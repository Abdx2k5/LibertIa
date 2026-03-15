import React from "react";
import "./Home.css";
//import recent1 from "../../assets/recent1.jpg"; // replace with your images
//import recent2 from "../../assets/recent2.jpg";
//import suggestion1 from "../../assets/osaka.jpg";
//import suggestion2 from "../../assets/seoul.jpg";
import suggestion3 from "../../../public/logo.jpeg";

const Home = () => {
  const recentRequests = [
    { date: "10 juin 2024", title: "Recherche Tokyo", type: "Vol + Hôtel", budget: "1500€", button: "Voir les résultats" },
    { date: "5 juin 2024", title: "Hôtel Paris", type: "3 hôtels trouvés", budget: "+50€", button: "Réserver à nouveau" },
    { date: "28 mai 2024", title: "Activités Barcelone", type: "12 activités recommandées", budget: null, button: "Voir" },
  ];

  const suggestions = [
    { img: suggestion3, city: "Osaka, Japon", info: "Découvrez la capitale gastronomique du Japon avec une culture vibrante et similaire à Tokyo.", price: "~1200€", tag: "Vous avez aimé Tokyo" },
    { img: suggestion3, city: "Séoul, Corée du Sud", info: "Une ville moderne, vibrante et extrêmement sûre et accessible pour les voyageurs solitaires.", price: "~1300€", tag: "Idéal Voyage Solo" },
    { img: suggestion3, city: "Lisbonne, Portugal", info: "Excellente alternative si vous cherchez du soleil, une culture riche et une gastronomie exceptionnelle sans exploser votre budget.", price: "~600€", tag: "Budget 1500€ respecté" },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1>Où votre imagination vous porte-t-elle aujourd'hui ?</h1>
        <p>Je suis votre assistant de voyage personnel. Je trouve vols, hôtels et activités selon vos envies et votre budget.</p>
        <div className="search-bar">
          <input type="text" placeholder="Dites où vous voulez aller, combien de temps, votre budget..." />
          <div className="filters">
            <button>✈️ Vol uniquement</button>
            <button>🏨 Hôtel uniquement</button>
            <button>✨ Activités</button>
            <button>👥 Groupe</button>
          </div>
          <div className="actions">
            <button className="mic">🎤</button>
            <button className="send">➤</button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="recent-requests">
          <h2>Mes demandes récentes</h2>
          {recentRequests.map((req, i) => (
            <div key={i} className="request-card">
              <span className="date">{req.date}</span>
              <h3>{req.title}</h3>
              <p>{req.type}</p>
              {req.budget && <span className="budget">{req.budget}</span>}
              <button>{req.button}</button>
            </div>
          ))}
          <button className="history-btn">Voir tout l'historique</button>
        </div>

        <div className="suggestions">
          <h2>Suggestions pour vous</h2>
          {suggestions.map((s, i) => (
            <div key={i} className="suggestion-card">
              <img src={s.img} alt={s.city} />
              <span className="tag">{s.tag}</span>
              <h3>{s.city}</h3>
              <p>{s.info}</p>
              <span className="price">{s.price}</span>
              <button>Explorer</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;