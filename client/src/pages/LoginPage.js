import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Scissors, Eye, EyeOff } from 'lucide-react';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const userType = location.state?.userType || 'client';
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular login simples
    setTimeout(() => {
      const userData = {
        id: 1,
        name: formData.email.split('@')[0],
        email: formData.email
      };
      
      onLogin(userData, userType);
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    navigate('/');
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
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Back Button */}
      <button
        onClick={handleBack}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: '#3A322A',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <ArrowLeft size={20} />
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: '#FF6B35',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
        }}>
          <Scissors size={24} color="white" />
        </div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Entrar como {userType === 'client' ? 'Cliente' : 'Barbeiro'}
        </h1>
        
        <p style={{
          fontSize: '14px',
          color: '#9E9E9E',
          margin: '0'
        }}>
          Faça login para continuar
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '400px',
        background: '#3A322A',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #483E34'
      }}>
        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'white'
          }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="seu@email.com"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#2D2720',
              border: '1px solid #483E34',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'white'
          }}>
            Senha
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Sua senha"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingRight: '48px',
                background: '#2D2720',
                border: '1px solid #483E34',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#9E9E9E',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <input
            type="checkbox"
            name="remember"
            id="remember"
            checked={formData.remember}
            onChange={handleInputChange}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#FF6B35'
            }}
          />
          <label htmlFor="remember" style={{
            fontSize: '14px',
            color: '#9E9E9E',
            cursor: 'pointer'
          }}>
            Lembrar de mim
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '16px',
            background: isLoading ? '#666' : '#FF6B35',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '24px'
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#9E9E9E',
          fontSize: '14px'
        }}>
          <p style={{ marginBottom: '8px', margin: '0 0 8px 0' }}>Não tem uma conta?</p>
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF6B35',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            Cadastre-se
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
