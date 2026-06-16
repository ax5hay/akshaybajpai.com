'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function useExperienceMotion(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;

    document.body.classList.add('home-world');

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });

      lenis.on('scroll', ScrollTrigger.update);

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (arguments.length && lenis && value !== undefined) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis?.scroll ?? 0;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });

      tickerFn = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      gsap.from('[data-home="hero-in"]', {
        y: 56,
        opacity: 0,
        duration: 1.1,
        stagger: 0.09,
        ease: 'power3.out',
        delay: 0.12,
      });

      gsap.from('[data-exp="hero-char"]', {
        y: 90,
        opacity: 0,
        duration: 1,
        stagger: 0.03,
        ease: 'power4.out',
        delay: 0.28,
      });

      gsap.to('[data-home="hero-title"]', {
        y: -72,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-home="hero"]',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      gsap.utils.toArray<HTMLElement>('[data-home="reveal"]').forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 84%',
            toggleActions: 'play none none none',
          },
        });
      });

      const path = root.querySelector('[data-home="thread"]') as SVGPathElement | null;
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: reduced ? 0 : len });
        if (!reduced) {
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.35,
            },
          });
        }
      }

      if (!reduced) {
        gsap.utils.toArray<SVGElement>('[data-home="ray"]').forEach((ray, i) => {
          gsap.to(ray, {
            opacity: 0.06 + i * 0.04,
            duration: 5 + i,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.5,
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-home="ring"]').forEach((ring, i) => {
          gsap.to(ring, {
            scale: 1.015,
            duration: 4 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.3,
          });
        });
      }

      gsap.from('[data-home="entry"]', {
        y: 28,
        opacity: 0,
        stagger: 0.07,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '[data-home="writing"]',
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      });

      const dock = document.querySelector('[data-home="dock"]');
      if (dock) {
        ScrollTrigger.create({
          trigger: '[data-home="hero"]',
          start: 'bottom 75%',
          onEnter: () => dock.classList.add('is-visible'),
          onLeaveBack: () => dock.classList.remove('is-visible'),
        });
        if (window.scrollY > window.innerHeight * 0.5) {
          dock.classList.add('is-visible');
        }
      }

      ScrollTrigger.refresh();
    }, root);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      ctx.revert();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenis?.destroy();
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      document.body.classList.remove('home-world');
      document.querySelector('[data-home="dock"]')?.classList.remove('is-visible');
    };
  }, [rootRef]);
}
