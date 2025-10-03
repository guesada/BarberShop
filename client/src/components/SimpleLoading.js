import React from 'react';

const SimpleLoading = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#2D2720',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FF6B35',
      fontSize: '18px',
      zIndex: 9999
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #FF6B35',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        Carregando...
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimpleLoading;
