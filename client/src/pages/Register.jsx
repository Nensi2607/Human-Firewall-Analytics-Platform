import { useState } from "react";
import hero from "../assets/hero.png";
import { ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { firstName, lastName, email, password } = formData;

      const { data } = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });

      // Save authentication data returned by backend
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Registration Successful!");

      navigate("/dashboard");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ================= LEFT SIDE ================= */}

      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-purple-900 p-12">

        <img
          src={hero}
          alt="HFAP"
          className="w-80 mb-8"
        />

        <h1 className="text-4xl font-bold text-white text-center">
          Human Firewall
        </h1>

        <h2 className="text-3xl font-bold text-cyan-400 mt-2">
          Analytics Platform
        </h2>

        <p className="text-slate-300 mt-6 text-center leading-7 max-w-lg">
          Build stronger cybersecurity habits through awareness,
          phishing simulations, and intelligent human risk analytics.
        </p>

      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="bg-white flex items-center justify-center p-8 lg:p-10">

        <div className="w-full max-w-md">

          {/* Icon */}

          <div className="flex justify-center mb-5">

            <div className="bg-blue-600 p-4 rounded-full">
              <ShieldCheck
                className="text-white"
                size={34}
              />
            </div>

          </div>

          {/* Heading */}

          <h2 className="text-3xl font-bold text-center text-slate-800">
            Create Account
          </h2>

          <p className="text-center text-gray-500 mt-2 mb-7">
            Join the Human Firewall Analytics Platform
          </p>

          {/* ================= FORM ================= */}

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >

            {/* First + Last Name */}

            <div className="grid grid-cols-2 gap-4">

              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Email */}

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Password */}

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Confirm Password */}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Terms */}

            <label className="flex items-start gap-2 text-sm text-gray-600">

              <input
                type="checkbox"
                required
                className="mt-1"
              />

              <span>
                I agree to the platform's terms and cybersecurity
                awareness policies.
              </span>

            </label>

            {/* Register Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white py-3 rounded-xl font-semibold disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Login */}

            <p className="text-center text-gray-600 pt-2">

              Already have an account?{" "}

              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Register;