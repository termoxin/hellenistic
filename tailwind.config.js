/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        indigo: {
          950: '#1a1a3a',
        },
        theme: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          accent: 'var(--accent-primary)',
          'accent-light': 'var(--accent-secondary)',
          card: 'var(--card-bg)',
          input: 'var(--input-bg)',
        }
      },
      backgroundColor: {
        theme: {
          card: 'var(--card-bg)',
          input: 'var(--input-bg)',
        }
      },
      borderColor: {
        theme: {
          card: 'var(--card-border)',
          input: 'var(--input-border)',
        }
      },
      textColor: {
        theme: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          accent: 'var(--accent-primary)',
        }
      },
      keyframes: {
        wave: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-2px) rotate(1deg)' },
          '100%': { transform: 'translateY(0px) rotate(0deg)' },
        }
      },
      animation: {
        wave: 'wave 5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}; 