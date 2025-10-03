import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

// Modal sizes
const modalSizes = {
  sm: css`
    max-width: 400px;
    width: 90vw;
  `,
  md: css`
    max-width: 500px;
    width: 90vw;
  `,
  lg: css`
    max-width: 700px;
    width: 90vw;
  `,
  xl: css`
    max-width: 900px;
    width: 95vw;
  `,
  full: css`
    max-width: none;
    width: 95vw;
    height: 95vh;
  `,
};

// Overlay
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[4]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing[2]};
    align-items: flex-end;
  }
`;

// Modal container
const ModalContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  box-shadow: ${({ theme }) => theme.shadows['2xl']};
  position: relative;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  /* Apply size styles */
  ${({ $size }) => modalSizes[$size] || modalSizes.md}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    border-radius: ${({ theme }) => theme.borderRadius.xl} ${({ theme }) => theme.borderRadius.xl} 0 0;
    max-height: 95vh;
    width: 100% !important;
    max-width: none !important;
  }
`;

// Modal header
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  flex-shrink: 0;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

const ModalSubtitle = styled.p`
  margin: ${({ theme }) => theme.spacing[1]} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const CloseButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing[2]};
  min-height: auto;
  width: auto;
  aspect-ratio: 1;
`;

// Modal body
const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[6]};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.secondary};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.text.tertiary};
    }
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

// Modal footer
const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  flex-shrink: 0;
  
  ${({ $justify }) => css`
    justify-content: ${$justify};
  `}
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing[4]};
    flex-direction: column-reverse;
    
    > * {
      width: 100%;
    }
  }
`;

// Animation variants
const overlayVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const mobileModalVariants = {
  hidden: {
    opacity: 0,
    y: '100%',
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// Main Modal component
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  ...props
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose?.();
    }
  };
  
  const isMobile = window.innerWidth <= 768;
  
  if (!isOpen) return null;
  
  return createPortal(
    <AnimatePresence>
      <Overlay
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleOverlayClick}
      >
        <ModalContainer
          className={className}
          variants={isMobile ? mobileModalVariants : modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          $size={size}
          {...props}
        >
          {(title || showCloseButton) && (
            <ModalHeader>
              <div>
                {title && <ModalTitle>{title}</ModalTitle>}
                {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
              </div>
              {showCloseButton && (
                <CloseButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  leftIcon={<X size={16} />}
                  iconOnly
                />
              )}
            </ModalHeader>
          )}
          
          <ModalBody>
            {children}
          </ModalBody>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>,
    document.body
  );
};

// Compound components
Modal.Header = ({ children, title, subtitle, actions, ...props }) => (
  <ModalHeader {...props}>
    <div>
      {title && <ModalTitle>{title}</ModalTitle>}
      {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
      {!title && !subtitle && children}
    </div>
    {actions}
  </ModalHeader>
);

Modal.Body = ({ children, ...props }) => (
  <ModalBody {...props}>
    {children}
  </ModalBody>
);

Modal.Footer = ({ children, justify = 'flex-end', ...props }) => (
  <ModalFooter $justify={justify} {...props}>
    {children}
  </ModalFooter>
);

// Specialized modal components
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div style={{ marginBottom: '24px' }}>
        {message}
      </div>
      
      <Modal.Footer>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Atenção',
  message,
  buttonText = 'OK',
  variant = 'primary',
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div style={{ marginBottom: '24px' }}>
        {message}
      </div>
      
      <Modal.Footer justify="center">
        <Button
          variant={variant}
          onClick={onClose}
          fullWidth
        >
          {buttonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  loading = false,
  disabled = false,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      {...props}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          {children}
        </div>
        
        <Modal.Footer>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={disabled}
          >
            {submitText}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default Modal;
