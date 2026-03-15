import "./styles/Airesponse.css";

export default function Airesponse({ query }) {
  return (
    <div className="ai-response">

      <h2>Assistant IA</h2>

      <p>
        Voici ce que j'ai trouvé pour votre demande :
      </p>

      <div className="user-query">
        "{query}"
      </div>

    </div>
  );
}