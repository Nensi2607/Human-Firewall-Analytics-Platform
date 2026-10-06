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
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user?.role === "admin" ? "/dashboard" : "/employee", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-visual">
          <img src={hero} alt="HFAP" className="auth-hero-image" />
          <h1>Human Firewall</h1>
          <h2>Analytics Platform</h2>
          <p>
            Empowering organizations through AI-powered cybersecurity awareness,
            phishing simulations, and human risk analytics.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-icon-wrap">
            <div className="auth-icon">
              <ShieldCheck size={34} />
            </div>
          </div>

          <h2>Welcome back</h2>
          <p className="auth-subtitle">Login to continue</p>

          <form onSubmit={handleLogin} className="auth-form">
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />

            <button type="submit" disabled={loading} className="auth-cta">
              {loading ? "Signing In..." : "Login"}
            </button>

            <p className="auth-footer">
              Don’t have an account? <Link to="/register" className="auth-link">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;