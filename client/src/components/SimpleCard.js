import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  padding: ${props => {
    switch(props.padding) {
      case 'sm': return 'var(--space-16)';
      case 'md': return 'var(--space-20)';
      case 'lg': return 'var(--space-24)';
      case 'xl': return 'var(--space-32)';
      default: return 'var(--space-24)';
    }
  }};
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
`;

const SimpleCard = ({ children, padding = 'md', className, style, ...props }) => {
  return (
    <CardContainer 
      padding={padding} 
      className={className} 
      style={style}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

export default SimpleCard;
