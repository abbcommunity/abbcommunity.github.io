/**
 * Utility to extract Google Drive File ID from various share link formats.
 */
export const extractGoogleDriveFileId = (url?: string | null): string | null => {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/FILE_ID
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Pattern 2: ?id=FILE_ID or &id=FILE_ID
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pattern 3: /d/FILE_ID (lh3.googleusercontent.com/d/FILE_ID)
  const matchDirectD = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchDirectD && matchDirectD[1]) return matchDirectD[1];

  return null;
};

/**
 * Automatically converts any Google Drive view/share link into a direct displayable image URL.
 * Uses Google's official public thumbnail generator endpoint which bypasses CORS/hotlinking blocks.
 */
export const convertGoogleDriveUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    // Official Google Drive thumbnail endpoint (works reliably across all browsers without CORS issues)
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }

  return trimmed;
};

/**
 * Returns formatted avatar photo URL with fallback avatar placeholder.
 */
export const getAvatarUrl = (url?: string | null, fallbackName = 'ABB'): string => {
  const converted = convertGoogleDriveUrl(url);
  if (converted) return converted;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=1E293B&color=38BDF8&bold=true`;
};

/**
 * Image onError fallback handler that tries alternative Google Drive CDN endpoints before falling back to UI Avatars.
 */
export const handleAvatarError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  photoURL?: string | null,
  fallbackName = 'ABB'
) => {
  const target = e.currentTarget;
  const fileId = extractGoogleDriveFileId(photoURL);

  if (fileId && !target.dataset.triedLh3) {
    target.dataset.triedLh3 = 'true';
    target.src = `https://lh3.googleusercontent.com/d/${fileId}`;
    return;
  }

  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || 'ABB')}&background=1E293B&color=38BDF8&bold=true`;
};
