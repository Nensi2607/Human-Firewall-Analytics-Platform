<<<<<<< HEAD
import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
=======
import Dashboard from "./pages/Dashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

function App() {
    const path = window.location.pathname;

    if (path === "/analytics") {
        return <AnalyticsDashboard />;
    }

    return <Dashboard />;
>>>>>>> 7f1e331 (basic analytics dashboard)
}

export default App;