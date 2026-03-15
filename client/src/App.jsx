import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home_page/Home";
import Assistant from "./pages/Assistant_page/Assistant";

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistant" element={<Assistant />} />
      </Routes>
    </Router>
  );
}

export default App;