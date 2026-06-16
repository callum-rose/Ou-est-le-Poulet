import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { copy } from '../config/app.config';
import { challenges, pubs } from '../config/data';
import { Screen } from '../components/ui/Screen';

/** Player onboarding URL = app root (strip any #/cheatsheet hash). */
function appRootUrl(): string {
  if (typeof window === 'undefined') return '';
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/`;
}

export function CheatSheetScreen() {
  const url = appRootUrl();

  return (
    <Screen
      title={copy.cheatsheet.heading}
      footer={
        <div className="link-row">
          <Link to="/">{copy.cheatsheet.backLink}</Link>
        </div>
      }
    >
      <p className="notice notice--warn">{copy.cheatsheet.warning}</p>

      <section className="cheat-section">
        <h2>{copy.cheatsheet.qrHeading}</h2>
        <p className="muted">{copy.cheatsheet.qrBody}</p>
        <div
          style={{
            background: '#fff',
            padding: 16,
            borderRadius: 14,
            width: 'fit-content',
          }}
        >
          <QRCodeSVG value={url} size={180} />
        </div>
        <p className="muted" style={{ fontSize: 13, wordBreak: 'break-all' }}>
          {url}
        </p>
      </section>

      <section className="cheat-section">
        <h2>{copy.cheatsheet.pubsHeading}</h2>
        <ol className="cheat-list">
          {pubs.map((p) => (
            <li key={p.id}>
              {p.name}
              {p.phonetic && <span className="phonetic"> — {p.phonetic}</span>}
            </li>
          ))}
        </ol>
      </section>

      <section className="cheat-section">
        <h2>{copy.cheatsheet.challengesHeading}</h2>
        <ol className="cheat-list">
          {challenges.map((c, i) => (
            <li key={i}>
              <strong>{c.title}</strong> — {c.description}
            </li>
          ))}
        </ol>
      </section>

      <section className="cheat-section">
        <h2>{copy.cheatsheet.rulesHeading}</h2>
        <ul className="cheat-list">
          {copy.rules.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>
    </Screen>
  );
}
