"""
embeddings.py
-------------
Indexation automatique ChromaDB avec delta sync :
- Indexe seulement les nouveaux documents (pas tout réindexer)
- Appelé automatiquement par import_data.py
- Appelé par le cron job toutes les 12h

Usage manuel :
    python ai/embeddings.py
"""

import chromadb
import pymongo
import requests

# ─────────────────────────────────────────────
#  CONNEXIONS
# ─────────────────────────────────────────────
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
db    = mongo_client["libertia"]
db_dw = mongo_client["libertia_dw"]

chroma_client    = chromadb.PersistentClient(path="./ai/chroma_db")
col_destinations = chroma_client.get_or_create_collection("destinations")
col_activites    = chroma_client.get_or_create_collection("activites")
col_restaurants  = chroma_client.get_or_create_collection("restaurants")
col_hotels       = chroma_client.get_or_create_collection("hotels")

OLLAMA_URL = "http://localhost:11434/api/embeddings"


# ─────────────────────────────────────────────
#  EMBEDDING
# ─────────────────────────────────────────────
def get_embedding(text):
    response = requests.post(OLLAMA_URL, json={
        "model": "nomic-embed-text",
        "prompt": text
    })
    return response.json()["embedding"]


# ─────────────────────────────────────────────
#  DOC → TEXTE
# ─────────────────────────────────────────────
def doc_to_text(doc, type_doc):
    if type_doc == "destination":
        return (
            f"Destination : {doc.get('nom', '')}. "
            f"Pays : {doc.get('pays', '')}. "
            f"Description : {doc.get('description', '')}. "
            f"Climat : {doc.get('climat', '')}. "
            f"Meilleure période : {doc.get('meilleure_periode', '')}."
        )
    elif type_doc == "activite":
        return (
            f"Activité : {doc.get('nom', '')} à {doc.get('destination', '')}. "
            f"Type : {doc.get('type', '')}. "
            f"Description : {doc.get('description', '')}. "
            f"Prix : {doc.get('prix', 'N/A')}. "
            f"Durée : {doc.get('duree', 'N/A')}."
        )
    elif type_doc == "restaurant":
        return (
            f"Restaurant : {doc.get('nom', '')} à {doc.get('destination', '')}. "
            f"Cuisine : {doc.get('cuisine', '')}. "
            f"Note : {doc.get('note', 'N/A')}. "
            f"Prix moyen : {doc.get('prix_moyen', 'N/A')}."
        )
    elif type_doc == "hotel":
        return (
            f"Hôtel : {doc.get('nom', '')} à {doc.get('destination', '')}. "
            f"Note : {doc.get('note', 'N/A')}. "
            f"Prix nuit : {doc.get('prix_nuit', 'N/A')}."
        )
    return str(doc)


# ─────────────────────────────────────────────
#  DELTA SYNC — indexe seulement les nouveaux
# ─────────────────────────────────────────────
def indexer_delta(mongo_col, chroma_col, type_doc):
    """
    Compare MongoDB et ChromaDB.
    Indexe seulement les documents pas encore dans ChromaDB.
    """
    docs = list(mongo_col.find())
    if not docs:
        print(f"  ⚠️  Collection {type_doc} vide dans MongoDB")
        return 0

    # IDs déjà dans ChromaDB
    try:
        existing = chroma_col.get()
        existing_ids = set(existing["ids"])
    except:
        existing_ids = set()

    # Filtrer les nouveaux uniquement
    nouveaux = [d for d in docs if str(d.get("_id", "")) not in existing_ids]

    if not nouveaux:
        print(f"  ✅ {type_doc} — déjà à jour ({len(docs)} docs)")
        return 0

    print(f"  📦 {type_doc} — {len(nouveaux)} nouveaux docs à indexer (/{len(docs)} total)...")

    ids        = []
    embeddings = []
    textes     = []
    metadatas  = []

    for i, doc in enumerate(nouveaux):
        try:
            texte = doc_to_text(doc, type_doc)
            if not texte.strip():
                continue

            embedding = get_embedding(texte)
            doc_id    = str(doc.get("_id", f"{type_doc}_{i}"))

            ids.append(doc_id)
            embeddings.append(embedding)
            textes.append(texte)
            metadatas.append({
                "nom":         str(doc.get("nom", "")),
                "destination": str(doc.get("destination", doc.get("nom", ""))),
                "type":        type_doc,
                "source":      str(doc.get("source", "import")),
            })

            if (i + 1) % 10 == 0:
                print(f"    ✓ {i + 1}/{len(nouveaux)}...")

        except Exception as e:
            print(f"    ⚠️  Erreur doc {i}: {e}")
            continue

    if ids:
        chroma_col.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=textes,
            metadatas=metadatas
        )
        print(f"  ✅ {len(ids)} nouveaux docs indexés")

    return len(ids)


