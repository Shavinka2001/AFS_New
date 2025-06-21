import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setRemember(true); // Reset remember checkbox on submit
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        console.log("Login response:", data); // Debug log

        // Store token and user info
        if (remember) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("User", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("User", JSON.stringify(data.user));
        }

        // Check if user is admin
        const isAdmin = data.user?.userType === 'admin' || data.user?.isAdmin;
        console.log("Is admin:", isAdmin); // Debug log

        setTimeout(() => {
          if (isAdmin) {
            navigate("/admin");
          } else {
            navigate("/user/dashboard");
          }
        }, 1000);
      } else {
        setMessage({ type: "error", text: data.message || "Login failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Network error." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ff] via-white to-[#f0f4ff] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-200">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="h-20 w-27 object-contain squar-full shadow-md"
          />
        </div>
        <h2 className="text-3xl font-extrabold text-center text-[#0a2342] mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
          Sign in to your account to continue
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#0a2342] mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a2342] transition shadow-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#0a2342] mb-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a2342] transition shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-[#0a2342]">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={remember}
                className="mr-2 accent-[#0a2342]"
              />
              Remember me
            </label>
            <a
              href="#"
              className="hover:underline font-medium text-[#19376d]"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0a2342] text-white font-semibold rounded-xl hover:bg-[#0e2f5a] transition shadow-md"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-[#0a2342] font-semibold hover:underline"
            >
              Register
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;