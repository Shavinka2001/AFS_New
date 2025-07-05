import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";

// Configure axios defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://4.236.138.4:5001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: "user",
    isActive: true,
    phone: ""
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get token from localStorage or sessionStorage
        let token = localStorage.getItem("token") || sessionStorage.getItem("token");
        token = token?.replace(/^"|"$/g, '');
        const userData = JSON.parse(localStorage.getItem("User") || sessionStorage.getItem("User") || "{}");
          console.log("Token:", token); // Debug log
        console.log("User data:", userData); // Debug log
        
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }
        
        // Admin check is now handled by AdminRoute component
        const response = await api.get("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data) {
          setUsers(response.data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Email validation: must end with @agilefacilities.com
    if (!newUser.email.toLowerCase().endsWith('@agilefacilities.com')) {
      setError("Email must end with @agilefacilities.com");
      return;
    }
    
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const userData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        userType: newUser.userType,
        isActive: newUser.isActive,
        phone: newUser.phone
      };

      const response = await api.post(
        "/api/users",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setUsers([...users, response.data]);
        setShowAddModal(false);
        setSuccess("User created successfully!");
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          userType: "user",
          isActive: true,
          phone: ""
        });
      }
    } catch (err) {
      console.error("Error adding user:", err);
      setError(err.response?.data?.message || "Failed to add user. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "email") {
      // Only allow editing before the @ for both add and edit modals
      const username = value.split("@")[0];
      setNewUser(prev => ({
        ...prev,
        email: username + "@agilefacilities.com"
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleEditUser = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setNewUser({
        firstName: user.firstname || user.firstName || "",
        lastName: user.lastname || user.lastName || "",
        email: user.email || "",
        password: "", // Don't show password
        userType: user.userType,
        isActive: user.isActive,
        phone: user.phone || ""
      });
      setShowEditModal(true);
    }
  };  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.delete(`/api/users/${userToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(users.filter(user => user._id !== userToDelete));
      setSuccess("User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const userData = {
        firstname: newUser.firstName,
        lastname: newUser.lastName,
        email: newUser.email,
        userType: newUser.userType,
        isActive: newUser.isActive,
        phone: newUser.phone
      };

      if (newUser.password) {
        userData.password = newUser.password;
      }

      const response = await api.put(
        `/api/users/${selectedUser._id}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setUsers(users.map(user => 
          user._id === selectedUser._id ? response.data : user
        ));
        setShowEditModal(false);
        setSuccess("User updated successfully!");
        setSelectedUser(null);
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          userType: "user",
          isActive: true,
          phone: ""
        });
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  // Approve user
  const handleApproveUser = async (userId) => {
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await api.patch(
        `/api/users/approve/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data && response.data.user) {
        setUsers(users.map(user =>
          user._id === userId ? { ...user, isActive: true } : user
        ));
        setSuccess("User approved successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve user.");
    }
  };

  // Download users as Excel
  const handleDownloadUsersExcel = () => {
    if (!users || users.length === 0) {
      alert("No users to export.");
      return;
    }
    const allUsers = users.map(user => ({
      "User ID": user._id,
      "First Name": user.firstname || user.firstName,
      "Last Name": user.lastname || user.lastName,
      "Email": user.email,
      "Phone": user.phone || "",
      "Role": user.userType,
      "Active": user.isActive ? "Yes" : "No",
      "Created At": user.createdAt,
      "Updated At": user.updatedAt,
    }));
    const ws = XLSX.utils.json_to_sheet(allUsers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user-management.xlsx");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
         <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-700">
                Manage your users, their roles, and account status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownloadUsersExcel}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl shadow-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 transform hover:scale-105"
                title="Download users as Excel"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download Users
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New User
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 sm:mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl animate-fadeIn shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 sm:mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-xl animate-fadeIn shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                    Contact
                  </th>
                  <th scope="col" className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Role
                  </th>
                  <th scope="col" className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th scope="col" className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Approval
                  </th>
                  <th scope="col" className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                            <span className="text-gray-900 font-medium text-base sm:text-lg">
                              {user.firstname?.[0]}{user.lastname?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            ID: {user._id.slice(-6)}
                          </div>
                          <div className="sm:hidden mt-1">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-600">{user.phone || 'No phone'}</div>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-3 sm:px-4 py-1 sm:py-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.userType === 'admin' 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.userType === 'admin' ? 'Administrator' : 'Regular User'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap hidden sm:table-cell">
                      <span className={`px-3 sm:px-4 py-1 sm:py-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-semibold shadow-sm border border-green-200 text-xs sm:text-sm">
                        <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Approved
                      </span>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveUser(user._id)}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-sm border border-blue-400 hover:from-blue-700 hover:to-blue-600 transition-all text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          title="Approve"
                        >
                          <svg className="w-4 h-4 mr-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold shadow-sm border border-red-300 hover:from-red-600 hover:to-red-500 transition-all text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                          title="Reject"
                        >
                          <svg className="w-4 h-4 mr-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2 sm:space-x-4">
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 sm:p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md mx-auto shadow-2xl transform transition-all animate-slideIn border border-gray-100">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Add New User
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={newUser.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={newUser.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="email"
                    value={newUser.email.replace("@agilefacilities.com", "")}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 sm:pl-12 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border ${!newUser.email || newUser.email.toLowerCase().endsWith('@agilefacilities.com') ? 'border-gray-300' : 'border-red-500'} focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all pr-44`}
                    placeholder="john.doe"
                    autoComplete="off"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 select-none pointer-events-none">
                    @agilefacilities.com
                  </span>
                  {/* Email validation message */}
                  {newUser.email && !newUser.email.toLowerCase().endsWith('@agilefacilities.com') && (
                    <p className="mt-1 text-xs text-red-600">Email must end with @agilefacilities.com</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 sm:pl-12 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">User Type</label>
                <div className="relative">
                  <select
                    name="userType"
                    value={newUser.userType}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newUser.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 focus:ring-gray-500 border-gray-300 rounded transition-all"
                />
                <label className="ml-2 sm:ml-3 block text-sm font-medium text-gray-700">
                  Active Account
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-100 animate-slideIn">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="bg-red-100 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Delete User
              </h3>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <p className="text-gray-700">Are you sure you want to delete this user? This action cannot be undone and all associated data will be permanently removed.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={cancelDeleteUser}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>Delete User</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md mx-auto shadow-2xl transform transition-all animate-slideIn border border-gray-100">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Edit User
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={newUser.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={newUser.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="email"
                    value={newUser.email.replace("@agilefacilities.com", "")}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 sm:pl-12 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all pr-44"
                    placeholder="john.doe"
                    autoComplete="off"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 select-none pointer-events-none">
                    @agilefacilities.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 sm:pl-12 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">User Type</label>
                <div className="relative">
                  <select
                    name="userType"
                    value={newUser.userType}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newUser.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 focus:ring-gray-500 border-gray-300 rounded transition-all"
                />
                <label className="ml-2 sm:ml-3 block text-sm font-medium text-gray-700">
                  Active Account
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;