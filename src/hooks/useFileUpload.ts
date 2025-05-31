
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UploadOptions {
  bucket: 'ai-assets' | 'user-avatars' | 'nft-metadata';
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadFile = async (file: File, options: UploadOptions) => {
    if (!user) throw new Error('User not authenticated');
    
    setUploading(true);
    setProgress(0);

    try {
      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed`);
      }

      // Validate file size
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(`File size exceeds ${options.maxSize} bytes`);
      }

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const folder = options.folder || user.id;
      const filePath = `${folder}/${fileName}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      return {
        path: data.path,
        url: urlData.publicUrl,
        fullPath: filePath
      };
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress
  };
};
