
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarUpload = ({ size = 'md', className }: AvatarUploadProps) => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { uploadAvatar, uploading, progress } = useAvatarUpload();

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
      } catch (error) {
        console.error('Avatar upload failed:', error);
      }
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <Avatar className={cn(sizeClasses[size], "border-2 border-gray-200")}>
        <AvatarImage src={profile?.avatar_url || ''} />
        <AvatarFallback>
          {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="text-white text-xs">
            <Upload className="w-4 h-4 animate-pulse" />
          </div>
        ) : (
          <Camera className="w-4 h-4 text-white" />
        )}
      </label>
      
      {uploading && (
        <div className="absolute -bottom-2 left-0 right-0">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-cyber-blue h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
