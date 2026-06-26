/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-low": "#0B0D10",
        "on-error-container": "#ffdad6",
        "on-secondary-fixed": "#1c1b1b",
        "tertiary-container": "#e5e2e1",
        "secondary-fixed": "#e5e2e1",
        "secondary": "#c9c6c5",
        "on-tertiary-fixed": "#1c1b1b",
        "secondary-container": "#4a4949",
        "on-tertiary": "#313030",
        "background": "#0B0D10",
        "primary-container": "#e2e2e2",
        "outline-variant": "rgba(255,255,255,0.1)",
        "surface-container-lowest": "#0B0D10",
        "tertiary": "#ffffff",
        "inverse-primary": "#5d5f5f",
        "tertiary-fixed-dim": "#c8c6c5",
        "on-secondary-fixed-variant": "#474646",
        "error": "#ffb4ab",
        "on-primary-container": "#636565",
        "primary-fixed": "#e2e2e2",
        "error-container": "#93000a",
        "surface-container": "#15171A",
        "surface-dim": "#0B0D10",
        "surface-tint": "#c6c6c7",
        "on-secondary-container": "#bab8b7",
        "on-tertiary-fixed-variant": "#474746",
        "on-surface-variant": "#8E9192",
        "on-primary": "#0B0D10",
        "on-error": "#690005",
        "on-background": "#e2e2e2",
        "surface-bright": "#1F2226",
        "primary": "#ffffff",
        "surface-variant": "rgba(255,255,255,0.05)",
        "inverse-surface": "#e2e2e2",
        "on-primary-fixed-variant": "#454747",
        "primary-fixed-dim": "#c6c6c7",
        "surface-container-high": "rgba(255,255,255,0.03)",
        "inverse-on-surface": "#303030",
        "surface": "#0B0D10",
        "on-tertiary-container": "#656464",
        "secondary-fixed-dim": "#c9c6c5",
        "on-secondary": "#313030",
        "on-primary-fixed": "#1a1c1c",
        "tertiary-fixed": "#e5e2e1",
        "surface-container-highest": "rgba(255,255,255,0.08)",
        "on-surface": "#e2e2e2",
        "outline": "rgba(255,255,255,0.2)",
        "border-main": "#1F2328",
        "surface-raised": "#161B22",
      },
      borderRadius: {
        "DEFAULT": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      spacing: {
        "sm": "8px",
        "margin": "24px",
        "xs": "4px",
        "md": "16px",
        "base": "4px",
        "xl": "40px",
        "lg": "24px",
        "gutter": "16px"
      },
      fontFamily: {
        "headline-md": ["Geist", "sans-serif"],
        "body-md": ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"],
        "label-caps": ["JetBrains Mono", "monospace"],
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "code-sm": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "headline-md": ["14px", {"lineHeight": "1.4", "letterSpacing": "0", "fontWeight": "600"}],
        "body-md": ["13px", {"lineHeight": "1.5", "letterSpacing": "0", "fontWeight": "400"}],
        "headline-lg": ["24px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "label-caps": ["11px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "headline-lg-mobile": ["20px", {"lineHeight": "1.2", "fontWeight": "600"}],
        "code-sm": ["12px", {"lineHeight": "1.5", "letterSpacing": "0", "fontWeight": "400"}]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography')
  ],
}
