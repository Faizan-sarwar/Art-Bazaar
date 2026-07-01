import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Landing
import HomePage from './Landing/HomePage';
import BrowseArtworksPage from './Landing/BrowseArtworksPage';
import ArtistsPage from './Landing/ArtistsPage';
import AboutAndHowItWorks from './Landing/AboutAndHowitWorks';

// Auth
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Static Pages
import AboutUs from './StaticPages/AboutUs';
import ContactUs from './StaticPages/ContactUs';
import PrivacyPolicy from './StaticPages/PrivacyPolicy';
import TermsAndConditions from './StaticPages/TermsAndConditions';
import RefundPolicy from './StaticPages/RefundPolicy';
import HelpSupport from './StaticPages/HelpSupport';

// Utility Pages
import NotFound404 from './UtilityPages/NotFound404';
import EmailVerification from './UtilityPages/EmailVerification';
import Maintenance from './UtilityPages/Maintenance';

// Additional Pages
import ArtistApplicationPage from './AdditionalPages/ArtistApplicationPage';
import ComparePage from './AdditionalPages/ComparePage';
import SuccessPage from './AdditionalPages/SuccessPage';

// Buyer
import BuyerHomePage from './Buyer/BuyerHomePage';
import BuyerBrowsePage from './Buyer/BuyerBrowsePage';
import ArtworkDetail from './Buyer/ArtworkDetail';
import ArtistProfileView from './Buyer/ArtistProfileView';
import ArtStore from './Buyer/ArtStore';
import MyOrders from './Buyer/MyOrders';
import MyFavorites from './Buyer/MyFavorites';
import OrderTracking from './Buyer/OrderTracking';
import MessagesPage from './Buyer/MessagesPage';
import NotificationsCenter from './Buyer/NotificationsCenter';
import ProfileSettings from './Buyer/ProfileSettings';
import SearchResultsPage from './Buyer/SearchResultsPage';
import CustomRequestForm from './Buyer/CustomRequestForm';
import LiveSessions from './Buyer/LiveSessions';
import EventsNews from './Buyer/EventsNews';
import CheckoutPage from './Buyer/CheckoutPage';
import SupportChat from './Buyer/SupportChat';
import StoreCheckout from './Buyer/StoreCheckout';
import BuyerStoreOrders from './Buyer/BuyerStoreOrders';

// Seller
import SellerHomePage from './Seller/SellerHomePage';
import SellerExplorePage from './Seller/SellerExplorePage';
import SellerDashboard from './Seller/SellerDashboard';
import UploadArtwork from './Seller/UploadArtwork';
import EditArtwork from './Seller/EditArtwork';
import OrderManagement from './Seller/OrderManagement';
import CustomOrderRequests from './Seller/CustomOrderRequests';
import ChatWithBuyers from './Seller/ChatWithBuyers';
import LiveStudio from './Seller/LiveStudio';
import EarningsAnalytics from './Seller/EarningsAnalytics';
import SalesHistory from './Seller/SalesHistory';
import ReviewsRatings from './Seller/ReviewsRatings';
import ProfileManagement from './Seller/ProfileManagement';
import SellerNotifications from './Seller/NotificationsPage';
import SellerArtistProfile from './Seller/ArtistProfileView';

// Admin
import AdminHomePage from './Admin/AdminHomePage';
import AdminDashboard from './Admin/AdminDashboard';
import AdminUsers from './Admin/AdminUsers';
import AdminSellers from './Admin/AdminSellers';
import AdminBuyers from './Admin/AdminBuyers';
import AdminArtworks from './Admin/AdminArtworks';
import AdminCategories from './Admin/AdminCategories';
import AdminTransactions from './Admin/AdminTransactions';
import AdminPayouts from './Admin/AdminPayouts';
import AdminRevenue from './Admin/AdminRevenue';
import AdminAnalytics from './Admin/AdminAnalytics';
import AdminReports from './Admin/AdminReports';
import AdminSettings from './Admin/AdminSettings';
import AdminStore from './Admin/AdminStore';
import AdminEvents from './Admin/AdminEvents';
import AdminChat from './Admin/AdminChat';
import AdminStoreOrders from './Admin/AdminStoreOrders';

// ── Smart Home ───────────────────────────────────────────────
const SmartHome = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const viewMode = localStorage.getItem('viewMode');
  if (token && user?.role === 'buyer') return <Navigate to="/buyer/home" replace />;
  if (token && user?.role === 'artist' && viewMode === 'buyer') return <Navigate to="/buyer/home" replace />;
  if (token && user?.role === 'artist') return <Navigate to="/seller/home" replace />;
  if (token && user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <HomePage />;
};

