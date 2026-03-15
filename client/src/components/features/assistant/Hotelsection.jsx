import "./styles/Hotelsection.css";

export default function Hotelsection() {

  const hotels = [
    {
      name: "The Prince Park Tower",
      price: "120€ / nuit",
      rating: "4.6 ⭐"
    },
    {
      name: "Hotel Niwa Tokyo",
      price: "110€ / nuit",
      rating: "4.7 ⭐"
    },
    {
      name: "Citadines Shinjuku",
      price: "95€ / nuit",
      rating: "4.5 ⭐"
    }
  ];

  return (
    <div className="hotel-section">

      <h2>🏨 Hôtels suggérés</h2>

      {hotels.map((hotel, i) => (

        <div key={i} className="hotel-card">

          <h3>{hotel.name}</h3>

          <p>{hotel.rating}</p>

          <span className="price">{hotel.price}</span>

          <button>Détails</button>

        </div>

      ))}

    </div>
  );
}