import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./i18n"; // Phase L.0 - Initialize i18n
import { AuthProvider } from "./contexts/AuthContext";
import { ContributorAuthProvider } from "./contexts/ContributorAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AccountModeProvider } from "./contexts/AccountModeContext";
import { MediaViewerProvider } from "./hooks/useMediaViewer";
import { MediaViewer } from "./components/media/MediaViewer";
import { WebSocketProvider } from "./contexts/WebSocketContext"; // Phase 4: WebSocket
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
import SignInPage from "./pages/auth/SignInPage";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
// Phase 8.5 - Onboarding
import WelcomePage from "./pages/onboarding/WelcomePage";
// Phase 8.5 - Groups
import GroupsPage from "./pages/portal/social/GroupsPage";
import GroupDetailPage from "./pages/portal/social/GroupDetailPage";
// Phase 17.0 - BANIBS Social World (Unified Social Hub)
import SocialWorldHome from "./pages/socialworld/SocialWorldHome";
import SocialWorldShortForm from "./pages/socialworld/ShortFormPage";
import SocialWorldMoments from "./pages/socialworld/MomentsPage";
import SocialWorldStories from "./pages/socialworld/StoriesPage";
import SocialWorldConnections from "./pages/socialworld/ConnectionsPage";
import SocialWorldLive from "./pages/socialworld/LiveCirclePage";
import SocialWorldCircles from "./pages/socialworld/CirclesPage";
import SocialWorldVoice from "./pages/socialworld/VoiceSharePage";
import SocialWorldChat from "./pages/socialworld/ChatSpherePage";
import SocialWorldTalent from "./pages/socialworld/TalentWorldPage";
import SocialWorldMarketplace from "./pages/socialworld/MarketplacePage";

// MEGADROP V1 - Peoples Room System (Phase 3 UI)
import MyRoom from "./pages/MyRoom";

// Phase B2 - Black News Tab
import BlackNewsPage from "./pages/BlackNewsPage";

// Phase A2 - Mission & Values Page
import MissionValuesPage from "./pages/MissionValuesPage";

// Phase A3 - Our Story Page
import OurStoryPage from "./pages/OurStoryPage";

// Phase A4 - Business Page
import BusinessPage from "./pages/BusinessPage";

// Phase A5 - Black News About Page
import BlackNewsAboutPage from "./pages/BlackNewsAboutPage";

// Phase A6 - BANIBS Social Landing Page
import SocialLandingPage from "./pages/social/SocialLandingPage";

