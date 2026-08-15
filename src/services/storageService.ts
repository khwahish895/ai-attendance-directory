import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type StorageBucket = 'notes' | 'assignments' | 'student-submissions';

export interface UploadResult {
  filePath: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageProvider: 'supabase' | 'local';
}

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

const DEFAULT_MAX_SIZE_MB = 15;

const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.zip',
];

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
];

/**
 * Validates file size, type, and extension with user-friendly error messages.
 */
export function validateFile(file: File, options?: FileValidationOptions): { valid: boolean; error?: string } {
  const maxSizeMB = options?.maxSizeMB || DEFAULT_MAX_SIZE_MB;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${maxSizeMB} MB.`,
    };
  }

  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const allowedExts = options?.allowedExtensions || ACCEPTED_EXTENSIONS;

  if (!allowedExts.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file extension "${extension}". Allowed formats: ${allowedExts.join(', ')}`,
    };
  }

  if (file.type && options?.allowedMimeTypes && !options.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file MIME type "${file.type}".`,
    };
  }

  return { valid: true };
}

/**
 * Converts a browser File object to a persistent Data URL for offline preview/storage.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file to Supabase Storage bucket (or local persistent store with data URL).
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  folder: string = 'general',
  onProgress?: (progressPct: number) => void
): Promise<UploadResult> {
  // Validate first
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'File validation failed');
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${timestamp}_${sanitizedName}`;

  if (onProgress) onProgress(30);

  // If live Supabase is configured, upload to Supabase Storage bucket
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        console.warn('Supabase storage upload error, falling back to secure data URL:', error.message);
        throw error;
      }

      if (onProgress) onProgress(80);

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

      if (onProgress) onProgress(100);

      return {
        filePath: data.path,
        fileUrl: publicUrlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        storageProvider: 'supabase',
      };
    } catch (err: any) {
      console.warn('Storage fallback triggered:', err.message);
      // Fallback seamlessly to data URL
    }
  }

  // Local/Offline Persistent Data URL
  if (onProgress) onProgress(60);
  const dataUrl = await fileToDataUrl(file);
  if (onProgress) onProgress(100);

  return {
    filePath: `storage://${bucket}/${path}`,
    fileUrl: dataUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    storageProvider: 'local',
  };
}

/**
 * Downloads a file either from a remote URL or a data URL.
 */
export function downloadFile(url: string, filename: string) {
  if (!url) return;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formats bytes to human-readable size string (KB, MB).
 */
export function formatBytes(bytes?: number, decimals: number = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
