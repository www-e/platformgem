// src/components/admin/create-course-form/FormNavigation.tsx
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function FormNavigation({ 
  currentStep, 
  isLoading, 
  onPrevious, 
  onNext, 
  onSubmit 
}: FormNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
      >
        Previous
      </Button>

      <div className="flex gap-2">
        {currentStep < 4 ? (
          <Button onClick={onNext}>
            Next
          </Button>
        ) : (
          <Button onClick={onSubmit} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Creating...' : 'Create Course'}
          </Button>
        )}
      </div>
    </div>
  );
}