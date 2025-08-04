// src/components/admin/CreateCourseForm.tsx
"use client";

import { useCreateCourseForm } from '@/hooks/useCreateCourseForm';
import { FormStepsIndicator } from './create-course-form/FormStepsIndicator';
import { BasicInfoStep } from './create-course-form/BasicInfoStep';
import { TeachingSettingsStep } from './create-course-form/TeachingSettingsStep';
import { ImageContentStep } from './create-course-form/ImageContentStep';
import { ReviewPublishStep } from './create-course-form/ReviewPublishStep';
import { FormNavigation } from './create-course-form/FormNavigation';

export function CreateCourseForm() {
  const {
    formData,
    categories,
    professors,
    isLoading,
    currentStep,
    handleInputChange,
    handleThumbnailUpload,
    handleNext,
    handlePrevious,
    handleSubmit
  } = useCreateCourseForm();

  return (
    <div className="space-y-6">
      <FormStepsIndicator currentStep={currentStep} />

      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <BasicInfoStep
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
          />
        )}

        {currentStep === 2 && (
          <TeachingSettingsStep
            formData={formData}
            professors={professors}
            onInputChange={handleInputChange}
          />
        )}

        {currentStep === 3 && (
          <ImageContentStep
            formData={formData}
            onThumbnailUpload={handleThumbnailUpload}
          />
        )}

        {currentStep === 4 && (
          <ReviewPublishStep
            formData={formData}
            categories={categories}
            professors={professors}
            onInputChange={handleInputChange}
          />
        )}
      </div>

      <FormNavigation
        currentStep={currentStep}
        isLoading={isLoading}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
}