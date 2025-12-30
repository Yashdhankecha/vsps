import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminLayoutProvider, useAdminLayout } from "./contexts/AdminLayoutContext";
import Footer from "./components/user/Footer";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import Services from "./pages/Services";
import Testimonials from "./pages/Testimonials";
import SubmitReview from "./pages/SubmitReview";
import Resources from "./pages/Resources";
import EventCategories from "./pages/EventCategories";
import Booking from "./pages/Booking";
import LiveStreaming from "./pages/LiveStreaming";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/adminpanel/Dashboard";
import BookingManagement from "./pages/adminpanel/BookingManagement";
import ContentManagement from "./pages/adminpanel/ContentManagement";
import LiveStreams from "./pages/adminpanel/LiveStreams";
import AdminSidebar from "./components/admin/AdminSidebar";
import AdminPageContainer from "./components/admin/AdminPageContainer";
import Header from "./components/user/Header";
import ProfileSettings from './pages/ProfileSettings';
import RecentBookings from './pages/RecentBookings';
import Users from './pages/adminpanel/Users';
import FormManagement from './pages/adminpanel/FormManagement';
import SamuhLaganBooking from './pages/SamuhLaganBooking';
import StudentAwardRegistration from './pages/StudentAwardRegistration';
import AdminRoute from './components/AdminRoute';
import UserManagerRoute from './components/UserManagerRoute';
import ContentManagerRoute from './components/ContentManagerRoute';
import FormManagerRoute from './components/FormManagerRoute';
import BookingManagerRoute from './components/BookingManagerRoute';
import ContactManagerRoute from './components/ContactManagerRoute';
import CommitteeMemberRoute from './components/CommitteeMemberRoute';
import CommitteeMemberSidebar from './components/admin/CommitteeMemberSidebar';
import BookedDatesCalendar from './pages/adminpanel/BookedDatesCalendar';
import axios from './utils/axiosConfig';
import React from 'react';

import ContactManagement from './pages/adminpanel/ContactManagement';
import Reviews from './pages/adminpanel/Reviews';

// Committee Pages
import CommitteeDashboard from './pages/committee/CommitteeDashboard';
import AddVillageMember from './pages/committee/AddVillageMember';
import BookVillageEvent from './pages/committee/BookVillageEvent';
import CommitteeMembersList from './pages/committee/CommitteeMembersList';
import VillagerApproval from './pages/committee/VillagerApproval';

import VillageMembers from './pages/committee/VillageMembers';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" />;
  }
  return children;
};

