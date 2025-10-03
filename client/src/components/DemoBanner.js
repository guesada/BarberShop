import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import styled from 'styled-components';

const BannerContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #FF6B35, #FF5722);
  color: white;
  padding: var(--space-12) var(--space-16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-12);
  flex: 1;
`;

const BannerIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const BannerText = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--space-4);
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const bannerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    y: -100, 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

function DemoBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if banner was previously dismissed
    return !localStorage.getItem('demo-banner-dismissed');
  });

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('demo-banner-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <BannerContainer
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <BannerContent>
            <BannerIcon>
              <Info size={20} />
            </BannerIcon>
            <BannerText>
              🚀 Modo Demo: Dados salvos localmente. Para funcionalidade completa, execute o backend.
            </BannerText>
          </BannerContent>
          <CloseButton onClick={handleClose}>
            <X size={18} />
          </CloseButton>
        </BannerContainer>
      )}
    </AnimatePresence>
  );
}

export default DemoBanner;
