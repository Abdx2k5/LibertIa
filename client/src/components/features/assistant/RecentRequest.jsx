export default function RecentRequest() {

  const history = [
    {
      date: "10 juin 2024",
      title: "Recherche Tokyo JP",
      desc: "Vol + Hôtel proposés • Budget respecté",
      budget: "1500€"
    },
    {
      date: "5 juin 2024",
      title: "Hôtel Paris FR",
      desc: "3 hôtels trouvés dans votre budget",
      budget: "+50€"
    },
    {
      date: "28 mai 2024",
      title: "Activités Barcelone ES",
      desc: "12 activités recommandées",
      budget: ""
    }
  ];

  return (
    <div className="recent">

      <h2>Mes demandes récentes</h2>

      {history.map((item, i) => (
        <div key={i} className="recent-card">

          <span className="date">{item.date}</span>

          <h3>{item.title}</h3>

          <p>{item.desc}</p>

          {item.budget && <span className="budget">{item.budget}</span>}

        </div>
      ))}

    </div>
  );
}