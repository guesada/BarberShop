import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Wifi, Bell } from 'lucide-react';
import styled, { ThemeProvider } from 'styled-components';
import { useAppSelector } from '../../store';
import { selectEffectiveTheme } from '../../store/slices/uiSlice';
import { lightTheme, darkTheme } from '../../styles/theme';
import Button from './Button';
import Card from './Card';
import usePWA from '../../hooks/usePWA';

const PromptContainer = styled(motion.div)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing[6]};
  left: ${({ theme }) => theme.spacing[4]};
  right: ${({ theme }) => theme.spacing[4]};
  z-index: ${({ theme }) => theme.zIndex.modal};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    left: auto;
    right: ${({ theme }) => theme.spacing[6]};
    width: 400px;
  }
`;

const PromptHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const PromptTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.animations.duration.fast} ${({ theme }) => theme.animations.easing.easeOut};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const PromptContent = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const PromptDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
  line-height: 1.5;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FeatureIcon = styled.div`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.primary[500]};
  flex-shrink: 0;
`;

const PromptActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const UpdatePromptContainer = styled(motion.div)`
  position: fixed;
  top: ${({ theme }) => theme.spacing[4]};
  left: ${({ theme }) => theme.spacing[4]};
  right: ${({ theme }) => theme.spacing[4]};
  z-index: ${({ theme }) => theme.zIndex.modal};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    left: auto;
    right: ${({ theme }) => theme.spacing[6]};
    width: 350px;
  }
`;

const PWAInstallPrompt = () => {
  const theme = useAppSelector(selectEffectiveTheme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  
  const {
    isInstallable,
    isInstalled,
    updateAvailable,
    installPWA,
    updateApp,
    isOnline
  } = usePWA();
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Verificar se deve mostrar o prompt de instalação
  useEffect(() => {
    const installDismissed = localStorage.getItem('pwa-install-dismissed');
    const lastDismissed = localStorage.getItem('pwa-install-last-dismissed');
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 semana em ms
    
    // Mostrar prompt se:
    // - App é instalável
    // - Não está instalado
    // - Não foi dispensado ou foi dispensado há mais de 1 semana
    // - Está online
    if (isInstallable && !isInstalled && isOnline) {
      if (!installDismissed || (lastDismissed && (now - parseInt(lastDismissed)) > oneWeek)) {
        // Delay para não ser intrusivo
        const timer = setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isInstallable, isInstalled, isOnline]);

  // Verificar se deve mostrar o prompt de atualização
  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-last-dismissed', Date.now().toString());
  };

  const handleUpdate = () => {
    updateApp();
    setShowUpdatePrompt(false);
  };

  const installPromptVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: 100,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const updatePromptVariants = {
    hidden: {
      opacity: 0,
      y: -100,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: -100,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <AnimatePresence>
        {/* Prompt de Instalação */}
        {showInstallPrompt && !dismissed && (
          <PromptContainer
            variants={installPromptVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card padding="lg" variant="elevated">
              <PromptHeader>
                <PromptTitle>
                  <Download size={20} />
                  Instalar BarberShop
                </PromptTitle>
                <CloseButton onClick={handleDismiss}>
                  <X size={16} />
                </CloseButton>
              </PromptHeader>
              
              <PromptContent>
                <PromptDescription>
                  Instale o BarberShop no seu dispositivo para uma experiência ainda melhor!
                </PromptDescription>
                
                <FeatureList>
                  <FeatureItem>
                    <FeatureIcon>
                      <Smartphone size={16} />
                    </FeatureIcon>
                    Acesso rápido na tela inicial
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon>
                      <Wifi size={16} />
                    </FeatureIcon>
                    Funciona offline
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon>
                      <Bell size={16} />
                    </FeatureIcon>
                    Notificações de agendamentos
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon>
                      <Monitor size={16} />
                    </FeatureIcon>
                    Interface nativa
                  </FeatureItem>
                </FeatureList>
              </PromptContent>
              
              <PromptActions>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download size={16} />}
                  onClick={handleInstall}
                  fullWidth
                >
                  Instalar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  fullWidth
                >
                  Agora não
                </Button>
              </PromptActions>
            </Card>
          </PromptContainer>
        )}

        {/* Prompt de Atualização */}
        {showUpdatePrompt && (
          <UpdatePromptContainer
            variants={updatePromptVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card padding="lg" variant="elevated">
              <PromptHeader>
                <PromptTitle>
                  <Download size={20} />
                  Atualização Disponível
                </PromptTitle>
                <CloseButton onClick={() => setShowUpdatePrompt(false)}>
                  <X size={16} />
                </CloseButton>
              </PromptHeader>
              
              <PromptContent>
                <PromptDescription>
                  Uma nova versão do BarberShop está disponível com melhorias e correções.
                </PromptDescription>
              </PromptContent>
              
              <PromptActions>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpdate}
                  fullWidth
                >
                  Atualizar Agora
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdatePrompt(false)}
                  fullWidth
                >
                  Depois
                </Button>
              </PromptActions>
            </Card>
          </UpdatePromptContainer>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
};

export default PWAInstallPrompt;
