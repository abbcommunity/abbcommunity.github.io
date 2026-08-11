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
 * Uses Google's official public thumbnail CDN (drive.google.com/thumbnail).
 */
export const convertGoogleDriveUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
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
 * Multi-CDN Image onError Fallback Proxy Chain.
 * If client-side browser hotlinking is blocked by Google Drive CORS, automatically tries:
 * 1. Google Drive Thumbnail CDN
 * 2. wsrv.nl Global Cloudflare Image Proxy for Google Drive
 * 3. lh3.googleusercontent CDN
 * 4. wsrv.nl Global Proxy for lh3
 * 5. UI Avatars Placeholder Badge
 */
export const handleAvatarError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  photoURL?: string | null,
  fallbackName = 'ABB'
) => {
  const target = e.currentTarget;
  const fileId = extractGoogleDriveFileId(photoURL);

  if (fileId) {
    const step = parseInt(target.dataset.fallbackStep || '0', 10);

    if (step === 0) {
      target.dataset.fallbackStep = '1';
      // Step 1: Global Cloudflare Image Proxy via wsrv.nl (bypasses all Google Drive browser CORS/hotlinking restrictions)
      target.src = `https://wsrv.nl/?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${fileId}&sz=w800`)}`;
      return;
    }

    if (step === 1) {
      target.dataset.fallbackStep = '2';
      // Step 2: Direct lh3 Google User Content CDN
      target.src = `https://lh3.googleusercontent.com/d/${fileId}`;
      return;
    }

    if (step === 2) {
      target.dataset.fallbackStep = '3';
      // Step 3: Global Proxy for lh3 Google User Content CDN
      target.src = `https://wsrv.nl/?url=${encodeURIComponent(`https://lh3.googleusercontent.com/d/${fileId}`)}`;
      return;
    }
  }

  // Final Fallback: UI Avatars Badge if file is private or deleted
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || 'ABB')}&background=1E293B&color=38BDF8&bold=true`;
};
