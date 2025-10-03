import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertCircle, CheckCircle } from 'lucide-react';
import styled, { ThemeProvider } from 'styled-components';
import { useAppSelector } from '../../store';
import { selectEffectiveTheme } from '../../store/slices/uiSlice';
import { lightTheme, darkTheme } from '../../styles/theme';
import usePWA from '../../hooks/usePWA';

const IndicatorContainer = styled(motion.div)`
  position: fixed;
  top: ${({ theme }) => theme?.spacing?.[4] || '1rem'};
  left: 50%;
  transform: translateX(-50%);
  z-index: ${({ theme }) => theme?.zIndex?.toast || '1700'};
  pointer-events: none;
`;

const IndicatorCard = styled(motion.div)`
  background: ${({ theme, $isOnline }) => 
    $isOnline 
      ? theme?.colors?.status?.success || '#4CAF50'
      : theme?.colors?.status?.error || '#F44336'
  };
  color: ${({ theme }) => theme?.colors?.text?.inverse || '#ffffff'};
  padding: ${({ theme }) => `${theme?.spacing?.[3] || '0.75rem'} ${theme?.spacing?.[4] || '1rem'}`};
  border-radius: ${({ theme }) => theme?.borderRadius?.full || '9999px'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.[2] || '0.5rem'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  box-shadow: ${({ theme }) => theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme, $isOnline }) => 
    $isOnline 
      ? theme?.colors?.status?.success || '#4CAF50'
      : theme?.colors?.status?.error || '#F44336'
  };
  
  @media (max-width: ${({ theme }) => theme?.breakpoints?.mobile || '480px'}) {
    font-size: ${({ theme }) => theme?.typography?.fontSize?.xs || '0.75rem'};
    padding: ${({ theme }) => `${theme?.spacing?.[2] || '0.5rem'} ${theme?.spacing?.[3] || '0.75rem'}`};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusText = styled.span`
  white-space: nowrap;
`;

const PulseIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OfflineIndicator = () => {
  const theme = useAppSelector(selectEffectiveTheme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const { isOnline } = usePWA();

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const getStatusContent = () => {
    if (isOnline) {
      return {
        icon: <CheckCircle size={16} />,
        text: 'Conectado',
        showDuration: 2000 // Mostrar por 2 segundos quando voltar online
      };
    } else {
      return {
        icon: (
          <PulseIcon variants={pulseVariants} animate="pulse">
            <WifiOff size={16} />
          </PulseIcon>
        ),
        text: 'Modo Offline',
        showDuration: null // Mostrar indefinidamente quando offline
      };
    }
  };

  const statusContent = getStatusContent();

  return (
    <ThemeProvider theme={currentTheme}>
      <AnimatePresence>
        {(!isOnline || (isOnline && statusContent.showDuration)) && (
          <IndicatorContainer
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key={isOnline ? 'online' : 'offline'}
          >
            <IndicatorCard $isOnline={isOnline}>
              <IconWrapper>
                {statusContent.icon}
              </IconWrapper>
              <StatusText>
                {statusContent.text}
              </StatusText>
            </IndicatorCard>
          </IndicatorContainer>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
};

// Componente adicional para mostrar informações detalhadas de conectividade
export const ConnectionStatus = ({ showDetails = false }) => {
  const theme = useAppSelector(selectEffectiveTheme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const { isOnline } = usePWA();

  if (!showDetails) return null;

  return (
    <ThemeProvider theme={currentTheme}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: currentTheme.spacing[2],
          padding: currentTheme.spacing[2],
          backgroundColor: isOnline 
            ? currentTheme.colors.success[50] 
            : currentTheme.colors.error[50],
          borderRadius: currentTheme.borderRadius.md,
          border: `1px solid ${isOnline 
            ? currentTheme.colors.success[200] 
            : currentTheme.colors.error[200]
          }`,
          fontSize: currentTheme.typography.fontSize.xs,
          color: isOnline 
            ? currentTheme.colors.success[700] 
            : currentTheme.colors.error[700]
        }}
      >
        {isOnline ? (
          <>
            <Wifi size={14} />
            <span>Online - Dados sincronizados</span>
          </>
        ) : (
          <>
            <AlertCircle size={14} />
            <span>Offline - Dados podem estar desatualizados</span>
          </>
        )}
      </motion.div>
    </ThemeProvider>
  );
};

export default OfflineIndicator;
