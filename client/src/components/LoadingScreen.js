import React from 'react';
import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoadingLogo = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-24);
  box-shadow: var(--shadow-primary);
`;

const LoadingText = styled(motion.p)`
  color: var(--color-text-secondary);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: var(--space-16);
`;

const LoadingDots = styled(motion.div)`
  display: flex;
  gap: var(--space-8);
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
`;

const logoVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const textVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const dotVariants = {
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function LoadingScreen() {
  return (
    <LoadingContainer>
      <LoadingLogo
        variants={logoVariants}
        animate="animate"
      >
        <Scissors size={32} color="white" />
      </LoadingLogo>
      
      <LoadingText
        variants={textVariants}
        animate="animate"
      >
        Carregando Elite Barber...
      </LoadingText>
      
      <LoadingDots>
        {[0, 1, 2].map((index) => (
          <Dot
            key={index}
            variants={dotVariants}
            animate="animate"
            transition={{
              delay: index * 0.2,
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </LoadingDots>
    </LoadingContainer>
  );
}

export default LoadingScreen;
