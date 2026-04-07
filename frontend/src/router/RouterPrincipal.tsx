import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import LogIn from "../components/main-elements-views/LogIn";
import UserList from "../components/lists/UserList";
import UserDetail from "../components/details/UserDetail";
import Home from "../components/main-elements-views/Home";
import FormUser from "../components/forms/FormUser";
import FormAircraft from "../components/forms/FormAircraft";
import Dashboard from "../components/dashboard/Dashboard";
import Forbidden from "../components/main-elements-views/Forbidden";
import NotFound from "../components/main-elements-views/NotFound";
import AircraftList from "../components/lists/AircraftList";
import ProfileDetail from "../components/details/ProfileDetail";
import AircraftDetail from "../components/details/AircraftDetail";
import OperationList from "../components/lists/OperationList";
import MultiStepsForm from "../components/commons/MultiStepForm/MultiStepsForm";
import MyOperationList from "../components/lists/MyOperationList";
import OperationDetail from "../components/details/OperationDetail";
import OperationAnexoDetail from "../components/details/OperationAnexoDetail";
import FileBrowserView from "../components/docs/FileBrowserView";
import FormOperation from "../components/forms/FormOperation";
import FormUserPassword from "../components/forms/FormUserPassword";

export default class RouterPrincipal extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Commons */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Users */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <UserList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/:id" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <UserDetail />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/users/:id/password"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <FormUserPassword />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/register-user" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <FormUser />
            </ProtectedRoute>
          } 
        />

        <Route path="/profile/:id" element={<ProfileDetail />} />

        {/* Aircrafts */}
        <Route path="/aircrafts" element={<AircraftList />} />
        <Route path="/aircrafts/:id" element={<AircraftDetail />} />
        
        {/* Registrar aeronave está restringido */}
        <Route 
          path="/register-aircraft" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <FormAircraft />
            </ProtectedRoute>
          } 
        />

        {/* Operations */}
        <Route path="/operations" element={<OperationList />} />
        <Route path="/operations/details/mine" element={<MyOperationList />} />
        <Route path="/operations/:id" element={<OperationDetail />} />
        <Route path="/operations/:id/anexo4" element={<OperationAnexoDetail tipoAnexo={4} />} />
        <Route path="/operations/:id/anexo5" element={<OperationAnexoDetail tipoAnexo={5} />} />
        <Route path="/operations/:id/anexo6" element={<OperationAnexoDetail tipoAnexo={6} />} />
        <Route path="/operations/:id/anexo7" element={<OperationAnexoDetail tipoAnexo={7} />} />
        <Route path="/operations/:id/anexo8" element={<OperationAnexoDetail tipoAnexo={8} />} />
        <Route path="/register-operation" element={<FormOperation />} />

        <Route 
          path="/docs" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <FileBrowserView />
            </ProtectedRoute>
          } 
        />
        

        {/* Error */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }
}
