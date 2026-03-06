import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import LogIn from "../components/LogIn";

export default class RouterPrincipal extends React.Component {
  render() {
    return (
      <div>
        <nav>
          <Link to="/auth/login">Login </Link>
          <Link to="/auth/pilots">Pilotos</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" />} />
          <Route path="/auth/login" element={<LogIn />} />
        </Routes>
      </div>
    );
  }
}