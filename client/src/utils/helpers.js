// Formate une date ISO en "12 mars 2025"
export function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Formate un prix : 450 → "450 €"
export function formatPrice(amount, currency = "€") {
  if (amount === null || amount === undefined) return "";
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
}

// Tronque un texte long
export function truncate(text, maxLength = 100) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

// Retourne les initiales d'un nom : "Jean Dupont" → "JD"
export function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}