import React, { useState, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

// Input variants
const inputVariants = {
  default: css`
    background: ${({ theme }) => theme.components.input.background};
    border: 1px solid ${({ theme }) => theme.components.input.border};
    color: ${({ theme }) => theme.components.input.text};
    
    &::placeholder {
      color: ${({ theme }) => theme.components.input.placeholder};
    }
    
    &:focus {
      background: ${({ theme }) => theme.components.input.backgroundFocus};
      border-color: ${({ theme }) => theme.components.input.borderFocus};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[500]}20;
    }
  `,
  
  filled: css`
    background: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.text.tertiary};
    }
    
    &:focus {
      background: ${({ theme }) => theme.colors.background.primary};
      border-color: ${({ theme }) => theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[500]}20;
    }
  `,
  
  outlined: css`
    background: transparent;
    border: 2px solid ${({ theme }) => theme.colors.border.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.text.tertiary};
    }
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[500]}20;
    }
  `,
};

// Size variants
const sizeVariants = {
  sm: css`
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    min-height: 36px;
  `,
  
  md: css`
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    min-height: 44px;
  `,
  
  lg: css`
    padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    min-height: 52px;
  `,
};

// Input container
const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

// Input wrapper
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

// Styled input
const StyledInput = styled.input`
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.easeOut};
  outline: none;
  
  /* Apply variant styles */
  ${({ $variant }) => inputVariants[$variant] || inputVariants.default}
  
  /* Apply size styles */
  ${({ $size }) => sizeVariants[$size] || sizeVariants.md}
  
  /* Error state */
  ${({ $error }) => $error && css`
    border-color: ${({ theme }) => theme.colors.status.error};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.status.error}20;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.status.error};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.status.error}20;
    }
  `}
  
  /* Success state */
  ${({ $success }) => $success && css`
    border-color: ${({ theme }) => theme.colors.status.success};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.status.success}20;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.status.success};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.status.success}20;
    }
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background.secondary};
  }
  
  /* With left icon */
  ${({ $hasLeftIcon, $size }) => $hasLeftIcon && css`
    padding-left: ${$size === 'sm' ? '36px' : $size === 'lg' ? '48px' : '40px'};
  `}
  
  /* With right icon */
  ${({ $hasRightIcon, $size }) => $hasRightIcon && css`
    padding-right: ${$size === 'sm' ? '36px' : $size === 'lg' ? '48px' : '40px'};
  `}
`;

// Input label
const InputLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  
  ${({ $required }) => $required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.status.error};
    }
  `}
`;

// Input description
const InputDescription = styled.p`
  margin: ${({ theme }) => theme.spacing[1]} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

// Input error message
const InputError = styled(motion.p)`
  margin: ${({ theme }) => theme.spacing[1]} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.status.error};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

// Input success message
const InputSuccess = styled(motion.p)`
  margin: ${({ theme }) => theme.spacing[1]} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.status.success};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

// Icon container
const IconContainer = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  pointer-events: none;
  z-index: 1;
  
  ${({ $position, $size }) => css`
    ${$position}: ${$size === 'sm' ? '12px' : $size === 'lg' ? '16px' : '14px'};
  `}
  
  ${({ $clickable }) => $clickable && css`
    pointer-events: auto;
    cursor: pointer;
    
    &:hover {
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  `}
`;

// Floating label
const FloatingLabel = styled.label`
  position: absolute;
  left: ${({ theme }) => theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.tertiary};
  pointer-events: none;
  transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.easeOut};
  background: ${({ theme }) => theme.colors.background.primary};
  padding: 0 ${({ theme }) => theme.spacing[1]};
  
  ${({ $focused, $hasValue }) => ($focused || $hasValue) && css`
    top: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.primary[500]};
  `}
  
  ${({ $error }) => $error && css`
    color: ${({ theme }) => theme.colors.status.error};
  `}
  
  ${({ $success }) => $success && css`
    color: ${({ theme }) => theme.colors.status.success};
  `}
`;

// Main Input component
const Input = forwardRef(({
  label,
  description,
  error,
  success,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  type = 'text',
  placeholder,
  floating = false,
  required = false,
  className,
  onChange,
  onFocus,
  onBlur,
  value,
  defaultValue,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;
  const hasValue = Boolean(inputValue);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };
  
  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const finalRightIcon = isPassword ? (
    <IconContainer
      $position="right"
      $size={size}
      $clickable
      onClick={togglePasswordVisibility}
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </IconContainer>
  ) : rightIcon ? (
    <IconContainer $position="right" $size={size}>
      {rightIcon}
    </IconContainer>
  ) : null;

  return (
    <InputContainer className={className}>
      {label && !floating && (
        <InputLabel $required={required}>
          {label}
        </InputLabel>
      )}
      
      <InputWrapper>
        {leftIcon && (
          <IconContainer $position="left" $size={size}>
            {leftIcon}
          </IconContainer>
        )}
        
        <StyledInput
          ref={ref}
          type={inputType}
          placeholder={floating ? undefined : placeholder}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          $variant={variant}
          $size={size}
          $error={Boolean(error)}
          $success={Boolean(success)}
          $hasLeftIcon={Boolean(leftIcon)}
          $hasRightIcon={Boolean(finalRightIcon)}
          {...props}
        />
        
        {floating && (
          <FloatingLabel
            $focused={focused}
            $hasValue={hasValue}
            $error={Boolean(error)}
            $success={Boolean(success)}
          >
            {label}
            {required && ' *'}
          </FloatingLabel>
        )}
        
        {finalRightIcon}
      </InputWrapper>
      
      {description && !error && !success && (
        <InputDescription>{description}</InputDescription>
      )}
      
      {error && (
        <InputError
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <AlertCircle size={14} />
          {error}
        </InputError>
      )}
      
      {success && !error && (
        <InputSuccess
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Check size={14} />
          {success}
        </InputSuccess>
      )}
    </InputContainer>
  );
});

Input.displayName = 'Input';

// Textarea component
const StyledTextarea = styled.textarea`
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.easeOut};
  outline: none;
  resize: vertical;
  min-height: 100px;
  
  /* Apply variant styles */
  ${({ $variant }) => inputVariants[$variant] || inputVariants.default}
  
  /* Apply size styles */
  ${({ $size }) => sizeVariants[$size] || sizeVariants.md}
  
  /* Error state */
  ${({ $error }) => $error && css`
    border-color: ${({ theme }) => theme.colors.status.error};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.status.error}20;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.status.error};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.status.error}20;
    }
  `}
  
  /* Success state */
  ${({ $success }) => $success && css`
    border-color: ${({ theme }) => theme.colors.status.success};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.status.success}20;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.status.success};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.status.success}20;
    }
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`;

export const Textarea = forwardRef(({
  label,
  description,
  error,
  success,
  variant = 'default',
  size = 'md',
  required = false,
  className,
  rows = 4,
  ...props
}, ref) => {
  return (
    <InputContainer className={className}>
      {label && (
        <InputLabel $required={required}>
          {label}
        </InputLabel>
      )}
      
      <StyledTextarea
        ref={ref}
        rows={rows}
        $variant={variant}
        $size={size}
        $error={Boolean(error)}
        $success={Boolean(success)}
        {...props}
      />
      
      {description && !error && !success && (
        <InputDescription>{description}</InputDescription>
      )}
      
      {error && (
        <InputError
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <AlertCircle size={14} />
          {error}
        </InputError>
      )}
      
      {success && !error && (
        <InputSuccess
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Check size={14} />
          {success}
        </InputSuccess>
      )}
    </InputContainer>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
