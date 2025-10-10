import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        support: 'rgb(var(--color-support) / <alpha-value>)',
        'neutral-base': 'rgb(var(--color-neutral-base) / <alpha-value>)',
        'neutral-light-gray': 'rgb(var(--color-neutral-light-gray) / <alpha-value>)',
        'neutral-dark-gray': 'rgb(var(--color-neutral-dark-gray) / <alpha-value>)',
        'neutral-darker-gray': 'rgb(var(--color-neutral-darker-gray) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}
export default config
