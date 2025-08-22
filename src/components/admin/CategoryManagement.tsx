// src/components/admin/CategoryManagement.tsx
"use client";

import { useState } from "react";
import { CategoryDialog } from "./CategoryDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import { deleteCategory } from "@/lib/actions/category.actions";
import { Category } from "@/lib/api/categories";
import { toast } from "sonner";

interface CategoryWithStats extends Category {
  _count: {
    courses: number;
  };
  totalEnrollments: number;
}

interface CategoryManagementProps {
  categories: CategoryWithStats[];
}

export function CategoryManagement({
  categories: initialCategories,
}: CategoryManagementProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "name" | "courses" | "enrollments" | "created"
  >("created");

  // Filter and sort categories
  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name, "ar");
        case "courses":
          return b._count.courses - a._count.courses;
        case "enrollments":
          return b.totalEnrollments - a.totalEnrollments;
        case "created":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const handleDelete = async (categoryId: string) => {
    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        toast.success(result.success);
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the category");
    }
  };

  const refreshCategories = () => {
    // In a real app, you'd refetch from the server
    // For now, we'll just trigger a page refresh
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: "name" | "courses" | "enrollments" | "created") => setSortBy(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Most Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="courses">Course Count</SelectItem>
            <SelectItem value="enrollments">Enrollments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No results found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <CategoryDialog
                      category={category}
                      onSuccess={refreshCategories}
                      trigger={
                        <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e: Event) => e.preventDefault()}
                          className="text-destructive focus:text-destructive"
                          disabled={category._count.courses > 0}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete category &ldquo;{category.name}&rdquo;? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status and Slug */}
              <div className="flex items-center gap-2">
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <LinkIcon className="w-3 h-3 mr-1" />
                  {category.slug}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>Courses</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {category._count.courses}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Enrollments</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {category.totalEnrollments}
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="w-3 h-3 mr-1" />
                Created:{" "}
                {new Date(category.createdAt).toLocaleDateString("en-US")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
