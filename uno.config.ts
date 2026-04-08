import {
  defineConfig,
  presetWind3,
  presetIcons,
  presetAttributify,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  extendTheme: (theme) => {
    // Extend rather than override so spacing/etc remain from presetWind3
    theme.colors = {
      ...theme.colors,
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
        hover: 'hsl(var(--primary-hover))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      success: {
        DEFAULT: 'hsl(var(--success))',
        foreground: 'hsl(var(--success-foreground))',
      },
      warning: {
        DEFAULT: 'hsl(var(--warning))',
        foreground: 'hsl(var(--warning-foreground))',
      },
      medical: {
        blue: 'hsl(var(--medical-blue))',
        teal: 'hsl(var(--medical-teal))',
        light: 'hsl(var(--medical-light))',
      },
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar-background))',
        foreground: 'hsl(var(--sidebar-foreground))',
        primary: 'hsl(var(--sidebar-primary))',
        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        accent: 'hsl(var(--sidebar-accent))',
        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        border: 'hsl(var(--sidebar-border))',
        ring: 'hsl(var(--sidebar-ring))',
      },
    }
    theme.borderRadius = {
      ...theme.borderRadius,
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    }
    theme.animation = {
      ...theme.animation,
      keyframes: {
        ...theme.animation?.keyframes,
        'accordion-down': '{from{height:0}to{height:var(--radix-accordion-content-height)}}',
        'accordion-up': '{from{height:var(--radix-accordion-content-height)}to{height:0}}',
        'fade-in-up': '{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
        'scale-in': '{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}',
        'slide-in-right': '{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}',
        'pulse-soft': '{0%,100%{opacity:1}50%{opacity:0.7}}',
      },
      durations: {
        ...theme.animation?.durations,
        'accordion-down': '0.2s',
        'accordion-up': '0.2s',
        'fade-in-up': '0.5s',
        'scale-in': '0.3s',
        'slide-in-right': '0.4s',
        'pulse-soft': '2s',
      },
      timingFns: {
        ...theme.animation?.timingFns,
        'accordion-down': 'ease-out',
        'accordion-up': 'ease-out',
        'fade-in-up': 'ease-out',
        'scale-in': 'ease-out',
        'slide-in-right': 'ease-out',
        'pulse-soft': 'ease-in-out',
      },
      counts: {
        ...theme.animation?.counts,
        'pulse-soft': 'infinite',
      },
    }
  },
  shortcuts: {
    'glass': 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10',
    'glass-card': 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-xl border border-white/30 dark:border-white/10 shadow-lg',
    'btn-gradient': 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--medical-teal))] text-white font-medium rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
    'card-hover': 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
    'text-gradient': 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--medical-teal))] bg-clip-text text-transparent',
    'focus-ring': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
  safelist: [
    'animate-accordion-down',
    'animate-accordion-up',
    'animate-fade-in-up',
    'animate-scale-in',
    'animate-slide-in-right',
    'animate-pulse-soft',
  ],
  content: {
    filesystem: [
      'src/**/*.{ts,tsx}',
    ],
  },
})
