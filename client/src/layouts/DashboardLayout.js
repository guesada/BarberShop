import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  selectEffectiveTheme, 
  selectSidebarOpen, 
  selectSidebarCollapsed,
  selectMobileMenuOpen,
  setSidebarOpen,
  setMobileMenuOpen 
} from '../store/slices/uiSlice';
import { lightTheme, darkTheme } from '../styles/theme';

// Components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/dashboard/Sidebar';
import MobileSidebar from '../components/dashboard/MobileSidebar';
import Breadcrumbs from '../components/dashboard/Breadcrumbs';
import QuickActions from '../components/dashboard/QuickActions';
import ToastContainer from '../components/common/ToastContainer';
import OfflineIndicator from '../components/common/OfflineIndicator';
import LoadingOverlay from '../components/common/LoadingOverlay';
import NotificationCenter from '../components/dashboard/NotificationCenter';

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.3s ease;
  position: relative;
`;

const SidebarContainer = styled(motion.aside)`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.primary};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${({ $sidebarCollapsed, $sidebarOpen }) => {
    if (!$sidebarOpen) return '0';
    return $sidebarCollapsed ? '80px' : '280px';
  }};
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: 0;
  }
`;

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 900;
  background: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const BreadcrumbContainer = styled.div`
  padding: 16px 24px 0;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 12px 16px 0;
  }
`;

const MainContent = styled(motion.main)`
  flex: 1;
  padding: 24px;
  position: relative;
  overflow-x: hidden;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px;
  }
`;

const MobileOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const QuickActionsContainer = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 800;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    bottom: 16px;
    right: 16px;
  }
`;

// Animation variants
const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const overlayVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const contentVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const DashboardLayout = ({ userType = 'client' }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const theme = useAppSelector(selectEffectiveTheme);
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed);
  const mobileMenuOpen = useAppSelector(selectMobileMenuOpen);
  
  const [isMobile, setIsMobile] = useState(false);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (mobile && sidebarOpen) {
        dispatch(setSidebarOpen(false));
      } else if (!mobile && !sidebarOpen) {
        dispatch(setSidebarOpen(true));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, sidebarOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      dispatch(setMobileMenuOpen(false));
    }
  }, [location.pathname, dispatch, mobileMenuOpen]);

  // Handle mobile overlay click
  const handleOverlayClick = () => {
    dispatch(setMobileMenuOpen(false));
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        dispatch(setMobileMenuOpen(false));
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen, dispatch]);

  return (
    <ThemeProvider theme={currentTheme}>
      <DashboardContainer>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <SidebarContainer
            variants={sidebarVariants}
            animate={sidebarOpen ? 'open' : 'closed'}
            initial={false}
          >
            <Sidebar 
              userType={userType} 
              collapsed={sidebarCollapsed}
            />
          </SidebarContainer>
        )}

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <>
              <MobileOverlay
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                onClick={handleOverlayClick}
              />
              <MobileSidebar 
                userType={userType}
                isOpen={mobileMenuOpen}
                onClose={() => dispatch(setMobileMenuOpen(false))}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <MainContainer 
          $sidebarOpen={sidebarOpen && !isMobile} 
          $sidebarCollapsed={sidebarCollapsed}
        >
          {/* Header */}
          <HeaderContainer>
            <DashboardHeader userType={userType} />
          </HeaderContainer>

          {/* Content */}
          <ContentArea>
            {/* Breadcrumbs */}
            <BreadcrumbContainer>
              <Breadcrumbs />
            </BreadcrumbContainer>

            {/* Main Content */}
            <MainContent
              variants={contentVariants}
              initial="initial"
              animate="in"
              exit="out"
              key={location.pathname}
            >
              <AnimatePresence mode="wait">
                <Outlet />
              </AnimatePresence>
            </MainContent>
          </ContentArea>
        </MainContainer>

        {/* Quick Actions FAB */}
        <QuickActionsContainer
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        >
          <QuickActions userType={userType} />
        </QuickActionsContainer>

        {/* Global Components */}
        <ToastContainer />
        <OfflineIndicator />
        <LoadingOverlay />
        <NotificationCenter />
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default DashboardLayout;
