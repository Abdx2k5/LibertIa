import "./styles/ActivitiesSection.css";

export default function Activitiessection() {

  const activities = [
    {
      name: "Temple Senso-ji",
      duration: "2h",
      price: "25€"
    },
    {
      name: "TeamLab Planets",
      duration: "3h",
      price: "30€"
    },
    {
      name: "Cours de Sushi",
      duration: "2h30",
      price: "65€"
    }
  ];

  return (
    <div className="activities-section">

      <h2>🎎 Activités recommandées</h2>

      {activities.map((activity, i) => (

        <div key={i} className="activity-card">

          <h3>{activity.name}</h3>

          <p>Durée : {activity.duration}</p>

          <span className="price">{activity.price}</span>

          <button>Ajouter</button>

        </div>

      ))}

    </div>
  );
}