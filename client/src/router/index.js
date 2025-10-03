import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectIsAuthenticated, selectUserType } from '../store/slices/authSlice';

// Layout Components
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Loading Components
import PageLoader from '../components/common/PageLoader';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy load pages for code splitting
const WelcomePage = lazy(() => import('../pages/WelcomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const EmailVerificationPage = lazy(() => import('../pages/EmailVerificationPage'));

// Client Pages
const ClientDashboard = lazy(() => import('../pages/client/Dashboard'));
const NewAppointment = lazy(() => import('../pages/client/NewAppointment'));
const MyAppointments = lazy(() => import('../pages/client/MyAppointments'));
const AppointmentHistory = lazy(() => import('../pages/client/AppointmentHistory'));
const ClientProfile = lazy(() => import('../pages/client/Profile'));
const FavoriteBarbers = lazy(() => import('../pages/client/FavoriteBarbers'));
const BarberDetails = lazy(() => import('../pages/client/BarberDetails'));
const ServiceCatalog = lazy(() => import('../pages/client/ServiceCatalog'));
const PaymentMethods = lazy(() => import('../pages/client/PaymentMethods'));
const Notifications = lazy(() => import('../pages/client/Notifications'));
const Settings = lazy(() => import('../pages/client/Settings'));

// Barber Pages
const BarberDashboard = lazy(() => import('../pages/barber/Dashboard'));
const BarberSchedule = lazy(() => import('../pages/barber/Schedule'));
const BarberAppointments = lazy(() => import('../pages/barber/Appointments'));
const BarberProfile = lazy(() => import('../pages/barber/Profile'));
const BarberServices = lazy(() => import('../pages/barber/Services'));
const BarberAnalytics = lazy(() => import('../pages/barber/Analytics'));
const BarberClients = lazy(() => import('../pages/barber/Clients'));
const BarberEarnings = lazy(() => import('../pages/barber/Earnings'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminBarbers = lazy(() => import('../pages/admin/Barbers'));
const AdminServices = lazy(() => import('../pages/admin/Services'));
const AdminAppointments = lazy(() => import('../pages/admin/Appointments'));
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));
const AdminReports = lazy(() => import('../pages/admin/Reports'));

// Shared Pages
const Chat = lazy(() => import('../pages/shared/Chat'));
const Help = lazy(() => import('../pages/shared/Help'));
const About = lazy(() => import('../pages/shared/About'));
const Terms = lazy(() => import('../pages/shared/Terms'));
const Privacy = lazy(() => import('../pages/shared/Privacy'));

// Error Pages
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));
const ServerError = lazy(() => import('../pages/errors/ServerError'));
const Maintenance = lazy(() => import('../pages/errors/Maintenance'));

// Route Guards
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userType = useAppSelector(selectUserType);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userType = useAppSelector(selectUserType);
  
  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on user type
    switch (userType) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'barber':
        return <Navigate to="/barber/dashboard" replace />;
      case 'client':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

const BarberRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['barber', 'admin']}>
    {children}
  </ProtectedRoute>
);

const ClientRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['client', 'admin']}>
    {children}
  </ProtectedRoute>
);

