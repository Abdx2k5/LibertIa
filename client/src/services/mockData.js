export const MOCK_USER = {
  nom: "Marie",
  email: "marie@libertia.com",
  abonnement: "free",
  promptsUtilises: 3,
  promptsTotal: 10,
};

export const MOCK_PROMPT_SUGGESTIONS = [
  "Je veux aller à New York 5 jours en juillet",
  "Trouve-moi un vol pour Tokyo, je verrai l'hôtel après",
  "Je pars à Paris avec un budget de 800€ pour le vol",
];

export const MOCK_RECENT_SEARCHES = [
  {
    id: 1,
    city: "Tokyo",
    status: "en cours",
    details: "10-20 juin 2024 • Vol + Hôtel",
  },
  {
    id: 2,
    city: "Paris",
    status: "réservé",
    details: "Hôtel uniquement",
  },
  {
    id: 3,
    city: "New York",
    status: "",
    details: "Vols consultés",
  },
];

export const MOCK_TRIP = {
  voyageId: "mock-001",
  userInput: "Je veux aller à Tokyo du 10 au 20 juin avec un budget de 1500€",
  destination: "Tokyo, Japon",
  dates: "10 - 20 juin 2024 (10 jours)",
  budget: 1500,
  budgetDetail: {
    flight: 780,
    hotel: 650,
    activities: 70,
    remaining: 70,
    hotelBudgetRemaining: 720,
  },
  travelers: 1,
  type: "Vol + Hôtel",
};

export const MOCK_FLIGHTS = [
  { id: 1, compagnie: "Air France", code: "AF 275", prix: 780 },
  { id: 2, compagnie: "KLM", code: "KL 861", prix: 620 },
  { id: 3, compagnie: "JAL", code: "JL 045", prix: 950 },
];

export const MOCK_HOTELS = [
  {
    id: 1,
    name: "HOTEL SUNROUTE PLAZA SHINJUKU",
    rating: "4 étoiles 4.5/5 (2348 avis)",
    district: "Shinjuku",
    pricePerNight: 85,
    totalPrice: 850,
    nights: 10,
    amenities: "Petit-déjeuner inclus",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80",
    status: "warning",
    statusText: "Dépasse légèrement votre budget hôtel.",
  },
  {
    id: 2,
    name: "APA HOTEL ASAKUSA",
    rating: "3 étoiles 4.2/5 (1567 avis)",
    district: "Asakusa",
    pricePerNight: 65,
    totalPrice: 650,
    nights: 10,
    amenities: "Bon transport",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
    status: "recommended",
    statusText: "L'hôtel APA Hotel (650€) vous laisse 70€ pour des activités",
    isRecommended: true,
  },
  {
    id: 3,
    name: "THE PRINCE PARK TOWER",
    rating: "5 étoiles 4.8/5 (3219 avis)",
    district: "Minato",
    pricePerNight: 180,
    totalPrice: 1800,
    nights: 10,
    amenities: "Piscine • Spa",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80",
    status: "error",
    statusText: "The Prince Park Tower dépasse votre budget total.",
  },
  {
    id: 4,
    name: "HOTEL NIWA",
    rating: "4 étoiles 4.6/5",
    district: "Chiyoda",
    pricePerNight: 95,
    totalPrice: 950,
    nights: 10,
    amenities: "Style japonais traditionnel",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&q=80",
    status: "warning",
    statusText: "Dépasse le budget hôtel.",
  },
  {
    id: 5,
    name: "CITADINES SHINJUKU",
    rating: "3 étoiles 4.0/5",
    district: "Shinjuku",
    pricePerNight: 55,
    totalPrice: 550,
    nights: 10,
    amenities: "Appartement • Kitchenette",
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&q=80",
    status: "recommended",
    statusText: "Vous laisse plus de marge budget.",
  },
  {
    id: 6,
    name: "TOKYO STATION HOTEL",
    rating: "5 étoiles 4.7/5",
    district: "Marunouchi",
    pricePerNight: 145,
    totalPrice: 1450,
    nights: 10,
    amenities: "Vue sur la gare • Luxe",
    image: "https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?w=900&q=80",
    status: "error",
    statusText: "Dépasse largement le budget.",
  },
];

export const MOCK_ACTIVITIES = [
  {
    id: 1,
    nom: "Temple Senso-ji",
    prix: 25,
    duree: "3h",
    note: 4.7,
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80",
  },
  {
    id: 2,
    nom: "TeamLab Planets",
    prix: 30,
    duree: "2h",
    note: 4.9,
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=900&q=80",
  },
  {
    id: 3,
    nom: "Cours de sushi",
    prix: 65,
    duree: "2h30",
    note: 4.8,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=900&q=80",
  },
  {
    id: 4,
    nom: "Mont Fuji journée",
    prix: 90,
    duree: "10h",
    note: 4.8,
    image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=900&q=80",
  },
];
