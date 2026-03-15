import { useState, useEffect } from "react";
import api from "../../services/api";
import Header from "../../components/layout/Header";
import Banner from "../../components/features/assistant/Banner";
import Chatinput from "../../components/features/assistant/Chatinput";
import Airesponse from "../../components/features/assistant/Airesponse";
import Flightsection from "../../components/features/assistant/Flightsection";
import Hotelsection from "../../components/features/assistant/Hotelsection";
import Tripsummary from "../../components/features/assistant/Tripsummary";
import Activitiessection from "../../components/features/assistant/Activitiessection";
import "./Assistant.css";

export default function Assistant() {
  const [userName, setUserName] = useState("Voyageur");
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [tripDetails, setTripDetails] = useState({
    destination: "",
    dates: "",
    budget: 0,
    travelers: 1,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/auth/me');
          if (res.data && res.data.nom) {
            setUserName(res.data.nom.split(' ')[0]);
          }
        }
      } catch (err) {
        console.error('Erreur récupération utilisateur:', err);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (input) => {
    setUserInput(input);
    setIsProcessing(true);
    setShowResults(false);

    try {
      const res = await api.post('/voyages/generer', { prompt: input });
      const itineraryData = res.data.data.itineraire;
      
      setTripDetails({
        destination: itineraryData.destination || "Tokyo, Japon",
        dates: itineraryData.dates || "10 - 20 juin 2024 (10 jours)",
        budget: itineraryData.budget_estime || 1500,
        travelers: 1,
      });
      
      setIsProcessing(false);
      setShowResults(true);
    } catch (err) {
      console.error('Erreur génération:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="assistant-page">
      <Header />
      
      <main className="assistant-main">
        <Banner userName={userName} />
        
        <div className="chat-section">
          <Chatinput 
            onSubmit={handleSubmit} 
            isProcessing={isProcessing}
            initialValue={userInput}
          />
        </div>

        {(isProcessing || showResults) && (
          <div className="results-section">
            <Airesponse 
              userInput={userInput || "Je veux aller à Tokyo du 10 au 20 juin avec un budget de 1500€"}
              tripDetails={tripDetails}
              isProcessing={isProcessing}
            />

            {showResults && (
              <>
                <Flightsection />
                <Hotelsection budget={tripDetails.budget} />
                <Tripsummary />
                <Activitiessection />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}