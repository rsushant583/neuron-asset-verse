
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string[];
  maxSize?: number;
  currentFile?: string;
  uploading?: boolean;
  progress?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const FileUpload = ({
  onFileSelect,
  onFileRemove,
  accept = ['image/*'],
  maxSize = 5 * 1024 * 1024,
  currentFile,
  uploading = false,
  progress = 0,
  disabled = false,
  className,
  children
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
    disabled: disabled || uploading
  });

  const isImage = (file: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
  };

  if (currentFile && !uploading) {
    return (
      <div className={cn("relative group", className)}>
        {isImage(currentFile) ? (
          <img
            src={currentFile}
            alt="Uploaded file"
            className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <File className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {onFileRemove && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onFileRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-cyber-blue transition-colors",
        isDragActive && "border-cyber-blue bg-cyber-blue/5",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div className="space-y-4">
          <Upload className="w-8 h-8 text-cyber-blue mx-auto animate-pulse" />
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyber-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">Uploading... {progress}%</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="w-8 h-8 text-gray-400 mx-auto" />
          {children || (
            <>
              <p className="text-gray-600">
                Drag and drop your file here, or{' '}
                <span className="text-cyber-blue font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400">
                Max size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
