import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, getUser } from "../../services/userService";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
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

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
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
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {passwordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
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