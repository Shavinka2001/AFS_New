import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, getUser } from "../../services/userService";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Check if there's any redirect message from other pages and if user is already logged in
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get('message');
    const type = params.get('type') || 'info';
    
    if (msg) {
      setMessage({ type, text: msg });
    }
    
    // Check if user is already logged in - but don't do this on every render
    const checkUserLoggedIn = () => {
      const user = localStorage.getItem("User") || sessionStorage.getItem("User");
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          if (parsedUser.isAdmin || parsedUser.userType === 'admin') {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/user/dashboard", { replace: true });
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };
    
    // Only check once when component mounts
    checkUserLoggedIn();
  }, [location, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRememberChange = (e) => {
    setRemember(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    
    try {
      const { email, password } = form;
      const data = await login(email, password, remember);
      
      setMessage({ 
        type: "success", 
        text: "Login successful! Redirecting..." 
      });
        // Navigate based on user role
      setTimeout(() => {
        if (data.user.isAdmin || data.user.userType === 'admin') {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/user/dashboard", { replace: true });
        }
      }, 1000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.message || "Invalid email or password. Please try again." 
      });
    } finally {
      setLoading(false);
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
          </div>          <div className="flex items-center justify-between text-sm text-[#0a2342]">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={handleRememberChange}
                className="mr-2 accent-[#0a2342]"
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              className="hover:underline font-medium text-[#19376d]"
            >
              Forgot password?
            </a>
          </div>          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl transition shadow-md ${
              loading 
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-[#0a2342] hover:bg-[#0e2f5a]"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
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