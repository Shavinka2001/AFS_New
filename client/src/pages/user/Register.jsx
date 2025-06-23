import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "user",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for email field to auto-append domain
    if (name === 'email') {
      // If user types @ character, auto-complete with full domain
      if (value.endsWith('@') && !value.includes('@agilefacilities.com')) {
        setForm({ ...form, [name]: value + 'agilefacilities.com' });
        return;
      }
      
      // If user has deleted part of the domain, keep it consistent
      if (value.includes('@') && !value.endsWith('@')) {
        const username = value.split('@')[0];
        if (username && !value.includes('@agilefacilities.com')) {
          // Only auto-complete if they're typing the domain portion
          const domainPart = value.split('@')[1] || '';
          if ('agilefacilities.com'.startsWith(domainPart)) {
            // Allow typing domain, don't auto-complete yet
            setForm({ ...form, [name]: value });
            return;
          } else {
            // Auto-complete with full domain when they type something else
            setForm({ ...form, [name]: username + '@agilefacilities.com' });
            return;
          }
        }
      }
    }
    
    // Default handling for all other fields
    setForm({ ...form, [name]: value });
  };
  // Function to validate email format
  const validateEmail = (email) => {
    return email.toLowerCase().endsWith('@agilefacilities.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    // Validate that email ends with @agilefacilities.com
    if (!validateEmail(form.email)) {
      setMessage({ type: "error", text: "Email must end with @agilefacilities.com" });
      return;
    }
    
    // Check if passwords match
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    
    setLoading(true);
    try {      // Use the correct backend URL for registration
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Registration successful! Redirecting..." });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Registration failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Network error." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.jpg" alt="Logo" className="h-24 w-24 object-contain" />
        </div>

        <h2 className="text-3xl font-extrabold text-[#0a2342] text-center mb-4">
          Create Your Account
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Please fill in the form to register
        </p>

        {message && (
          <div
            className={`mb-4 text-center rounded-lg py-2 px-4 ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="firstname" className="block text-[#19376d] font-semibold mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                id="firstname"
                value={form.firstname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#19376d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition"
                required
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="lastname" className="block text-[#19376d] font-semibold mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                value={form.lastname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#19376d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition"
                required
              />
            </div>
          </div>          <div>
            <label htmlFor="email" className="block text-[#19376d] font-semibold mb-1">
              Email Address <span className="text-sm font-normal text-gray-600">(@agilefacilities.com email required)</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="yourname@agilefacilities.com"
              className={`w-full px-4 py-2 border ${!form.email || validateEmail(form.email) ? 'border-[#19376d]' : 'border-red-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition`}
              required
            />
            {form.email && !validateEmail(form.email) && (
              <p className="mt-1 text-sm text-red-600">Email must end with @agilefacilities.com</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-[#19376d] font-semibold mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#19376d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition"
              required
            />
          </div>          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="password" className="block text-[#19376d] font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#19376d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#19376d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A6.978 6.978 0 0012 19.5c-3.866 0-7-3.134-7-7s3.134-7 7-7c1.875 0 3.579.75 4.875 1.975M15 12h6m-3-3l3 3l-3 3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#19376d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A6.978 6.978 0 0012 19.5c-3.866 0-7-3.134-7-7s3.134-7 7-7c1.875 0 3.579.75 4.875 1.975M15 12h6m-3-3l3 3l-3 3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="w-1/2">
              <label htmlFor="confirmPassword" className="block text-[#19376d] font-semibold mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    !form.confirmPassword || form.password === form.confirmPassword 
                      ? 'border-[#19376d]' 
                      : 'border-red-500'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {confirmPasswordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#19376d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A6.978 6.978 0 0012 19.5c-3.866 0-7-3.134-7-7s3.134-7 7-7c1.875 0 3.579.75 4.875 1.975M15 12h6m-3-3l3 3l-3 3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#19376d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A6.978 6.978 0 0012 19.5c-3.866 0-7-3.134-7-7s3.134-7 7-7c1.875 0 3.579.75 4.875 1.975M15 12h6m-3-3l3 3l-3 3" />
                    </svg>
                  )}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Removed User Type label and select */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 bg-[#19376d] text-white font-bold rounded-lg hover:bg-[#0a2342] transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-[#19376d]">
            Already have an account?{" "}
            <a href="/login" className="font-semibold hover:underline">
              Sign in
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;