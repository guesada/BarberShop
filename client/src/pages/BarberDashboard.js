import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Users, TrendingUp, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../store';

function BarberDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth || {});
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data para relatórios
  const monthlyStats = {
    revenue: 2450,
    appointments: 48,
    clients: 32,
    rating: 4.8
  };

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      client: 'João Silva',
      service: 'Corte + Barba',
      date: '2024-01-15',
      time: '14:30',
      status: 'confirmed',
      price: 45
    },
    {
      id: 2,
      client: 'Pedro Santos',
      service: 'Corte Social',
      date: '2024-01-15',
      time: '16:00',
      status: 'pending',
      price: 30
    },
    {
      id: 3,
      client: 'Carlos Lima',
      service: 'Barba',
      date: '2024-01-16',
      time: '10:00',
      status: 'confirmed',
      price: 20
    }
  ]);

  const weeklyRevenue = [
    { day: 'Seg', revenue: 280 },
    { day: 'Ter', revenue: 320 },
    { day: 'Qua', revenue: 450 },
    { day: 'Qui', revenue: 380 },
    { day: 'Sex', revenue: 520 },
    { day: 'Sáb', revenue: 680 },
    { day: 'Dom', revenue: 420 }
  ];

  const topServices = [
    { name: 'Corte + Barba', count: 18, revenue: 810 },
    { name: 'Corte Social', count: 15, revenue: 450 },
    { name: 'Barba', count: 12, revenue: 240 },
    { name: 'Bigode', count: 8, revenue: 120 }
  ];

  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
    toast.success('Logout realizado com sucesso!');
    navigate('/');
  };

  const handleConfirmAppointment = (appointmentId) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'confirmed' }
          : apt
      )
    );
    toast.success('Agendamento confirmado!');
  };

  const handleCancelAppointment = (appointmentId) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    toast.success('Agendamento cancelado!');
  };

  const renderOverview = () => (
    <div>
      <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
        Visão Geral - Janeiro 2024
      </h2>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: '#3A322A',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #483E34'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              background: '#22C55E',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <DollarSign size={20} color="white" />
            </div>
            <span style={{ color: '#9E9E9E', fontSize: '14px' }}>Faturamento</span>
          </div>
          <p style={{ color: 'white', fontSize: '24px', fontWeight: '600', margin: 0 }}>
            R$ {monthlyStats.revenue}
          </p>
        </div>

        <div style={{
          background: '#3A322A',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #483E34'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              background: '#3B82F6',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <Calendar size={20} color="white" />
            </div>
            <span style={{ color: '#9E9E9E', fontSize: '14px' }}>Agendamentos</span>
          </div>
          <p style={{ color: 'white', fontSize: '24px', fontWeight: '600', margin: 0 }}>
            {monthlyStats.appointments}
          </p>
        </div>

        <div style={{
          background: '#3A322A',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #483E34'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              background: '#8B5CF6',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <Users size={20} color="white" />
            </div>
            <span style={{ color: '#9E9E9E', fontSize: '14px' }}>Clientes</span>
          </div>
          <p style={{ color: 'white', fontSize: '24px', fontWeight: '600', margin: 0 }}>
            {monthlyStats.clients}
          </p>
        </div>

        <div style={{
          background: '#3A322A',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #483E34'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              background: '#F59E0B',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <TrendingUp size={20} color="white" />
            </div>
            <span style={{ color: '#9E9E9E', fontSize: '14px' }}>Avaliação</span>
          </div>
          <p style={{ color: 'white', fontSize: '24px', fontWeight: '600', margin: 0 }}>
            {monthlyStats.rating} ⭐
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div style={{
        background: '#3A322A',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #483E34',
        marginBottom: '32px'
      }}>
        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
          Faturamento Semanal
        </h3>
        <div style={{ display: 'flex', alignItems: 'end', gap: '12px', height: '200px' }}>
          {weeklyRevenue.map((day, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                background: '#FF6B35',
                width: '100%',
                height: `${(day.revenue / 700) * 160}px`,
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                minHeight: '20px'
              }}></div>
              <span style={{ color: '#9E9E9E', fontSize: '12px' }}>{day.day}</span>
              <span style={{ color: 'white', fontSize: '10px', fontWeight: '500' }}>
                R$ {day.revenue}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Services */}
      <div style={{
        background: '#3A322A',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #483E34'
      }}>
        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
          Serviços Mais Populares
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topServices.map((service, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: '#483E34',
              borderRadius: '8px'
            }}>
              <div>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: '0 0 4px 0' }}>
                  {service.name}
                </p>
                <p style={{ color: '#9E9E9E', fontSize: '12px', margin: 0 }}>
                  {service.count} serviços
                </p>
              </div>
              <p style={{ color: '#FF6B35', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                R$ {service.revenue}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div>
      <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
        Agendamentos de Hoje
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {appointments.map(appointment => (
          <div key={appointment.id} style={{
            background: '#3A322A',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #483E34',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                {appointment.client}
              </h3>
              <p style={{ color: '#9E9E9E', fontSize: '14px', margin: '0 0 4px 0' }}>
                Serviço: {appointment.service}
              </p>
              <p style={{ color: '#9E9E9E', fontSize: '14px', margin: '0 0 4px 0' }}>
                Horário: {appointment.time}
              </p>
              <p style={{ color: '#FF6B35', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                R$ {appointment.price}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                background: appointment.status === 'confirmed' ? '#22C55E' : '#F59E0B',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
              </span>
              
              {appointment.status === 'pending' && (
                <button
                  onClick={() => handleConfirmAppointment(appointment.id)}
                  style={{
                    background: '#22C55E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle size={12} />
                  Confirmar
                </button>
              )}
              
              <button
                onClick={() => handleCancelAppointment(appointment.id)}
                style={{
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <XCircle size={12} />
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#2D2720',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#3A322A',
        padding: '20px 24px',
        borderBottom: '1px solid #483E34',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0' }}>
            Olá, {user?.name || 'Barbeiro'}!
          </h1>
          <p style={{ color: '#9E9E9E', fontSize: '14px', margin: 0 }}>
            Aqui está o resumo do seu trabalho
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '1px solid #483E34',
            color: '#9E9E9E',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>

      {/* Navigation */}
      <div style={{
        background: '#3A322A',
        padding: '0 24px',
        borderBottom: '1px solid #483E34'
      }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { id: 'overview', label: 'Relatórios', icon: TrendingUp },
            { id: 'appointments', label: 'Agendamentos', icon: Calendar },
            { id: 'schedule', label: 'Agenda', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab.id ? '#FF6B35' : '#9E9E9E',
                  padding: '16px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: activeTab === tab.id ? '2px solid #FF6B35' : '2px solid transparent'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'schedule' && (
          <div>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
              Agenda da Semana
            </h2>
            <p style={{ color: '#9E9E9E', fontSize: '14px' }}>
              Sua agenda semanal aparecerá aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BarberDashboard;
