import { useState } from "react";
import hero from "../assets/hero.png";
import { ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">

        {/* Left Side */}
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

          <p className="text-slate-300 mt-6 text-center leading-7">
            Empowering organizations through AI-powered cybersecurity
            awareness, phishing simulations, and human risk analytics.
          </p>

        </div>

        {/* Right Side */}
        <div className="bg-white flex items-center justify-center p-10">

          <div className="w-full max-w-md">

            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full">
                <ShieldCheck
                  className="text-white"
                  size={34}
                />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-slate-800">
              Welcome Back
            </h2>

            <p className="text-center text-gray-500 mt-2 mb-8">
              Login to continue
            </p>

            <form
              onSubmit={handleLogin}
              className="space-y-5 mt-8"
            >

              {/* Email */}

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Password */}

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Remember + Forgot */}

              <div className="flex justify-between items-center">

                <label className="flex items-center gap-2 text-sm">

                  <input type="checkbox" />

                  Remember me

                </label>

                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Forgot Password?
                </Link>

              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white py-3 rounded-xl font-semibold disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Login"}
              </button>

              {/* Register */}

              <p className="text-center text-gray-600">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Register
                </Link>

              </p>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;