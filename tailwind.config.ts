import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Gaming Theme Extensions
				earth: {
					DEFAULT: 'hsl(var(--earth))',
					foreground: 'hsl(var(--earth-foreground))'
				},
				highlight: {
					DEFAULT: 'hsl(var(--highlight))',
					foreground: 'hsl(var(--highlight-foreground))'
				}
			},
			fontFamily: {
				pixel: ['Press Start 2P', 'cursive'],
				retro: ['Orbitron', 'monospace'],
				code: ['Courier Prime', 'monospace'],
				sans: ['Courier Prime', 'monospace']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				pixel: '0px'
			},
			backdropBlur: {
				gaming: '20px'
			},
			boxShadow: {
				pixel: 'var(--shadow-pixel)',
				card: 'var(--shadow-card)',
				hero: 'var(--shadow-hero)',
				retro: '4px 4px 0px hsl(var(--pixel-shadow)), 6px 6px 0px hsl(var(--pixel-dark))'
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-glow': 'var(--gradient-glow)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'particle-float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-30px) rotate(120deg)' },
					'66%': { transform: 'translateY(15px) rotate(240deg)' }
				},
				'neon-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--glow-primary))' },
					'50%': { boxShadow: '0 0 30px hsl(var(--glow-primary)), 0 0 40px hsl(var(--glow-accent))' }
				},
				'glow-rotate': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'fade-in-scale': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'typewriter': {
					'0%': { width: '0' },
					'100%': { width: '100%' }
				},
				'blink': {
					'0%, 50%': { borderColor: 'transparent' },
					'51%, 100%': { borderColor: 'hsl(var(--secondary))' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pixel-float': 'pixelScroll 10s linear infinite',
				'pixel-pulse': 'pixelPulse 1.5s ease-in-out infinite',
				'pixel-bounce': 'pixelBounce 2s ease-in-out infinite',
				'pixel-grow': 'pixelGrow 0.5s ease-out',
				'slide-up': 'slide-up 0.6s ease-out',
				'fade-in-scale': 'fade-in-scale 0.4s ease-out',
				'typewriter': 'typewriter 3s steps(40) 1s both',
				'blink': 'blink 1s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
