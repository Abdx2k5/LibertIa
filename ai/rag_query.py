"""
rag_query.py
Appelé par compagnonController.js pour enrichir Colibri avec le contexte ChromaDB
Usage : python rag_query.py "ta question"
"""
import sys
import chromadb
from sentence_transformers import SentenceTransformer

if len(sys.argv) < 2:
    sys.exit(0)

query = sys.argv[1]

try:
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    embedding = model.encode(query).tolist()

    import os
    chroma_path = os.path.join(os.path.dirname(__file__), 'chroma_db')
    client = chromadb.PersistentClient(path=chroma_path)

    resultats = []
    for col_name in ["destinations", "activites", "restaurants", "hotels"]:
        try:
            col = client.get_collection(col_name)
            res = col.query(query_embeddings=[embedding], n_results=2)
            docs = res["documents"][0] if res["documents"] else []
            resultats.extend(docs)
        except:
            pass

    if not resultats:
        sys.exit(0)

    contexte = "=== DONNÉES LIBERTIA PERTINENTES ===\n"
    for doc in resultats[:6]:
        contexte += f"- {doc}\n"

    print(contexte)

except Exception as e:
    sys.exit(0)
