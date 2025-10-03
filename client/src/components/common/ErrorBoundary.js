import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Button from './Button';
import Card from './Card';

// Styled components
const ErrorContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme?.spacing?.[4] || '1rem'};
  background: ${({ theme }) => theme?.colors?.background?.primary || '#2D2720'};
`;

const ErrorCard = styled(Card)`
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const ErrorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.status.error}20;
  border-radius: 50%;
  margin: 0 auto ${({ theme }) => theme.spacing[6]};
  color: ${({ theme }) => theme.colors.status.error};
`;

const ErrorTitle = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ErrorMessage = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing[6]} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const ErrorDetails = styled.details`
  margin: ${({ theme }) => theme.spacing[4]} 0;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  text-align: left;
  
  summary {
    cursor: pointer;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary[500]};
    }
  }
  
  pre {
    margin: ${({ theme }) => theme.spacing[2]} 0 0 0;
    padding: ${({ theme }) => theme.spacing[3]};
    background: ${({ theme }) => theme.colors.background.primary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

// Error Boundary Class Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // Example: Send to Sentry
      // Sentry.captureException(error, {
      //   contexts: {
      //     react: {
      //       componentStack: errorInfo.componentStack,
      //     },
      //   },
      // });

      // Example: Send to custom logging service
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Store in localStorage for debugging
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10))); // Keep last 10 errors

      console.warn('Error logged to localStorage:', errorData);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const errorData = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Create mailto link with error details
    const subject = encodeURIComponent('Bug Report - BarberShop App Error');
    const body = encodeURIComponent(`
Erro encontrado na aplicação BarberShop:

Mensagem: ${errorData.message}
Timestamp: ${errorData.timestamp}
URL: ${errorData.url}
User Agent: ${errorData.userAgent}

Stack Trace:
${errorData.stack}

Component Stack:
${errorData.componentStack}

Por favor, descreva o que você estava fazendo quando o erro ocorreu:
[Descreva aqui]
    `);

    window.open(`mailto:support@barbershop.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { fallback: Fallback } = this.props;

      // If a custom fallback component is provided, use it
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo}
            resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          />
        );
      }

      // Default error UI
      return (
        <ErrorContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ErrorCard padding="xl">
            <ErrorIcon>
              <AlertTriangle size={40} />
            </ErrorIcon>
            
            <ErrorTitle>Oops! Algo deu errado</ErrorTitle>
            
            <ErrorMessage>
              Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
            </ErrorMessage>

            {process.env.NODE_ENV === 'development' && error && (
              <ErrorDetails>
                <summary>
                  <Bug size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre>
                  <strong>Erro:</strong> {error.message}
                  {'\n\n'}
                  <strong>Stack:</strong>
                  {'\n'}
                  {error.stack}
                  {errorInfo?.componentStack && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack:</strong>
                      {'\n'}
                      {errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </ErrorDetails>
            )}

            <ButtonGroup>
              <Button
                variant="primary"
                leftIcon={<RefreshCw size={16} />}
                onClick={this.handleReload}
              >
                Recarregar página
              </Button>
              
              <Button
                variant="secondary"
                leftIcon={<Home size={16} />}
                onClick={this.handleGoHome}
              >
                Ir para início
              </Button>
              
              <Button
                variant="ghost"
                leftIcon={<Bug size={16} />}
                onClick={this.handleReportBug}
              >
                Reportar bug
              </Button>
            </ButtonGroup>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // You can dispatch to a global error state here
    // or show a toast notification
    
    // For now, we'll just log it
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
    
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push(errorData);
    localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10)));
  };
};

// Simple error fallback component
export const SimpleErrorFallback = ({ error, resetError }) => (
  <ErrorContainer>
    <ErrorCard>
      <ErrorIcon>
        <AlertTriangle size={32} />
      </ErrorIcon>
      <ErrorTitle style={{ fontSize: '1.5rem' }}>Algo deu errado</ErrorTitle>
      <ErrorMessage style={{ fontSize: '1rem' }}>
        {error?.message || 'Erro inesperado'}
      </ErrorMessage>
      <Button onClick={resetError}>Tentar novamente</Button>
    </ErrorCard>
  </ErrorContainer>
);

// Inline error component for smaller errors
export const InlineError = ({ 
  error, 
  onRetry, 
  title = 'Erro', 
  showDetails = false 
}) => (
  <Card variant="outlined" padding="lg" style={{ textAlign: 'center' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginBottom: '16px',
      color: '#F44336'
    }}>
      <AlertTriangle size={24} />
    </div>
    
    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem' }}>
      {title}
    </h3>
    
    <p style={{ margin: '0 0 16px 0', color: '#666' }}>
      {error?.message || 'Ocorreu um erro inesperado'}
    </p>
    
    {showDetails && error?.stack && (
      <ErrorDetails>
        <summary>Ver detalhes</summary>
        <pre style={{ fontSize: '0.75rem' }}>{error.stack}</pre>
      </ErrorDetails>
    )}
    
    {onRetry && (
      <Button variant="primary" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    )}
  </Card>
);

export default ErrorBoundary;
