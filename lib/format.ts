export function parseContentDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) {
    return new Date(Date.UTC(dateStr.getUTCFullYear(), dateStr.getUTCMonth(), dateStr.getUTCDate()));
  }

  const [year, month, day] = String(dateStr).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(dateStr: string | Date, style: 'long' | 'short' = 'long'): string {
  const date = parseContentDate(dateStr);
  const options: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
      : { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };

  return date.toLocaleDateString('en-US', options);
}
