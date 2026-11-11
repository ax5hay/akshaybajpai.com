'use client';

import { useEffect } from 'react';

/**
 * Drives A-103's construction sequence. The figure is drawn on the server,
 * complete; this only moves the stage, by setting attributes on what is
 * already there (data-state on the courses and the delivered schedule,
 * data-on on the readout, the level mark's transform). Nothing re-renders.
 *
 * Hover, focus or click a course to choose it; arrow keys step, Home and End
 * jump; the stepper steps; "Build it in order" raises the courses one at a
 * time, or goes straight to the top when motion is reduced.
 */
const PACE = 720;

export function SequenceControl({ rootId, last }: { rootId: string; last: number }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const courses = Array.from(root.querySelectorAll<SVGGElement>('[data-course]'));
    const level = root.querySelector<SVGGElement>('[data-level]');
    const levelText = root.querySelector('[data-level-text]');
    const counter = root.querySelector('[data-counter]');
    const datum = root.querySelector<SVGGElement>('[data-datum]');
    const prev = root.querySelector<HTMLButtonElement>('[data-act="prev"]');
    const next = root.querySelector<HTMLButtonElement>('[data-act="next"]');
    const build = root.querySelector<HTMLButtonElement>('[data-act="build"]');
    const no = (i: number) => String(i + 1).padStart(2, '0');

    let at = last;
    let timer = 0;

    const apply = (i: number, focus = false) => {
      at = Math.min(last, Math.max(0, i));
      root.dataset.at = String(at);
      courses.forEach((g, k) => {
        g.dataset.state = k < at ? 'built' : k === at ? 'on' : 'proposed';
        g.tabIndex = k === at ? 0 : -1;
        g.setAttribute('aria-pressed', String(k === at));
      });
      root.querySelectorAll<HTMLElement>('[data-deliver]').forEach((li, k) => {
        li.dataset.state = k <= at ? 'issued' : 'pending';
        li.toggleAttribute('data-on', k === at);
      });
      root.querySelectorAll<HTMLElement>('[data-step]').forEach((li, k) => li.toggleAttribute('data-on', k === at));
      if (level) level.style.transform = `translateY(${courses[at]?.dataset.top ?? 0}px)`;
      if (levelText) levelText.textContent = `Stage ${no(at)}`;
      if (counter) counter.textContent = `${no(at)} / ${no(last)}`;
      if (datum) datum.dataset.state = at >= 2 ? 'set' : '';
      if (prev) prev.disabled = at === 0;
      if (next) next.disabled = at === last;
      if (focus) courses[at]?.focus();
    };

    const stop = () => {
      window.clearTimeout(timer);
      timer = 0;
      build?.setAttribute('aria-pressed', 'false');
    };

    const choose = (i: number, focus = false) => {
      stop();
      apply(i, focus);
    };

    const raise = () => {
      stop();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(last);
      build?.setAttribute('aria-pressed', 'true');
      apply(0);
      const step = (i: number) => {
        timer = window.setTimeout(() => {
          apply(i);
          if (i < last) step(i + 1);
          else stop();
        }, PACE);
      };
      step(1);
    };

    const courseOf = (event: Event) =>
      (event.target as Element).closest?.('[data-course]') as SVGGElement | null;

    const onClick = (event: MouseEvent) => {
      const act = (event.target as Element).closest?.('[data-act]') as HTMLElement | null;
      if (act) {
        if (act.dataset.act === 'build') raise();
        else choose(at + (act.dataset.act === 'next' ? 1 : -1));
        return;
      }
      const course = courseOf(event);
      if (course) choose(Number(course.dataset.course));
    };
    const onOver = (event: Event) => {
      if (timer) return;
      const course = courseOf(event);
      if (course && Number(course.dataset.course) !== at) apply(Number(course.dataset.course));
    };
    const onKey = (event: KeyboardEvent) => {
      if (!courseOf(event)) return;
      const step: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 };
      if (event.key === 'Home') choose(0, true);
      else if (event.key === 'End') choose(last, true);
      else if (step[event.key]) choose(at + step[event.key], true);
      else if (event.key === 'Enter' || event.key === ' ') choose(Number(courseOf(event)!.dataset.course));
      else return;
      event.preventDefault();
    };

    root.addEventListener('click', onClick);
    root.addEventListener('pointerover', onOver);
    root.addEventListener('focusin', onOver);
    root.addEventListener('keydown', onKey);
    apply(last);
    return () => {
      stop();
      root.removeEventListener('click', onClick);
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('focusin', onOver);
      root.removeEventListener('keydown', onKey);
    };
  }, [rootId, last]);

  return null;
}
