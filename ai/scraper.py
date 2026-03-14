from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
import pymongo
import time
from datetime import datetime, timedelta

# Connexion MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["libertia"]
db_dw = client["libertia_dw"]

hotels_col    = db["hotels_temp"]
vols_col      = db["vols_temp"]
activites_col = db["activites_temp"]
restos_col    = db["restos_temp"]

dw_recherches   = db_dw["recherches"]
dw_destinations = db_dw["destinations_stats"]
dw_prix         = db_dw["prix_historique"]

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/123.0.0.0 Safari/537.36"
)

stealth = Stealth()

def get_browser(headless=True):
    p = sync_playwright().start()
    browser = p.chromium.launch(
        headless=headless,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-dev-shm-usage",
        ]
    )
    context = browser.new_context(
        user_agent=USER_AGENT,
        viewport={"width": 1280, "height": 800},
        locale="fr-FR",
    )
    return p, browser, context


# ─────────────────────────────────────────────
#  BOOKING.COM
# ─────────────────────────────────────────────
def scrape_booking(destination, checkin, checkout):
    print(f"  🏨 Booking.com → {destination}...")
    p, browser, context = get_browser()
    page = context.new_page()
    results = []

    try:
        url = (
            f"https://www.booking.com/searchresults.fr.html"
            f"?ss={destination}&checkin={checkin}&checkout={checkout}"
            f"&group_adults=2&no_rooms=1&order=popularity"
        )
        page.goto(url, timeout=30000)
        page.wait_for_timeout(4000)

        try:
            page.click('[aria-label="Ignorer"]', timeout=2000)
        except:
            pass

        cards = page.query_selector_all('[data-testid="property-card"]')
        for card in cards[:15]:
            try:
                nom     = card.query_selector('[data-testid="title"]')
                prix    = card.query_selector('[data-testid="price-and-discounted-price"]')
                note    = card.query_selector('[data-testid="review-score"]')
                adresse = card.query_selector('[data-testid="address"]')
                lien    = card.query_selector('a[data-testid="title-link"]')

                hotel = {
                    "nom":          nom.inner_text().strip() if nom else "Inconnu",
                    "destination":  destination,
                    "prix_nuit":    prix.inner_text().strip() if prix else "N/A",
                    "note":         note.inner_text().strip() if note else "N/A",
                    "adresse":      adresse.inner_text().strip() if adresse else "N/A",
                    "lien_booking": lien.get_attribute("href") if lien else "",
                    "checkin":      checkin,
                    "checkout":     checkout,
                    "source":       "booking.com",
                    "type":         "hotel",
                    "scraped_at":   datetime.now(),
                    "expire_at":    datetime.now() + timedelta(hours=12)
                }
                hotels_col.update_one(
                    {"nom": hotel["nom"], "destination": destination, "checkin": checkin},
                    {"$set": hotel}, upsert=True
                )
                dw_prix.insert_one({
                    "destination": destination, "type": "hotel",
                    "nom": hotel["nom"], "prix": hotel["prix_nuit"],
                    "note": hotel["note"], "date": datetime.now()
                })
                results.append(hotel)
            except:
                continue

        print(f"     ✅ {len(results)} hôtels")
    except Exception as e:
        print(f"     ❌ Erreur Booking: {e}")
    finally:
        browser.close()
        p.stop()

    return results


# ─────────────────────────────────────────────
#  AIRBNB
# ─────────────────────────────────────────────
def scrape_airbnb(destination, checkin, checkout):
    print(f"  🏠 Airbnb → {destination}...")
    p, browser, context = get_browser()
    page = context.new_page()
    results = []

    try:
        url = f"https://www.airbnb.fr/s/{destination}/homes?checkin={checkin}&checkout={checkout}&adults=2"
        page.goto(url, timeout=30000)
        page.wait_for_timeout(4000)

        cards = page.query_selector_all('[data-testid="card-container"]')
        for card in cards[:15]:
            try:
                nom  = card.query_selector('[data-testid="listing-card-title"]')
                prix = card.query_selector('span._tyxjp1')
                note = card.query_selector('span.r1dxllyb')

                logement = {
                    "nom":         nom.inner_text().strip() if nom else "Logement Airbnb",
                    "destination": destination,
                    "prix_nuit":   prix.inner_text().strip() if prix else "N/A",
                    "note":        note.inner_text().strip() if note else "N/A",
                    "checkin":     checkin,
                    "checkout":    checkout,
                    "source":      "airbnb",
                    "type":        "airbnb",
                    "scraped_at":  datetime.now(),
                    "expire_at":   datetime.now() + timedelta(hours=12)
                }
                hotels_col.update_one(
                    {"nom": logement["nom"], "destination": destination, "checkin": checkin},
                    {"$set": logement}, upsert=True
                )
                results.append(logement)
            except:
                continue

        print(f"     ✅ {len(results)} logements Airbnb")
    except Exception as e:
        print(f"     ❌ Erreur Airbnb: {e}")
    finally:
        browser.close()
        p.stop()

    return results


