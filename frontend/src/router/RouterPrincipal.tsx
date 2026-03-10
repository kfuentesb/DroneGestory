import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import LogIn from "../components/LogIn";
import PilotsList from "../components/lists/PilotsList";
import UserList from "../components/lists/UserList";
import Home from "../components/commons/Home";
import FormUser from "../components/forms/FormUser";
import Dashboard from "../components/Dashboard";
import Forbidden from "../components/commons/Forbidden";

export default class RouterPrincipal extends React.Component {
  render() {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth/login" element={<LogIn />} />
          <Route path="/auth/dashboard" element={<Dashboard/>}></Route>
          <Route path="/auth/users" element={<UserList />}></Route>
          <Route path="/auth/pilots" element={<PilotsList />}></Route>
          <Route path="/auth/register-user" element={<FormUser />}></Route>
          <Route path="/403" element={<Forbidden />} />
        </Routes>
      </div>
    );
  }
}