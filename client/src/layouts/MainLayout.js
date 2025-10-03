import React from 'react';
import { Outlet } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../store';
import { selectEffectiveTheme } from '../store/slices/uiSlice';
import { lightTheme, darkTheme } from '../styles/theme';

// Components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ToastContainer from '../components/common/ToastContainer';
import OfflineIndicator from '../components/common/OfflineIndicator';
import CookieConsent from '../components/common/CookieConsent';
import ScrollToTop from '../components/common/ScrollToTop';

// Styled Components
const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.3s ease;
`;

const MainContent = styled(motion.main)`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px); // Account for header height
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    min-height: calc(100vh - 70px);
  }
`;

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

const MainLayout = () => {
  const theme = useAppSelector(selectEffectiveTheme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <LayoutContainer>
        <Header />
        
        <MainContent
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <ContentWrapper>
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </ContentWrapper>
        </MainContent>
        
        <Footer />
        
        {/* Global Components */}
        <ToastContainer />
        <OfflineIndicator />
        <CookieConsent />
        <ScrollToTop />
      </LayoutContainer>
    </ThemeProvider>
  );
};

export default MainLayout;
