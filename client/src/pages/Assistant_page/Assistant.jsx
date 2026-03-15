import { useState } from "react";

import Header from "../../components/layout/Header";
import Banner from "../../components/features/assistant/Banner";
import Chatinput from "../../components/features/assistant/Chatinput";
import Airesponse from "../../components/features/assistant/AiResponse";
import Flightsection from "../../components/features/assistant/Flightsection";
import Hotelsection from "../../components/features/assistant/Hotelsection";
import Activitiessection from "../../components/features/assistant/Activitiessection";
import Tripsummary from "../../components/features/assistant/Tripsummary";

import "./Assistant.css";

export default function Assistant(){

const [query,setQuery]=useState("")
const [showResults,setShowResults]=useState(false)

const handleSearch=(q)=>{
setQuery(q)
setShowResults(true)
}

return(

<div className="assistant-page">

<Header/>

<Banner/>

<Chatinput onSearch={handleSearch}/>

{showResults && (

<>

<Airesponse query={query}/>

<Flightsection/>

<Hotelsection/>

<Activitiessection/>

<Tripsummary/>

</>

)}

</div>

)
}