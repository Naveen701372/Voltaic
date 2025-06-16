// Custom CSS animations for AI components
export const injectStyles = () => {
    if (typeof document === 'undefined') return;

    const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-30px);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px) scaleX(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scaleX(1);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-slideInRight {
  animation: slideInRight 0.7s ease-out forwards;
}

/* Specific animation for iframe to handle opacity */
iframe.animate-fadeInUp {
  animation: fadeInUp 1s ease-out forwards;
}
`;

    // Check if styles are already injected
    const existingStyle = document.getElementById('voltaic-ai-styles');
    if (existingStyle) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'voltaic-ai-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}; 