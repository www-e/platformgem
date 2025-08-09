// src/components/admin/ModernFilters.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Filter,
  X,
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  RotateCcw,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAdminDate } from "@/lib/date-utils";

export interface FilterOption {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange" | "multiSelect";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: any;
}

interface ModernFiltersProps {
  filters: FilterOption[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onReset?: () => void;
  onExport?: () => void;
  className?: string;
  showExport?: boolean;
  isLoading?: boolean;
}

export function ModernFilters({
  filters,
  values,
  onChange,
  onReset,
  onExport,
  className,
  showExport = false,
  isLoading = false,
}: ModernFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(values.search || "");

  const activeFiltersCount = Object.values(values).filter(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    handleFilterChange("search", value);
  };

  const clearFilter = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
    if (key === "search") {
      setSearchQuery("");
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    onChange({});
    onReset?.();
  };

  const renderFilterInput = (filter: FilterOption) => {
    const value = values[filter.key];

    switch (filter.type) {
      case "text":
        return (
          <Input
            placeholder={filter.placeholder}
            value={value || ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="h-9"
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(val) => handleFilterChange(filter.key, val)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? formatAdminDate(new Date(value)) : filter.placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date: Date | undefined) =>
                  handleFilterChange(filter.key, date?.toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "multiSelect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <Select
              onValueChange={(val) => {
                const newValues = selectedValues.includes(val)
                  ? selectedValues.filter((v) => v !== val)
                  : [...selectedValues, val];
                handleFilterChange(filter.key, newValues);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-4 h-4 border rounded",
                          selectedValues.includes(option.value) &&
                            "bg-primary border-primary"
                        )}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((val) => {
                  const option = filter.options?.find(
                    (opt) => opt.value === val
                  );
                  return (
                    <Badge key={val} variant="secondary" className="text-xs">
                      {option?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => {
                          const newValues = selectedValues.filter(
                            (v) => v !== val
                          );
                          handleFilterChange(filter.key, newValues);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "border-0 shadow-sm bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Search Bar and Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 bg-background/50"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => handleSearchChange("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-10 px-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            فلترة
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 ml-2 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-10 px-3"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              إعادة تعيين
            </Button>
          )}

          {showExport && (
            <Button
              variant="outline"
              onClick={onExport}
              disabled={isLoading}
              className="h-10 px-4"
            >
              <Download className="w-4 h-4 mr-2" />
              تصدير
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(values)
              .filter(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0))
                  return false;
                const filter = filters.find((f) => f.key === key);
                return filter && key !== "search";
              })
              .map(([key, value]) => {
                const filter = filters.find((f) => f.key === key);
                if (!filter) return null;

                let displayValue = value;
                if (filter.type === "select" || filter.type === "multiSelect") {
                  if (Array.isArray(value)) {
                    displayValue = value
                      .map(
                        (v) =>
                          filter.options?.find((opt) => opt.value === v)
                            ?.label || v
                      )
                      .join(", ");
                  } else {
                    displayValue =
                      filter.options?.find((opt) => opt.value === value)
                        ?.label || value;
                  }
                } else if (filter.type === "date") {
                  displayValue = formatAdminDate(new Date(value));
                }

                return (
                  <Badge key={key} variant="secondary" className="gap-1">
                    <span className="text-xs font-medium">{filter.label}:</span>
                    <span className="text-xs">{displayValue}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => clearFilter(key)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                );
              })}
          </div>
        )}

        {/* Expanded Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {filter.label}
                    </Label>
                    {renderFilterInput(filter)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
