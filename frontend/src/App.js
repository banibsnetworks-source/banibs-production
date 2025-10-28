import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from "./contexts/AuthContext";
import { ContributorAuthProvider } from "./contexts/ContributorAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOpportunitiesDashboard from "./pages/admin/AdminOpportunitiesDashboard";
import PublicOpportunities from "./pages/public/PublicOpportunities";
import SubmitOpportunity from "./pages/public/SubmitOpportunity";
import ContributorRegister from "./pages/contributor/ContributorRegister";
import ContributorLogin from "./pages/contributor/ContributorLogin";
// Phase 3.1 - Contributor Profile Pages
import ContributorProfile from "./pages/contributor/ContributorProfile";
import ContributorProfileEdit from "./pages/contributor/ContributorProfileEdit";
// Phase 5.4 - Opportunity Detail Page
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
// Home/Landing Page
import HomePage from "./pages/HomePage";
// Opportunity Hub (marketing/info page)
import OpportunityHubPage from "./pages/OpportunityHubPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div>
      <header className="App-header">
        <a
          className="App-link"
          href="https://emergent.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" alt="Emergent" />
        </a>
        <p className="mt-5 text-2xl font-bold text-white mb-6">BANIBS Platform</p>
        <div className="flex gap-4 mb-4">
          <a 
            href="/opportunities" 
            className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all inline-block shadow-[0_0_15px_rgba(255,215,0,0.5)]"
          >
            View Opportunities
          </a>
          <a 
            href="/submit" 
            className="px-6 py-3 bg-[#1a1a1a] border-2 border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] transition-all inline-block"
          >
            Submit Opportunity
          </a>
        </div>
        <a 
          href="/admin/login" 
          className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-400 text-sm rounded hover:bg-gray-700 transition-all inline-block"
        >
          Admin Dashboard
        </a>
      </header>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ContributorAuthProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/opportunity-hub" element={<OpportunityHubPage />} />
              
              {/* Public Routes */}
              <Route path="/opportunities" element={<PublicOpportunities />} />
              <Route path="/submit" element={<SubmitOpportunity />} />
              {/* Phase 5.4 - Opportunity Detail Page */}
              <Route path="/opportunity/:id" element={<OpportunityDetailPage />} />
              
              {/* Contributor Routes */}
              <Route path="/contributor/register" element={<ContributorRegister />} />
              <Route path="/contributor/login" element={<ContributorLogin />} />
              {/* Phase 3.1 - Contributor Profile Routes */}
              <Route path="/contributor/:id" element={<ContributorProfile />} />
              <Route path="/contributor/profile/edit" element={<ContributorProfileEdit />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/opportunities" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminOpportunitiesDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </div>
      </ContributorAuthProvider>
    </AuthProvider>
  );
}

export default App;
