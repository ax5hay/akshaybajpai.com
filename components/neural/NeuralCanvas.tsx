'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NeuralSceneHandle, OverlayPhase } from './NeuralScene';
import { NeuralOverlay } from './NeuralOverlay';
import { NeuralFallback } from './NeuralFallback';
import { ClusterPicker } from './ClusterPicker';
import { CoachMark } from './CoachMark';
import {
  NEURAL_CLUSTERS,
  clusterHref,
  clusterIndexFromSlug,
  clusterTitle,
  titleFromPath,
} from '@/lib/neural-clusters';
import styles from './NeuralCanvas.module.css';

function prefetchUrl(url: string) {
  if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

export function NeuralCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<NeuralSceneHandle | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const historyPushedRef = useRef(false);
  const staticModeRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [coverFaded, setCoverFaded] = useState(false);
  const [staticMode, setStaticMode] = useState(false);
  const [hover, setHover] = useState<{ label: string; x: number; y: number } | null>(null);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [overlayTitle, setOverlayTitle] = useState('');
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('closed');
  const [halo, setHalo] = useState({ x: 0, y: 0 });
  const [showPicker, setShowPicker] = useState(false);
  const [showCoach, setShowCoach] = useState(false);

  staticModeRef.current = staticMode;
  const dimActive = hover !== null && overlayPhase === 'closed';

  const pushHistory = useCallback((url: string) => {
    const hash = `#open=${encodeURIComponent(url)}`;
    if (!historyPushedRef.current) {
      history.pushState({ neuralOverlay: url }, '', hash);
      historyPushedRef.current = true;
    } else {
      history.replaceState({ neuralOverlay: url }, '', hash);
    }
  }, []);

  const openOverlay = useCallback((url: string, cluster?: number, instant = false) => {
    setOverlayUrl(url);
    setOverlayTitle(titleFromPath(url));
    prefetchUrl(url);

    if (instant || staticModeRef.current) {
      setOverlayPhase('open');
      sceneRef.current?.setOverlayPhase('open');
    } else if (cluster != null) {
      sceneRef.current?.flyToCluster(cluster);
    }

    pushHistory(url);
  }, [pushHistory]);

  const closeOverlay = useCallback((fromHistory = false) => {
    setOverlayUrl(null);
    setOverlayPhase('closed');
    sceneRef.current?.setOverlayPhase('closed');
    setHover(null);
    historyPushedRef.current = false;

    if (!fromHistory && window.location.hash.startsWith('#open=')) {
      history.back();
    } else if (window.location.hash.startsWith('#open=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    setTimeout(() => {
      document.querySelector<HTMLElement>('[data-section-explorer] button')?.focus();
    }, 80);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    setShowPicker(window.matchMedia('(pointer: coarse)').matches);
    setShowCoach(!localStorage.getItem('neural-coach-seen'));

    import('./NeuralScene').then(({ initNeuralScene }) => {
      if (cancelled) return;
      sceneRef.current = initNeuralScene(mount, {
        onReady: () => {
          if (cancelled) return;
          setReady(true);
          setTimeout(() => setCoverFaded(true), 180);
          window.dispatchEvent(new CustomEvent('neuralready'));

          const clusterSlug = new URLSearchParams(window.location.search).get('cluster');
          if (clusterSlug) {
            const idx = clusterIndexFromSlug(clusterSlug);
            if (idx != null) {
              setTimeout(() => openOverlay(clusterHref(idx), idx, staticModeRef.current), 500);
            }
          }

          const hashMatch = window.location.hash.match(/^#open=(.+)$/);
          if (hashMatch) {
            const url = decodeURIComponent(hashMatch[1]);
            setTimeout(() => openOverlay(url, undefined, true), 400);
          }
        },
        onStaticMode: () => setStaticMode(true),
        onHover: (cluster, label, x, y) => {
          if (cluster === null) setHover(null);
          else {
            setHover({ label, x, y });
            prefetchUrl(clusterHref(cluster));
          }
        },
        onPhaseChange: (phase) => setOverlayPhase(phase),
        onClusterSelect: (_cluster, url) => {
          setOverlayUrl(url);
          setOverlayTitle(titleFromPath(url));
          prefetchUrl(url);
        },
      });
    });

    const onMove = (e: MouseEvent) => {
      const wrap = mountRef.current?.parentElement;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      setHalo({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const onSelectCluster = (e: Event) => {
      const idx = (e as CustomEvent<{ cluster: number }>).detail?.cluster;
      if (idx == null) return;
      openOverlay(clusterHref(idx), idx, staticModeRef.current);
    };

    const onNavigate = (e: Event) => {
      const url = (e as CustomEvent<{ url: string }>).detail?.url;
      if (url) openOverlay(url, undefined, true);
    };

    const onPopState = () => {
      const hashMatch = window.location.hash.match(/^#open=(.+)$/);
      if (hashMatch) {
        openOverlay(decodeURIComponent(hashMatch[1]), undefined, true);
      } else if (overlayPhase !== 'closed') {
        setOverlayUrl(null);
        setOverlayPhase('closed');
        sceneRef.current?.setOverlayPhase('closed');
        setHover(null);
        historyPushedRef.current = false;
      }
    };

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'neural-close') closeOverlay();
      if (e.data?.type === 'neural-navigate' && typeof e.data.url === 'string') {
        setOverlayUrl(e.data.url);
        setOverlayTitle(titleFromPath(e.data.url));
        pushHistory(e.data.url);
      }
      if (e.data?.type === 'neural-open-full' && typeof e.data.url === 'string') {
        window.location.href = e.data.url;
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('neural-select-cluster', onSelectCluster);
    window.addEventListener('neural-navigate', onNavigate);
    window.addEventListener('popstate', onPopState);
    window.addEventListener('message', onMessage);

    return () => {
      cancelled = true;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('neural-select-cluster', onSelectCluster);
      window.removeEventListener('neural-navigate', onNavigate);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('message', onMessage);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [closeOverlay, openOverlay, pushHistory]);

  useEffect(() => {
    if (overlayPhase === 'open') closeBtnRef.current?.focus();
  }, [overlayPhase]);

  return (
    <>
      <div className={styles.wrap}>
        {!staticMode && (
          <>
            <div className={`${styles.cover} ${coverFaded ? styles.coverFaded : ''}`} aria-hidden="true" />
            <div className={`${styles.dim} ${dimActive ? styles.dimActive : ''}`} aria-hidden="true" />
            <div
              className={`${styles.halo} ${hover ? styles.haloNear : ''}`}
              style={{ left: halo.x, top: halo.y }}
              aria-hidden="true"
            />
            <div ref={mountRef} className={`${styles.mount} ${ready ? styles.mountReady : ''}`} role="presentation" />
            {hover && overlayPhase === 'closed' && (
              <div className={styles.label} style={{ left: hover.x, top: hover.y }} aria-hidden="true">
                {hover.label}
              </div>
            )}
          </>
        )}
        {staticMode && (
          <NeuralFallback onSelect={(index, url) => openOverlay(url, index, true)} />
        )}
      </div>

      {showCoach && overlayPhase === 'closed' && ready && (
        <CoachMark onDismiss={() => {
          localStorage.setItem('neural-coach-seen', '1');
          setShowCoach(false);
        }} />
      )}

      {showPicker && overlayPhase === 'closed' && !staticMode && (
        <ClusterPicker onSelect={(index, url) => openOverlay(url, index, false)} />
      )}

      <NeuralOverlay
        url={overlayUrl}
        title={overlayTitle}
        phase={overlayPhase}
        onClose={() => closeOverlay()}
        closeButtonRef={closeBtnRef}
      />
    </>
  );
}
