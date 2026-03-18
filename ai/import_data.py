"""
import_data.py
--------------
Importe les données statiques dans MongoDB libertia :
- Destinations    → description de base
- Activités       → OpenStreetMap (Overpass API)
- Restaurants     → OpenStreetMap (Overpass API)
- Hôtels          → Hotels API

Puis lance automatiquement embeddings.py (delta sync ChromaDB)

Usage :
    python ai/import_data.py
    python ai/import_data.py --destination "Tokyo"  ← ajouter une seule destination
"""

import requests
import pymongo
import subprocess
import sys
import urllib3
from datetime import datetime

urllib3.disable_warnings()

# ─────────────────────────────────────────────
#  CONNEXION
# ─────────────────────────────────────────────
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["libertia"]

col_destinations = db["destinations"]
col_activites    = db["activites"]
col_restaurants  = db["restaurants"]
col_hotels       = db["hotels"]

HOTELS_API_KEY = "d2e462e83f35f148f4fbc0ce6a61ba89958aa7684d397cf49a7284240da5a333"
HOTELS_API_URL = "https://api.hotels-api.com/v1/hotels/search"
OVERPASS_URL   = "https://overpass-api.de/api/interpreter"

# ─────────────────────────────────────────────
#  DESTINATIONS PAR DÉFAUT
# ─────────────────────────────────────────────
DESTINATIONS = [
    {"nom": "Marrakech",  "pays": "Maroc",   "lat": 31.6295,  "lon": -7.9811,  "description": "Marrakech est une destination populaire en Maroc, connue pour ses souks, sa médina et ses palais."},
    {"nom": "Paris",      "pays": "France",  "lat": 48.8566,  "lon": 2.3522,   "description": "Paris, capitale de la France, est mondialement connue pour la Tour Eiffel, le Louvre et sa gastronomie."},
    {"nom": "Istanbul",   "pays": "Turquie", "lat": 41.0082,  "lon": 28.9784,  "description": "Istanbul est une ville transcontinentale riche en histoire, entre Orient et Occident."},
    {"nom": "Dubai",      "pays": "EAU",     "lat": 25.2048,  "lon": 55.2708,  "description": "Dubaï est une métropole moderne du désert, célèbre pour ses gratte-ciels et son luxe."},
    {"nom": "Rome",       "pays": "Italie",  "lat": 41.9028,  "lon": 12.4964,  "description": "Rome, la Ville Éternelle, est le berceau de la civilisation occidentale avec ses vestiges antiques."},
    {"nom": "Alger",      "pays": "Algérie", "lat": 36.7372,  "lon": 3.0865,   "description": "Alger est la capitale de l'Algérie, ville méditerranéenne mêlant architecture ottomane et française."},
    {"nom": "Tunis",      "pays": "Tunisie", "lat": 36.8190,  "lon": 10.1658,  "description": "Tunis est la capitale de la Tunisie, porte d'entrée vers les ruines de Carthage et la médina historique."},
    {"nom": "Barcelone",  "pays": "Espagne", "lat": 41.3851,  "lon": 2.1734,   "description": "Barcelone est une ville cosmopolite connue pour l'architecture de Gaudí, ses plages et sa vie nocturne."},
]


# ─────────────────────────────────────────────
#  OVERPASS API — Activités
# ─────────────────────────────────────────────
def importer_activites(nom, lat, lon, rayon=5000):
    print(f"  🎯 Activités OSM → {nom}...")
    query = f"""
    [out:json][timeout:25];
    (
      node["tourism"~"museum|attraction|viewpoint|artwork|gallery|theme_park|zoo"](around:{rayon},{lat},{lon});
      node["historic"~"monument|castle|ruins|archaeological_site"](around:{rayon},{lat},{lon});
      node["leisure"~"park|garden|nature_reserve"](around:{rayon},{lat},{lon});
    );
    out body 20;
    """
    try:
        response = requests.post(OVERPASS_URL, data={"data": query}, timeout=30, verify=False)
        elements = response.json().get("elements", [])

        count = 0
        for el in elements:
            tags = el.get("tags", {})
            nom_lieu = tags.get("name") or tags.get("name:fr") or tags.get("name:en")
            if not nom_lieu:
                continue

            activite = {
                "nom":         nom_lieu,
                "destination": nom,
                "type":        tags.get("tourism") or tags.get("historic") or tags.get("leisure") or "attraction",
                "description": tags.get("description") or tags.get("wikipedia") or f"Attraction à {nom}",
                "adresse":     tags.get("addr:full") or tags.get("addr:street") or "N/A",
                "lat":         el.get("lat"),
                "lon":         el.get("lon"),
                "source":      "openstreetmap",
                "importé_le":  datetime.now()
            }

            col_activites.update_one(
                {"nom": activite["nom"], "destination": nom},
                {"$set": activite},
                upsert=True
            )
            count += 1

        print(f"     ✅ {count} activités importées")
        return count

    except Exception as e:
        print(f"     ❌ Erreur OSM activités: {e}")
        return 0


