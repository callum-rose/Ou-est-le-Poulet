import type { ReactNode } from 'react';

interface ScreenProps {
  title?: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Standard mobile-first screen scaffold: header, scrollable body, footer. */
export function Screen({ title, subtitle, children, footer, className }: ScreenProps) {
  return (
    <div className={['screen', className].filter(Boolean).join(' ')}>
      {(title || subtitle) && (
        <header className="screen__header">
          {title && <h1>{title}</h1>}
          {subtitle && <p className="muted">{subtitle}</p>}
        </header>
      )}
      <div className="screen__body">{children}</div>
      {footer && <footer className="screen__footer">{footer}</footer>}
    </div>
  );
}
