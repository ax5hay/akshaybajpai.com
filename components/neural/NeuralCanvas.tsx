'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NeuralSceneHandle, OverlayPhase } from './NeuralScene';
import { NeuralOverlay } from './NeuralOverlay';
import styles from './NeuralCanvas.module.css';

export function NeuralCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<NeuralSceneHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [coverFaded, setCoverFaded] = useState(false);
  const [hover, setHover] = useState<{ label: string; x: number; y: number } | null>(null);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('closed');
  const [halo, setHalo] = useState({ x: 0, y: 0 });
  const dimActive = hover !== null && overlayPhase === 'closed';

  const closeOverlay = useCallback(() => {
    setOverlayUrl(null);
    setOverlayPhase('closed');
    sceneRef.current?.setOverlayPhase('closed');
    setHover(null);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;

    import('./NeuralScene').then(({ initNeuralScene }) => {
      if (cancelled) return;
      sceneRef.current = initNeuralScene(mount, {
        onReady: () => {
          if (cancelled) return;
          setReady(true);
          setTimeout(() => setCoverFaded(true), 180);
          window.dispatchEvent(new CustomEvent('neuralready'));
        },
        onHover: (cluster, label, x, y) => {
          if (cluster === null) setHover(null);
          else setHover({ label, x, y });
        },
        onPhaseChange: (phase) => setOverlayPhase(phase),
        onClusterSelect: (_cluster, url) => {
          setOverlayUrl(url);
        },
      });
    });

    const onMove = (e: MouseEvent) => {
      const wrap = mountRef.current?.parentElement;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      setHalo({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener('mousemove', onMove);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <>
      <div className={styles.wrap} aria-hidden="true">
        <div className={`${styles.cover} ${coverFaded ? styles.coverFaded : ''}`} />
        <div className={`${styles.dim} ${dimActive ? styles.dimActive : ''}`} />
        <div
          className={`${styles.halo} ${hover ? styles.haloNear : ''}`}
          style={{ left: halo.x, top: halo.y }}
        />
        <div ref={mountRef} className={`${styles.mount} ${ready ? styles.mountReady : ''}`} />
        {hover && overlayPhase === 'closed' && (
          <div className={styles.label} style={{ left: hover.x, top: hover.y }}>
            {hover.label}
          </div>
        )}
      </div>
      <NeuralOverlay url={overlayUrl} phase={overlayPhase} onClose={closeOverlay} />
    </>
  );
}
