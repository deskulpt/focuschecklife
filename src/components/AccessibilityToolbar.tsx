import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const AccessibilityToolbar: React.FC = () => {
  const { theme, setTheme, fontSize, setFontSize, reducedMotion, setReducedMotion } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50" role="region" aria-label="Accessibility controls">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform focus-ring"
        aria-label="Toggle accessibility menu"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="4.5" r="2.5"/>
          <path d="m10.2 6.3-3.9 3.3"/>
          <path d="m14 6.3 4 3.3"/>
          <path d="M12 12v6"/>
          <path d="m8 18 2-4"/>
          <path d="m14 14 2 4"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 glass-card p-5 space-y-4" role="dialog" aria-label="Accessibility settings">
          <h3 className="text-sm font-semibold text-foreground">Accessibility</h3>

          {/* Theme */}
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground mb-2">Theme</legend>
            <div className="flex gap-2">
              {(['light', 'dark', 'high-contrast'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors focus-ring ${
                    theme === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                  aria-pressed={theme === t}
                >
                  {t === 'high-contrast' ? 'High Contrast' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Font Size */}
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground mb-2">Font Size: {fontSize}%</legend>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                className="w-8 h-8 rounded border border-border flex items-center justify-center text-foreground hover:bg-muted focus-ring"
                aria-label="Decrease font size"
              >
                A-
              </button>
              <input
                type="range"
                min="80"
                max="150"
                step="10"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1"
                aria-label="Font size slider"
              />
              <button
                onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                className="w-8 h-8 rounded border border-border flex items-center justify-center text-foreground hover:bg-muted focus-ring"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>
          </fieldset>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <label htmlFor="reduced-motion" className="text-xs font-medium text-muted-foreground">
              Reduce Motion
            </label>
            <button
              id="reduced-motion"
              role="switch"
              aria-checked={reducedMotion}
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-10 h-5 rounded-full relative transition-colors focus-ring ${
                reducedMotion ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  reducedMotion ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
