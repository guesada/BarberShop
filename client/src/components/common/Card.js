import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

// Card variants
const cardVariants = {
  default: css`
    background: ${({ theme }) => theme.components.card.background};
    border: 1px solid ${({ theme }) => theme.components.card.border};
    box-shadow: ${({ theme }) => theme.components.card.shadow};
  `,
  
  elevated: css`
    background: ${({ theme }) => theme.components.card.background};
    border: 1px solid ${({ theme }) => theme.components.card.border};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  `,
  
  outlined: css`
    background: ${({ theme }) => theme.components.card.background};
    border: 2px solid ${({ theme }) => theme.colors.border.primary};
    box-shadow: none;
  `,
  
  filled: css`
    background: ${({ theme }) => theme.colors.background.secondary};
    border: none;
    box-shadow: none;
  `,
  
  glass: css`
    background: ${({ theme }) => theme.colors.background.glass};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  `,
};

// Padding variants
const paddingVariants = {
  none: css`
    padding: 0;
  `,
  sm: css`
    padding: ${({ theme }) => theme.spacing[3]};
  `,
  md: css`
    padding: ${({ theme }) => theme.spacing[4]};
  `,
  lg: css`
    padding: ${({ theme }) => theme.spacing[6]};
  `,
  xl: css`
    padding: ${({ theme }) => theme.spacing[8]};
  `,
};

// Styled card component
const StyledCard = styled(motion.div)`
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.professional};
  overflow: hidden;
  position: relative;
  
  /* Apply variant styles */
  ${({ $variant }) => cardVariants[$variant] || cardVariants.default}
  
  /* Apply padding styles */
  ${({ $padding }) => paddingVariants[$padding] || paddingVariants.md}
  
  /* Hoverable */
  ${({ $hoverable }) => $hoverable && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.xl};
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
  
  /* Clickable */
  ${({ $clickable }) => $clickable && css`
    cursor: pointer;
    user-select: none;
    
    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
    
    &:active {
      transform: scale(0.98);
    }
  `}
  
  /* Full height */
  ${({ $fullHeight }) => $fullHeight && css`
    height: 100%;
  `}
  
  /* Loading state */
  ${({ $loading }) => $loading && css`
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }
  `}
`;

// Card header component
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  
  ${({ $noBorder }) => !$noBorder && css`
    padding-bottom: ${({ theme }) => theme.spacing[4]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  `}
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const CardSubtitle = styled.p`
  margin: ${({ theme }) => theme.spacing[1]} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

// Card body component
const CardBody = styled.div`
  flex: 1;
  
  ${({ $scrollable }) => $scrollable && css`
    overflow-y: auto;
    max-height: ${({ $maxHeight }) => $maxHeight || '300px'};
    
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
  `}
`;

// Card footer component
const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing[4]};
  
  ${({ $noBorder }) => !$noBorder && css`
    padding-top: ${({ theme }) => theme.spacing[4]};
    border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  `}
  
  ${({ $justify }) => css`
    justify-content: ${$justify};
  `}
`;

// Card image component
const CardImage = styled.div`
  width: 100%;
  height: ${({ $height }) => $height || '200px'};
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  
  ${({ $objectFit }) => css`
    background-size: ${$objectFit || 'cover'};
  `}
  
  ${({ $overlay }) => $overlay && css`
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${$overlay};
      border-radius: ${({ theme }) => theme.borderRadius.lg};
    }
  `}
`;

// Card badge component
const CardBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  background: ${({ $color, theme }) => $color || theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  z-index: 1;
`;

// Main Card component
const Card = React.forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  fullHeight = false,
  loading = false,
  onClick,
  className,
  ...props
}, ref) => {
  const handleClick = (e) => {
    if (clickable || hoverable) {
      onClick?.(e);
    }
  };

  return (
    <StyledCard
      ref={ref}
      onClick={handleClick}
      className={className}
      $variant={variant}
      $padding={padding}
      $hoverable={hoverable}
      $clickable={clickable}
      $fullHeight={fullHeight}
      $loading={loading}
      layout
      {...props}
    >
      {children}
    </StyledCard>
  );
});

Card.displayName = 'Card';

// Compound components
Card.Header = ({ children, title, subtitle, actions, noBorder = false, ...props }) => (
  <CardHeader $noBorder={noBorder} {...props}>
    <div>
      {title && <CardTitle>{title}</CardTitle>}
      {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
      {!title && !subtitle && children}
    </div>
    {actions && <CardActions>{actions}</CardActions>}
  </CardHeader>
);

Card.Body = ({ children, scrollable = false, maxHeight, ...props }) => (
  <CardBody $scrollable={scrollable} $maxHeight={maxHeight} {...props}>
    {children}
  </CardBody>
);

Card.Footer = ({ children, noBorder = false, justify = 'space-between', ...props }) => (
  <CardFooter $noBorder={noBorder} $justify={justify} {...props}>
    {children}
  </CardFooter>
);

Card.Image = ({ src, height, objectFit, overlay, alt, ...props }) => (
  <CardImage 
    $src={src} 
    $height={height} 
    $objectFit={objectFit} 
    $overlay={overlay}
    role="img"
    aria-label={alt}
    {...props} 
  />
);

Card.Badge = ({ children, color, ...props }) => (
  <CardBadge $color={color} {...props}>
    {children}
  </CardBadge>
);

// Specialized card components
export const StatsCard = ({ title, value, change, icon, trend, ...props }) => (
  <Card hoverable {...props}>
    <Card.Header noBorder>
      <div>
        <CardSubtitle>{title}</CardSubtitle>
        <CardTitle style={{ fontSize: '2rem', margin: '8px 0' }}>
          {value}
        </CardTitle>
        {change && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            color: trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#9E9E9E'
          }}>
            <span style={{ fontSize: '0.875rem' }}>{change}</span>
          </div>
        )}
      </div>
      {icon && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '12px', 
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          color: '#FF6B35'
        }}>
          {icon}
        </div>
      )}
    </Card.Header>
  </Card>
);

export const ProfileCard = ({ avatar, name, role, status, actions, ...props }) => (
  <Card {...props}>
    <Card.Body>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          backgroundImage: `url(${avatar})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div style={{ flex: 1 }}>
          <CardTitle style={{ margin: '0 0 4px 0' }}>{name}</CardTitle>
          <CardSubtitle style={{ margin: 0 }}>{role}</CardSubtitle>
          {status && (
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              padding: '4px 8px',
              borderRadius: '12px',
              backgroundColor: status === 'online' ? '#E8F5E8' : '#F5F5F5',
              color: status === 'online' ? '#4CAF50' : '#9E9E9E',
              fontSize: '0.75rem'
            }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: 'currentColor' 
              }} />
              {status}
            </div>
          )}
        </div>
        {actions && <CardActions>{actions}</CardActions>}
      </div>
    </Card.Body>
  </Card>
);

export default Card;
