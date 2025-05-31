
import { useFileUpload } from './useFileUpload';

export const useProductAssetUpload = () => {
  const { uploadFile, deleteFile, uploading, progress } = useFileUpload();

  const uploadProductAsset = async (file: File, productId?: string) => {
    const folder = productId || 'temp';
    
    return await uploadFile(file, {
      bucket: 'ai-assets',
      folder,
      allowedTypes: [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf',
        'audio/mpeg', 'audio/wav',
        'video/mp4', 'video/webm'
      ],
      maxSize: 50 * 1024 * 1024 // 50MB
    });
  };

  const uploadPreviewImage = async (file: File, productId?: string) => {
    const folder = productId || 'temp';
    
    return await uploadFile(file, {
      bucket: 'ai-assets',
      folder: `${folder}/previews`,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024 // 5MB
    });
  };

  return {
    uploadProductAsset,
    uploadPreviewImage,
    deleteFile,
    uploading,
    progress
  };
};
