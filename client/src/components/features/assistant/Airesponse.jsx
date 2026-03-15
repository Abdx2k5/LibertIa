import { CheckCircle2, Edit3, MapPin, Calendar, Wallet, Users, Luggage } from "lucide-react";
//import { motion } from "motion/react";
import "./styles/Airesponse.css";

export default function Airesponse({ userInput, tripDetails, isProcessing }) {
  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="airesponse-container processing"
      >
        <div className="airesponse-loading">
          <div className="animate-spin size-6">
            <svg className="size-full" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#0ff" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="#0ff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="airesponse-title">ANALYSE DE VOTRE DEMANDE EN COURS...</h3>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="airesponse-container"
    >
      <div className="airesponse-header">
        <CheckCircle2 className="size-6 text-[#0ff]" strokeWidth={2} />
        <h3 className="airesponse-title">J'AI COMPRIS VOTRE DEMANDE</h3>
      </div>

      <div className="airesponse-quote">
        <p className="airesponse-quote-text">"{userInput}"</p>
      </div>

      <div className="airesponse-details">
        <div className="airesponse-detail-item">
          <MapPin className="size-[14px] text-[#0ff]" strokeWidth={2} />
          <strong>Destination :</strong>
          <span>{tripDetails.destination}</span>
        </div>

        <div className="airesponse-detail-item">
          <Calendar className="size-[14px] text-[#0ff]" strokeWidth={2} />
          <strong>Dates :</strong>
          <span>{tripDetails.dates}</span>
        </div>

        <div className="airesponse-detail-item">
          <Wallet className="size-[14px] text-[#0ff]" strokeWidth={2} />
          <strong>Budget total :</strong>
          <span>{tripDetails.budget}€</span>
        </div>

        <div className="airesponse-detail-item">
          <Users className="size-[14px] text-[#0ff]" strokeWidth={2} />
          <strong>Voyageurs :</strong>
          <span>{tripDetails.travelers} personne</span>
        </div>

        <div className="airesponse-detail-item">
          <Luggage className="size-[14px] text-[#0ff]" strokeWidth={2} />
          <strong>Type :</strong>
          <span>Vol + Hôtel</span>
        </div>
      </div>

      <div className="airesponse-actions">
        <button className="airesponse-btn-confirm">
          <CheckCircle2 className="size-[14px] text-[#22c983]" strokeWidth={2} />
          <span>Confirmer</span>
        </button>

        <button className="airesponse-btn-edit">
          <Edit3 className="size-[14px] text-[#e6f0ff]" strokeWidth={2} />
          <span>Modifier</span>
        </button>
      </div>
    </motion.div>
  );
}