# ─────────────────────────────────────────────
#  OVERPASS API — Restaurants
# ─────────────────────────────────────────────
def importer_restaurants(nom, lat, lon, rayon=3000):
    print(f"  🍽️  Restaurants OSM → {nom}...")
    query = f"""
    [out:json][timeout:25];
    node["amenity"="restaurant"](around:{rayon},{lat},{lon});
    out body 20;
    """
    try:
        response = requests.post(OVERPASS_URL, data={"data": query}, timeout=30, verify=False)
        elements = response.json().get("elements", [])

        count = 0
        for el in elements:
            tags = el.get("tags", {})
            nom_lieu = tags.get("name") or tags.get("name:fr") or tags.get("name:en")
            if not nom_lieu:
                continue

            resto = {
                "nom":         nom_lieu,
                "destination": nom,
                "cuisine":     tags.get("cuisine") or "locale",
                "adresse":     tags.get("addr:street") or "N/A",
                "note":        "N/A",
                "prix_moyen":  tags.get("price_range") or "N/A",
                "lat":         el.get("lat"),
                "lon":         el.get("lon"),
                "source":      "openstreetmap",
                "importé_le":  datetime.now()
            }

            col_restaurants.update_one(
                {"nom": resto["nom"], "destination": nom},
                {"$set": resto},
                upsert=True
            )
            count += 1

        print(f"     ✅ {count} restaurants importés")
        return count

    except Exception as e:
        print(f"     ❌ Erreur OSM restaurants: {e}")
        return 0


# ─────────────────────────────────────────────
#  HOTELS API
# ─────────────────────────────────────────────
def importer_hotels(nom, lat, lon):
    print(f"  🏨 Hotels API → {nom}...")
    try:
        response = requests.get(
            HOTELS_API_URL,
            headers={"X-API-KEY": HOTELS_API_KEY},
            params={"city": nom, "latitude": lat, "longitude": lon, "limit": 10},
            timeout=15,
            verify=False
        )

        data = response.json()
        hotels = data.get("hotels") or data.get("data") or data.get("results") or []

        count = 0
        for h in hotels:
            hotel = {
                "nom":         h.get("name") or h.get("hotel_name") or "Hôtel",
                "destination": nom,
                "etoiles":     h.get("stars") or h.get("star_rating") or "N/A",
                "note":        h.get("rating") or h.get("review_score") or "N/A",
                "prix_nuit":   h.get("price") or h.get("price_per_night") or "N/A",
                "adresse":     h.get("address") or "N/A",
                "lat":         h.get("latitude") or lat,
                "lon":         h.get("longitude") or lon,
                "source":      "hotels-api",
                "importé_le":  datetime.now()
            }

            col_hotels.update_one(
                {"nom": hotel["nom"], "destination": nom},
                {"$set": hotel},
                upsert=True
            )
            count += 1

        print(f"     ✅ {count} hôtels importés")
        return count

    except Exception as e:
        print(f"     ❌ Erreur Hotels API: {e}")
        return 0


# ─────────────────────────────────────────────
#  IMPORTER UNE DESTINATION
# ─────────────────────────────────────────────
def importer_destination(dest):
    nom = dest["nom"]
    lat = dest["lat"]
    lon = dest["lon"]

    print(f"\n📍 {nom} ({dest['pays']})")
    print("─" * 30)

    # Sauvegarder la destination
    col_destinations.update_one(
        {"nom": nom},
        {"$set": {**dest, "importé_le": datetime.now()}},
        upsert=True
    )

    importer_activites(nom, lat, lon)
    importer_restaurants(nom, lat, lon)
    importer_hotels(nom, lat, lon)


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    # Mode : ajouter une seule destination
    # python ai/import_data.py --destination "Tokyo"
    if "--destination" in sys.argv:
        idx = sys.argv.index("--destination")
        nom_dest = sys.argv[idx + 1]
        # Chercher dans la liste ou créer une entrée minimale
        dest = next((d for d in DESTINATIONS if d["nom"].lower() == nom_dest.lower()), None)
        if not dest:
            print(f"⚠️  {nom_dest} pas dans la liste — ajout minimal sans coordonnées précises")
            # Géocoder via Nominatim (OpenStreetMap)
            try:
                geo = requests.get(
                    f"https://nominatim.openstreetmap.org/search",
                    params={"q": nom_dest, "format": "json", "limit": 1},
                    headers={"User-Agent": "LibertIa/1.0"},
                    timeout=10
                ).json()
                if geo:
                    dest = {
                        "nom": nom_dest,
                        "pays": geo[0].get("display_name", "").split(",")[-1].strip(),
                        "lat": float(geo[0]["lat"]),
                        "lon": float(geo[0]["lon"]),
                        "description": f"{nom_dest} est une destination touristique."
                    }
            except:
                print("❌ Géocodage échoué")
                sys.exit(1)

        importer_destination(dest)

    else:
        # Import complet de toutes les destinations
        print("🚀 Import données statiques LibertIa\n")
        print("=" * 40)

        for dest in DESTINATIONS:
            importer_destination(dest)

    # ── Lancer embeddings.py automatiquement (delta sync) ──
    print("\n🔄 Mise à jour ChromaDB (delta sync)...")
    result = subprocess.run(
        [sys.executable, "ai/embeddings.py"],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print(result.stdout)
    else:
        print(f"⚠️  ChromaDB sync warning: {result.stderr}")

    print("\n✅ Import terminé !")