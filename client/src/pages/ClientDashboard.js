import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Star, Plus, History, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../store';

function ClientDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth || {});
  const [activeTab, setActiveTab] = useState('appointments');

  // Mock data para agendamentos
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      barber: 'João Silva',
      service: 'Corte + Barba',
      date: '2024-01-15',
      time: '14:30',
      status: 'confirmed',
      price: 45
    },
    {
      id: 2,
      barber: 'Carlos Santos',
      service: 'Corte Social',
      date: '2024-01-20',
      time: '16:00',
      status: 'pending',
      price: 30
    }
  ]);

  // Mock data para barbeiros
  const barbers = [
    {
      id: 1,
      name: 'João Silva',
      rating: 4.8,
      specialties: ['Corte Clássico', 'Barba', 'Bigode'],
      price: 45,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Carlos Santos',
      rating: 4.9,
      specialties: ['Corte Moderno', 'Degradê', 'Barba'],
      price: 40,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Pedro Costa',
      rating: 4.7,
      specialties: ['Corte Social', 'Barba', 'Sobrancelha'],
      price: 35,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const services = [
    { id: 1, name: 'Corte Simples', price: 25, duration: '30min' },
    { id: 2, name: 'Corte + Barba', price: 45, duration: '60min' },
    { id: 3, name: 'Barba', price: 20, duration: '30min' },
    { id: 4, name: 'Bigode', price: 15, duration: '20min' },
    { id: 5, name: 'Sobrancelha', price: 10, duration: '15min' }
  ];

  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
    toast.success('Logout realizado com sucesso!');
    navigate('/');
  };

  const handleNewAppointment = () => {
    setActiveTab('new-appointment');
  };

  const handleCancelAppointment = (appointmentId) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    toast.success('Agendamento cancelado com sucesso!');
  };

  const handleBookAppointment = (barberId, serviceId) => {
    const barber = barbers.find(b => b.id === barberId);
    const service = services.find(s => s.id === serviceId);
    
    const newAppointment = {
      id: appointments.length + 1,
      barber: barber.name,
      service: service.name,
      date: '2024-01-25',
      time: '15:00',
      status: 'pending',
      price: service.price
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    toast.success(`Agendamento com ${barber.name} realizado!`);
    setActiveTab('appointments');
  };

  const renderAppointments = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Meus Agendamentos
        </h2>
        <button
          onClick={handleNewAppointment}
          style={{
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          Novo Agendamento
        </button>
      </div>

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
                {appointment.service}
              </h3>
              <p style={{ color: '#9E9E9E', fontSize: '14px', margin: '0 0 4px 0' }}>
                Barbeiro: {appointment.barber}
              </p>
              <p style={{ color: '#9E9E9E', fontSize: '14px', margin: '0 0 4px 0' }}>
                Data: {appointment.date} às {appointment.time}
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
              
              <button
                onClick={() => handleCancelAppointment(appointment.id)}
                style={{
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewAppointment = () => (
    <div>
      <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
        Novo Agendamento
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>
          Escolha o Serviço
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {services.map(service => (
            <div key={service.id} style={{
              background: '#3A322A',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #483E34',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>
                {service.name}
              </h4>
              <p style={{ color: '#9E9E9E', fontSize: '12px', margin: '0 0 4px 0' }}>
                Duração: {service.duration}
              </p>
              <p style={{ color: '#FF6B35', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                R$ {service.price}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>
          Escolha o Barbeiro
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {barbers.map(barber => (
            <div key={barber.id} style={{
              background: '#3A322A',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #483E34'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <img 
                  src={barber.avatar} 
                  alt={barber.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                    {barber.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="#FF6B35" color="#FF6B35" />
                    <span style={{ color: '#FF6B35', fontSize: '14px', fontWeight: '500' }}>
                      {barber.rating}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#9E9E9E', fontSize: '12px', marginBottom: '8px' }}>Especialidades:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {barber.specialties.map((specialty, index) => (
                    <span key={index} style={{
                      background: '#483E34',
                      color: '#9E9E9E',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => handleBookAppointment(barber.id, 1)}
                style={{
                  width: '100%',
                  background: '#FF6B35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Agendar - R$ {barber.price}
              </button>
            </div>
          ))}
        </div>
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
            Olá, {user?.name || 'Cliente'}!
          </h1>
          <p style={{ color: '#9E9E9E', fontSize: '14px', margin: 0 }}>
            Como podemos te ajudar hoje?
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
            { id: 'appointments', label: 'Agendamentos', icon: Calendar },
            { id: 'new-appointment', label: 'Novo Agendamento', icon: Plus },
            { id: 'history', label: 'Histórico', icon: History }
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
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'new-appointment' && renderNewAppointment()}
        {activeTab === 'history' && (
          <div>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
              Histórico de Serviços
            </h2>
            <p style={{ color: '#9E9E9E', fontSize: '14px' }}>
              Seus serviços anteriores aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDashboard;
