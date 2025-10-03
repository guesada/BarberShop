import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

// Animations
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Container
const LoaderContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal + 1};
`;

// Logo container
const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 70%
    );
    animation: ${shimmer} 2s infinite;
  }
`;

const LogoIcon = styled.div`
  font-size: 32px;
  color: ${({ theme }) => theme.colors.text.inverse};
  animation: ${spin} 2s linear infinite;
`;

// Text container
const TextContainer = styled(motion.div)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const LoadingTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingSubtitle = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  animation: ${pulse} 2s ease-in-out infinite 0.5s;
`;

// Dots container
const DotsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${({ $delay }) => $delay}s;
`;

// Progress bar
const ProgressContainer = styled.div`
  width: 200px;
  height: 4px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 2px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary[500]},
    ${({ theme }) => theme.colors.primary[400]},
    ${({ theme }) => theme.colors.primary[500]}
  );
  border-radius: 2px;
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

// Spinner variants
const SpinnerContainer = styled.div`
  width: 40px;
  height: 40px;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SpinnerRing = styled.div`
  width: 100%;
  height: 100%;
  border: 3px solid ${({ theme }) => theme.colors.background.secondary};
  border-top: 3px solid ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Animation variants
const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Main PageLoader component
const PageLoader = ({ 
  title = 'Carregando...', 
  subtitle = 'Aguarde um momento',
  variant = 'logo',
  showProgress = false,
  progress = 0,
}) => {
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div variants={itemVariants}>
            <SpinnerContainer>
              <SpinnerRing />
            </SpinnerContainer>
          </motion.div>
        );
      
      case 'dots':
        return (
          <motion.div variants={itemVariants}>
            <DotsContainer>
              <Dot $delay={0} />
              <Dot $delay={0.16} />
              <Dot $delay={0.32} />
            </DotsContainer>
          </motion.div>
        );
      
      case 'logo':
      default:
        return (
          <motion.div variants={itemVariants}>
            <LogoContainer>
              <LogoIcon>✂</LogoIcon>
            </LogoContainer>
          </motion.div>
        );
    }
  };

  return (
    <LoaderContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {renderLoader()}
      
      <TextContainer variants={itemVariants}>
        <LoadingTitle>{title}</LoadingTitle>
        <LoadingSubtitle>{subtitle}</LoadingSubtitle>
      </TextContainer>
      
      {showProgress && (
        <motion.div variants={itemVariants}>
          <ProgressContainer>
            <ProgressBar
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </ProgressContainer>
        </motion.div>
      )}
    </LoaderContainer>
  );
};

// Inline loader component
const InlineLoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const InlineSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${({ theme }) => theme.colors.background.secondary};
  border-top: 2px solid ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const InlineText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export const InlineLoader = ({ text = 'Carregando...', size = 24 }) => (
  <InlineLoaderContainer>
    <InlineSpinner style={{ width: size, height: size }} />
    {text && <InlineText>{text}</InlineText>}
  </InlineLoaderContainer>
);

// Button loader component
const ButtonSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const ButtonLoader = ({ size = 16 }) => (
  <ButtonSpinner style={{ width: size, height: size }} />
);

// Skeleton loader component
const SkeletonContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: ${shimmer} 1.5s infinite;
  }
`;

export const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius,
  className,
  ...props 
}) => (
  <SkeletonContainer
    className={className}
    style={{ 
      width, 
      height, 
      borderRadius: borderRadius || undefined 
    }}
    {...props}
  />
);

// Card skeleton
export const CardSkeleton = () => (
  <div style={{ padding: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="16px" style={{ marginBottom: '8px' }} />
        <Skeleton width="40%" height="14px" />
      </div>
    </div>
    <Skeleton width="100%" height="12px" style={{ marginBottom: '8px' }} />
    <Skeleton width="80%" height="12px" style={{ marginBottom: '8px' }} />
    <Skeleton width="90%" height="12px" />
  </div>
);

export default PageLoader;
