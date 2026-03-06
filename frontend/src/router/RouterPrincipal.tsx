import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import LogIn from "../components/LogIn";
import PilotsView from "../components/PilotsView";
import Dashboard from "../components/Dashboard";

export default class RouterPrincipal extends React.Component {
  render() {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/auth/login" element={<LogIn />} />
          <Route path="/auth/pilots" element={<PilotsView />}></Route>
        </Routes>
      </div>
    );
  }
}