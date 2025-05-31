
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Image, Music, Video } from 'lucide-react';
import FileUpload from '@/components/ui/file-upload';
import { useProductAssetUpload } from '@/hooks/useProductAssetUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductAssetUploadProps {
  productId?: string;
  onAssetUploaded?: (url: string, type: 'content' | 'preview') => void;
  className?: string;
}

const ProductAssetUpload = ({ 
  productId, 
  onAssetUploaded, 
  className 
}: ProductAssetUploadProps) => {
  const [uploadType, setUploadType] = useState<'content' | 'preview'>('content');
  const [currentAsset, setCurrentAsset] = useState<string>('');
  const { uploadProductAsset, uploadPreviewImage, uploading, progress } = useProductAssetUpload();

  const handleFileSelect = async (file: File) => {
    try {
      let result;
      if (uploadType === 'preview') {
        result = await uploadPreviewImage(file, productId);
      } else {
        result = await uploadProductAsset(file, productId);
      }
      
      setCurrentAsset(result.url);
      onAssetUploaded?.(result.url, uploadType);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="w-5 h-5" />;
    if (type.includes('audio')) return <Music className="w-5 h-5" />;
    if (type.includes('video')) return <Video className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex gap-2 mb-4">
        <Button
          variant={uploadType === 'content' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadType('content')}
          className="bg-gradient-to-r from-cyber-blue to-cyber-purple text-white"
        >
          Content File
        </Button>
        <Button
          variant={uploadType === 'preview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadType('preview')}
          className="bg-gradient-to-r from-cyber-purple to-cyber-pink text-white"
        >
          Preview Image
        </Button>
      </div>

      <div className="relative">
        <Badge className="absolute top-2 left-2 z-10 bg-cyber-blue text-white">
          {uploadType === 'content' ? 'Product Content' : 'Preview Image'}
        </Badge>
        
        <FileUpload
          onFileSelect={handleFileSelect}
          onFileRemove={() => setCurrentAsset('')}
          accept={uploadType === 'preview' ? ['image/*'] : ['image/*', 'application/pdf', 'audio/*', 'video/*']}
          maxSize={uploadType === 'preview' ? 5 * 1024 * 1024 : 50 * 1024 * 1024}
          currentFile={currentAsset}
          uploading={uploading}
          progress={progress}
          className="min-h-[200px]"
        >
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-gray-600">
              {uploadType === 'content' 
                ? 'Upload your AI-generated content (PDF, Audio, Video, Image)'
                : 'Upload a preview image for your product'
              }
            </p>
            <p className="text-xs text-gray-400">
              Max size: {uploadType === 'preview' ? '5MB' : '50MB'}
            </p>
          </div>
        </FileUpload>
      </div>
    </motion.div>
  );
};

export default ProductAssetUpload;
