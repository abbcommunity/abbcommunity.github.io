/**
 * Automatically converts any Google Drive view/share link into a direct displayable image URL.
 * Supports patterns:
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 */
export const convertGoogleDriveUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();

  if (trimmed.includes('drive.google.com')) {
    let fileId: string | null = null;

    // Pattern 1: ?id=FILE_ID or &id=FILE_ID
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    } else {
      // Pattern 2: /file/d/FILE_ID
      const pathMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (pathMatch && pathMatch[1]) {
        fileId = pathMatch[1];
      }
    }

    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  return trimmed;
};

/**
 * Returns formatted avatar photo URL with Google Drive auto-conversion and fallback avatar placeholder.
 */
export const getAvatarUrl = (url?: string | null, fallbackName = 'ABB'): string => {
  const converted = convertGoogleDriveUrl(url);
  if (converted) return converted;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=1E293B&color=38BDF8&bold=true`;
};
