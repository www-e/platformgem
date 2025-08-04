// src/components/admin/create-course-form/FormStepsIndicator.tsx
import { Progress } from '@/components/ui/progress';
import { FORM_STEPS, calculateProgress } from '@/lib/course-form-utils';

interface FormStepsIndicatorProps {
  currentStep: number;
}

export function FormStepsIndicator({ currentStep }: FormStepsIndicatorProps) {
  return (
    <div className="space-y-6">
      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-8">
        {FORM_STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground text-muted-foreground'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div className="mr-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.title}
              </p>
            </div>
            {index < FORM_STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <Progress value={calculateProgress(currentStep)} className="mb-6" />
    </div>
  );
}