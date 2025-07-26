// src/hooks/useViewingHistory.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ViewingHistoryData {
  id: string;
  watchedDuration: number;
  totalDuration: number;
  lastPosition: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProgressUpdate {
  watchedDuration: number;
  totalDuration: number;
  lastPosition: number;
  completed: boolean;
}

export function useViewingHistory(lessonId: string) {
  const [viewingHistory, setViewingHistory] = useState<ViewingHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch viewing history
  const fetchViewingHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/lessons/${lessonId}/viewing-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في تحميل سجل المشاهدة');
      }

      const data = await response.json();
      setViewingHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      console.error('Error fetching viewing history:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  // Update viewing history
  const updateViewingHistory = useCallback(async (progressData: ProgressUpdate) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/viewing-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حفظ التقدم');
      }

      const updatedData = await response.json();
      setViewingHistory(updatedData);

      // Show completion toast if lesson was just completed
      if (progressData.completed && (!viewingHistory?.completed)) {
        toast.success('🎉 تم إكمال الدرس بنجاح!');
      }

      return updatedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في حفظ التقدم';
      console.error('Error updating viewing history:', err);
      
      // Don't show error toast for background updates to avoid spam
      // toast.error(errorMessage);
      
      throw err;
    }
  }, [lessonId, viewingHistory?.completed]);

  // Batch update function to avoid too many API calls
  const batchUpdateViewingHistory = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      let pendingUpdate: ProgressUpdate | null = null;

      return (progressData: ProgressUpdate) => {
        pendingUpdate = progressData;
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (pendingUpdate) {
            updateViewingHistory(pendingUpdate).catch(() => {
              // Error already handled in updateViewingHistory
            });
            pendingUpdate = null;
          }
        }, 2000); // Batch updates every 2 seconds
      };
    })(),
    [updateViewingHistory]
  );

  // Load viewing history on mount
  useEffect(() => {
    if (lessonId) {
      fetchViewingHistory();
    }
  }, [lessonId, fetchViewingHistory]);

  return {
    viewingHistory,
    loading,
    error,
    updateViewingHistory,
    batchUpdateViewingHistory,
    refetch: fetchViewingHistory
  };
}