import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import LogIn from "../components/LogIn";
import PilotsView from "../components/PilotsView";
import Home from "../components/Home";
import Navbar from "../components/Navbar";

export default class RouterPrincipal extends React.Component {
  render() {
    return (
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth/login" element={<LogIn />} />
          <Route path="/auth/pilots" element={<PilotsView />}></Route>
        </Routes>
      </div>
    );
  }
}