import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LogIn from "../components/LogIn";
import PilotsList from "../components/lists/PilotsList";
import UserList from "../components/lists/UserList";
import UserDetail from "../components/UserDetail";
import Home from "../components/commons/Home";
import FormUser from "../components/forms/FormUser";
import Dashboard from "../components/Dashboard";
import Forbidden from "../components/commons/Forbidden";
import NotFound from "../components/commons/NotFound";

export default class RouterPrincipal extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />

        <Route path="/home" element={<Home />} />
        <Route path="/auth/login" element={<LogIn />} />
        <Route path="/auth/dashboard" element={<Dashboard />} />

        {/* Users */}
        <Route path="/auth/users" element={<UserList />} />
        <Route path="/auth/users/:id" element={<UserDetail />} />
        <Route path="/auth/register-user" element={<FormUser />} />

        {/* Pilots */}
        <Route path="/auth/pilots" element={<PilotsList />} />

        {/* Error */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }
}