// src/components/course/course-catalog/CatalogFilters.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import { SORT_OPTIONS, PRICE_RANGE_OPTIONS } from '@/lib/catalog-utils';
import type { Category } from '@/hooks/useCourseCatalog';

interface CatalogFiltersProps {
  searchTerm: string;
  categoryFilter: string;
  priceRangeFilter: string;
  levelFilter: string;
  sortFilter: string;
  categories: Category[];
  viewMode: 'grid' | 'list';
  onSearch: (value: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function CatalogFilters({
  searchTerm,
  categoryFilter,
  priceRangeFilter,
  levelFilter,
  sortFilter,
  categories,
  viewMode,
  onSearch,
  onFilterChange,
  onViewModeChange
}: CatalogFiltersProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            البحث والتصفية
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الدورات..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value) => onFilterChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range Filter */}
          <Select value={priceRangeFilter} onValueChange={(value) => onFilterChange('priceRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="السعر" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select value={sortFilter} onValueChange={(value) => onFilterChange('sort', value)}>
            <SelectTrigger>
              <SelectValue placeholder="الترتيب" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}