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

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes agentReveal {
  from {
    opacity: 0;
    transform: translateX(40px) scale(0.85);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
    max-height: 200px;
  }
}

@keyframes gradientPulse {
  0% {
    background-position: 0% 50%;
    transform: scale(1);
  }
  25% {
    background-position: 100% 50%;
    transform: scale(1.05);
  }
  50% {
    background-position: 100% 50%;
    transform: scale(1.1);
  }
  75% {
    background-position: 0% 50%;
    transform: scale(1.05);
  }
  100% {
    background-position: 0% 50%;
    transform: scale(1);
  }
}

@keyframes logoFadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes suggestionSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes suggestionFadeDown {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-fadeOutUp {
  animation: fadeOutUp 0.5s ease-in forwards;
}

.animate-slideInRight {
  animation: slideInRight 0.7s ease-out forwards;
}

.animate-slideInFromRight {
  animation: slideInFromRight 0.7s ease-out forwards;
}

.animate-messageSlideIn {
  animation: messageSlideIn 0.4s ease-out forwards;
}

.animate-agentReveal {
  animation: agentReveal 0.6s ease-out forwards;
}

.animate-gradient-pulse {
  animation: gradientPulse 3s ease-in-out infinite;
}

.animate-logo-fade-in-up {
  animation: logoFadeInUp 1s ease-out forwards;
}

.animate-suggestion-slide-up {
  animation: suggestionSlideUp 0.6s ease-out forwards;
}

.animate-suggestion-fade-down {
  animation: suggestionFadeDown 0.4s ease-in forwards;
}

/* Specific animation for iframe to handle opacity */
iframe.animate-fadeInUp {
  animation: fadeInUp 1s ease-out forwards;
}

/* Ensure animations work with transform utilities */
.transform {
  transform-origin: center;
}

/* Page load animations */
@media (prefers-reduced-motion: no-preference) {
  .page-load-fade-up {
    animation: logoFadeInUp 0.8s ease-out forwards;
  }
}
`;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}; 