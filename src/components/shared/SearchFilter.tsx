// src/components/shared/SearchFilter.tsx
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  /**
   * Current search value
   */
  value: string;
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Show search icon
   * @default true
   */
  showIcon?: boolean;
}

export function SearchFilter({
  value,
  onChange,
  placeholder = 'البحث...',
  className = '',
  showIcon = true
}: SearchFilterProps) {
  return (
    <div className={`relative ${className}`}>
      {showIcon && (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={showIcon ? 'pl-10' : ''}
      />
    </div>
  );
}