// ── Guest Guard ──────────────────────────────────────────────
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (token && user?.role === 'buyer') return <Navigate to="/buyer/home" replace />;
  if (token && user?.role === 'artist') return <Navigate to="/seller/home" replace />;
  if (token && user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// ── Protected Route ──────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

// ── App ──────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>

        {/* ── Landing ── */}
        <Route path="/" element={<SmartHome />} />
        <Route path="/artworks" element={<BrowseArtworksPage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/about" element={<AboutAndHowItWorks />} />

        {/* ── Static / Footer ── */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/help" element={<HelpSupport />} />

        {/* ── Utility ── */}
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/maintenance" element={<Maintenance />} />

        {/* ── Additional ── */}
        <Route path="/apply-artist" element={<ArtistApplicationPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/success" element={<SuccessPage />} />

        {/* ── Auth ── */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

        {/* ── Buyer ── */}
        <Route path="/buyer/home" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><BuyerHomePage /></ProtectedRoute>} />
        <Route path="/buyer/browse" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><BuyerBrowsePage /></ProtectedRoute>} />
        <Route path="/buyer/artwork/:id" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><ArtworkDetail /></ProtectedRoute>} />
        <Route path="/buyer/artist/:id" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><ArtistProfileView /></ProtectedRoute>} />
        <Route path="/buyer/store" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><ArtStore /></ProtectedRoute>} />
        <Route path="/buyer/orders" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><MyOrders /></ProtectedRoute>} />
        <Route path="/buyer/favorites" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><MyFavorites /></ProtectedRoute>} />
        <Route path="/buyer/wishlist" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><MyFavorites /></ProtectedRoute>} />
        <Route path="/buyer/track/:orderId" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><OrderTracking /></ProtectedRoute>} />
        <Route path="/buyer/messages" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><MessagesPage /></ProtectedRoute>} />
        <Route path="/buyer/notifications" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><NotificationsCenter /></ProtectedRoute>} />
        <Route path="/buyer/profile" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><ProfileSettings /></ProtectedRoute>} />
        <Route path="/buyer/search" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><SearchResultsPage /></ProtectedRoute>} />
        <Route path="/buyer/custom-request" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><CustomRequestForm /></ProtectedRoute>} />
        <Route path="/buyer/live-sessions" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><LiveSessions /></ProtectedRoute>} />
        <Route path="/buyer/events" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><EventsNews /></ProtectedRoute>} />
        <Route path="/buyer/checkout" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/buyer/support" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><SupportChat /></ProtectedRoute>} />
        <Route path="/buyer/store-checkout" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><StoreCheckout /></ProtectedRoute>} />
        <Route path="/buyer/store-orders" element={<ProtectedRoute allowedRoles={['buyer', 'artist']}><BuyerStoreOrders /></ProtectedRoute>} />

        {/* ── Seller ── */}
        <Route path="/seller/home" element={<ProtectedRoute allowedRoles={['artist']}><SellerHomePage /></ProtectedRoute>} />
        <Route path="/seller/explore" element={<ProtectedRoute allowedRoles={['artist']}><SellerExplorePage /></ProtectedRoute>} />
        <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['artist']}><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/upload" element={<ProtectedRoute allowedRoles={['artist']}><UploadArtwork /></ProtectedRoute>} />
        <Route path="/seller/edit/:id" element={<ProtectedRoute allowedRoles={['artist']}><EditArtwork /></ProtectedRoute>} />
        <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['artist']}><OrderManagement /></ProtectedRoute>} />
        <Route path="/seller/custom-requests" element={<ProtectedRoute allowedRoles={['artist']}><CustomOrderRequests /></ProtectedRoute>} />
        <Route path="/seller/chat" element={<ProtectedRoute allowedRoles={['artist']}><ChatWithBuyers /></ProtectedRoute>} />
        <Route path="/seller/live-studio" element={<ProtectedRoute allowedRoles={['artist']}><LiveStudio /></ProtectedRoute>} />
        <Route path="/seller/earnings" element={<ProtectedRoute allowedRoles={['artist']}><EarningsAnalytics /></ProtectedRoute>} />
        <Route path="/seller/sales" element={<ProtectedRoute allowedRoles={['artist']}><SalesHistory /></ProtectedRoute>} />
        <Route path="/seller/reviews" element={<ProtectedRoute allowedRoles={['artist']}><ReviewsRatings /></ProtectedRoute>} />
        <Route path="/seller/profile" element={<ProtectedRoute allowedRoles={['artist']}><ProfileManagement /></ProtectedRoute>} />
        <Route path="/seller/notifications" element={<ProtectedRoute allowedRoles={['artist']}><SellerNotifications /></ProtectedRoute>} />
        <Route path="/seller/artist/:id" element={<ProtectedRoute allowedRoles={['artist']}><SellerArtistProfile /></ProtectedRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminHomePage /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/sellers" element={<ProtectedRoute allowedRoles={['admin']}><AdminSellers /></ProtectedRoute>} />
        <Route path="/admin/buyers" element={<ProtectedRoute allowedRoles={['admin']}><AdminBuyers /></ProtectedRoute>} />
        <Route path="/admin/artworks" element={<ProtectedRoute allowedRoles={['admin']}><AdminArtworks /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
        <Route path="/admin/payouts" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayouts /></ProtectedRoute>} />
        <Route path="/admin/revenue" element={<ProtectedRoute allowedRoles={['admin']}><AdminRevenue /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/store" element={<ProtectedRoute allowedRoles={['admin']}><AdminStore /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['admin']}><AdminEvents /></ProtectedRoute>} />
        <Route path="/admin/chat" element={<ProtectedRoute allowedRoles={['admin']}><AdminChat /></ProtectedRoute>} />
        <Route path="/admin/store-orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminStoreOrders /></ProtectedRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound404 />} />

      </Routes>
    </Router>
  );
}

export default App;
