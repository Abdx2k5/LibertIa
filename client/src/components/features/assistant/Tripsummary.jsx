import "./styles/Tripsummary.css";

export default function Tripsummary() {

  return (
    <div className="trip-summary">

      <h2>📊 Résumé du voyage</h2>

      <div className="summary-card">

        <p>Vol : 650€</p>

        <p>Hôtel : 5 nuits × 110€</p>

        <p>Activités : 120€</p>

        <hr />

        <h3>Total estimé : 1320€</h3>

        <span className="budget-ok">
          Budget respecté
        </span>

        <button className="book-btn">
          Confirmer le voyage
        </button>

      </div>

    </div>
  );
}