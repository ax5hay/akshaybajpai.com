'use client';

import { useEffect, useState } from 'react';

const ZONE = 'Asia/Kolkata';
/** IST is UTC+5:30 the year round; India keeps no daylight saving time. */
const ZONE_OFFSET_MIN = 330;

/**
 * The time where the reader's message will be read, and how far that is from
 * where they are. Useful to anyone deciding when to expect an answer.
 * Rendered on the client only: the server cannot know either clock.
 */
export function LocalTime({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return <span className={className}>&nbsp;</span>;

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  // Minutes the reader's clock is behind (positive) or ahead of (negative) IST.
  const gap = ZONE_OFFSET_MIN + now.getTimezoneOffset();
  const hours = Math.floor(Math.abs(gap) / 60);
  const minutes = Math.abs(gap) % 60;
  const span = [hours ? `${hours} h` : '', minutes ? `${minutes} min` : ''].filter(Boolean).join(' ');
  const relation = gap === 0 ? 'the same as yours' : `${span} ${gap > 0 ? 'ahead of' : 'behind'} you`;

  return (
    <span className={className}>
      <time dateTime={now.toISOString()}>{time}</time> IST
      <span> · {relation}</span>
    </span>
  );
}
