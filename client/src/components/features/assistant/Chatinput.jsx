import { useState } from "react";
import "./styles/Chatinput.css";

export default function Chatinput({ onSearch }) {

  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (!query) return;
    onSearch(query);
  };

  return (
    <div className="chat-box">

      <input
        placeholder="Dites où vous voulez aller, combien de temps, votre budget..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={handleSubmit}>✈️</button>

    </div>
  );
}