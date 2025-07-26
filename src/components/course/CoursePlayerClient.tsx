// src/components/course/CoursePlayerClient.tsx
"use client";

import { useState } from "react";
import { BunnyVideoPlayer } from "@/components/video/BunnyVideoPlayer";
import { CompletionButton } from "@/app/courses/[courseId]/_components/completion-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lesson } from "@prisma/client";
import { getSignedBunnyUrl } from "@/lib/bunny";
import LessonMaterials from "./LessonMaterials";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface CoursePlayerClientProps {
  courseId: string;
  bunnyLibraryId: string;
  currentLesson: Lesson;
  isCompleted: boolean;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export default function CoursePlayerClient({
  courseId,
  bunnyLibraryId,
  currentLesson,
  isCompleted,
  prevLesson,
  nextLesson,
}: CoursePlayerClientProps) {
  
  // State to track if the video has been watched enough. Initialize with isCompleted status.
  const [canMarkComplete, setCanMarkComplete] = useState(isCompleted);

  // This function will be passed to the VideoPlayer
  const handleVideoProgress = (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number; }) => {
    // Enable the complete button if video is 95% watched.
    if (progress.played > 0.95 && !canMarkComplete) {
      setCanMarkComplete(true);
    }
  };

  const secureVideoUrl = getSignedBunnyUrl(bunnyLibraryId, currentLesson.bunnyVideoId);

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card">
        <CardHeader className="p-0">
          <BunnyVideoPlayer
            lessonId={currentLesson.id}
            bunnyVideoId={currentLesson.bunnyVideoId}
            bunnyLibraryId={bunnyLibraryId}
            title={currentLesson.title}
            onProgressUpdate={(progress) => {
              if (progress.watchedDuration / progress.totalDuration > 0.95 && !canMarkComplete) {
                setCanMarkComplete(true);
              }
            }}
            onLessonComplete={() => setCanMarkComplete(true)}
          />
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center justify-between mb-4">
            {prevLesson ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/courses/${courseId}?lesson=${prevLesson.id}`}>
                  <ChevronRight className="h-4 w-4 ml-1" />
                  الدرس السابق
                </Link>
              </Button>
            ) : <div />}
            {nextLesson ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/courses/${courseId}?lesson=${nextLesson.id}`}>
                  الدرس التالي
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Link>
              </Button>
            ) : <div />}
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-grow">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {currentLesson.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span>يتم تأمين هذا المحتوى لبث الفيديو.</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <CompletionButton
                courseId={courseId}
                lessonId={currentLesson.id}
                isCompleted={isCompleted}
                canMarkComplete={canMarkComplete}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lesson Materials Section */}
      <LessonMaterials materials={currentLesson.materials} />
    </div>
  );
}