// Phase A7 - BANIBS Marketplace Landing Page
import MarketplaceLandingPage from "./pages/MarketplaceLandingPage";
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
import InformationPage from "./pages/Stubs/InformationPage";
import EducationPage from "./pages/Stubs/EducationPage";
import YouthPage from "./pages/Stubs/YouthPage";
import OpportunitiesPage from "./pages/Business/Opportunities/OpportunitiesPage"; // Phase 7.1
import BusinessJobDetailPage from "./pages/Business/Opportunities/JobDetailPage"; // Phase 7.1 (Legacy)
import RecruiterDashboard from "./pages/Business/Opportunities/RecruiterDashboard"; // Phase 7.1
import BusinessDirectoryPage from "./pages/business/BusinessDirectoryV2.1"; // Phase B.0 v2.1 - Motion, imagery, emotion upgrade
import BusinessRegistrationPlaceholder from "./pages/business/BusinessRegistrationPlaceholder"; // Phase B.0 - Registration placeholder
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
// Phase 8.2 - Social Connections
import SocialConnectionsPage from "./pages/social/SocialConnectionsPage";
// Phase 9.2 - Infinite Circle Engine UI
import InfiniteCirclePage from "./pages/circles/InfiniteCirclePage";
import SharedCirclePage from "./pages/circles/SharedCirclePage";
import { InfiniteCirclePage as InfiniteCirclePageSocial } from "./pages/social/InfiniteCirclePage";
import { SharedCirclePage as SharedCirclePageSocial } from "./pages/social/SharedCirclePage";
// Phase 8.4 - Messaging Engine
import { MessagesPage } from "./pages/social/messages/MessagesPage";
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
import SettingsPage from "./pages/settings/SettingsPage";
import EmojiRenderTest from "./pages/test/EmojiRenderTest";
// Phase 11+ Portal Placeholders
import {
  DiasporaPlaceholder
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

// Phase 12.0 - Diaspora Connect
import DiasporaHomePage from "./pages/diaspora/DiasporaHomePage";
import DiasporaRegionsPage from "./pages/diaspora/DiasporaRegionsPage";
import DiasporaStoriesPage from "./pages/diaspora/DiasporaStoriesPage";
import DiasporaBusinessDirectory from "./pages/diaspora/DiasporaBusinessDirectory";
import DiasporaLearnPage from "./pages/diaspora/DiasporaLearnPage";
import DiasporaSnapshotPage from "./pages/diaspora/DiasporaSnapshotPage";

// Phase 13.0 - BANIBS Academy
import AcademyHomePage from "./pages/academy/AcademyHomePage";
import AcademyCoursesPage from "./pages/academy/AcademyCoursesPage";
import AcademyMentorshipPage from "./pages/academy/AcademyMentorshipPage";
import AcademyLifeSkillsPage from "./pages/academy/AcademyLifeSkillsPage";
import AcademyHistoryPage from "./pages/academy/AcademyHistoryPage";
import AcademyOpportunitiesPage from "./pages/academy/AcademyOpportunitiesPage";

// Phase 14.0 - BANIBS Wallet
import WalletHomePage from "./pages/wallet/WalletHomePage";

// Phase 15.0 - BANIBS OS / Developer Platform
import DevLayout from "./pages/developer/DevLayout";
import DevDashboardPage from "./pages/developer/DevDashboardPage";
import DevApiKeysPage from "./pages/developer/DevApiKeysPage";
import DevAppsPage from "./pages/developer/DevAppsPage";
import DevWebhooksPage from "./pages/developer/DevWebhooksPage";
import DevDocsPage from "./pages/developer/DevDocsPage";

// Phase 16.0 - Global Marketplace
import MarketplaceHomePage from "./pages/marketplace/MarketplaceHomePage";
import MarketplaceRegionPage from "./pages/marketplace/MarketplaceRegionPage";
import MarketplaceStorePage from "./pages/marketplace/MarketplaceStorePage";
import MarketplaceProductPage from "./pages/marketplace/MarketplaceProductPage";
import MarketplaceCheckoutPage from "./pages/marketplace/MarketplaceCheckoutPage";
import MarketplaceOrdersPage from "./pages/marketplace/MarketplaceOrdersPage";
import MarketplaceSellerDashboardPage from "./pages/marketplace/MarketplaceSellerDashboardPage";

// Phase 11.6-11.9 - Community Life Hub
import CommunityHomePage from "./pages/community/CommunityHomePage";
import HealthHomePage from "./pages/community/HealthHomePage";
import HealthResourceDetailPage from "./pages/community/HealthResourceDetailPage";
import HealthProvidersPage from "./pages/community/HealthProvidersPage";
import HealthProviderDetailPage from "./pages/community/HealthProviderDetailPage";
import FitnessHomePage from "./pages/community/FitnessHomePage";
import FitnessProgramDetailPage from "./pages/community/FitnessProgramDetailPage";
import FitnessCoachesPage from "./pages/community/FitnessCoachesPage";
import FitnessCoachDetailPage from "./pages/community/FitnessCoachDetailPage";
import FoodHomePage from "./pages/community/FoodHomePage";
import RecipeDetailPage from "./pages/community/RecipeDetailPage";
import RecipeSubmitPage from "./pages/community/RecipeSubmitPage";
import SchoolHomePage from "./pages/community/SchoolHomePage";
import SchoolResourceDetailPage from "./pages/community/SchoolResourceDetailPage";
import SchoolResourceSubmitPage from "./pages/community/SchoolResourceSubmitPage";
// Phase 11.5 - Ability Network
import AbilityHomePage from "./pages/ability/AbilityHomePage";
import AbilityProviderDirectoryPage from "./pages/ability/providers/AbilityProviderDirectoryPage";
import AbilityProviderDetailPage from "./pages/ability/providers/AbilityProviderDetailPage";
// Phase 11.5.3 - Support Groups
import AbilitySupportGroupsPage from "./pages/ability/support-groups/AbilitySupportGroupsPage";
import AbilitySupportGroupDetailPage from "./pages/ability/support-groups/AbilitySupportGroupDetailPage";
// Phase 11.5.4 - Submission & Moderation
import AbilityResourceSubmitPage from "./pages/ability/AbilityResourceSubmitPage";
import AbilityProviderSubmitPage from "./pages/ability/AbilityProviderSubmitPage";
import AbilityModerationDashboardPage from "./pages/admin/ability/AbilityModerationDashboardPage";
// Phase 0.0 - BPOC Orchestration Dashboard
import OrchestrationDashboardPage from "./pages/admin/orchestration/OrchestrationDashboardPage";

// Founder Control Center
import FounderControlCenter from "./pages/founder/FounderControlCenter";
import NavV2Preview from "./pages/founder/NavV2Preview";

// Coming Soon Page
import ComingSoonPage from "./pages/ComingSoonPage";

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
  const [comingSoonMode, setComingSoonMode] = useState(false);
  const [comingSoonVariant, setComingSoonVariant] = useState('dark');
  const [featureFlagsLoaded, setFeatureFlagsLoaded] = useState(false);
  
  // Check feature flags on app load
  useEffect(() => {
    const checkFeatureFlags = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/config/feature-flags`);
        setComingSoonMode(response.data.coming_soon_mode || false);
        setComingSoonVariant(response.data.coming_soon_variant || 'dark');
      } catch (error) {
        console.error('Failed to load feature flags:', error);
        // Default to false if we can't load flags
        setComingSoonMode(false);
        setComingSoonVariant('dark');
      } finally {
        setFeatureFlagsLoaded(true);
      }
    };
    
    checkFeatureFlags();
    initializeAnalytics();
  }, []);
  
  // Show nothing while loading feature flags
  if (!featureFlagsLoaded) {
    return null;
  }
  
  // Detect if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                        window.location.hostname === 'localhost' ||
                        window.location.hostname.includes('preview.emergentagent.com');
  
  // Show Coming Soon page ONLY if:
  // 1. Coming Soon mode is enabled AND
  // 2. We're NOT in development mode AND
  // 3. Current path is not an /about/* page
  const shouldShowComingSoon = comingSoonMode && !isDevelopment && !window.location.pathname.startsWith('/about');
  
  if (shouldShowComingSoon) {
    // Select variant based on flag
    if (comingSoonVariant === 'blue') return <ComingSoonPageBlue />;
    if (comingSoonVariant === 'gold') return <ComingSoonPageGold />;
    return <ComingSoonPage />; // Default to dark variant
  }
  
  return (
    <ThemeProvider>
      <ToastProvider>
        <MediaViewerProvider>
          <AuthProvider>
            <ContributorAuthProvider>
              <WebSocketProvider>
                <div className="App">
                  <MediaViewer />
                  <BrowserRouter>
                    <AccountModeProvider>
            <Routes>
              {/* Phase 10.0 - Full-Page Auth Routes (P0 Blocker Fix) */}
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/signin" element={<SignInPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Phase 8.5 - Onboarding Routes */}
              <Route path="/onboarding/welcome" element={<WelcomePage />} />
              
              {/* Phase 17.0 - BANIBS Social World (Unified Social Hub) */}
              <Route path="/socialworld" element={<SocialWorldHome />} />
              <Route path="/socialworld/shortform" element={<SocialWorldShortForm />} />
              <Route path="/socialworld/moments" element={<SocialWorldMoments />} />
              <Route path="/socialworld/stories" element={<SocialWorldStories />} />
              <Route path="/socialworld/connections" element={<SocialWorldConnections />} />
              <Route path="/socialworld/live" element={<SocialWorldLive />} />
              <Route path="/socialworld/circles" element={<SocialWorldCircles />} />
              <Route path="/socialworld/voice" element={<SocialWorldVoice />} />
              <Route path="/socialworld/chat" element={<SocialWorldChat />} />
              <Route path="/socialworld/talent" element={<SocialWorldTalent />} />
              <Route path="/socialworld/marketplace" element={<SocialWorldMarketplace />} />
              
              {/* MEGADROP V1 - Peoples Room System (Phase 3) */}
              <Route path="/my-room" element={<MyRoom />} />
              
              {/* Main BANIBS Application Landing */}
              <Route path="/" element={<HomePage />} />
              
              {/* Coming Soon Page - Available at /coming-soon */}
              <Route path="/coming-soon" element={<ComingSoonPage />} />
              
              {/* Phase B2 - Black News Tab */}
              <Route path="/news/black" element={<BlackNewsPage />} />
              
              {/* Phase A2 - Mission & Values Page */}
              <Route path="/about/mission" element={<MissionValuesPage />} />
              
              {/* Phase A3 - Our Story Page */}
              <Route path="/about/our-story" element={<OurStoryPage />} />
              
              {/* Phase A4 - Business Page */}
              <Route path="/about/business" element={<BusinessPage />} />
              
              {/* Phase A5 - Black News About Page */}
              <Route path="/about/black-news" element={<BlackNewsAboutPage />} />
              
              {/* Phase A7 - Marketplace Landing Page */}
              <Route path="/about/marketplace" element={<MarketplaceLandingPage />} />
              
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
              
              {/* Phase 8.5 - Groups Routes */}
              <Route path="/portal/social/groups" element={<GroupsPage />} />
              <Route path="/portal/social/groups/mine" element={<GroupsPage />} />
              <Route path="/portal/social/groups/:groupId" element={<GroupDetailPage />} />
              <Route path="/portal/social/watch" element={<CommunityWatchPage />} />
              
              {/* Phase 8.2 - Social Connections */}
              <Route path="/social/connections" element={<SocialConnectionsPage />} />
              
              {/* Phase 9.2 - Infinite Circle Engine UI */}
              <Route path="/social/circles" element={<InfiniteCirclePageSocial />} />
              <Route path="/social/circles/:userId" element={<InfiniteCirclePageSocial />} />
              <Route path="/social/circles/shared/:userId" element={<SharedCirclePageSocial />} />
              <Route path="/portal/social/circles" element={<InfiniteCirclePageSocial />} />
              <Route path="/portal/social/circles/shared/:userId" element={<SharedCirclePageSocial />} />
              
              {/* Phase 8.4 - Messaging Engine */}
              <Route path="/portal/social/messages" element={<MessagesPage />} />
              <Route path="/portal/social/messages/:userId" element={<MessagesPage />} />
              <Route path="/portal/social/messages/:conversationId" element={<MessagesPage />} />
              
              {/* Social Home Route */}
              <Route path="/portal/social/home" element={<SocialPortal />} />
              
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
              
              {/* Phase 10.x - Social Portal Pages */}
              <Route path="/portal/social/u/:handle" element={<SocialMyPostsPage />} />
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
              {/* Test Routes - Development Only */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <Route path="/test/highfive" element={<HighFiveDemo />} />
                  <Route path="/test/emojis" element={<EmojiTestPage />} />
                  <Route path="/test/emoji-picker" element={<EmojiPickerDemo />} />
                  <Route path="/test/emoji-render" element={<EmojiRenderTest />} />
                </>
              )}
              <Route path="/settings" element={<SettingsPage />} />
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
              {/* Phase A6 - BANIBS Social Landing Page */}
              <Route path="/social" element={<SocialLandingPage />} />
              
              {/* Stub Pages */}
              <Route path="/business" element={<Navigate to="/portal/business" replace />} />
              <Route path="/business-directory" element={<BusinessDirectoryPage />} /> {/* Phase B.0 - Redesigned */}
              <Route path="/business/register" element={<BusinessRegistrationPlaceholder />} /> {/* Phase B.0 - Registration placeholder */}
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
              
              {/* Phase 12.0 - Diaspora Connect Portal */}
              <Route path="/portal/diaspora" element={<DiasporaHomePage />} />
              <Route path="/portal/diaspora/regions" element={<DiasporaRegionsPage />} />
              <Route path="/portal/diaspora/stories" element={<DiasporaStoriesPage />} />
              <Route path="/portal/diaspora/businesses" element={<DiasporaBusinessDirectory />} />
              <Route path="/portal/diaspora/learn" element={<DiasporaLearnPage />} />
              <Route path="/portal/diaspora/snapshot" element={<DiasporaSnapshotPage />} />
              
              {/* Phase 13.0 - BANIBS Academy */}
              <Route path="/portal/academy" element={<AcademyHomePage />} />
              <Route path="/portal/academy/courses" element={<AcademyCoursesPage />} />
              <Route path="/portal/academy/mentorship" element={<AcademyMentorshipPage />} />
              <Route path="/portal/academy/lifeskills" element={<AcademyLifeSkillsPage />} />
              <Route path="/portal/academy/history" element={<AcademyHistoryPage />} />
              <Route path="/portal/academy/opportunities" element={<AcademyOpportunitiesPage />} />
              
              {/* Phase 14.0 - BANIBS Wallet (AUTH ONLY) */}
              <Route path="/portal/wallet" element={<WalletHomePage />} />
              <Route path="/portal/wallet/*" element={<WalletHomePage />} />
              
              {/* Phase 15.0 - BANIBS OS / Developer Platform (AUTH ONLY) */}
              <Route path="/developer" element={<DevLayout />}>
                <Route index element={<DevDashboardPage />} />
                <Route path="api-keys" element={<DevApiKeysPage />} />
                <Route path="apps" element={<DevAppsPage />} />
                <Route path="webhooks" element={<DevWebhooksPage />} />
                <Route path="docs" element={<DevDocsPage />} />
              </Route>
              
              {/* Phase 16.0 - Global Marketplace */}
              <Route path="/portal/marketplace" element={<MarketplaceHomePage />} />
              <Route path="/portal/marketplace/region/:regionId" element={<MarketplaceRegionPage />} />
              <Route path="/portal/marketplace/store/:storeId" element={<MarketplaceStorePage />} />
              <Route path="/portal/marketplace/product/:productId" element={<MarketplaceProductPage />} />
              <Route path="/portal/marketplace/checkout" element={<MarketplaceCheckoutPage />} />
              <Route path="/portal/marketplace/orders" element={<MarketplaceOrdersPage />} />
              <Route path="/portal/marketplace/seller/dashboard" element={<MarketplaceSellerDashboardPage />} />

              {/* Phase 11.6-11.9 - Community Life Hub */}
              <Route path="/portal/community" element={<CommunityHomePage />} />
              <Route path="/portal/community/health" element={<HealthHomePage />} />
              <Route path="/portal/community/health/resources/:slug" element={<HealthResourceDetailPage />} />
              <Route path="/portal/community/health/providers" element={<HealthProvidersPage />} />
              <Route path="/portal/community/health/providers/:providerId" element={<HealthProviderDetailPage />} />
              <Route path="/portal/community/fitness" element={<FitnessHomePage />} />
              <Route path="/portal/community/fitness/programs/:programId" element={<FitnessProgramDetailPage />} />
              <Route path="/portal/community/fitness/coaches" element={<FitnessCoachesPage />} />
              <Route path="/portal/community/fitness/coaches/:coachId" element={<FitnessCoachDetailPage />} />
              <Route path="/portal/community/food" element={<FoodHomePage />} />
              <Route path="/portal/community/food/recipes/:slug" element={<RecipeDetailPage />} />
              <Route path="/portal/community/food/submit" element={<RecipeSubmitPage />} />
              <Route path="/portal/community/school" element={<SchoolHomePage />} />
              <Route path="/portal/community/school/resources/:slug" element={<SchoolResourceDetailPage />} />
              <Route path="/portal/community/school/submit" element={<SchoolResourceSubmitPage />} />
              
              {/* Phase 11.5 - Ability Network */}
              <Route path="/portal/ability" element={<AbilityHomePage />} />
              <Route path="/portal/ability/providers" element={<AbilityProviderDirectoryPage />} />
              <Route path="/portal/ability/providers/:providerId" element={<AbilityProviderDetailPage />} />
              <Route path="/portal/ability/support-groups" element={<AbilitySupportGroupsPage />} />
              <Route path="/portal/ability/support-groups/:circleId" element={<AbilitySupportGroupDetailPage />} />
              {/* Phase 11.5.4 - Submission & Moderation */}
              <Route path="/portal/ability/resources/submit" element={<AbilityResourceSubmitPage />} />
              <Route path="/portal/ability/providers/submit" element={<AbilityProviderSubmitPage />} />
              <Route path="/portal/admin/ability/moderation" element={<AbilityModerationDashboardPage />} />
              
              {/* Phase 0.0 - BPOC Orchestration Dashboard */}
              <Route path="/admin/orchestration" element={<OrchestrationDashboardPage />} />
              
              {/* Founder Control Center v1.0 */}
              <Route path="/founder/command" element={<FounderControlCenter />} />
              
              {/* Navigation V2 Preview (do not deploy until approved) */}
              <Route path="/founder/nav-v2-preview" element={<NavV2Preview />} />
              
              {/* Phase 11+ Portal Routes - Placeholder Pages (removed duplicates) */}
            </Routes>
                  </AccountModeProvider>
          </BrowserRouter>
        </div>
              </WebSocketProvider>
      </ContributorAuthProvider>
    </AuthProvider>
        </MediaViewerProvider>
      </ToastProvider>
  </ThemeProvider>
  );
}

export default App;
