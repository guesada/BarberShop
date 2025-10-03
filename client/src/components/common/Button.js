import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Button variants
const buttonVariants = {
  primary: css`
    background: ${({ theme }) => theme.components.button.primary.background};
    color: ${({ theme }) => theme.components.button.primary.text};
    border: 1px solid ${({ theme }) => theme.components.button.primary.border};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.components.button.primary.backgroundHover};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.professionalHover};
    }
    
    &:active {
      transform: translateY(0);
    }
  `,
  
  secondary: css`
    background: ${({ theme }) => theme.components.button.secondary.background};
    color: ${({ theme }) => theme.components.button.secondary.text};
    border: 1px solid ${({ theme }) => theme.components.button.secondary.border};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.components.button.secondary.backgroundHover};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.professional};
    }
    
    &:active {
      transform: translateY(0);
    }
  `,
  
  ghost: css`
    background: ${({ theme }) => theme.components.button.ghost.background};
    color: ${({ theme }) => theme.components.button.ghost.text};
    border: 1px solid ${({ theme }) => theme.components.button.ghost.border};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.components.button.ghost.backgroundHover};
    }
  `,
  
  danger: css`
    background: ${({ theme }) => theme.colors.status.error};
    color: ${({ theme }) => theme.colors.text.inverse};
    border: 1px solid ${({ theme }) => theme.colors.status.error};
    
    &:hover:not(:disabled) {
      background: #d32f2f;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  `,
  
  success: css`
    background: ${({ theme }) => theme.colors.status.success};
    color: ${({ theme }) => theme.colors.text.inverse};
    border: 1px solid ${({ theme }) => theme.colors.status.success};
    
    &:hover:not(:disabled) {
      background: #388e3c;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  `,
};

// Size variants
const sizeVariants = {
  sm: css`
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    min-height: 32px;
  `,
  
  md: css`
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    min-height: 40px;
  `,
  
  lg: css`
    padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    min-height: 48px;
  `,
  
  xl: css`
    padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[8]};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    min-height: 56px;
  `,
};

// Styled button component
const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.none};
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  user-select: none;
  
  transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.professional};
  
  /* Apply variant styles */
  ${({ $variant }) => buttonVariants[$variant] || buttonVariants.primary}
  
  /* Apply size styles */
  ${({ $size }) => sizeVariants[$size] || sizeVariants.md}
  
  /* Full width */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Icon only */
  ${({ $iconOnly }) => $iconOnly && css`
    padding: ${({ theme }) => theme.spacing[3]};
    aspect-ratio: 1;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  /* Loading state */
  ${({ $loading }) => $loading && css`
    cursor: not-allowed;
    position: relative;
    
    > *:not(.loading-spinner) {
      opacity: 0;
    }
  `}
  
  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
  
  /* Active state */
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const LoadingSpinner = styled(Loader2)`
  position: absolute;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ButtonContent = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

// Main Button component
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className,
  ...props
}, ref) => {
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <StyledButton
      ref={ref}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $iconOnly={iconOnly}
      $loading={loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading && <LoadingSpinner className="loading-spinner" size={16} />}
      
      <ButtonContent>
        {leftIcon && !iconOnly && leftIcon}
        {iconOnly ? (leftIcon || rightIcon) : children}
        {rightIcon && !iconOnly && rightIcon}
      </ButtonContent>
    </StyledButton>
  );
});

Button.displayName = 'Button';

// Button group component
const ButtonGroupContainer = styled.div`
  display: inline-flex;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.base};
  
  ${StyledButton} {
    border-radius: 0;
    border-right-width: 0;
    
    &:first-child {
      border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
      border-bottom-left-radius: ${({ theme }) => theme.borderRadius.lg};
    }
    
    &:last-child {
      border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
      border-bottom-right-radius: ${({ theme }) => theme.borderRadius.lg};
      border-right-width: 1px;
    }
    
    &:not(:first-child):not(:last-child) {
      border-radius: 0;
    }
  }
  
  ${({ $vertical }) => $vertical && css`
    flex-direction: column;
    
    ${StyledButton} {
      border-right-width: 1px;
      border-bottom-width: 0;
      
      &:first-child {
        border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
      }
      
      &:last-child {
        border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg};
        border-bottom-width: 1px;
      }
    }
  `}
`;

export const ButtonGroup = ({ children, vertical = false, className, ...props }) => {
  return (
    <ButtonGroupContainer className={className} $vertical={vertical} {...props}>
      {children}
    </ButtonGroupContainer>
  );
};

// Icon button component
export const IconButton = React.forwardRef((props, ref) => {
  return <Button ref={ref} iconOnly {...props} />;
});

IconButton.displayName = 'IconButton';

// Floating Action Button component
const FABContainer = styled(StyledButton)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing[6]};
  right: ${({ theme }) => theme.spacing[6]};
  z-index: ${({ theme }) => theme.zIndex.docked};
  
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  
  &:hover:not(:disabled) {
    box-shadow: ${({ theme }) => theme.shadows.xl};
    transform: scale(1.05);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    bottom: ${({ theme }) => theme.spacing[4]};
    right: ${({ theme }) => theme.spacing[4]};
    width: 48px;
    height: 48px;
  }
`;

export const FloatingActionButton = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <FABContainer
      ref={ref}
      as={motion.button}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </FABContainer>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

export default Button;
