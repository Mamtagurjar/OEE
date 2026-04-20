export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: number; // epoch ms
};

const STORAGE_KEY = 'oee.notifications.readIds.v1';

const getNow = (): number => Date.now();

// Minimal seeded/demo notifications. Replace with API later.
export const getAllNotifications = (): NotificationItem[] => {
  const now = getNow();
  return [
    {
      id: 'sys-001',
      title: 'System Alerts',
      message: 'New alert detected. Please review System Alerts.',
      createdAt: now - 2 * 60 * 1000,
    },
    {
      id: 'maint-001',
      title: 'Maintenance Log',
      message: 'Inspection schedule updated for Machine 2.',
      createdAt: now - 55 * 60 * 1000,
    },
    {
      id: 'oee-001',
      title: 'OEE',
      message: 'Efficiency report is ready for export.',
      createdAt: now - 26 * 60 * 60 * 1000,
    },
  ].sort((a, b) => b.createdAt - a.createdAt);
};

export const getReadIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === 'string'));
  } catch {
    return new Set();
  }
};

export const setReadIds = (ids: Set<string>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore storage errors (private mode, quotas, etc)
  }
};

export const markRead = (id: string): void => {
  const ids = getReadIds();
  ids.add(id);
  setReadIds(ids);
};

export const markManyRead = (idsToMark: string[]): void => {
  const ids = getReadIds();
  for (const id of idsToMark) ids.add(id);
  setReadIds(ids);
};

export const getUnreadNotifications = (): NotificationItem[] => {
  const read = getReadIds();
  return getAllNotifications().filter((n) => !read.has(n.id));
};

export const getLatestUnreadNotification = (): NotificationItem | null => {
  const unread = getUnreadNotifications();
  return unread.length > 0 ? unread[0] : null;
};

export const formatRelativeTime = (createdAt: number, nowMs: number = getNow()): string => {
  const deltaMs = Math.max(0, nowMs - createdAt);
  const seconds = Math.floor(deltaMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return 'just now';
  if (minutes < 1) return `${seconds}s ago`;
  if (hours < 1) return `${minutes}m ago`;
  if (days < 1) return `${hours}h ago`;
  return `${days}d ago`;
};
