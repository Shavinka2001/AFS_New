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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Use the correct backend URL for registration
      const res = await fetch("http://localhost:5000/api/users/register", {
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
          </div>

          <div>
            <label htmlFor="email" className="block text-[#19376d] font-semibold mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#19376d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition"
              required
            />
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
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="password" className="block text-[#19376d] font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#19376d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition"
                required
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="confirmPassword" className="block text-[#19376d] font-semibold mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#19376d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19376d] transition"
                required
              />
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