import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import UserDashboard from "./pages/user/UserDashboard";
import UserManagement from "./pages/admin/UserManagement";
import LocationManagement from "./pages/admin/LocationManagement";
import WorkOrderManagement from "./pages/admin/workOrderManagement";
import SessionTimeoutAlert from "./components/common/SessionTimeoutAlert";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SessionTimeoutAlert />
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes with layout */}       
         <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="workorders" element={<WorkOrderManagement />} />
          <Route path="locations" element={<LocationManagement />} />
          {/* Add more admin routes here */}
        </Route>

        {/* User routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;