# ─────────────────────────────────────────────
#  GOOGLE FLIGHTS
#  Confirmé par debug : div[role="listitem"] → 12 résultats
# ─────────────────────────────────────────────
def scrape_google_flights(destination, date_depart, origine="CMN"):
    print(f"  ✈️  Google Flights → {origine} → {destination}...")
    p, browser, context = get_browser(headless=False)
    page = context.new_page()
    stealth.use_sync(page)
    results = []

    IATA_MAP = {
        "Marrakech": "RAK", "Paris": "CDG", "Istanbul": "IST",
        "Dubai": "DXB", "Rome": "FCO", "Alger": "ALG",
        "Tunis": "TUN", "Barcelone": "BCN",
    }
    dest_code = IATA_MAP.get(destination, destination)

    try:
        url = (
            f"https://www.google.com/travel/flights"
            f"?q=Vols+de+{origine}+%C3%A0+{dest_code}+le+{date_depart}"
            f"&hl=fr&curr=MAD"
        )
        page.goto(url, timeout=60000)
        page.wait_for_timeout(7000)

        for selector in ['[aria-label="Tout accepter"]', 'button:has-text("Accepter tout")']:
            try:
                page.click(selector, timeout=2000)
                page.wait_for_timeout(1000)
                break
            except:
                pass

        page.evaluate("window.scrollBy(0, 600)")
        page.wait_for_timeout(3000)

        # Sélecteur principal confirmé
        cards = page.query_selector_all('div[role="listitem"]')
        if not cards:
            cards = page.query_selector_all('[aria-label*="vol"]')

        print(f"     🔍 {len(cards)} cartes détectées")

        for card in cards[:10]:
            try:
                texte = card.inner_text().strip()
                aria  = card.get_attribute("aria-label") or ""

                if not texte or len(texte) < 10:
                    continue

                # Prix
                prix = "N/A"
                for sel in ['span[data-gs]', 'span[class*="YMlIz"]', 'span[class*="BVAVmf"]', 'div[class*="U3gSDe"]']:
                    el = card.query_selector(sel)
                    if el:
                        prix = el.inner_text().strip()
                        break
                if prix == "N/A" and "MAD" in aria:
                    import re
                    m = re.search(r'[\d\s]+MAD', aria)
                    if m:
                        prix = m.group().strip()

                # Compagnie
                compagnie = "N/A"
                for sel in ['span[class*="h1fkLb"]', 'div[class*="sSHqwe"]', 'span[class*="Xsgmwe"]', 'div[class*="TQqf0e"]']:
                    el = card.query_selector(sel)
                    if el:
                        compagnie = el.inner_text().strip()
                        break

                # Durée
                duree = "N/A"
                for sel in ['div[class*="gvkrdb"]', 'span[class*="Ak5kof"]', 'div[class*="AdWm1c"]']:
                    el = card.query_selector(sel)
                    if el:
                        duree = el.inner_text().strip()
                        break

                # Horaires
                horaires = "N/A"
                for sel in ['span[class*="mv1WYe"]', 'div[class*="wtdjmc"]', 'span[class*="GmGTcb"]']:
                    el = card.query_selector(sel)
                    if el:
                        horaires = el.inner_text().strip()
                        break

                # Fallback texte brut
                if prix == "N/A" and compagnie == "N/A":
                    lignes = [l.strip() for l in texte.split("\n") if l.strip()]
                    if len(lignes) >= 2:
                        compagnie = lignes[0]
                        import re
                        prix = next((l for l in lignes if re.search(r'\d', l) and ("MAD" in l or "€" in l)), "N/A")

                if prix == "N/A" and compagnie == "N/A":
                    continue

                vol = {
                    "destination": destination, "origine": origine,
                    "prix": prix, "compagnie": compagnie,
                    "duree": duree, "horaires": horaires,
                    "date_depart": date_depart,
                    "source": "google_flights", "type": "vol",
                    "scraped_at": datetime.now(),
                    "expire_at": datetime.now() + timedelta(hours=12)
                }
                vols_col.update_one(
                    {"destination": destination, "origine": origine,
                     "date_depart": date_depart, "compagnie": vol["compagnie"]},
                    {"$set": vol}, upsert=True
                )
                dw_prix.insert_one({
                    "destination": destination, "type": "vol",
                    "origine": origine, "prix": vol["prix"],
                    "compagnie": vol["compagnie"], "date": datetime.now()
                })
                results.append(vol)

            except:
                continue

        print(f"     ✅ {len(results)} vols")
    except Exception as e:
        print(f"     ❌ Erreur Google Flights: {e}")
    finally:
        browser.close()
        p.stop()

    return results


