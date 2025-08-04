// src/components/shared/SelectFilter.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  /**
   * Current selected value
   */
  value: string;
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  /**
   * Available options
   */
  options: SelectOption[];
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Full width
   * @default false
   */
  fullWidth?: boolean;
}

export function SelectFilter({
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  className = '',
  fullWidth = false
}: SelectFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${fullWidth ? 'w-full' : 'w-48'} ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}