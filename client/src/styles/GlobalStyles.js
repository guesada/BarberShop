import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Figma Design Colors */
    --color-primary-dark: #2D2720;
    --color-secondary-dark: #3A322A;
    --color-tertiary-dark: #484E34;
    --color-primary-orange: #FF6B35;
    --color-secondary-orange: #FF5722;
    --color-accent-orange: #FF8A65;
    
    /* Semantic Colors */
    --color-background: var(--color-primary-dark);
    --color-surface: var(--color-secondary-dark);
    --color-text: #ffffff;
    --color-text-secondary: #cccccc;
    --color-primary: var(--color-primary-orange);
    --color-primary-hover: var(--color-secondary-orange);
    --color-secondary: var(--color-tertiary-dark);
    
    /* Spacing */
    --space-4: 4px;
    --space-8: 8px;
    --space-12: 12px;
    --space-16: 16px;
    --space-20: 20px;
    --space-24: 24px;
    --space-32: 32px;
    
    /* Border Radius */
    --radius-sm: 8px;
    --radius-base: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    
    /* Shadows */
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-base: 0 4px 12px rgba(0, 0, 0, 0.15);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
    --shadow-primary: 0 8px 32px rgba(255, 107, 53, 0.3);
    
    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-base: 0.2s ease;
    --transition-slow: 0.3s ease;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: var(--color-background);
    color: var(--color-text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    color: var(--color-text);
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.125rem; }
  h5 { font-size: 1rem; }
  h6 { font-size: 0.875rem; }

  p {
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  /* Button base styles */
  button {
    font-family: inherit;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all var(--transition-base);
    border-radius: var(--radius-base);
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  /* Input base styles */
  input, textarea, select {
    font-family: inherit;
    border: none;
    outline: none;
    background: var(--color-surface);
    color: var(--color-text);
    border-radius: var(--radius-base);
    transition: all var(--transition-base);
    
    &::placeholder {
      color: var(--color-text-secondary);
    }
    
    &:focus {
      box-shadow: 0 0 0 2px var(--color-primary);
    }
  }

  /* Link base styles */
  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-base);
    
    &:hover {
      color: var(--color-primary-hover);
    }
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-background);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary-hover);
  }

  /* === Design Upgrade 2025 === */
  /* Light Theme Variables (auto toggled via .theme-light no <body>) */
  .theme-light {
    --color-background: #FAFAFA;
    --color-surface: #FFFFFF;
    --color-text: #222222;
    --color-text-secondary: #555555;
    --color-primary: #FF6B35;
    --color-primary-hover: #FF5722;
    --color-secondary: #F5F5F5;
  }

  /* Accessible focus outline */
  :focus-visible {
    outline: 3px dashed var(--color-primary);
    outline-offset: 2px;
  }

  /* Component Primitives */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-24);
    font-weight: 600;
    border-radius: var(--radius-base);
    background: var(--color-primary);
    color: #fff;
    transition: background var(--transition-base), transform var(--transition-fast);
  }
  .btn:hover {
    background: var(--color-primary-hover);
    transform: translateY(-2px);
  }
  .btn:active {
    transform: translateY(0);
    background: var(--color-primary-hover);
  }

  .card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-base);
    padding: var(--space-24);
    transition: box-shadow var(--transition-base), transform var(--transition-fast);
  }
  .card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-16);
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Responsive breakpoints */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
    
    .container {
      padding: 0 var(--space-12);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default GlobalStyles;
