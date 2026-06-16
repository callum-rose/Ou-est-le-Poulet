import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copy } from '../config/app.config';
import { pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import { isPubCompleted } from '../state/gameReducer';
import { visitedPubIds } from '../state/selectors';
import { haversineM } from '../lib/geo';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PubList } from '../components/ui/PubList';
import { HuntMap } from '../components/Map/HuntMap';
import { AlreadySearchedScreen } from './AlreadySearchedScreen';

export function HuntScreen() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  // Mount the geolocation controller so polling runs while hunting.
  useGeolocation();

  const visited = useMemo(() => visitedPubIds(state), [state]);
  const last = state.geo.last;

  const distances = useMemo(() => {
    if (!last) return undefined;
    const out: Record<string, number> = {};
    for (const p of pubs) out[p.id] = haversineM(last.lat, last.lng, p.lat, p.lng);
    return out;
  }, [last]);

  const [alreadyPubId, setAlreadyPubId] = useState<string | null>(null);
  const [confirmFound, setConfirmFound] = useState(false);

  const selectPub = (pubId: string) => {
    if (isPubCompleted(state, pubId)) {
      setAlreadyPubId(pubId);
      return;
    }
    dispatch({ type: 'ARRIVE_AT_PUB', pubId, at: Date.now() });
  };

  if (alreadyPubId) {
    return (
      <AlreadySearchedScreen
        pubId={alreadyPubId}
        onBack={() => setAlreadyPubId(null)}
      />
    );
  }

  const allSearched = visited.size >= pubs.length;

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>{copy.hunt.heading}</h1>
        <p className="muted">{copy.hunt.body}</p>
      </header>

      <div className="screen__body">
        <div className="map-wrap">
          <HuntMap
            pubs={pubs}
            visitedIds={visited}
            last={last}
            crumbs={state.breadcrumbs}
            onSelectPub={selectPub}
          />
        </div>

        <PubList
          pubs={pubs}
          visitedIds={visited}
          distancesM={distances}
          onSelect={selectPub}
        />

        {allSearched && (
          <p className="notice">{copy.hunt.allSearchedNotice}</p>
        )}
      </div>

      <footer className="screen__footer">
        <BigButton variant="success" onClick={() => setConfirmFound(true)}>
          {copy.hunt.foundCta}
        </BigButton>
        <BigButton variant="primary" onClick={() => navigate('/stats')}>
          {copy.hunt.statsLink}
        </BigButton>
      </footer>

      {confirmFound && (
        <ConfirmDialog
          message={copy.hunt.foundConfirm}
          confirmLabel={copy.hunt.foundConfirmCta}
          cancelLabel={copy.hunt.foundConfirmCancel}
          onConfirm={() => {
            setConfirmFound(false);
            dispatch({ type: 'FOUND_STAG', at: Date.now() });
          }}
          onCancel={() => setConfirmFound(false)}
        />
      )}
    </div>
  );
}
