export interface CSSTheme {
  name: string;
  primaryColors: string[];
  secondaryColors: string[];
  backgroundGradient: string;
  glassOpacity: number;
  borderRadius: string;
  animations: string[];
}

export const CSS_THEMES: Record<string, CSSTheme> = {
  'modern-purple': {
    name: 'Modern Purple',
    primaryColors: ['#8b5cf6', '#3b82f6', '#6366f1'], // purple-500, blue-600, indigo-500
    secondaryColors: ['#a78bfa', '#60a5fa', '#818cf8'], // purple-400, blue-400, indigo-400
    backgroundGradient: 'from-slate-900 via-purple-900 to-slate-900',
    glassOpacity: 0.1,
    borderRadius: '12px',
    animations: ['blob', 'pulse', 'fadeIn']
  },
  'ocean-blue': {
    name: 'Ocean Blue',
    primaryColors: ['#2563eb', '#06b6d4', '#0d9488'], // blue-600, cyan-500, teal-600
    secondaryColors: ['#60a5fa', '#67e8f9', '#4ade80'], // blue-400, cyan-400, teal-400
    backgroundGradient: 'from-slate-900 via-blue-900 to-cyan-900',
    glassOpacity: 0.12,
    borderRadius: '16px',
    animations: ['wave', 'float', 'slideIn']
  },
  'sunset-orange': {
    name: 'Sunset Orange',
    primaryColors: ['#f97316', '#ef4444', '#ec4899'], // orange-500, red-500, pink-500
    secondaryColors: ['#fb923c', '#f87171', '#f472b6'], // orange-400, red-400, pink-400
    backgroundGradient: 'from-slate-900 via-orange-900 to-red-900',
    glassOpacity: 0.08,
    borderRadius: '14px',
    animations: ['glow', 'bounce', 'scaleIn']
  },
  'forest-green': {
    name: 'Forest Green',
    primaryColors: ['#16a34a', '#10b981', '#0d9488'], // green-600, emerald-500, teal-600
    secondaryColors: ['#4ade80', '#34d399', '#4ade80'], // green-400, emerald-400, teal-400
    backgroundGradient: 'from-slate-900 via-green-900 to-emerald-900',
    glassOpacity: 0.1,
    borderRadius: '10px',
    animations: ['grow', 'sway', 'fadeInUp']
  }
};

export class CSSGenerator {
  static selectThemeBasedOnInput(userInput: string, projectTitle: string): CSSTheme {
    const input = (userInput + ' ' + projectTitle).toLowerCase();

    // Keyword-based theme selection
    if (input.includes('ocean') || input.includes('water') || input.includes('blue') || input.includes('sea')) {
      return CSS_THEMES['ocean-blue'];
    }
    if (input.includes('sunset') || input.includes('warm') || input.includes('orange') || input.includes('fire')) {
      return CSS_THEMES['sunset-orange'];
    }
    if (input.includes('nature') || input.includes('green') || input.includes('forest') || input.includes('eco')) {
      return CSS_THEMES['forest-green'];
    }

    // Default to modern purple
    return CSS_THEMES['modern-purple'];
  }

  static generateCustomCSS(theme: CSSTheme, projectTitle: string): string {
    const primary = theme.primaryColors[0];
    const secondary = theme.secondaryColors[0];

    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .glass-primary {
    backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(255, 255, 255, ${theme.glassOpacity});
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: ${theme.borderRadius};
  }
  
  .glass-dark {
    backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(17, 25, 40, ${theme.glassOpacity});
    border: 1px solid rgba(255, 255, 255, 0.125);
    border-radius: ${theme.borderRadius};
  }

  .glass-button {
    backdrop-filter: blur(10px);
    background: linear-gradient(135deg, rgba(255, 255, 255, ${theme.glassOpacity}), rgba(255, 255, 255, ${theme.glassOpacity * 0.5}));
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: calc(${theme.borderRadius} * 0.7);
    transition: all 0.3s ease;
  }

  .glass-button:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, ${theme.glassOpacity * 2}), rgba(255, 255, 255, ${theme.glassOpacity}));
    transform: translateY(-1px);
  }

  .gradient-primary {
    background: linear-gradient(135deg, ${primary}, ${secondary});
  }

  .gradient-bg {
    background: linear-gradient(to bottom right, #0f172a, #581c87, #0f172a);
  }

  /* Custom animations for ${projectTitle} */
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  @keyframes wave {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
    50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.2); }
  }

  @keyframes grow {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .animate-blob {
    animation: blob 7s infinite;
  }

  .animate-wave {
    animation: wave 3s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 4s ease-in-out infinite;
  }

  .animate-grow {
    animation: grow 6s ease-in-out infinite;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-4000 {
    animation-delay: 4s;
  }
}

/* Project-specific styles for ${projectTitle} */
.hero-gradient {
  background: linear-gradient(to bottom right, #0f172a, #581c87, #0f172a);
}

.text-gradient {
  background: linear-gradient(135deg, ${primary}, ${secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced mobile responsiveness */
@media (max-width: 640px) {
  .glass-card {
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
  }

  .glass-button {
    min-height: 44px;
    touch-action: manipulation;
  }
}`;
  }

  static generateTailwindConfig(theme: CSSTheme): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          500: '${theme.primaryColors[0]}',
          400: '${theme.secondaryColors[0]}',
          600: '${theme.primaryColors[1]}',
        },
        secondary: {
          500: '${theme.secondaryColors[0]}',
          400: '${theme.secondaryColors[1]}',
          600: '${theme.primaryColors[2]}',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'blob': 'blob 7s infinite',
        'wave': 'wave 3s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite',
        'grow': 'grow 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '25%': {
            'background-size': '400% 400%',
            'background-position': 'left top'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right top'
          },
          '75%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          }
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(255, 255, 255, 0.1)' },
          '50%': { 'box-shadow': '0 0 30px rgba(255, 255, 255, 0.2)' },
        },
        grow: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}`;
  }
} 