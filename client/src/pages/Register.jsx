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
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-visual">
          <img src={hero} alt="HFAP" className="auth-hero-image" />
          <h1>Human Firewall</h1>
          <h2>Analytics Platform</h2>
          <p>
            Build stronger cybersecurity habits through awareness, phishing
            simulations, and intelligent human risk analytics.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-icon-wrap">
            <div className="auth-icon">
              <ShieldCheck size={34} />
            </div>
          </div>

          <h2>Create account</h2>
          <p className="auth-subtitle">Join the Human Firewall Analytics Platform</p>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-name-row">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="auth-input"
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
            />

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="auth-input"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="auth-input"
            />

            <label className="remember-me auth-terms">
              <input type="checkbox" required />
              <span>
                I agree to the platform&apos;s terms and cybersecurity awareness
                policies.
              </span>
            </label>

            <button type="submit" disabled={loading} className="auth-cta">
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="auth-footer">
              Already have an account? <Link to="/login" className="auth-link">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;