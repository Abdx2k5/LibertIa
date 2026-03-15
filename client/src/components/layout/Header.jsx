import React from "react";
import "./styles/Header.css";
//import logo from "../../assets/logo.jpeg"; // your logo

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        
        <span>Libertia</span>
      </div>
      <nav className="nav-links">
        <a href="#">Accueil</a>
        <a href="#">Vols</a>
        <a href="#">Hébergements</a>
        <a href="#">Activités</a>
        <a href="#">Communauté</a>
      </nav>
      <div className="header-actions">
        <button className="theme-btn">🌙</button>
        <button className="lang-btn">FR</button>
        <img className="user-avatar" src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
        <a href="#" className="assistant-btn">Assistant IA</a>
      </div>
    </header>
  );
};

export default Header;