# ─────────────────────────────────────────────
#  VIATOR
#  Confirmé par debug : a[href*="/tours/"] → 24
#  IDs Viator incorrects → utiliser recherche texte
# ─────────────────────────────────────────────
def scrape_viator(destination):
    print(f"  🎯 Viator → {destination}...")
    p, browser, context = get_browser(headless=False)
    page = context.new_page()
    stealth.use_sync(page)
    results = []

    try:
        url = f"https://www.viator.com/fr-FR/search?text={destination}"
        page.goto(url, timeout=60000)
        page.wait_for_timeout(6000)

        for selector in ['button[id*="accept"]', 'button:has-text("Accepter")', 'button:has-text("Accept all")']:
            try:
                page.click(selector, timeout=2000)
                page.wait_for_timeout(1000)
                break
            except:
                pass

        # Attendre chargement complet avant de scroller
        try:
            page.wait_for_load_state("networkidle", timeout=10000)
        except:
            pass

        for _ in range(4):
            try:
                page.evaluate("window.scrollBy(0, 700)")
                page.wait_for_timeout(1500)
            except:
                break

        # Sélecteur confirmé
        liens = page.query_selector_all('a[href*="/tours/"]')
        print(f"     🔍 {len(liens)} liens activités détectés")

        vus = set()
        for lien in liens[:20]:
            try:
                href = lien.get_attribute("href") or ""
                if not href or href in vus:
                    continue
                vus.add(href)

                nom_el = lien.query_selector('h3') or lien.query_selector('h2')
                nom_text = nom_el.inner_text().strip() if nom_el else lien.inner_text().split("\n")[0].strip()
                if not nom_text or len(nom_text) < 5:
                    continue

                prix = "N/A"
                for sel in ['span[class*="price"]', 'div[class*="Price"]', 'span[class*="Price"]']:
                    el = lien.query_selector(sel)
                    if el:
                        prix = el.inner_text().strip()
                        break

                note = "N/A"
                for sel in ['span[class*="rating"]', 'div[class*="Rating"]', 'span[aria-label]']:
                    el = lien.query_selector(sel)
                    if el:
                        note = el.get_attribute("aria-label") or el.inner_text().strip()
                        break

                lien_href = href if href.startswith("http") else "https://www.viator.com" + href

                activite = {
                    "nom": nom_text, "destination": destination,
                    "prix": prix, "note": note, "lien_viator": lien_href,
                    "source": "viator", "type": "activite",
                    "scraped_at": datetime.now(),
                    "expire_at": datetime.now() + timedelta(hours=12)
                }
                activites_col.update_one(
                    {"nom": activite["nom"], "destination": destination},
                    {"$set": activite}, upsert=True
                )
                results.append(activite)
            except:
                continue

        print(f"     ✅ {len(results)} activités")
    except Exception as e:
        print(f"     ❌ Erreur Viator: {e}")
    finally:
        browser.close()
        p.stop()

    return results


# ─────────────────────────────────────────────
#  TRIPADVISOR
#  Confirmé par debug : a[href*="Restaurant_Review"] → 206
# ─────────────────────────────────────────────
TRIPADVISOR_IDS = {
    "Marrakech": "304135", "Paris": "187147", "Istanbul": "297662",
    "Dubai": "295424", "Rome": "187791", "Alger": "299553",
    "Tunis": "299557", "Barcelone": "187497",
    "Athènes":   "189400",
    "Athens":    "189400",
}

