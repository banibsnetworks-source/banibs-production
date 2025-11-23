import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from "./contexts/AuthContext";
import { ContributorAuthProvider } from "./contexts/ContributorAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AccountModeProvider } from "./contexts/AccountModeContext";
import { MediaViewerProvider } from "./hooks/useMediaViewer";
import { MediaViewer } from "./components/media/MediaViewer";
import { initializeAnalytics } from "./utils/analytics"; // Phase 7.5.1
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOpportunitiesDashboard from "./pages/admin/AdminOpportunitiesDashboard";
// Phase 8.3.1 - Social Moderation
import AdminSocialReportsPage from "./pages/admin/AdminSocialReportsPage";
// Phase 6.4 - Moderation Queue
import ModerationQueue from "./pages/Admin/ModerationQueue";
// Phase 6.5 - Sentiment Analytics
import SentimentAnalytics from "./pages/Admin/SentimentAnalytics";
import PublicOpportunities from "./pages/public/PublicOpportunities";
import SubmitOpportunity from "./pages/public/SubmitOpportunity";
import ContributorRegister from "./pages/contributor/ContributorRegister";
import ContributorLogin from "./pages/contributor/ContributorLogin";
// Phase 3.1 - Contributor Profile Pages
import ContributorProfile from "./pages/contributor/ContributorProfile";
import ContributorProfileEdit from "./pages/contributor/ContributorProfileEdit";
// Phase 5.4 - Opportunity Detail Page
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
// Phase 7.6.2 - CNN-Style News Homepage
import NewsHomePage from "./pages/NewsHomePage";
// Phase 7.6.3 - Section-Specific News Pages
import NewsSectionPage from "./pages/NewsSectionPage";
// Home/Landing Page (Legacy)
import HomePage from "./pages/HomePage";
// Opportunity Hub (marketing/info page)
import OpportunityHubPage from "./pages/OpportunityHubPage";
// Phase 6.0 - World News Page
import WorldNewsPage from "./pages/WorldNewsPage";
// Phase 6.1 - Hub v1 Dashboard
import HubPage from "./pages/Hub/HubPage";
// Phase 6.0 - Unified Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SignInPage from "./pages/auth/SignInPage";
import RegisterPageNew from "./pages/auth/RegisterPage.jsx";
// Phase 6.2.1 - Notifications
import NotificationsPage from "./pages/Notifications/NotificationsPage";
// Phase 6.2.3 - Resources & Events
import ResourcesPage from "./pages/Resources/ResourcesPage";
import ResourceDetailPage from "./pages/Resources/ResourceDetailPage";
import EventsPage from "./pages/Events/EventsPage";
import EventDetailPage from "./pages/Events/EventDetailPage";
// Phase 6.2.4 - Unified Search
import SearchPage from "./pages/Search/SearchPage";
// Stub pages for navigation
import SocialPage from "./pages/Stubs/SocialPage";
import BusinessPage from "./pages/Stubs/BusinessPage";
import InformationPage from "./pages/Stubs/InformationPage";
import EducationPage from "./pages/Stubs/EducationPage";
import YouthPage from "./pages/Stubs/YouthPage";
import OpportunitiesPage from "./pages/Business/Opportunities/OpportunitiesPage"; // Phase 7.1
import BusinessJobDetailPage from "./pages/Business/Opportunities/JobDetailPage"; // Phase 7.1 (Legacy)
import RecruiterDashboard from "./pages/Business/Opportunities/RecruiterDashboard"; // Phase 7.1
import BusinessDirectoryPage from "./pages/business/BusinessDirectory"; // Phase 8.2 - Geo-enabled
// Phase 7.1 Cycle 1.3 - Candidate Flow
import CandidateProfilePage from "./pages/Candidate/CandidateProfilePage";
import MyApplicationsPage from "./pages/Candidate/MyApplicationsPage";
// Phase 8.2 - Portal Routes
import NewsPortal from "./pages/portals/NewsPortal";
import SocialPortal from "./pages/portals/SocialPortal";
import BusinessPortal from "./pages/portals/BusinessPortal";
import TVPortal from "./pages/portals/TVPortal";
import SearchPortal from "./pages/portals/SearchPortal";
import MarketplacePortal from "./pages/portals/MarketplacePortal";
// Phase 10.0 - BANIBS Helping Hands
import HelpingHandsHome from "./pages/helpinghands/HelpingHandsHome";
import HelpingHandsCreate from "./pages/helpinghands/HelpingHandsCreate";
import HelpingHandsCampaignDetail from "./pages/helpinghands/HelpingHandsCampaignDetail";
// Phase 9.0 - Social Profiles
import SocialProfileEditPage from "./pages/portals/SocialProfileEditPage";
import SocialProfilePublicPage from "./pages/portals/SocialProfilePublicPage";
import SocialSettingsDisplay from "./pages/portals/SocialSettingsDisplay";
import SocialProfileTheme from "./pages/portals/SocialProfileTheme";
// Phase 8.3+ - Community & Safety Settings
import PrivacySettings from "./pages/social/settings/PrivacySettings";
import HiddenBlockedSettings from "./pages/social/settings/HiddenBlockedSettings";
import SecuritySettings from "./pages/social/settings/SecuritySettings";
import LanguageSettings from "./pages/social/settings/LanguageSettings";
import AnonymousPostingSettings from "./pages/social/settings/AnonymousPostingSettings";
import AutoplaySettings from "./pages/social/settings/AutoplaySettings";
import SocialDiscoverPeoplePage from "./pages/social/SocialDiscoverPeoplePage";
import CommunityWatchPage from "./pages/social/CommunityWatchPage";
// Phase 8.2 - Business Profiles
import BusinessProfileEdit from "./pages/business/BusinessProfileEdit";
import BusinessProfileCreate from "./pages/business/BusinessProfileCreate";
import BusinessProfilePublic from "./pages/business/BusinessProfilePublic";
import MyBusinessRedirect from "./pages/business/MyBusinessRedirect";
// Phase 8.3 - Business Board
import BusinessBoardPage from "./pages/business/BusinessBoardPage";
// Phase 8.4 - Business Mode Pages
import BusinessProfilePage from "./pages/business/BusinessProfilePage";
import BusinessPostsPage from "./pages/business/BusinessPostsPage";
import BusinessTeamPage from "./pages/business/BusinessTeamPage";
import BusinessServicesPage from "./pages/business/BusinessServicesPage";
import BusinessEventsPage from "./pages/business/BusinessEventsPage";
import BusinessPaymentsPage from "./pages/business/BusinessPaymentsPage";
import BusinessAnalyticsPage from "./pages/business/BusinessAnalyticsPage";
import BusinessNotificationsPage from "./pages/business/BusinessNotificationsPage";
import BusinessLessonsPage from "./pages/business/BusinessLessonsPage";
import BusinessSettingsPage from "./pages/business/BusinessSettingsPage";
import BusinessAnalyticsDashboard from "./pages/business/BusinessAnalyticsDashboard";
import BusinessJobsDashboard from "./pages/business/BusinessJobsDashboard";
import BusinessJobForm from "./pages/business/BusinessJobForm";
// Phase 3.0 - BANIBS Connect (Messaging)
import { MessagingHomePage } from "./pages/messaging/MessagingHomePage.jsx";
// Phase 10.x - Social Portal Pages
import SocialMyPostsPage from "./pages/portals/SocialMyPostsPage";
import SocialGroupsPage from "./pages/portals/SocialGroupsPage";
import SocialSavedPage from "./pages/portals/SocialSavedPage";
import SocialLivesPage from "./pages/portals/SocialLivesPage";
import SocialSubscriptionsPage from "./pages/portals/SocialSubscriptionsPage";
// Dual-Layout System: BANIBS Connect
import ConnectHome from "./pages/portals/ConnectHome";
// Phase 7.1 - Jobs & Opportunities + Rating System
import JobsDashboard from "./pages/connect/JobsDashboard";
import JobForm from "./pages/connect/JobForm";
import JobsBrowser from "./pages/social/JobsBrowser";
import JobDetailPage from "./pages/social/JobDetailPage";
// Phase 7.1.1 - Business Insights Analytics
import AnalyticsDashboard from "./pages/connect/AnalyticsDashboard";
// High Five Emoji System
import HighFiveDemo from "./pages/test/HighFiveDemo";
import EmojiTestPage from "./pages/test/EmojiTestPage";
import EmojiPickerDemo from "./pages/test/EmojiPickerDemo";
import EmojiIdentitySettingsPanel from "./components/settings/EmojiIdentitySettingsPanel";
import EmojiRenderTest from "./pages/test/EmojiRenderTest";
// Phase 11+ Portal Placeholders
import {
  DiasporaPlaceholder,
  YouthAcademyPlaceholder,
  WalletPlaceholder
} from "./components/portals/PortalPlaceholder";
// Phase 11.0 - Prayer Rooms (Real Implementation)
import PrayerLobbyPage from "./pages/prayer/PrayerLobbyPage";
import PrayerRoomPage from "./pages/prayer/PrayerRoomPage";
// Phase 11.1 - Beauty & Wellness (Real Implementation)
import BeautyHomePage from "./pages/beauty/BeautyHomePage";
import BeautyProviderDirectory from "./pages/beauty/BeautyProviderDirectory";
import BeautyEducationPage from "./pages/beauty/BeautyEducationPage";
import BeautyBoardPage from "./pages/beauty/BeautyBoardPage";
import BeautyCostCalculator from "./pages/beauty/BeautyCostCalculator";
// Phase 11.2 - Sneakers & Fashion (Real Implementation)
import FashionHomePage from "./pages/fashion/FashionHomePage";
import FashionBrandDirectory from "./pages/fashion/FashionBrandDirectory";
import FashionEducationPage from "./pages/fashion/FashionEducationPage";
import FashionBoardPage from "./pages/fashion/FashionBoardPage";
import FashionSpendToolPage from "./pages/fashion/FashionSpendToolPage";

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
  // Phase 7.5.1 - Initialize analytics on app load
  useEffect(() => {
    initializeAnalytics();
  }, []);
  
  return (
    <ThemeProvider>
      <ToastProvider>
        <MediaViewerProvider>
          <AuthProvider>
            <ContributorAuthProvider>
              <div className="App">
                <MediaViewer />
                <BrowserRouter>
                  <AccountModeProvider>
            <Routes>
              {/* Phase 10.0 - Full-Page Auth Routes (P0 Blocker Fix) */}
              <Route path="/auth/register" element={<RegisterPageNew />} />
              <Route path="/auth/signin" element={<SignInPage />} />
              
              {/* Phase 7.6.2 - New CNN-Style News Homepage */}
              <Route path="/" element={<NewsHomePage />} />
              
              {/* Phase 8.2 - Portal Routes */}
              <Route path="/portal/news" element={<NewsPortal />} />
              
              {/* Phase 9.0 - Social Profile Routes (must come BEFORE /portal/social) */}
              <Route path="/portal/social/profile/theme" element={<SocialProfileTheme />} />
              <Route path="/portal/social/profile" element={<SocialProfileEditPage />} />
              <Route path="/portal/social/u/:handle" element={<SocialProfilePublicPage />} />
              <Route path="/portal/social/id/:userId" element={<SocialProfilePublicPage />} />
              <Route path="/portal/social/settings/display" element={<SocialSettingsDisplay />} />
              
              {/* Phase 8.3+ - Community & Safety Settings (Placeholders) */}
              <Route path="/portal/social/settings/privacy" element={<PrivacySettings />} />
              <Route path="/portal/social/settings/blocked" element={<HiddenBlockedSettings />} />
              <Route path="/portal/social/settings/security" element={<SecuritySettings />} />
              <Route path="/portal/social/settings/language" element={<LanguageSettings />} />
              <Route path="/portal/social/settings/anonymous" element={<AnonymousPostingSettings />} />
              <Route path="/portal/social/settings/video" element={<AutoplaySettings />} />
              <Route path="/portal/social/discover/people" element={<SocialDiscoverPeoplePage />} />
              <Route path="/portal/social/watch" element={<CommunityWatchPage />} />
              
              {/* Base social portal route (catch-all for /portal/social) */}
              <Route path="/portal/social" element={<SocialPortal />} />
              
              {/* Phase 8.4 - Business Mode Routes */}
              {/* Business Owner Tools */}
              <Route path="/portal/business/profile" element={<BusinessProfilePage />} />
              <Route path="/portal/business/board" element={<BusinessBoardPage />} />
              <Route path="/portal/business/posts" element={<BusinessPostsPage />} />
              <Route path="/portal/business/team" element={<BusinessTeamPage />} />
              <Route path="/portal/business/services" element={<BusinessServicesPage />} />
              <Route path="/portal/business/events" element={<BusinessEventsPage />} />
              <Route path="/portal/business/payments" element={<BusinessPaymentsPage />} />
              <Route path="/portal/business/notifications" element={<BusinessNotificationsPage />} />
              <Route path="/portal/business/lessons" element={<BusinessLessonsPage />} />
              <Route path="/portal/business/settings" element={<BusinessSettingsPage />} />
              
              {/* Business Analytics & Jobs (migrated from /portal/connect) */}
              <Route path="/portal/business/analytics" element={<BusinessAnalyticsDashboard />} />
              <Route path="/portal/business/jobs" element={<BusinessJobsDashboard />} />
              <Route path="/portal/business/jobs/new" element={<BusinessJobForm />} />
              <Route path="/portal/business/jobs/:jobId/edit" element={<BusinessJobForm />} />
              
              {/* Business Profile Create & Edit */}
              <Route path="/portal/business/profile/create" element={<BusinessProfileCreate />} />
              <Route path="/portal/business/profile/edit" element={<BusinessProfileEdit />} />
              
              {/* Legacy redirects */}
              <Route path="/portal/business/me" element={<MyBusinessRedirect />} />
              
              {/* Public business profile */}
              <Route path="/portal/business/:businessId" element={<BusinessProfilePublic />} />
              
              {/* Base business portal route */}
              <Route path="/portal/business" element={<BusinessPortal />} />
              
              {/* Phase 10.0 - BANIBS Helping Hands */}
              <Route path="/portal/helping-hands" element={<HelpingHandsHome />} />
              <Route path="/portal/helping-hands/create" element={<HelpingHandsCreate />} />
              <Route path="/portal/helping-hands/campaign/:campaignId" element={<HelpingHandsCampaignDetail />} />
              
              {/* Phase 3.0 - BANIBS Connect Messaging */}
              <Route path="/messages" element={<MessagingHomePage />} />
              <Route path="/messages/:conversationId" element={<MessagingHomePage />} />
              <Route path="/portal/social/messages" element={<MessagingHomePage />} />
              <Route path="/portal/social/messages/:conversationId" element={<MessagingHomePage />} />
              
              {/* Phase 10.x - Social Portal Pages */}
              <Route path="/portal/social/u/:handle" element={<SocialMyPostsPage />} />
              <Route path="/portal/social/groups" element={<SocialGroupsPage />} />
              <Route path="/portal/social/groups/mine" element={<SocialGroupsPage />} />
              <Route path="/portal/social/saved" element={<SocialSavedPage />} />
              <Route path="/portal/social/live" element={<SocialLivesPage />} />
              <Route path="/portal/social/lives" element={<SocialLivesPage />} />
              <Route path="/portal/social/subscriptions" element={<SocialSubscriptionsPage />} />

              {/* Phase 8.4 - Redirect legacy /portal/connect to /portal/business */}
              <Route path="/portal/connect" element={<Navigate to="/portal/business" replace />} />
              <Route path="/portal/connect/*" element={<Navigate to="/portal/business" replace />} />
              <Route path="/connect" element={<Navigate to="/portal/business" replace />} />
              
              {/* Phase 7.1 - Jobs & Opportunities (Social Mode - Job Seeker) */}
              <Route path="/portal/social/jobs" element={<JobsBrowser />} />
              <Route path="/portal/social/jobs/:jobId" element={<JobDetailPage />} />
              
              {/* Test Pages */}
              <Route path="/test/highfive" element={<HighFiveDemo />} />
              <Route path="/test/emojis" element={<EmojiTestPage />} />
              <Route path="/test/emoji-picker" element={<EmojiPickerDemo />} />
              <Route path="/test/emoji-render" element={<EmojiRenderTest />} />
              <Route path="/settings/emoji-identity" element={<EmojiIdentitySettingsPanel />} />
              
              <Route path="/portal/marketplace/*" element={<MarketplacePortal />} />
              <Route path="/portal/tv" element={<TVPortal />} />
              <Route path="/portal/search" element={<SearchPortal />} />
              
              {/* Phase 7.6.3 - Section-Specific News Pages */}
              <Route path="/news/:section" element={<NewsSectionPage />} />
              {/* Legacy homepage moved to /hub-legacy if needed */}
              <Route path="/hub-legacy" element={<HomePage />} />
              <Route path="/opportunity-hub" element={<OpportunityHubPage />} />
              {/* Phase 6.0 - World News Page */}
              <Route path="/world-news" element={<WorldNewsPage />} />
              {/* Phase 6.0 - Unified Auth Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Phase 6.1 - Hub v1 Dashboard (Auth Required) */}
              <Route path="/hub" element={<HubPage />} />
              {/* Phase 6.2.1 - Notifications (Auth Required) */}
              <Route path="/notifications" element={<NotificationsPage />} />
              {/* Phase 6.2.3 - Resources & Events */}
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/resources/:id" element={<ResourceDetailPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              {/* Phase 6.2.4 - Unified Search */}
              <Route path="/search" element={<SearchPage />} />
              {/* Stub Pages */}
              {/* Old stub - redirect to portal */}
              <Route path="/social" element={<Navigate to="/portal/social" replace />} />
              <Route path="/business" element={<Navigate to="/portal/business" replace />} />
              <Route path="/business-directory" element={<BusinessDirectoryPage />} /> {/* Phase 7.2 */}
              <Route path="/information" element={<InformationPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/youth" element={<YouthPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/jobs/:id" element={<BusinessJobDetailPage />} />
              <Route path="/opportunities/dashboard" element={<RecruiterDashboard />} />
              
              {/* Candidate Routes - Phase 7.1 Cycle 1.3 */}
              <Route path="/candidate/profile" element={<CandidateProfilePage />} />
              <Route path="/candidate/applications" element={<MyApplicationsPage />} />
              
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
              <Route 
                path="/admin/moderation" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ModerationQueue />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics/sentiment" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <SentimentAnalytics />
                  </ProtectedRoute>
                } 
              />
              {/* Phase 8.3.1 - Social Moderation */}
              <Route 
                path="/admin/social/reports" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminSocialReportsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Phase 11.0 - Prayer Rooms (Real Implementation) */}
              <Route path="/portal/prayer" element={<PrayerLobbyPage />} />
              <Route path="/portal/prayer/room/:roomSlug" element={<PrayerRoomPage />} />
              
              {/* Phase 11.1 - Beauty & Wellness (Real Implementation) */}
              <Route path="/portal/beauty" element={<BeautyHomePage />} />
              <Route path="/portal/beauty/providers" element={<BeautyProviderDirectory />} />
              <Route path="/portal/beauty/education" element={<BeautyEducationPage />} />
              <Route path="/portal/beauty/board" element={<BeautyBoardPage />} />
              <Route path="/portal/beauty/cost" element={<BeautyCostCalculator />} />
              
              {/* Phase 11.2 - Sneakers & Fashion (Real Implementation) */}
              <Route path="/portal/fashion" element={<FashionHomePage />} />
              <Route path="/portal/fashion/brands" element={<FashionBrandDirectory />} />
              <Route path="/portal/fashion/education" element={<FashionEducationPage />} />
              <Route path="/portal/fashion/board" element={<FashionBoardPage />} />
              <Route path="/portal/fashion/spend" element={<FashionSpendToolPage />} />
              
              {/* Phase 11+ Portal Routes - Placeholder Pages */}
              <Route path="/portal/diaspora" element={<DiasporaPlaceholder />} />
              <Route path="/portal/academy" element={<YouthAcademyPlaceholder />} />
              <Route path="/portal/wallet" element={<WalletPlaceholder />} />
            </Routes>
                  </AccountModeProvider>
          </BrowserRouter>
        </div>
      </ContributorAuthProvider>
    </AuthProvider>
        </MediaViewerProvider>
      </ToastProvider>
  </ThemeProvider>
  );
}

export default App;
