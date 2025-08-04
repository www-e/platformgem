// src/components/upload/FileUploader.tsx
"use client";

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

const ACCEPTED_FILE_TYPES = {
  'image/*': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  'video/*': ['mp4', 'webm', 'ogg'],
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'text/plain': ['txt'],
  'application/zip': ['zip'],
  'application/x-rar-compressed': ['rar']
};

const DEFAULT_ACCEPTED_TYPES = Object.keys(ACCEPTED_FILE_TYPES);

export function FileUploader({
  onUpload,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = 50, // 50MB default
  maxFiles = 10,
  className,
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `حجم الملف كبير جداً. الحد الأقصى ${maxFileSize}MB`;
    }

    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return 'نوع الملف غير مدعوم';
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<{ url: string; id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'course-material');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'فشل في رفع الملف');
    }

    return await response.json();
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    if (disabled) return;

    const newFiles = Array.from(fileList);
    
    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`يمكن رفع ${maxFiles} ملفات كحد أقصى`);
      return;
    }

    // Validate and prepare files
    const validFiles: FileWithProgress[] = [];
    
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'uploading'
      });
    }

    if (validFiles.length === 0) return;

    // Add files to state
    setFiles(prev => [...prev, ...validFiles]);

    // Upload files
    const uploadPromises = validFiles.map(async (fileWithProgress) => {
      try {
        const result = await uploadFile(fileWithProgress.file);
        
        // Update file status
        setFiles(prev => prev.map(f => 
          f.id === fileWithProgress.id 
            ? { ...f, status: 'completed', progress: 100, url: result.url }
            : f
        ));

        return {
          id: result.id,
          name: fileWithProgress.file.name,
          size: fileWithProgress.file.size,
          type: fileWithProgress.file.type,
          url: result.url,
          uploadedAt: new Date()
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في الرفع';
        
        // Update file status with error
        setFiles(prev => prev.map(f => 
          f.id === fileWithProgress.id 
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ));

        toast.error(`${fileWithProgress.file.name}: ${errorMessage}`);
        return null;
      }
    });

    // Wait for all uploads and notify parent
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((result): result is UploadedFile => result !== null);
    
    if (successfulUploads.length > 0) {
      onUpload(successfulUploads);
      toast.success(`تم رفع ${successfulUploads.length} ملف بنجاح`);
    }
  }, [files.length, maxFiles, maxFileSize, acceptedTypes, disabled, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver && !disabled && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            اسحب الملفات هنا أو انقر للاختيار
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            الحد الأقصى: {maxFileSize}MB لكل ملف، {maxFiles} ملفات كحد أقصى
          </p>
          <Button 
            variant="outline" 
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            اختر الملفات
          </Button>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">الملفات المرفوعة:</h4>
          {files.map((fileWithProgress) => (
            <Card key={fileWithProgress.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getFileIcon(fileWithProgress.file.type)}
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileWithProgress.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(fileWithProgress.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {fileWithProgress.status === 'uploading' && (
                    <Progress value={fileWithProgress.progress} className="mt-2" />
                  )}
                  
                  {fileWithProgress.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">
                      {fileWithProgress.error}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {fileWithProgress.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {fileWithProgress.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileWithProgress.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}