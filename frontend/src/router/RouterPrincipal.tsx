import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import LogIn from "../components/main-elements-views/LogIn";
import UserList from "../components/lists/UserList";
import UserDetail from "../components/details/user&profile/UserDetail";
import Home from "../components/main-elements-views/Home";
import FormUser from "../components/forms/FormUser";
import Dashboard from "../components/dashboard/Dashboard";
import Forbidden from "../components/main-elements-views/Forbidden";
import NotFound from "../components/main-elements-views/NotFound";
import AircraftList from "../components/lists/AircraftList";
import ProfileDetail from "../components/details/user&profile/ProfileDetail";
import AircraftDetail from "../components/details/aircraft/AircraftDetail";
import AircraftModelDetail from "../components/details/aircraft/AircraftModelDetail";
import OperationList from "../components/lists/OperationList";
import MyOperationList from "../components/lists/MyOperationList";
import OperationDetail from "../components/details/operation/OperationDetail";
import OperationAnexoDetail from "../components/details/operation/OperationAnexoDetail";
import FileBrowserView from "../components/docs/FileBrowserView";
import FormUserPassword from "../components/forms/FormUserPassword";
import RegisterAircraftFlow from "../components/forms/RegisterAircraftFlow";
import FormAircraftModel from "../components/forms/FormAircraftModel";
import FormFlightTime from "../components/forms/FormFlightTime";
import FormMaintenance from "../components/forms/FormMaintenance";
import AircraftModelList from "../components/lists/AircraftModelList";
import FlightTimeList from "../components/lists/FlightTimeList";
import MaintenanceList from "../components/lists/MaintenanceList";
import MaintenanceAircraftList from "../components/lists/MaintenanceAircraftList";
import AircraftFlightTimeList from "../components/lists/AircraftFlightTimeList";
import Settings from "../components/main-elements-views/Settings";

export default class RouterPrincipal extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Commons */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Users */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/:id" 
          element={
            <ProtectedRoute>
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
        <Route path="/aircraft-models" element={<AircraftModelList />} />
        <Route path="/aircraft-models/:id" element={<AircraftModelDetail />} />
        
        {/* Registrar aeronave está restringido */}
        <Route 
          path="/register-aircraft" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <RegisterAircraftFlow />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/register-model"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <FormAircraftModel />
            </ProtectedRoute>
          }
        />

        {/* Summary list of aircraft flight hours. */}
        <Route 
          path="/flight-times" 
          element={
              <AircraftFlightTimeList />
          } 
        />

        <Route 
          path="/flight-times/:aircraftId" 
          element={
              <FlightTimeList />
          } 
        />

        <Route 
          path="/flight-times/:aircraftId/register" 
          element={
              <FormFlightTime />
          } 
        />

        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MAINTAINER"]}>
              <MaintenanceList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/maintenance/aircraft/:aircraftId" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MAINTAINER"]}>
              <MaintenanceAircraftList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/register-maintenance" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <FormMaintenance />
            </ProtectedRoute>
          } 
        />

        {/* Operations */}
        <Route path="/operations" element={<OperationList />} />
        <Route path="/operations/details/mine" element={<MyOperationList />} />
        <Route path="/operations/:id" element={<OperationDetail />} />
        <Route path="/operations/:id/anexo4" element={<OperationAnexoDetail tipoAnexo={4} />} />
        <Route path="/operations/:id/anexo4/version/:versionId" element={<OperationAnexoDetail tipoAnexo={4} />} />
        <Route path="/operations/:id/anexo5" element={<OperationAnexoDetail tipoAnexo={5} />} />
        <Route path="/operations/:id/anexo5/version/:versionId" element={<OperationAnexoDetail tipoAnexo={5} />} />
        <Route path="/operations/:id/anexo6" element={<OperationAnexoDetail tipoAnexo={6} />} />
        <Route path="/operations/:id/anexo6/version/:versionId" element={<OperationAnexoDetail tipoAnexo={6} />} />
        <Route path="/operations/:id/anexo7" element={<OperationAnexoDetail tipoAnexo={7} />} />
        <Route path="/operations/:id/anexo7/version/:versionId" element={<OperationAnexoDetail tipoAnexo={7} />} />
        <Route path="/operations/:id/anexo8" element={<OperationAnexoDetail tipoAnexo={8} />} />
        <Route path="/operations/:id/anexo8/version/:versionId" element={<OperationAnexoDetail tipoAnexo={8} />} />

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
