/**
 * Utility to format monetary amounts in Bolivianos (Bs)
 */
export const formatBs = (amount: number): string => {
  const formatted = new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `Bs ${formatted}`;
};

/**
 * Resolves media URLs (handles relative /uploads in development and cross-domain in production)
 */
export const getMediaUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
    : '';
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
};