def scrape_tripadvisor(destination):
    print(f"  ⭐ TripAdvisor → {destination}...")
    p, browser, context = get_browser(headless=False)
    page = context.new_page()
    stealth.use_sync(page)
    results = []

    try:
        geo_id = TRIPADVISOR_IDS.get(destination)
        url = (
            f"https://www.tripadvisor.fr/Restaurants-g{geo_id}.html"
            if geo_id
            else f"https://www.tripadvisor.fr/Search?q={destination}+restaurants"
        )

        page.goto(url, timeout=60000)
        page.wait_for_timeout(6000)

        for _ in range(2):
            page.evaluate("window.scrollBy(0, 600)")
            page.wait_for_timeout(1500)

        # Sélecteur confirmé
        liens = page.query_selector_all('a[href*="Restaurant_Review"]')
        print(f"     🔍 {len(liens)} liens restaurants détectés")

        vus = set()
        for lien in liens:
            try:
                href  = lien.get_attribute("href") or ""
                texte = lien.inner_text().strip()

                if not texte or len(texte) < 3 or href in vus:
                    continue
                if texte.startswith("(") and "avis" in texte:
                    continue
                if texte.isdigit():
                    continue

                vus.add(href)

                # Note depuis le parent
                note = "N/A"
                try:
                    parent = lien.evaluate_handle("el => el.closest('div') || el.parentElement")
                    note_el = parent.as_element().query_selector('svg[aria-label], span[aria-label*="sur 5"]')
                    if note_el:
                        note = note_el.get_attribute("aria-label") or "N/A"
                except:
                    pass

                lien_href = href if href.startswith("http") else "https://www.tripadvisor.fr" + href

                resto = {
                    "nom": texte, "destination": destination,
                    "note": note, "cuisine": "locale", "lien": lien_href,
                    "source": "tripadvisor", "type": "restaurant",
                    "scraped_at": datetime.now(),
                    "expire_at": datetime.now() + timedelta(hours=12)
                }
                restos_col.update_one(
                    {"nom": resto["nom"], "destination": destination},
                    {"$set": resto}, upsert=True
                )
                results.append(resto)

                if len(results) >= 15:
                    break
            except:
                continue

        print(f"     ✅ {len(results)} restaurants")
    except Exception as e:
        print(f"     ❌ Erreur TripAdvisor: {e}")
    finally:
        browser.close()
        p.stop()

    return results


# ─────────────────────────────────────────────
#  PIPELINE COMPLET
# ─────────────────────────────────────────────
def scrape_destination_complete(destination, checkin, checkout, origine="CMN"):
    print(f"\n🌍 Scraping complet → {destination}")
    print("=" * 40)

    debut = datetime.now()

    hotels    = scrape_booking(destination, checkin, checkout)
    time.sleep(2)
    airbnb    = scrape_airbnb(destination, checkin, checkout)
    time.sleep(2)
    vols      = scrape_google_flights(destination, checkin, origine)
    time.sleep(2)
    restos    = scrape_tripadvisor(destination)

    duree = (datetime.now() - debut).seconds

    dw_recherches.insert_one({
        "destination": destination, "checkin": checkin,
        "checkout": checkout, "origine": origine,
        "hotels_trouves": len(hotels), "airbnb_trouves": len(airbnb),
        "vols_trouves": len(vols), "activites_trouvees": 0,
        "restos_trouves": len(restos), "duree_scraping_sec": duree,
        "date": datetime.now()
    })

    print(f"\n✅ Scraping terminé en {duree}s")
    print(f"   🏨 Hôtels    : {len(hotels)}")
    print(f"   🏠 Airbnb    : {len(airbnb)}")
    print(f"   ✈️  Vols      : {len(vols)}")
    print(f"   🍽️  Restos    : {len(restos)}")

    return {
        "hotels": hotels, "airbnb": airbnb, "vols": vols,
        "activites": [], "restos": restos
    }


# ─────────────────────────────────────────────
#  TEST
# ─────────────────────────────────────────────
if __name__ == "__main__":
    scrape_destination_complete(
        destination="Marrakech",
        checkin="2026-04-10",
        checkout="2026-04-13",
        origine="CMN"
    )