// Suspense wrapper with error boundary
const SuspenseWrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Router configuration
const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <SuspenseWrapper><ServerError /></SuspenseWrapper>,
    children: [
      {
        index: true,
        element: (
          <PublicRoute>
            <SuspenseWrapper>
              <WelcomePage />
            </SuspenseWrapper>
          </PublicRoute>
        ),
      },
      {
        path: 'about',
        element: <SuspenseWrapper><About /></SuspenseWrapper>,
      },
      {
        path: 'help',
        element: <SuspenseWrapper><Help /></SuspenseWrapper>,
      },
      {
        path: 'terms',
        element: <SuspenseWrapper><Terms /></SuspenseWrapper>,
      },
      {
        path: 'privacy',
        element: <SuspenseWrapper><Privacy /></SuspenseWrapper>,
      },
    ],
  },
  
  // Auth routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <SuspenseWrapper>
              <LoginPage />
            </SuspenseWrapper>
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <SuspenseWrapper>
              <RegisterPage />
            </SuspenseWrapper>
          </PublicRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <SuspenseWrapper>
              <ForgotPasswordPage />
            </SuspenseWrapper>
          </PublicRoute>
        ),
      },
      {
        path: 'reset-password/:token',
        element: (
          <PublicRoute>
            <SuspenseWrapper>
              <ResetPasswordPage />
            </SuspenseWrapper>
          </PublicRoute>
        ),
      },
      {
        path: 'verify-email/:token',
        element: (
          <SuspenseWrapper>
            <EmailVerificationPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  
  // Legacy auth routes (for backward compatibility)
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/register',
    element: <Navigate to="/auth/register" replace />,
  },
  
  // Client routes
  {
    path: '/dashboard',
    element: (
      <ClientRoute>
        <DashboardLayout userType="client" />
      </ClientRoute>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><ClientDashboard /></SuspenseWrapper>,
      },
      {
        path: 'appointments',
        children: [
          {
            path: 'new',
            element: <SuspenseWrapper><NewAppointment /></SuspenseWrapper>,
          },
          {
            path: 'my',
            element: <SuspenseWrapper><MyAppointments /></SuspenseWrapper>,
          },
          {
            path: 'history',
            element: <SuspenseWrapper><AppointmentHistory /></SuspenseWrapper>,
          },
        ],
      },
      {
        path: 'barbers',
        children: [
          {
            index: true,
            element: <SuspenseWrapper><FavoriteBarbers /></SuspenseWrapper>,
          },
          {
            path: ':id',
            element: <SuspenseWrapper><BarberDetails /></SuspenseWrapper>,
          },
        ],
      },
      {
        path: 'services',
        element: <SuspenseWrapper><ServiceCatalog /></SuspenseWrapper>,
      },
      {
        path: 'payments',
        element: <SuspenseWrapper><PaymentMethods /></SuspenseWrapper>,
      },
      {
        path: 'profile',
        element: <SuspenseWrapper><ClientProfile /></SuspenseWrapper>,
      },
      {
        path: 'notifications',
        element: <SuspenseWrapper><Notifications /></SuspenseWrapper>,
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><Settings /></SuspenseWrapper>,
      },
      {
        path: 'chat',
        element: <SuspenseWrapper><Chat /></SuspenseWrapper>,
      },
    ],
  },
  
  // Barber routes
  {
    path: '/barber',
    element: (
      <BarberRoute>
        <DashboardLayout userType="barber" />
      </BarberRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <SuspenseWrapper><BarberDashboard /></SuspenseWrapper>,
      },
      {
        path: 'schedule',
        element: <SuspenseWrapper><BarberSchedule /></SuspenseWrapper>,
      },
      {
        path: 'appointments',
        element: <SuspenseWrapper><BarberAppointments /></SuspenseWrapper>,
      },
      {
        path: 'clients',
        element: <SuspenseWrapper><BarberClients /></SuspenseWrapper>,
      },
      {
        path: 'services',
        element: <SuspenseWrapper><BarberServices /></SuspenseWrapper>,
      },
      {
        path: 'earnings',
        element: <SuspenseWrapper><BarberEarnings /></SuspenseWrapper>,
      },
      {
        path: 'analytics',
        element: <SuspenseWrapper><BarberAnalytics /></SuspenseWrapper>,
      },
      {
        path: 'profile',
        element: <SuspenseWrapper><BarberProfile /></SuspenseWrapper>,
      },
      {
        path: 'chat',
        element: <SuspenseWrapper><Chat /></SuspenseWrapper>,
      },
    ],
  },
  
  // Admin routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>,
      },
      {
        path: 'users',
        element: <SuspenseWrapper><AdminUsers /></SuspenseWrapper>,
      },
      {
        path: 'barbers',
        element: <SuspenseWrapper><AdminBarbers /></SuspenseWrapper>,
      },
      {
        path: 'services',
        element: <SuspenseWrapper><AdminServices /></SuspenseWrapper>,
      },
      {
        path: 'appointments',
        element: <SuspenseWrapper><AdminAppointments /></SuspenseWrapper>,
      },
      {
        path: 'analytics',
        element: <SuspenseWrapper><AdminAnalytics /></SuspenseWrapper>,
      },
      {
        path: 'reports',
        element: <SuspenseWrapper><AdminReports /></SuspenseWrapper>,
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><AdminSettings /></SuspenseWrapper>,
      },
    ],
  },
  
  // Error routes
  {
    path: '/unauthorized',
    element: <SuspenseWrapper><Unauthorized /></SuspenseWrapper>,
  },
  {
    path: '/maintenance',
    element: <SuspenseWrapper><Maintenance /></SuspenseWrapper>,
  },
  {
    path: '/server-error',
    element: <SuspenseWrapper><ServerError /></SuspenseWrapper>,
  },
  
  // Catch all route - 404
  {
    path: '*',
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>,
  },
]);

// Router Provider Component
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

// Export route utilities
export const routes = {
  // Public routes
  home: '/',
  about: '/about',
  help: '/help',
  terms: '/terms',
  privacy: '/privacy',
  
  // Auth routes
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  resetPassword: (token) => `/auth/reset-password/${token}`,
  verifyEmail: (token) => `/auth/verify-email/${token}`,
  
  // Client routes
  dashboard: '/dashboard',
  newAppointment: '/dashboard/appointments/new',
  myAppointments: '/dashboard/appointments/my',
  appointmentHistory: '/dashboard/appointments/history',
  barbers: '/dashboard/barbers',
  barberDetails: (id) => `/dashboard/barbers/${id}`,
  services: '/dashboard/services',
  payments: '/dashboard/payments',
  profile: '/dashboard/profile',
  notifications: '/dashboard/notifications',
  settings: '/dashboard/settings',
  chat: '/dashboard/chat',
  
  // Barber routes
  barberDashboard: '/barber/dashboard',
  barberSchedule: '/barber/schedule',
  barberAppointments: '/barber/appointments',
  barberClients: '/barber/clients',
  barberServices: '/barber/services',
  barberEarnings: '/barber/earnings',
  barberAnalytics: '/barber/analytics',
  barberProfile: '/barber/profile',
  barberChat: '/barber/chat',
  
  // Admin routes
  adminDashboard: '/admin/dashboard',
  adminUsers: '/admin/users',
  adminBarbers: '/admin/barbers',
  adminServices: '/admin/services',
  adminAppointments: '/admin/appointments',
  adminAnalytics: '/admin/analytics',
  adminReports: '/admin/reports',
  adminSettings: '/admin/settings',
  
  // Error routes
  unauthorized: '/unauthorized',
  maintenance: '/maintenance',
  serverError: '/server-error',
  notFound: '/404',
};

// Navigation utilities
export const getDashboardRoute = (userType) => {
  switch (userType) {
    case 'admin':
      return routes.adminDashboard;
    case 'barber':
      return routes.barberDashboard;
    case 'client':
    default:
      return routes.dashboard;
  }
};

export const getProfileRoute = (userType) => {
  switch (userType) {
    case 'barber':
      return routes.barberProfile;
    case 'client':
    default:
      return routes.profile;
  }
};

export const getChatRoute = (userType) => {
  switch (userType) {
    case 'barber':
      return routes.barberChat;
    case 'client':
    default:
      return routes.chat;
  }
};
