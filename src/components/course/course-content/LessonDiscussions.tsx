// src/components/course/course-content/LessonDiscussions.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, Users } from "lucide-react";

interface Discussion {
  id: string;
  lessonId: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp?: number;
  replies: Discussion[];
  likes: number;
  createdAt: Date;
}

interface LessonDiscussionsProps {
  lessonId: string;
  className?: string;
}

export function LessonDiscussions({ lessonId, className }: LessonDiscussionsProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load discussions for the current lesson
  useEffect(() => {
    const loadDiscussions = async () => {
      if (!lessonId) return;
      
      try {
        const response = await fetch(`/api/lessons/${lessonId}/discussions`);
        if (response.ok) {
          const data = await response.json();
          setDiscussions(data.discussions || []);
        }
      } catch (error) {
        console.error('Failed to load discussions:', error);
        setDiscussions([]);
      }
    };

    loadDiscussions();
  }, [lessonId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (response.ok) {
        const newDiscussion = await response.json();
        setDiscussions(prev => [newDiscussion, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (discussionId: string) => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        setDiscussions(prev => 
          prev.map(d => 
            d.id === discussionId 
              ? { ...d, likes: d.likes + 1 }
              : d
          )
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            نقاشات الدورة ({discussions.length})
          </div>
          <Badge variant="secondary" className="text-xs">
            {discussions.filter(d => d.timestamp).length} أسئلة مرتبطة بالفيديو
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Comment */}
        <div className="space-y-3">
          <Textarea
            placeholder="شارك سؤالك أو تعليقك حول هذا الدرس..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isLoading}
              size="sm"
            >
              {isLoading ? "جاري النشر..." : "نشر التعليق"}
            </Button>
          </div>
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-800"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-600" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-neutral-900 dark:text-white">
                        {discussion.user.name}
                      </span>
                      {discussion.timestamp && (
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(discussion.timestamp / 60)}:{(discussion.timestamp % 60).toString().padStart(2, '0')}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">
                      {discussion.createdAt.toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {discussion.content}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(discussion.id)}
                      className="text-xs h-7 px-2"
                    >
                      <ThumbsUp className="w-3 h-3 ml-1" />
                      {discussion.likes}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                    >
                      رد
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {discussions.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد نقاشات حتى الآن</p>
              <p className="text-sm">كن أول من يبدأ النقاش حول هذا الدرس</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}