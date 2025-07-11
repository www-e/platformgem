// src/components/course/LessonMaterials.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paperclip, Info } from "lucide-react";
import { JsonValue } from "@prisma/client/runtime/library";

interface LessonMaterialsProps {
  // We'll add a description field later if needed
  // description: string | null;
  materials: JsonValue;
}

// A helper to safely parse the JSON materials
const parseMaterials = (materials: JsonValue): { title: string, url: string }[] => {
  if (Array.isArray(materials)) {
    // Basic validation to ensure it's an array of objects with title and url
    return materials.filter(
      (m): m is { title: string; url: string } =>
        typeof m === 'object' && m !== null && 'title' in m && 'url' in m
    );
  }
  return [];
};

export default function LessonMaterials({ materials }: LessonMaterialsProps) {
  const parsedMaterials = parseMaterials(materials);

  return (
    <div className="mt-6">
      <Tabs defaultValue="materials">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials">
            <Paperclip className="ml-2 h-4 w-4" />
            المرفقات والملفات
          </TabsTrigger>
          <TabsTrigger value="about" disabled>
            <Info className="ml-2 h-4 w-4" />
            عن الدرس
          </TabsTrigger>
        </TabsList>
        <TabsContent value="materials">
          {parsedMaterials.length > 0 ? (
            <ul className="space-y-3">
              {parsedMaterials.map((material, index) => (
                <li key={index}>
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-muted/50 hover:bg-muted rounded-md transition-colors"
                  >
                    <Paperclip className="h-5 w-5 ml-3 text-primary" />
                    <span className="font-medium text-foreground">{material.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">لا توجد ملفات مرفقة لهذا الدرس.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="about">
            <div className="text-center py-10">
                <p className="text-muted-foreground">لا يوجد وصف متاح لهذا الدرس حاليًا.</p>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}