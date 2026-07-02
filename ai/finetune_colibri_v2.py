"""
finetune_colibri_v2.py
Fine-tuning LoRA sur Qwen3-0.6B + merge complet + push HuggingFace
Dataset : colibri_dataset.jsonl (400+ exemples)
GPU requis : RTX 4060 8GB VRAM minimum
"""

import os
import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import LoraConfig, get_peft_model, PeftModel
from trl import SFTTrainer, SFTConfig

# ── Config ──
HF_TOKEN    = os.environ.get("HF_TOKEN", "TON_TOKEN_ICI")
MODEL_ID    = "Qwen/Qwen3-0.6B"
DATASET     = "colibri_dataset.jsonl"
OUTPUT_DIR  = "./colibri_lora"
MERGED_DIR  = "./colibri_merged"
HF_REPO     = "Abdx2k5/Colibri"

print("="*60)
print("FINE-TUNING COLIBRI v2")
print("="*60)
print(f"GPU disponible : {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU : {torch.cuda.get_device_name(0)}")
    print(f"VRAM : {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")

# ── 1. Charger le dataset ──
print("\n[1/5] Chargement du dataset...")
dataset = load_dataset("json", data_files=DATASET, split="train")
print(f"✅ {len(dataset)} exemples chargés")

# ── 2. Charger le tokenizer + modèle ──
print("\n[2/5] Chargement du modèle Qwen3-0.6B...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=HF_TOKEN)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16,
    device_map="auto",
    token=HF_TOKEN
)
model.config.use_cache = False
print(f"✅ Modèle chargé — {sum(p.numel() for p in model.parameters()) / 1e6:.0f}M paramètres")

# ── 3. Config LoRA ──
print("\n[3/5] Configuration LoRA...")
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],  # plus de modules = meilleur résultat
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total     = sum(p.numel() for p in model.parameters())
print(f"✅ Paramètres entraînables : {trainable:,} / {total:,} ({100*trainable/total:.2f}%)")

# ── Formater les messages en ChatML ──
def format_example(example):
    messages = example["messages"]
    text = ""
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        if role == "system":
            text += f"<|im_start|>system\n{content}<|im_end|>\n"
        elif role == "user":
            text += f"<|im_start|>user\n{content}<|im_end|>\n"
        elif role == "assistant":
            text += f"<|im_start|>assistant\n{content}<|im_end|>\n"
    return {"text": text}

dataset = dataset.map(format_example)
print(f"✅ Format ChatML appliqué")
print(f"   Exemple : {dataset[0]['text'][:150]}...")

# ── 4. Fine-tuning ──
print("\n[4/5] Lancement du fine-tuning...")

training_args = SFTConfig(
    output_dir=OUTPUT_DIR,
    num_train_epochs=5,                # plus d'époques pour un meilleur résultat
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,     # batch effectif = 8
    learning_rate=1e-4,                # plus bas = apprentissage plus stable
    fp16=True,
    logging_steps=10,
    save_steps=50,
    warmup_ratio=0.05,
    lr_scheduler_type="cosine",
    optim="adamw_torch",
    max_length=512,
    dataset_text_field="text",
    report_to="none",
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    args=training_args,
)

result = trainer.train()

print(f"\n✅ Fine-tuning terminé !")
print(f"   Loss finale : {result.training_loss:.4f}")
print(f"   Steps : {result.global_step}")

# ── Sauvegarder l'adapteur LoRA ──
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print(f"✅ Adapteur LoRA sauvegardé dans {OUTPUT_DIR}")

# ── 5. Merge LoRA dans le modèle de base ──
print("\n[5/5] Merge LoRA + modèle de base...")

# Recharger le modèle de base propre
base_model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16,
    device_map="auto",
    token=HF_TOKEN
)

# Charger l'adapteur et merger
from peft import PeftModel
peft_model = PeftModel.from_pretrained(base_model, OUTPUT_DIR)
merged_model = peft_model.merge_and_unload()

# Sauvegarder le modèle fusionné
merged_model.save_pretrained(MERGED_DIR, safe_serialization=True)
tokenizer.save_pretrained(MERGED_DIR)
print(f"✅ Modèle fusionné sauvegardé dans {MERGED_DIR}")

# ── Push sur HuggingFace ──
print(f"\n📤 Push sur HuggingFace : {HF_REPO}")

from huggingface_hub import HfApi
api = HfApi(token=HF_TOKEN)

# Créer le repo si n'existe pas
try:
    api.create_repo(HF_REPO, exist_ok=True)
    print(f"✅ Repo {HF_REPO} prêt")
except Exception as e:
    print(f"Repo existant : {e}")

# Push le modèle fusionné complet
merged_model.push_to_hub(HF_REPO, token=HF_TOKEN)
tokenizer.push_to_hub(HF_REPO, token=HF_TOKEN)

# Créer un README
readme = f"""---
language:
- fr
- en
- ar
license: apache-2.0
base_model: Qwen/Qwen3-0.6B
tags:
- travel
- chatbot
- fine-tuned
- lora-merged
- libertia
---

# Colibri — Compagnon de voyage LibertIa

Modèle Qwen3-0.6B fine-tuné avec LoRA sur {len(dataset)} conversations de voyage en français.

## Usage

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "{HF_REPO}"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16)

prompt = "<|im_start|>system\\nTu es Colibri...<|im_end|>\\n<|im_start|>user\\nBonjour !<|im_end|>\\n<|im_start|>assistant\\n"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=200, temperature=0.7, do_sample=True)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

## Entraînement
- Base : Qwen/Qwen3-0.6B
- Technique : LoRA (r=16, alpha=32, modules: q/k/v/o_proj) puis merge complet
- Dataset : {len(dataset)} conversations ChatML voyage FR/EN/AR
- Époques : 5
- GPU : NVIDIA RTX 4060 Laptop 8GB
"""

with open(f"{MERGED_DIR}/README.md", "w") as f:
    f.write(readme)

api.upload_file(
    path_or_fileobj=f"{MERGED_DIR}/README.md",
    path_in_repo="README.md",
    repo_id=HF_REPO,
    token=HF_TOKEN
)

print(f"\n{'='*60}")
print(f"✅ COLIBRI V2 DÉPLOYÉ SUR HUGGINGFACE")
print(f"   Modèle : https://huggingface.co/{HF_REPO}")
print(f"   Exemples entraînement : {len(dataset)}")
print(f"{'='*60}")
print(f"\nProchaine étape : mettre à jour compagnonController.js")
print(f"pour appeler HuggingFace Inference API au lieu de Groq")
