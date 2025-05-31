
import { useFileUpload } from './useFileUpload';
import { useUpdateProfile } from './useUserProfile';

export const useAvatarUpload = () => {
  const { uploadFile, uploading, progress } = useFileUpload();
  const updateProfile = useUpdateProfile();

  const uploadAvatar = async (file: File) => {
    const result = await uploadFile(file, {
      bucket: 'user-avatars',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024 // 5MB
    });

    // Update user profile with new avatar URL
    await updateProfile.mutateAsync({
      avatar_url: result.url
    });

    return result;
  };

  return {
    uploadAvatar,
    uploading,
    progress,
    isUpdating: updateProfile.isPending
  };
};
