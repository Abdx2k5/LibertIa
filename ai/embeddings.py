import chromadb
import pymongo
import sys
from sentence_transformers import SentenceTransformer

# ─────────────────────────────────────────────
#  CONNEXIONS
# ─────────────────────────────────────────────
MONGO_URI = "mongodb+srv://senky:nada1233@libertai.y2sjwgt.mongodb.net/"
mongo_client = pymongo.MongoClient(MONGO_URI)
db = mongo_client["libertia"]

chroma_client    = chromadb.PersistentClient(path="./ai/chroma_db")
col_destinations = chroma_client.get_or_create_collection("destinations")
col_activites    = chroma_client.get_or_create_collection("activites")
col_restaurants  = chroma_client.get_or_create_collection("restaurants")
col_hotels       = chroma_client.get_or_create_collection("hotels")

# Modèle d'embeddings LibertIa (multilingue FR/EN/AR)
print("🔄 Chargement du moteur d'embeddings LibertIa...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
print("✅ Moteur prêt")

# ─────────────────────────────────────────────
#  EMBEDDING
# ─────────────────────────────────────────────
def get_embedding(text):
    return model.encode(text).tolist()

# ─────────────────────────────────────────────
#  DOC → TEXTE
# ─────────────────────────────────────────────
def doc_to_text(doc, type_doc):
    if type_doc == "destination":
        return (
            f"Destination : {doc.get('nom', '')}. "
            f"Pays : {doc.get('pays', '')}. "
            f"Description : {doc.get('description', '')}."
        )
    elif type_doc == "activite":
        return (
            f"Activité : {doc.get('nom', '')} à {doc.get('destination', '')}. "
            f"Type : {doc.get('type', '')}. "
            f"Prix : {doc.get('prix', 'N/A')}. "
            f"Durée : {doc.get('duree', 'N/A')}."
        )
    elif type_doc == "restaurant":
        return (
            f"Restaurant : {doc.get('nom', '')} à {doc.get('destination', '')}. "
            f"Cuisine : {doc.get('cuisine', '')}. "
            f"Note : {doc.get('note', 'N/A')}. "
            f"Prix : {doc.get('prix', 'N/A')}."
        )
    elif type_doc == "hotel":
        return (
            f"Hôtel : {doc.get('nom', '')} à {doc.get('destination', '')}. "
            f"Note : {doc.get('note', 'N/A')}. "
            f"Prix nuit : {doc.get('prix_nuit', 'N/A')}."
        )
    return str(doc)

# ─────────────────────────────────────────────
#  DELTA SYNC
# ─────────────────────────────────────────────
def indexer_delta(mongo_col, chroma_col, type_doc):
    docs = list(mongo_col.find())
    if not docs:
        print(f"  ⚠️  Collection {type_doc} vide dans MongoDB")
        return 0

    try:
        existing = chroma_col.get()
        existing_ids = set(existing["ids"])
    except:
        existing_ids = set()

    nouveaux = [d for d in docs if str(d.get("_id", "")) not in existing_ids]
    if not nouveaux:
        print(f"  ✅ {type_doc} — déjà à jour ({len(docs)} docs)")
        return 0

    print(f"  📦 {type_doc} — {len(nouveaux)} nouveaux docs à indexer...")
    ids = []
    embeddings = []
    textes = []
    metadatas = []

    for i, doc in enumerate(nouveaux):
        try:
            texte = doc_to_text(doc, type_doc)
            if not texte.strip():
                continue
            embedding = get_embedding(texte)
            doc_id = str(doc.get("_id", f"{type_doc}_{i}"))
            ids.append(doc_id)
            embeddings.append(embedding)
            textes.append(texte)
            metadatas.append({
                "nom":         str(doc.get("nom", "")),
                "destination": str(doc.get("destination", doc.get("nom", ""))),
                "type":        type_doc,
            })
        except Exception as e:
            print(f"    ⚠️  Erreur doc {i}: {e}")
            continue

    if ids:
        chroma_col.upsert(ids=ids, embeddings=embeddings, documents=textes, metadatas=metadatas)
        print(f"  ✅ {len(ids)} docs indexés")
    return len(ids)

# ─────────────────────────────────────────────
#  RÉINDEXATION COMPLÈTE
# ─────────────────────────────────────────────
def reindexer_complet():
    print("🔄 Réindexation complète ChromaDB...")
    for nom, col in [("destinations", col_destinations), ("activites", col_activites),
                     ("restaurants", col_restaurants), ("hotels", col_hotels)]:
        try:
            existing = col.get()
            if existing["ids"]:
                col.delete(ids=existing["ids"])
                print(f"  🗑️  {nom} vidé ({len(existing['ids'])} docs supprimés)")
        except:
            pass
    total = indexer_tout()
    print(f"✅ Réindexation complète — {total} docs indexés")
    return total

def indexer_tout():
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
    embedding_query = get_embedding(query)
    where = {"destination": destination} if destination else None
    resultats = {}

    for nom_col, chroma_col in [("activites", col_activites), ("restaurants", col_restaurants),
                                  ("hotels", col_hotels), ("destinations", col_destinations)]:
        try:
            res = chroma_col.query(query_embeddings=[embedding_query], n_results=n_results, where=where)
            resultats[nom_col] = res["documents"][0] if res["documents"] else []
        except:
            resultats[nom_col] = []

    contexte = "=== DONNÉES LOCALES PERTINENTES ===\n\n"
    if resultats.get("destinations"):
        contexte += "�� DESTINATION :\n" + "\n".join(f"- {d}" for d in resultats["destinations"]) + "\n\n"
    if resultats.get("activites"):
        contexte += "🎯 ACTIVITÉS :\n" + "\n".join(f"- {d}" for d in resultats["activites"]) + "\n\n"
    if resultats.get("restaurants"):
        contexte += "🍽️ RESTAURANTS :\n" + "\n".join(f"- {d}" for d in resultats["restaurants"]) + "\n\n"
    if resultats.get("hotels"):
        contexte += "🏨 HÉBERGEMENTS :\n" + "\n".join(f"- {d}" for d in resultats["hotels"]) + "\n\n"
    return contexte

# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    if "--full" in sys.argv:
        reindexer_complet()
    else:
        print("🚀 Delta sync ChromaDB...\n")
        total = indexer_tout()
        print(f"\n✅ {total} nouveaux documents indexés")
