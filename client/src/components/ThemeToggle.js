import React from 'react';
import styled from 'styled-components';
import { Sun, Moon } from 'lucide-react';
import { useAppSelector, useAppDispatch, uiActions } from '../store';

// Button style
const ToggleButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--color-surface);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-base);
  cursor: pointer;
  transition: all var(--transition-base);
  z-index: 1100;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background: var(--color-primary);
    color: white;
  }

  &:active {
    transform: translateY(0);
  }
`;

const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.ui.theme);
  const isLight = theme === 'light';

  const toggleTheme = () => {
    dispatch(uiActions.toggleTheme());
  };

  return (
    <ToggleButton 
      onClick={toggleTheme} 
      aria-label="Alternar tema" 
      title={`Alternar para tema ${isLight ? 'escuro' : 'claro'}`}
    >
      {isLight ? <Moon size={20} /> : <Sun size={20} />}
    </ToggleButton>
  );
};

export default ThemeToggle;
