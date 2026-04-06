import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import LogIn from "../components/LogIn";
import UserList from "../components/lists/UserList";
import UserDetail from "../components/details/UserDetail";
import Home from "../components/commons/Home";
import FormUser from "../components/forms/FormUser";
import FormAircraft from "../components/forms/FormAircraft";
import Dashboard from "../components/Dashboard";
import Forbidden from "../components/commons/Forbidden";
import NotFound from "../components/commons/NotFound";
import AircraftList from "../components/lists/AircraftList";
import ProfileDetail from "../components/details/ProfileDetail";
import AircraftDetail from "../components/details/AircraftDetail";
import OperationList from "../components/lists/OperationList";
import MultiStepsForm from "../components/commons/MultiStepForm/MultiStepsForm";
import MyOperationList from "../components/lists/MyOperationList";
import OperationDetail from "../components/details/OperationDetail";
import OperationAnexoDetail from "../components/details/OperationAnexoDetail";
import FileBrowserView from "../components/docs/FileBrowserView";

export default class RouterPrincipal extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Commons */}
        <Route path="/home" element={<Home />} />
        <Route path="/auth/login" element={<LogIn />} />
        <Route path="/auth/dashboard" element={<Dashboard />} />

        {/* Users */}
        <Route 
          path="/auth/users" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <UserList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/auth/users/:id" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <UserDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/auth/register-user" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <FormUser />
            </ProtectedRoute>
          } 
        />

        <Route path="/profile/:id" element={<ProfileDetail />} />

        {/* Aircrafts */}
        <Route path="/auth/aircrafts" element={<AircraftList />} />
        <Route path="/auth/aircrafts/:id" element={<AircraftDetail />} />
        
        {/* Registrar aeronave está restringido */}
        <Route 
          path="/auth/register-aircraft" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <FormAircraft />
            </ProtectedRoute>
          } 
        />

        {/* Operations */}
        <Route path="/auth/operations" element={<OperationList />} />
        <Route path="/auth/operations/details/mine" element={<MyOperationList />} />
        <Route path="/auth/operations/:id" element={<OperationDetail />} />
        <Route path="/auth/operations/:id/anexo4" element={<OperationAnexoDetail tipoAnexo={4} />} />
        <Route path="/auth/operations/:id/anexo5" element={<OperationAnexoDetail tipoAnexo={5} />} />
        <Route path="/auth/operations/:id/anexo6" element={<OperationAnexoDetail tipoAnexo={6} />} />
        <Route path="/auth/operations/:id/anexo7" element={<OperationAnexoDetail tipoAnexo={7} />} />
        <Route path="/auth/operations/:id/anexo8" element={<OperationAnexoDetail tipoAnexo={8} />} />
        <Route path="/auth/register-operation" element={<MultiStepsForm />} />

        <Route 
          path="/auth/docs" 
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
