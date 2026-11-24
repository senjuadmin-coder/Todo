export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatEditorialDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getWeekDays(anchorIso: string, weekOffset = 0): {
  iso: string;
  weekdayShort: string;
  dayNumber: string;
  monthShort: string;
  isAnchorToday: boolean;
}[] {
  const [y, m, d] = anchorIso.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const dayOfWeek = base.getDay(); // 0 Sun .. 6 Sat
  const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(base);
  monday.setDate(base.getDate() + mondayDiff + weekOffset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const iso = toISODate(cur);
    days.push({
      iso,
      weekdayShort: cur.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: String(cur.getDate()),
      monthShort: cur.toLocaleDateString('en-US', { month: 'short' }),
      isAnchorToday: iso === anchorIso,
    });
  }
  return days;
}

export function formatMinutesReadable(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
}

export function formatTimerSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