# ─────────────────────────────────────────────
#  RÉINDEXATION COMPLÈTE (appelée par cron 12h)
# ─────────────────────────────────────────────
def reindexer_complet():
    """
    Vide ChromaDB et réindexe tout depuis MongoDB.
    Appelée par le cron job toutes les 12h après purge MongoDB.
    """
    print("🔄 Réindexation complète ChromaDB...")

    # Vider les collections ChromaDB
    for nom, col in [
        ("destinations", col_destinations),
        ("activites",    col_activites),
        ("restaurants",  col_restaurants),
        ("hotels",       col_hotels),
    ]:
        try:
            existing = col.get()
            if existing["ids"]:
                col.delete(ids=existing["ids"])
                print(f"  🗑️  {nom} vidé ({len(existing['ids'])} docs supprimés)")
        except:
            pass

    # Réindexer depuis MongoDB
    total = indexer_tout()
    print(f"✅ Réindexation complète — {total} docs indexés")
    return total


# ─────────────────────────────────────────────
#  INDEXATION COMPLÈTE
# ─────────────────────────────────────────────
def indexer_tout():
    """Indexe toutes les collections (delta sync)."""
    total = 0
    total += indexer_delta(db["destinations"], col_destinations, "destination")
    total += indexer_delta(db["activites"],    col_activites,    "activite")
    total += indexer_delta(db["restaurants"],  col_restaurants,  "restaurant")
    total += indexer_delta(db["hotels"],       col_hotels,       "hotel")
    return total


# ─────────────────────────────────────────────
#  RECHERCHE RAG
# ─────────────────────────────────────────────
def rechercher(query, destination=None, n_results=5):
    """
    Recherche sémantique dans ChromaDB.
    Retourne un contexte texte prêt pour Mistral.
    """
    embedding_query = get_embedding(query)
    where = {"destination": destination} if destination else None

    resultats = {}
    for nom_col, chroma_col in [
        ("activites",    col_activites),
        ("restaurants",  col_restaurants),
        ("hotels",       col_hotels),
        ("destinations", col_destinations),
    ]:
        try:
            res = chroma_col.query(
                query_embeddings=[embedding_query],
                n_results=n_results,
                where=where
            )
            resultats[nom_col] = res["documents"][0] if res["documents"] else []
        except:
            resultats[nom_col] = []

    # Construire le contexte
    contexte = "=== DONNÉES LOCALES PERTINENTES ===\n\n"

    if resultats["destinations"]:
        contexte += "📍 DESTINATION :\n"
        for doc in resultats["destinations"]:
            contexte += f"- {doc}\n"
        contexte += "\n"

    if resultats["activites"]:
        contexte += "🎯 ACTIVITÉS :\n"
        for doc in resultats["activites"]:
            contexte += f"- {doc}\n"
        contexte += "\n"

    if resultats["restaurants"]:
        contexte += "🍽️ RESTAURANTS :\n"
        for doc in resultats["restaurants"]:
            contexte += f"- {doc}\n"
        contexte += "\n"

    if resultats["hotels"]:
        contexte += "🏨 HÉBERGEMENTS :\n"
        for doc in resultats["hotels"]:
            contexte += f"- {doc}\n"
        contexte += "\n"

    return contexte


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    if "--full" in sys.argv:
        # Réindexation complète (appelée par cron)
        reindexer_complet()
    else:
        # Delta sync (appelée par import_data.py)
        print("🚀 Delta sync ChromaDB...\n")
        total = indexer_tout()
        print(f"\n✅ {total} nouveaux documents indexés")
        if total == 0:
            print("   (ChromaDB déjà à jour)")