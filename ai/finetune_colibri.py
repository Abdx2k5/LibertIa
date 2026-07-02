import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset
from huggingface_hub import login

HF_TOKEN = os.environ.get("HF_TOKEN", "")
BASE_MODEL = "Qwen/Qwen3-0.6B"
DATASET = "Abdx2k5/colibri-dataset"
OUTPUT = "Abdx2k5/Colibri"

login(token=HF_TOKEN)

print("🔄 Chargement du modèle...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True
)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

print("🔄 Chargement du dataset...")
dataset = load_dataset(DATASET, split="train")

training_args = SFTConfig(
    output_dir="./colibri_output",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    save_steps=50,
    logging_steps=10,
    push_to_hub=True,
    hub_model_id=OUTPUT,
    hub_token=HF_TOKEN,
    report_to="none"
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)

print("🚀 Début du fine-tuning Colibri...")
trainer.train()

print("📤 Push sur HuggingFace...")
trainer.push_to_hub()
print("✅ Colibri fine-tuné et publié !")
