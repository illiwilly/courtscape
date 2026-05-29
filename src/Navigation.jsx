import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          ⚖️ Courtscape
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Search
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/law-firms" className="nav-link">
              Law Firms
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/analytics" className="nav-link">
              Analytics
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
