/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#18221E',
          container: '#18221E',
          dark: '#030A07',
          light: '#26332E',
        },
        secondary: {
          DEFAULT: '#3A6B5C',
          hover: '#2E5649',
          container: '#B9EEDA',
          light: '#E6EFEA',
          fixed: '#366758',
        },
        tertiary: {
          DEFAULT: '#8C6D46',
          container: '#F5EFE6',
          dim: '#E6C093',
          dark: '#755935',
        },
        surface: {
          DEFAULT: '#F8FAF9',
          canvas: '#F8FAF9',
          lowest: '#FFFFFF',
          low: '#F1F5F3',
          container: '#E2F1E9',
          high: '#DCECE4',
          highest: '#D7E6DE',
        },
        neutral: {
          DEFAULT: '#52605A',
          slate: '#52605A',
          muted: '#7E8E87',
        },
        outline: {
          DEFAULT: '#E2E8E5',
          subtle: '#E2E8E5',
          variant: '#C3C8C4',
        },
        // Backwards compatibility mappings for existing component tokens
        background: {
          primary: '#F8FAF9',
          surface: '#FFFFFF',
          tint: '#F1F5F3',
        },
        brand: {
          DEFAULT: '#3A6B5C',
          hover: '#2E5649',
          light: '#E6EFEA',
          dark: '#2C5246',
          soft: '#5B8A7B',
        },
        sand: {
          DEFAULT: '#F5EFE6',
          text: '#8C6D46',
          border: '#E8DCCF',
          dark: '#755935',
        },
        charcoal: {
          primary: '#18221E',
          secondary: '#52605A',
          muted: '#7E8E87',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        headline: ['Epilogue', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '600' }],
        'headline-lg': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '500' }],
        'headline-lg-mobile': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '500' }],
        'headline-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '500' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
        'body-lg': ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1.45', letterSpacing: '0.01em', fontWeight: '400' }],
        'label-caps': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '600' }],
        'label-code': ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      borderRadius: {
        'none': '0px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(24, 34, 30, 0.05)',
        'hairline': '0 0 0 1px #E2E8E5',
      }
    },
  },
  plugins: [],
}