const FormStatusCheck = ({ children, formType }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formDetails, setFormDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkFormStatus = async () => {
      try {
        setLoading(true);
        const formNameMap = {
          'samuhLagan': 'registrationForm',
          'studentAwards': 'studentAwardForm',
        };

        const formName = formNameMap[formType];
        if (!formName) {
          setError(`Invalid form type: ${formType}`);
          setLoading(false);
          return;
        }

        const publicStatusResponse = await axios.get(`${API_BASE_URL}/api/admin/forms/public/status`);
        const formData = publicStatusResponse.data[formType];

        if (!formData) {
          setError(`Form data not found for: ${formType}`);
          setLoading(false);
          return;
        }

        setFormDetails(formData);

        if (!formData.active) {
          setError('This form is not currently available. Please check back later.');
          setLoading(false);
          return;
        }

        if (formData.startTime && new Date(formData.startTime) > new Date()) {
          setError(`This form will be available from ${new Date(formData.startTime).toLocaleString()}`);
          setLoading(false);
          return;
        }

        if (formData.endTime && new Date(formData.endTime) < new Date()) {
          setError('This form has expired. Please check back for future opportunities.');
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking form status:', error);
        setError('Unable to access the form at this time. Please try again later.');
        setLoading(false);
      }
    };

    checkFormStatus();
  }, [formType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking form availability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center p-4 max-w-md">
          <h2 className="text-xl font-bold mb-2">Form Unavailable</h2>
          <p>{error}</p>
          {formDetails && (formDetails.startTime || formDetails.endTime) && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Form Availability:</h3>
              {formDetails.startTime && (
                <p>Start Time: {new Date(formDetails.startTime).toLocaleString()}</p>
              )}
              {formDetails.endTime && (
                <p>End Time: {new Date(formDetails.endTime).toLocaleString()}</p>
              )}
            </div>
          )}
          <button
            onClick={() => navigate('/services')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Services
          </button>
        </div>
      </div>
    );
  }

  return React.cloneElement(children, { formDetails });
};

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/committee");
  const isAuthPage = location.pathname === "/auth" || location.pathname === "/ForgotPassword" || location.pathname.startsWith("/ResetPassword");
  const [formStatus, setFormStatus] = useState({
    samuhLagan: { active: false, isCurrentlyActive: false },
    studentAwards: { active: false, isCurrentlyActive: false }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormStatus = async () => {
      try {
        const response = await axios.get('/api/admin/forms/public/status');
        setFormStatus(response.data);
      } catch (error) {
        console.error('Error fetching form status:', error);
        setFormStatus({
          samuhLagan: { active: false, isCurrentlyActive: false },
          studentAwards: { active: false, isCurrentlyActive: false },

        });
      }
    };

    fetchFormStatus();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Render specialized admin layouts based on user role
  const renderAdminLayout = () => {
    if (!user) {
      return <Navigate to="/auth" />;
    }

    // Super admin gets full access
    if (user.role === "superadmin") {
      return (
        <AdminLayoutProvider>
          <div className="flex min-h-screen bg-gradient-mesh overflow-x-hidden">
            <AdminSidebar />
            <AdminPageContainer>
              <Routes>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/content-management" element={<ContentManagement />} />
                <Route path="/admin/booking-management" element={<BookingManagement />} />
                <Route path="/admin/contact-management" element={<ContactManagement />} />
                <Route path="/admin/live-streams" element={<LiveStreams />} />
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/form-management" element={<FormManagement />} />
                <Route path="/admin/reviews" element={<Reviews />} />
                {/* Add the missing route for booked dates calendar */}
                <Route path="/admin/booked-dates" element={<BookedDatesCalendar />} />
                <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
              </Routes>
            </AdminPageContainer>
          </div>
        </AdminLayoutProvider>
      );
    }

    // Specialized roles get limited access
    switch (user.role) {
      case "usermanager":
        return (
          <AdminLayoutProvider>
            <div className="flex min-h-screen bg-gradient-mesh overflow-x-hidden">
              <AdminSidebar />
              <AdminPageContainer>
                <Routes>
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/users" />} />
                </Routes>
              </AdminPageContainer>
            </div>
          </AdminLayoutProvider>
        );

      case "contentmanager":
        return (
          <AdminLayoutProvider>
            <div className="flex min-h-screen bg-gradient-mesh overflow-x-hidden">
              <AdminSidebar />
              <AdminPageContainer>
                <Routes>
                  <Route path="/admin/content-management" element={<ContentManagement />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/content-management" />} />
                </Routes>
              </AdminPageContainer>
            </div>
          </AdminLayoutProvider>
        );

      case "formmanager":
        return (
          <AdminLayoutProvider>
            <div className="flex min-h-screen bg-gradient-mesh overflow-x-hidden">
              <AdminSidebar />
              <AdminPageContainer>
                <Routes>
                  <Route path="/admin/form-management" element={<FormManagement />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/form-management" />} />
                </Routes>
              </AdminPageContainer>
            </div>
          </AdminLayoutProvider>
        );

      case "bookingmanager":
        return (
          <AdminLayoutProvider>
            <div className="flex min-h-screen bg-gradient-mesh overflow-x-hidden">
              <AdminSidebar />
              <AdminPageContainer>
                <Routes>
                  <Route path="/admin/booking-management" element={<BookingManagement />} />
                  <Route path="/admin/booked-dates" element={<BookedDatesCalendar />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/booking-management" />} />
                </Routes>
              </AdminPageContainer>
            </div>
          </AdminLayoutProvider>
        );

      case "contactmanager":
        return (
          <AdminLayoutProvider>
            <div className="flex min-h-screen bg-gradient-mesh overflow-x-hidden">
              <AdminSidebar />
              <AdminPageContainer>
                <Routes>
                  <Route path="/admin/contact-management" element={<ContactManagement />} />
                  <Route path="/admin/reviews" element={<Reviews />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/contact-management" />} />
                </Routes>
              </AdminPageContainer>
            </div>
          </AdminLayoutProvider>
        );

      case "committeemember":
        return (
          <AdminLayoutProvider>
            <div className="flex min-h-screen bg-gradient-mesh overflow-x-hidden">
              <CommitteeMemberSidebar />
              <AdminPageContainer>
                <Routes>
                  <Route path="/committee/dashboard" element={<CommitteeDashboard />} />
                  <Route path="/committee/add-member" element={<AddVillageMember />} />
                  <Route path="/committee/book-event" element={<BookVillageEvent />} />
                  <Route path="/committee/members" element={<CommitteeMembersList />} />
                  <Route path="/committee/approve-villagers" element={<VillagerApproval />} />
                  <Route path="/committee/village-members" element={<VillageMembers />} />
                  <Route path="/committee/*" element={<Navigate to="/committee/dashboard" />} />
                </Routes>
              </AdminPageContainer>
            </div>
          </AdminLayoutProvider>
        );

      case "admin":
        // Regular admin gets full access like super admin for backward compatibility
        return (
          <AdminLayoutProvider>
            <div className="flex min-h-screen bg-gradient-mesh overflow-x-hidden">
              <AdminSidebar />
              <AdminPageContainer>
                <Routes>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/content-management" element={<ContentManagement />} />
                  <Route path="/admin/booking-management" element={<BookingManagement />} />
                  <Route path="/admin/contact-management" element={<ContactManagement />} />
                  <Route path="/admin/live-streams" element={<LiveStreams />} />
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/form-management" element={<FormManagement />} />
                  <Route path="/admin/reviews" element={<Reviews />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
                </Routes>
              </AdminPageContainer>
            </div>
          </AdminLayoutProvider>
        );

      default:
        return <Navigate to="/auth" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      {isAdminRoute ? (
        renderAdminLayout()
      ) : (
        <>
          {/* Show header and footer on all non-admin pages including auth */}
          <Header />
          <main className="flex-grow overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/services" element={<Services />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/events/categories" element={<EventCategories />} />
              <Route path="/ForgotPassword" element={<ForgotPassword />} />
              <Route path="/ResetPassword/:token" element={<ResetPassword />} />

              <Route
                path="/samuh-lagan"
                element={
                  <FormStatusCheck formType="samuhLagan">
                    <SamuhLaganBooking />
                  </FormStatusCheck>
                }
              />
              <Route
                path="/student-awards"
                element={
                  <FormStatusCheck formType="studentAwards">
                    <StudentAwardRegistration />
                  </FormStatusCheck>
                }
              />


              <Route path="/booking" element={<Booking />} />

              <Route path="/live-streaming" element={
                <ProtectedRoute>
                  <LiveStreaming />
                </ProtectedRoute>
              } />
              <Route path="/reviews/submit-review" element={
                <ProtectedRoute>
                  <SubmitReview />
                </ProtectedRoute>
              } />
              <Route path="/profile-settings" element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/recently-booked" element={
                <ProtectedRoute>
                  <RecentBookings />
                </ProtectedRoute>
              } />
              <Route path="/recently-booked" element={
                <ProtectedRoute>
                  <RecentBookings />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

import IntroVideo from "./components/IntroVideo";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        {showIntro ? (
          <IntroVideo onComplete={handleIntroComplete} />
        ) : (
          <AppContent />
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;