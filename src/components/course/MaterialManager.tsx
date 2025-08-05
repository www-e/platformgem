// src/components/course/MaterialManager.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/upload/FileUploader";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Download,
  Eye,
  FileText,
  Image,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { JsonValue } from "@prisma/client/runtime/library";

interface Material {
  title: string;
  url: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
}

interface MaterialManagerProps {
  lessonId: string;
  materials: JsonValue;
  onUpdate: (materials: Material[]) => void;
  canEdit?: boolean;
}

export function MaterialManager({
  lessonId,
  materials,
  onUpdate,
  canEdit = false,
}: MaterialManagerProps) {
  const [parsedMaterials, setParsedMaterials] = useState<Material[]>(() => {
    if (Array.isArray(materials)) {
      return materials
        .filter((m) => {
          return (
            typeof m === "object" &&
            m !== null &&
            typeof (m as any).title === "string" &&
            typeof (m as any).url === "string"
          );
        })
        .map((m) => m as unknown as Material);
    }
    return [];
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const getFileIcon = (url: string, type?: string) => {
    if (type) {
      if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
      if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
    }

    const extension = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <Image className="w-4 h-4" />;
    }
    if (["mp4", "webm", "ogg"].includes(extension || "")) {
      return <Video className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const handleFileUpload = async (uploadedFiles: any[]) => {
    setIsUploading(true);
    try {
      const newMaterials = uploadedFiles.map((file) => ({
        title: file.name,
        url: file.url,
        type: file.type,
        size: file.size,
        uploadedAt: file.uploadedAt,
      }));

      const updatedMaterials = [...parsedMaterials, ...newMaterials];
      setParsedMaterials(updatedMaterials);
      onUpdate(updatedMaterials);

      toast.success(`تم رفع ${uploadedFiles.length} ملف بنجاح`);
    } catch (error) {
      toast.error("حدث خطأ في رفع الملفات");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditTitle(parsedMaterials[index].title);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const updatedMaterials = [...parsedMaterials];
    updatedMaterials[editingIndex] = {
      ...updatedMaterials[editingIndex],
      title: editTitle,
    };

    setParsedMaterials(updatedMaterials);
    onUpdate(updatedMaterials);
    setEditingIndex(null);
    setEditTitle("");
    toast.success("تم تحديث اسم الملف");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditTitle("");
  };

  const handleDelete = async (index: number) => {
    const material = parsedMaterials[index];

    try {
      // Delete file from server if it's an uploaded file
      if (material.url.startsWith("/uploads/")) {
        await fetch(`/api/upload?url=${encodeURIComponent(material.url)}`, {
          method: "DELETE",
        });
      }

      const updatedMaterials = parsedMaterials.filter((_, i) => i !== index);
      setParsedMaterials(updatedMaterials);
      onUpdate(updatedMaterials);

      toast.success("تم حذف الملف");
    } catch (error) {
      toast.error("حدث خطأ في حذف الملف");
    }
  };

  const handleDownload = (material: Material) => {
    const link = document.createElement("a");
    link.href = material.url;
    link.download = material.title;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (material: Material) => {
    window.open(material.url, "_blank");
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Section - Only for editors */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              إضافة ملفات جديدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploader
              onUpload={handleFileUpload}
              maxFileSize={50}
              maxFiles={10}
              disabled={isUploading}
            />
          </CardContent>
        </Card>
      )}

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>المواد التعليمية ({parsedMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {parsedMaterials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مواد تعليمية مرفقة بهذا الدرس</p>
              {canEdit && (
                <p className="text-sm mt-2">
                  استخدم النموذج أعلاه لإضافة ملفات
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {parsedMaterials.map((material, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0 text-primary">
                    {getFileIcon(material.url, material.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-grow min-w-0">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-grow"
                          placeholder="اسم الملف"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={!editTitle.trim()}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium truncate">{material.title}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {material.size && (
                            <span>{formatFileSize(material.size)}</span>
                          )}
                          {material.uploadedAt && (
                            <span>
                              {new Date(material.uploadedAt).toLocaleDateString(
                                "ar-EG"
                              )}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {editingIndex !== index && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePreview(material)}
                        title="معاينة"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(material)}
                        title="تحميل"
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      {canEdit && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(index)}
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(index)}
                            title="حذف"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
