import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframes for subtle floating animation
const float = keyframes`
  0% { transform: translateY(0) translateX(0) scale(1); }
  50% { transform: translateY(-20px) translateX(10px) scale(1.05); }
  100% { transform: translateY(0) translateX(0) scale(1); }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Shape = styled.span`
  position: absolute;
  display: block;
  pointer-events: none;
  opacity: 0.12;
  filter: blur(2px);
  background: var(--color-primary);
  animation: ${float} 8s ease-in-out infinite;

  &.circle {
    border-radius: 50%;
  }
  &.square {
    border-radius: 12px;
  }
  &.diamond {
    transform: rotate(45deg);
    animation: ${rotate} 20s linear infinite;
  }
`;

const FloatingShapesWrapper = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: -1;
`;

const shapesConfig = [
  { class: 'circle', size: 180, top: '-40px', left: '60%' },
  { class: 'square', size: 120, top: '70%', left: '10%' },
  { class: 'diamond', size: 140, top: '20%', left: '85%' },
  { class: 'circle', size: 90, top: '80%', left: '80%' },
  { class: 'square', size: 60, top: '10%', left: '25%' },
];

const FloatingShapes = () => (
  <FloatingShapesWrapper aria-hidden="true">
    {shapesConfig.map((shape, idx) => (
      <Shape
        key={idx}
        className={shape.class}
        style={{
          width: shape.size,
          height: shape.size,
          top: shape.top,
          left: shape.left,
          animationDelay: `${idx * 1.5}s`,
        }}
      />
    ))}
  </FloatingShapesWrapper>
);

export default FloatingShapes;
