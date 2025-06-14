import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				// Glass morphism color palette
				glass: {
					50: "rgba(255, 255, 255, 0.1)",
					100: "rgba(255, 255, 255, 0.15)",
					200: "rgba(255, 255, 255, 0.2)",
					300: "rgba(255, 255, 255, 0.3)",
					400: "rgba(255, 255, 255, 0.4)",
					500: "rgba(255, 255, 255, 0.5)",
				},
				dark: {
					50: "rgba(0, 0, 0, 0.1)",
					100: "rgba(0, 0, 0, 0.15)",
					200: "rgba(0, 0, 0, 0.2)",
					300: "rgba(0, 0, 0, 0.3)",
					400: "rgba(0, 0, 0, 0.4)",
					500: "rgba(0, 0, 0, 0.5)",
				},
				primary: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8",
					500: "#0ea5e9",
					600: "#0284c7",
					700: "#0369a1",
					800: "#075985",
					900: "#0c4a6e",
					950: "#082f49",
				},
			},
			backdropBlur: {
				xs: "2px",
				sm: "4px",
				md: "8px",
				lg: "12px",
				xl: "16px",
				"2xl": "24px",
				"3xl": "32px",
			},
			animation: {
				"fade-in": "fadeIn 0.6s ease-out",
				"slide-up": "slideUp 0.6s ease-out",
				"slide-down": "slideDown 0.3s ease-out",
				"scale-in": "scaleIn 0.2s ease-out",
				"glass-shimmer": "glassShimmer 3s ease-in-out infinite",
			},
			animationDelay: {
				'200': '200ms',
				'400': '400ms',
				'600': '600ms',
				'800': '800ms',
				'1000': '1000ms',
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { transform: "translateY(10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				slideDown: {
					"0%": { transform: "translateY(-10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				scaleIn: {
					"0%": { transform: "scale(0.95)", opacity: "0" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
				glassShimmer: {
					"0%, 100%": { backgroundPosition: "200% center" },
					"50%": { backgroundPosition: "-200% center" },
				},
			},
			borderRadius: {
				"4xl": "2rem",
				"5xl": "2.5rem",
			},
			fontFamily: {
				sans: ["var(--font-inter)", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "monospace"],
			},
		},
	},
	plugins: [
		// Custom glass morphism utilities
		function ({ addUtilities }: { addUtilities: any }) {
			const newUtilities = {
				".glass": {
					background: "rgba(255, 255, 255, 0.1)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
					borderRadius: "16px",
				},
				".glass-dark": {
					background: "rgba(0, 0, 0, 0.1)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					borderRadius: "16px",
				},
				".glass-card": {
					background: "rgba(255, 255, 255, 0.08)",
					backdropFilter: "blur(12px)",
					border: "1px solid rgba(255, 255, 255, 0.15)",
					borderRadius: "20px",
					boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
				},
				".glass-button": {
					background: "rgba(255, 255, 255, 0.1)",
					backdropFilter: "blur(8px)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
					borderRadius: "12px",
					transition: "all 0.2s ease",
				},
				".glass-button:hover": {
					background: "rgba(255, 255, 255, 0.15)",
					transform: "translateY(-1px)",
					boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
				},
				".glass-input": {
					background: "rgba(255, 255, 255, 0.05)",
					backdropFilter: "blur(6px)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					borderRadius: "8px",
				},
				".glass-input:focus": {
					background: "rgba(255, 255, 255, 0.08)",
					border: "1px solid rgba(59, 130, 246, 0.3)",
					outline: "none",
				},
			};
			addUtilities(newUtilities);
		},
	],
};
export default config;
