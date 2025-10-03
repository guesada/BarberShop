import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  User, 
  Calendar, 
  History, 
  Home, 
  LogOut,
  CalendarCheck,
  Clock,
  Plus,
  CalendarPlus,
  Star,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import styled, { ThemeProvider } from 'styled-components';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../store';
import { selectEffectiveTheme } from '../store/slices/uiSlice';
import { logoutUser } from '../store/slices/authSlice';
import { lightTheme, darkTheme } from '../styles/theme';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

const DashboardContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const UserGreeting = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  }
  
  p {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const HeaderButton = styled(motion.button)`
  width: 44px;
  height: 44px;
  background: var(--color-background);
  border: 1px solid var(--color-secondary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all var(--transition-base);
  
  &:hover {
    background: var(--color-secondary);
    transform: translateY(-1px);
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]};
  padding-bottom: 100px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

const StatsSection = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

const StatCard = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-secondary);
  border-radius: 16px;
  padding: var(--space-20);
  display: flex;
  align-items: center;
  gap: var(--space-16);
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
`;

const StatInfo = styled.div`
  h3 {
    font-size: 24px;
    font-weight: 700;
    color: white;
    margin-bottom: var(--space-4);
    font-family: 'Inter', sans-serif;
  }
  
  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
`;

const QuickActions = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

const ActionButton = styled(motion.button)`
  padding: var(--space-16);
  border-radius: 16px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-12);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: 'Inter', sans-serif;
  
  &.primary {
    background: var(--color-primary);
    color: white;
    
    &:hover {
      background: var(--color-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(255, 107, 53, 0.4);
    }
  }
  
  &.secondary {
    background: var(--color-surface);
    color: white;
    border: 1px solid var(--color-secondary);
    
    &:hover {
      background: var(--color-secondary);
      transform: translateY(-2px);
    }
  }
`;

const Section = styled(motion.div)`
  margin-bottom: var(--space-32);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-20);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const SeeAllButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
`;

const AppointmentItem = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-secondary);
  border-radius: 16px;
  padding: var(--space-20);
  display: flex;
  align-items: center;
  gap: var(--space-16);
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-base);
  }
`;

const AppointmentTime = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  
  .time {
    font-size: 18px;
    font-weight: 600;
    color: white;
  }
  
  .date {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
`;

const AppointmentDetails = styled.div`
  flex: 1;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin-bottom: var(--space-4);
    font-family: 'Inter', sans-serif;
  }
  
  p {
    font-size: 14px;
    font-weight: 400;
    color: var(--color-text-secondary);
    margin: 0;
  }
`;

const AppointmentActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-8);
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-4);
  border-radius: 50%;
  display: flex;

  &:hover {
    color: #ef4444; /* red-500 */
    background: rgba(239, 68, 68, 0.1);
  }
`;

const AppointmentStatus = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  
  &.confirmed {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }
  
  &.pending {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
  }
`;

const BarbersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
`;

const BarberItem = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-secondary);
  border-radius: 16px;
  padding: var(--space-20);
  display: flex;
  align-items: center;
  gap: var(--space-16);
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-base);
  }
`;

const BarberAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BarberInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin-bottom: var(--space-4);
    font-family: 'Inter', sans-serif;
  }
`;

const BarberRating = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
`;

const BookButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-base);
  
  &:hover {
    background: var(--color-primary-hover);
    transform: scale(1.05);
  }
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-secondary);
  padding: var(--space-12) var(--space-24);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
`;

const NavButton = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  padding: var(--space-8);
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  
  &.active {
    color: var(--color-primary);
    background: rgba(255, 107, 53, 0.1);
  }
  
  &:hover {
    color: var(--color-primary);
  }
  
  svg {
    margin-bottom: var(--space-2);
  }
`;

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const incrementTime = (duration / end) * 1;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count}</span>;
};

function DashboardPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectEffectiveTheme);
  const { user, isAuthenticated } = useAppSelector(state => state.auth || {});
  const appointments = useAppSelector(state => state.appointments?.list || []);
  const isLoading = useAppSelector(state => state.appointments?.isLoading || false);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  
  const [activeNav, setActiveNav] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock data for demonstration
  const mockAppointments = [
    {
      id: 1,
      time: '14:30',
      date: 'Hoje',
      service: 'Corte + Barba',
      barber: 'João Silva',
      status: 'confirmed'
    },
    {
      id: 2,
      time: '16:00',
      date: 'Amanhã',
      service: 'Corte Social',
      barber: 'Pedro Santos',
      status: 'pending'
    }
  ];

  const displayAppointments = appointments.length > 0 ? appointments : mockAppointments;
  
  const stats = {
    appointments: displayAppointments?.length || 0,
    pending: displayAppointments?.filter(apt => apt.status === 'pending')?.length || 0,
    completed: displayAppointments?.filter(apt => apt.status === 'completed')?.length || 0,
    revenue: 1250
  };
  
  const barbers = [
    {
      id: 1,
      name: 'João Silva',
      rating: 4.8,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Carlos Santos',
      rating: 4.9,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }
  ];

  useEffect(() => {
    // Mock data is already loaded, no need to fetch in demo mode
    console.log('Dashboard loaded with mock data');
  }, []);

  const handleLogout = () => {
    try {
      logoutUser();
      dispatch({ type: 'auth/logout' });
      toast.success('Logout realizado com sucesso!');
      window.location.href = '/';
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const handleNewBooking = () => {
    setIsModalOpen(true);
  };

  const handleViewHistory = () => {
    toast.info('Carregando histórico...');
    setActiveNav('history');
  };

  const handleBookWithBarber = (barberId) => {
    const barber = barbers.find(b => b.id === barberId);
    toast.success(`Agendando com ${barber?.name}...`);
    setIsModalOpen(true);
  };

  const handleViewAllAppointments = () => {
    toast.info('Carregando todos os agendamentos...');
    setActiveNav('calendar');
  };

  const handleViewAllBarbers = () => {
    toast.info('Carregando todos os barbeiros...');
    setActiveNav('barbers');
  };

  const handleBottomNavClick = (section) => {
    setActiveNav(section);
    toast.success(`Navegando para ${section}`);
  };

  const cancelAppointment = (appointmentId) => {
    toast.success(`Agendamento ${appointmentId} cancelado`);
    // Aqui você implementaria a lógica de cancelamento
  };

  const handleNavigation = (section) => {
    setActiveNav(section);
    toast.success(`Navegando para ${section}`);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <DashboardContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
      <Header>
        <HeaderTop>
          <UserGreeting>
            <h1>Olá, {user?.name || 'Cliente'}</h1>
            <p>Como você está hoje?</p>
          </UserGreeting>
          
          <HeaderActions>
            <HeaderButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={20} />
            </HeaderButton>
            
            <HeaderButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserAvatar>
                <img src={user?.avatar} alt="Avatar" />
              </UserAvatar>
            </HeaderButton>
          </HeaderActions>
        </HeaderTop>
      </Header>

      <Main>
        {isLoading && <p>Carregando dashboard...</p>}
        <StatsSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hover padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[4] }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: currentTheme.colors.primary[500], 
                borderRadius: currentTheme.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme.colors.text.inverse
              }}>
                <CalendarCheck size={20} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: currentTheme.typography.fontSize['2xl'], 
                  fontWeight: currentTheme.typography.fontWeight.bold,
                  color: currentTheme.colors.text.primary,
                  margin: 0,
                  marginBottom: currentTheme.spacing[1]
                }}>
                  <AnimatedCounter value={stats.appointments} />
                </h3>
                <p style={{ 
                  fontSize: currentTheme.typography.fontSize.sm,
                  color: currentTheme.colors.text.secondary,
                  margin: 0
                }}>
                  Agendamentos
                </p>
              </div>
            </div>
          </Card>
          
          <Card hover padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[4] }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: currentTheme.colors.status.warning, 
                borderRadius: currentTheme.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme.colors.text.inverse
              }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: currentTheme.typography.fontSize['2xl'], 
                  fontWeight: currentTheme.typography.fontWeight.bold,
                  color: currentTheme.colors.text.primary,
                  margin: 0,
                  marginBottom: currentTheme.spacing[1]
                }}>
                  <AnimatedCounter value={stats.pending} />
                </h3>
                <p style={{ 
                  fontSize: currentTheme.typography.fontSize.sm,
                  color: currentTheme.colors.text.secondary,
                  margin: 0
                }}>
                  Pendentes
                </p>
              </div>
            </div>
          </Card>
          
          <Card hover padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[4] }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: currentTheme.colors.status.success, 
                borderRadius: currentTheme.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme.colors.text.inverse
              }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: currentTheme.typography.fontSize['2xl'], 
                  fontWeight: currentTheme.typography.fontWeight.bold,
                  color: currentTheme.colors.text.primary,
                  margin: 0,
                  marginBottom: currentTheme.spacing[1]
                }}>
                  <AnimatedCounter value={stats.completed} />
                </h3>
                <p style={{ 
                  fontSize: currentTheme.typography.fontSize.sm,
                  color: currentTheme.colors.text.secondary,
                  margin: 0
                }}>
                  Concluídos
                </p>
              </div>
            </div>
          </Card>
          
          <Card hover padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[4] }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: currentTheme.colors.status.info, 
                borderRadius: currentTheme.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme.colors.text.inverse
              }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: currentTheme.typography.fontSize['2xl'], 
                  fontWeight: currentTheme.typography.fontWeight.bold,
                  color: currentTheme.colors.text.primary,
                  margin: 0,
                  marginBottom: currentTheme.spacing[1]
                }}>
                  R$ <AnimatedCounter value={stats.revenue} />
                </h3>
                <p style={{ 
                  fontSize: currentTheme.typography.fontSize.sm,
                  color: currentTheme.colors.text.secondary,
                  margin: 0
                }}>
                  Receita
                </p>
              </div>
            </div>
          </Card>
        </StatsSection>

        <QuickActions
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus size={20} />}
            onClick={handleNewBooking}
            fullWidth
          >
            Novo Agendamento
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<History size={20} />}
            onClick={handleViewHistory}
            fullWidth
          >
            Histórico
          </Button>
        </QuickActions>

        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader>
            <SectionTitle>Próximos Agendamentos</SectionTitle>
            <SeeAllButton onClick={handleViewAllAppointments}>
              Ver todos
            </SeeAllButton>
          </SectionHeader>
          
          <AppointmentsList>
            <AnimatePresence>
              {displayAppointments.slice(0, 2).map((appointment, index) => (
                <AppointmentItem
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <AppointmentTime>
                    <span className="time">{appointment.time}</span>
                    <span className="date">{appointment.date}</span>
                  </AppointmentTime>
                  
                  <AppointmentDetails>
                    <h4>{appointment.service}</h4>
                    <p>{appointment.barber}</p>
                  </AppointmentDetails>
                  
                  <AppointmentActions>
                    <CancelButton onClick={() => cancelAppointment(appointment.id)}>
                      <XCircle size={16} />
                    </CancelButton>
                    <AppointmentStatus className={appointment.status}>
                    {appointment.status === 'confirmed' ? 
                      <CheckCircle size={16} /> : 
                      <Clock size={16} />
                    }
                  </AppointmentStatus>
                  </AppointmentActions>
                </AppointmentItem>
              ))}
            </AnimatePresence>
          </AppointmentsList>
        </Section>

        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader>
            <SectionTitle>Barbeiros Favoritos</SectionTitle>
            <SeeAllButton onClick={handleViewAllBarbers}>
              Ver todos
            </SeeAllButton>
          </SectionHeader>
          
          <BarbersList>
            <AnimatePresence>
              {barbers.slice(0, 2).map((barber, index) => (
                <BarberItem
                  key={barber.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <BarberAvatar>
                    <img src={barber.avatar} alt={barber.name} />
                  </BarberAvatar>
                  
                  <BarberInfo>
                    <h4>{barber.name}</h4>
                    <BarberRating>
                      <Star size={14} fill="currentColor" />
                      <span>{barber.rating}</span>
                    </BarberRating>
                  </BarberInfo>
                  
                  <BookButton
                    onClick={() => handleBookWithBarber(barber.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CalendarPlus size={16} />
                  </BookButton>
                </BarberItem>
              ))}
            </AnimatePresence>
          </BarbersList>
        </Section>
      </Main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Agendamento"
        size="md"
      >
        <div style={{ padding: currentTheme.spacing[4] }}>
          <p style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing[4] }}>
            Funcionalidade em desenvolvimento...
          </p>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(false)}
            fullWidth
          >
            Fechar
          </Button>
        </div>
      </Modal>
      <BottomNav>
        <NavButton
          className={activeNav === 'home' ? 'active' : ''}
          onClick={() => handleNavigation('home')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home size={20} />
          <span>Início</span>
        </NavButton>
        
        <NavButton
          className={activeNav === 'calendar' ? 'active' : ''}
          onClick={() => handleNavigation('calendar')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Calendar size={20} />
          <span>Agenda</span>
        </NavButton>
        
        <NavButton
          className={activeNav === 'history' ? 'active' : ''}
          onClick={() => handleNavigation('history')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <History size={20} />
          <span>Histórico</span>
        </NavButton>
        
        <NavButton
          className={activeNav === 'profile' ? 'active' : ''}
          onClick={() => handleNavigation('profile')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <User size={20} />
          <span>Perfil</span>
        </NavButton>
        
        <NavButton
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={20} />
          <span>Sair</span>
        </NavButton>
      </BottomNav>
      </DashboardContainer>
    </ThemeProvider>
  );
}

export default DashboardPage;
