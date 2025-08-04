// src/lib/actions/types.ts

export interface ActionState {
    error?: string;
    success?: string;
  }
  
  export interface ToggleLessonCompleteResult {
    error?: string;
    success?: string;
    nextLessonId?: string | null;
  }