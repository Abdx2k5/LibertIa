import "./styles/Flightsection.css";

export default function Flightsection() {

  const flights = [
    {
      company: "Air France",
      price: "650€",
      time: "10h 30m"
    },
    {
      company: "Qatar Airways",
      price: "720€",
      time: "11h 10m"
    }
  ];

  return (
    <div className="flight-section">

      <h2>✈️ Vols recommandés</h2>

      {flights.map((flight, i) => (
        <div key={i} className="flight-card">

          <h3>{flight.company}</h3>

          <p>Durée : {flight.time}</p>

          <span className="price">{flight.price}</span>

          <button>Réserver</button>

        </div>
      ))}

    </div>
  );
}