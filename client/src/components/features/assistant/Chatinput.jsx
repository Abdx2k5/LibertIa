import { useState } from "react";
import { Sparkles, Mic, Send } from "lucide-react";
import "./styles/Chatinput.css";

export default function Chatinput({ onSubmit, isProcessing, initialValue = "" }) {
  const [input, setInput] = useState(initialValue);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = () => {
    if (input.trim() && !isProcessing) {
      onSubmit(input);
    }
  };

  const handleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setInput("Je veux aller à Paris du 5 au 15 juillet avec un budget de 2000€");
        setIsListening(false);
      }, 2000);
    }
  };

  const suggestions = [
    "Je veux aller à New York 5 jours en juillet",
    "Trouve-moi un vol pour Tokyo, je verrai l'hôtel après",
    "Je pars à Paris avec un budget de 800€ pour le vol",
  ];

  return (
    <div className="chatinput-container">
      <div className="chatinput-main">
        <div className="chatinput-icon">
          <Sparkles className="size-full text-[#0ff]" strokeWidth={2} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Je veux aller à Tokyo du 10 au 20 juin avec un budget de 1500€"
          disabled={isProcessing}
          className="chatinput-field"
        />
      </div>

      <div className="chatinput-actions">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || !input.trim()}
          className="chatinput-submit"
        >
          <Send className="size-[14px] text-[#001217]" fill="#001217" />
          <span>{isProcessing ? "Traitement..." : "Écrire"}</span>
        </button>

        <button
          onClick={handleVoice}
          className={`chatinput-voice ${isListening ? "listening" : ""}`}
        >
          <Mic className={`size-[14px] text-[#e6f0ff] ${isListening ? "animate-pulse" : ""}`} />
          <span>{isListening ? "Écoute..." : "Parler"}</span>
        </button>
      </div>

      <div className="chatinput-suggestions">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => setInput(suggestion)}
            disabled={isProcessing}
            className="chatinput-suggestion"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}