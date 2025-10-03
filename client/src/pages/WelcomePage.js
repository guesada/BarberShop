import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, User, UserCheck } from 'lucide-react';

function WelcomePage() {
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType) => {
    navigate('/login', { state: { userType } });
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#2D2720',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Logo Section */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#FF6B35',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
        }}>
          <Scissors size={32} color="white" />
        </div>
        
        <h1 style={{
          fontSize: '36px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Bem-vindo
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#9E9E9E',
          fontWeight: '400',
          margin: '0'
        }}>
          Escolha como deseja continuar
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        width: '100%',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => handleUserTypeSelect('client')}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#FF5722';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#FF6B35';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <User size={20} />
          Entrar como Cliente
        </button>

        <button
          onClick={() => handleUserTypeSelect('barber')}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'transparent',
            color: '#FF6B35',
            border: '1px solid #FF6B35',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#483E34';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <UserCheck size={20} />
          Entrar como Barbeiro
        </button>
      </div>

      {/* Register Link */}
      <div style={{
        color: '#9E9E9E',
        fontSize: '14px'
      }}>
        <p style={{ marginBottom: '8px', margin: '0 0 8px 0' }}>Primeira vez aqui?</p>
        <button 
          onClick={handleRegister}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            textDecoration: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#FF8A65';
            e.target.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#FF6B35';
            e.target.style.textDecoration = 'none';
          }}
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
