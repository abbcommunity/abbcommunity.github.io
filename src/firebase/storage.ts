import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  StorageReference,
} from 'firebase/storage';
import { storage } from './config';

export interface UploadOptions {
  folder: 'members' | 'events' | 'gallery' | 'stories' | 'garage' | 'rides' | 'documents';
  subId: string;
  filename: string;
  maxSizeMB?: number;
}

export const uploadMediaFile = async (
  file: File,
  options: UploadOptions
): Promise<{ url: string; path: string }> => {
  const maxBytes = (options.maxSizeMB || 10) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Ukuran file melebihi batas maksimum ${options.maxSizeMB || 10} MB.`);
  }

  const cleanFilename = `${Date.now()}_${options.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `${options.folder}/${options.subId}/${cleanFilename}`;
  const storageRef: StorageReference = ref(storage, filePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  const url = await getDownloadURL(storageRef);
  return { url, path: filePath };
};

export const deleteMediaFile = async (filePath: string): Promise<void> => {
  const storageRef = ref(storage, filePath);
  return await deleteObject(storageRef);
};

export { storage };
