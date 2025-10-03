import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Download, 
  Bell, 
  Wifi, 
  Trash2, 
  RefreshCw,
  HardDrive,
  Smartphone,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import styled, { ThemeProvider } from 'styled-components';
import { useAppSelector } from '../../store';
import { selectEffectiveTheme } from '../../store/slices/uiSlice';
import { lightTheme, darkTheme } from '../../styles/theme';
import Button from './Button';
import Card from './Card';
import Modal from './Modal';
import usePWA from '../../hooks/usePWA';
import useOfflineStorage from '../../hooks/useOfflineStorage';
import toast from 'react-hot-toast';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const SettingDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const SettingAction = styled.div`
  margin-left: ${({ theme }) => theme.spacing[4]};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  ${({ $status, theme }) => {
    switch ($status) {
      case 'success':
        return `
          background: ${theme.colors.success[100]};
          color: ${theme.colors.success[700]};
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[700]};
        `;
      case 'error':
        return `
          background: ${theme.colors.error[100]};
          color: ${theme.colors.error[700]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
    }
  }}
`;

const StorageStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const PWASettings = ({ isOpen, onClose }) => {
  const theme = useAppSelector(selectEffectiveTheme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  
  const {
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    installPWA,
    updateApp,
    requestNotificationPermission,
    clearCache,
    checkStorageQuota,
    isNotificationSupported,
    isServiceWorkerSupported,
    isPWACapable
  } = usePWA();
  
  const {
    isReady: isStorageReady,
    getStorageStats,
    clearAllData,
    processSyncQueue
  } = useOfflineStorage();
  
  const [storageStats, setStorageStats] = useState(null);
  const [storageQuota, setStorageQuota] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [isLoading, setIsLoading] = useState(false);

  // Carregar estatísticas
  useEffect(() => {
    if (isOpen && isStorageReady) {
      loadStats();
    }
  }, [isOpen, isStorageReady]);

  const loadStats = async () => {
    try {
      const [stats, quota] = await Promise.all([
        getStorageStats(),
        checkStorageQuota()
      ]);
      
      setStorageStats(stats);
      setStorageQuota(quota);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleInstallApp = async () => {
    setIsLoading(true);
    try {
      const success = await installPWA();
      if (success) {
        toast.success('App instalado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao instalar o app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateApp = async () => {
    setIsLoading(true);
    try {
      await updateApp();
      toast.success('App atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar o app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestNotificationPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
      if (granted) {
        toast.success('Notificações ativadas!');
      }
    } catch (error) {
      toast.error('Erro ao ativar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await clearCache();
      await loadStats();
      toast.success('Cache limpo com sucesso!');
    } catch (error) {
      toast.error('Erro ao limpar cache');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todos os dados offline? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await clearAllData();
      await loadStats();
      toast.success('Todos os dados foram limpos!');
    } catch (error) {
      toast.error('Erro ao limpar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setIsLoading(true);
    try {
      await processSyncQueue();
      await loadStats();
      toast.success('Dados sincronizados!');
    } catch (error) {
      toast.error('Erro ao sincronizar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatus = () => {
    if (isOnline) {
      return { status: 'success', text: 'Online' };
    } else {
      return { status: 'error', text: 'Offline' };
    }
  };

  const getInstallStatus = () => {
    if (isInstalled) {
      return { status: 'success', text: 'Instalado' };
    } else if (isInstallable) {
      return { status: 'warning', text: 'Disponível' };
    } else {
      return { status: 'default', text: 'Não disponível' };
    }
  };

  const getNotificationStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return { status: 'success', text: 'Ativadas' };
      case 'denied':
        return { status: 'error', text: 'Bloqueadas' };
      case 'default':
        return { status: 'warning', text: 'Não solicitadas' };
      default:
        return { status: 'default', text: 'Não suportadas' };
    }
  };

  const connectionStatus = getConnectionStatus();
  const installStatus = getInstallStatus();
  const notificationStatus = getNotificationStatus();

  return (
    <ThemeProvider theme={currentTheme}>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Configurações PWA"
        size="lg"
      >
        <SettingsContainer>
          {/* Status Geral */}
          <Card padding="lg">
            <SectionTitle>
              <Globe size={20} />
              Status do Sistema
            </SectionTitle>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Conexão</SettingLabel>
                <SettingDescription>
                  Status da conexão com a internet
                </SettingDescription>
              </SettingInfo>
              <StatusBadge $status={connectionStatus.status}>
                <Wifi size={12} />
                {connectionStatus.text}
              </StatusBadge>
            </SettingItem>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Service Worker</SettingLabel>
                <SettingDescription>
                  Funcionalidades offline e cache
                </SettingDescription>
              </SettingInfo>
              <StatusBadge $status={isServiceWorkerSupported ? 'success' : 'error'}>
                <Shield size={12} />
                {isServiceWorkerSupported ? 'Ativo' : 'Não suportado'}
              </StatusBadge>
            </SettingItem>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>PWA</SettingLabel>
                <SettingDescription>
                  Recursos de Progressive Web App
                </SettingDescription>
              </SettingInfo>
              <StatusBadge $status={isPWACapable ? 'success' : 'warning'}>
                <Zap size={12} />
                {isPWACapable ? 'Suportado' : 'Limitado'}
              </StatusBadge>
            </SettingItem>
          </Card>

          {/* Instalação */}
          <Card padding="lg">
            <SectionTitle>
              <Smartphone size={20} />
              Instalação
            </SectionTitle>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Status da Instalação</SettingLabel>
                <SettingDescription>
                  Instale o app na tela inicial do seu dispositivo
                </SettingDescription>
              </SettingInfo>
              <SettingAction>
                <StatusBadge $status={installStatus.status}>
                  <Download size={12} />
                  {installStatus.text}
                </StatusBadge>
              </SettingAction>
            </SettingItem>
            
            {isInstallable && !isInstalled && (
              <SettingItem>
                <SettingInfo>
                  <SettingLabel>Instalar App</SettingLabel>
                  <SettingDescription>
                    Adicionar à tela inicial para acesso rápido
                  </SettingDescription>
                </SettingInfo>
                <SettingAction>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleInstallApp}
                    loading={isLoading}
                    leftIcon={<Download size={16} />}
                  >
                    Instalar
                  </Button>
                </SettingAction>
              </SettingItem>
            )}
            
            {updateAvailable && (
              <SettingItem>
                <SettingInfo>
                  <SettingLabel>Atualização Disponível</SettingLabel>
                  <SettingDescription>
                    Nova versão com melhorias e correções
                  </SettingDescription>
                </SettingInfo>
                <SettingAction>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUpdateApp}
                    loading={isLoading}
                    leftIcon={<RefreshCw size={16} />}
                  >
                    Atualizar
                  </Button>
                </SettingAction>
              </SettingItem>
            )}
          </Card>

          {/* Notificações */}
          {isNotificationSupported && (
            <Card padding="lg">
              <SectionTitle>
                <Bell size={20} />
                Notificações
              </SectionTitle>
              
              <SettingItem>
                <SettingInfo>
                  <SettingLabel>Status das Notificações</SettingLabel>
                  <SettingDescription>
                    Receba lembretes de agendamentos e atualizações
                  </SettingDescription>
                </SettingInfo>
                <SettingAction>
                  <StatusBadge $status={notificationStatus.status}>
                    <Bell size={12} />
                    {notificationStatus.text}
                  </StatusBadge>
                </SettingAction>
              </SettingItem>
              
              {notificationPermission !== 'granted' && (
                <SettingItem>
                  <SettingInfo>
                    <SettingLabel>Ativar Notificações</SettingLabel>
                    <SettingDescription>
                      Permitir notificações push do navegador
                    </SettingDescription>
                  </SettingInfo>
                  <SettingAction>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRequestNotifications}
                      loading={isLoading}
                      leftIcon={<Bell size={16} />}
                    >
                      Ativar
                    </Button>
                  </SettingAction>
                </SettingItem>
              )}
            </Card>
          )}

          {/* Armazenamento */}
          <Card padding="lg">
            <SectionTitle>
              <HardDrive size={20} />
              Armazenamento
            </SectionTitle>
            
            {storageStats && (
              <StorageStats>
                <StatItem>
                  <StatValue>{storageStats.appointments || 0}</StatValue>
                  <StatLabel>Agendamentos</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{storageStats.barbers || 0}</StatValue>
                  <StatLabel>Barbeiros</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{storageStats.pendingSync || 0}</StatValue>
                  <StatLabel>Pendentes</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{storageStats.cache || 0}</StatValue>
                  <StatLabel>Cache</StatLabel>
                </StatItem>
              </StorageStats>
            )}
            
            {storageQuota && (
              <SettingItem>
                <SettingInfo>
                  <SettingLabel>Uso do Armazenamento</SettingLabel>
                  <SettingDescription>
                    {storageQuota.usage}MB de {storageQuota.quota}MB utilizados ({storageQuota.percentUsed}%)
                  </SettingDescription>
                </SettingInfo>
              </SettingItem>
            )}
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Sincronizar Dados</SettingLabel>
                <SettingDescription>
                  Enviar dados pendentes para o servidor
                </SettingDescription>
              </SettingInfo>
              <SettingAction>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSyncData}
                  loading={isLoading}
                  leftIcon={<RefreshCw size={16} />}
                  disabled={!isOnline}
                >
                  Sincronizar
                </Button>
              </SettingAction>
            </SettingItem>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Limpar Cache</SettingLabel>
                <SettingDescription>
                  Remove arquivos temporários e cache do navegador
                </SettingDescription>
              </SettingInfo>
              <SettingAction>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearCache}
                  loading={isLoading}
                  leftIcon={<Trash2 size={16} />}
                >
                  Limpar
                </Button>
              </SettingAction>
            </SettingItem>
            
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Limpar Todos os Dados</SettingLabel>
                <SettingDescription>
                  Remove todos os dados offline (não pode ser desfeito)
                </SettingDescription>
              </SettingInfo>
              <SettingAction>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearAllData}
                  loading={isLoading}
                  leftIcon={<Trash2 size={16} />}
                >
                  Limpar Tudo
                </Button>
              </SettingAction>
            </SettingItem>
          </Card>
        </SettingsContainer>
      </Modal>
    </ThemeProvider>
  );
};

export default PWASettings;
