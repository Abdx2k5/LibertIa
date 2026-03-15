export default function Suggestions() {

  const suggestions = [
    {
      city: "Osaka, Japon",
      price: "~1200€",
      img: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c"
    },
    {
      city: "Séoul, Corée du Sud",
      price: "~1300€",
      img: "https://images.unsplash.com/photo-1538485399081-7c807b3c6a4b"
    },
    {
      city: "Lisbonne, Portugal",
      price: "~600€",
      img: "https://images.unsplash.com/photo-1513735492246-483525079686"
    }
  ];

  return (
    <div className="suggestions">

      <h2>Suggestions pour vous</h2>

      <div className="suggest-grid">

        {suggestions.map((item, i) => (

          <div key={i} className="suggest-card">

            <img src={item.img} />

            <div className="suggest-content">

              <h3>{item.city}</h3>

              <p>{item.price}</p>

              <button>Explorer</button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}