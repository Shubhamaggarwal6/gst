import { supabase } from './supabase';

const BUCKET_NAME = 'billsaathi-backups';

export async function uploadBackup(userId: string, fileName: string, data: Blob): Promise<string | null> {
  const path = `${userId}/${fileName}`;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, data, { upsert: true, contentType: 'application/zip' });
  if (error) { console.error('Upload error:', error); return null; }
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return urlData.publicUrl;
}

export async function listBackups(userId: string) {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(userId);
  if (error) { console.error('List error:', error); return []; }
  return data ?? [];
}

export async function deleteBackup(userId: string, fileName: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([`${userId}/${fileName}`]);
  if (error) console.error('Delete error:', error);
}
