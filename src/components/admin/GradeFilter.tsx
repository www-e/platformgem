// src/components/admin/GradeFilter.tsx
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export default function GradeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentGrade = searchParams.get('grade') || 'ALL';

    const handleValueChange = (grade: string) => {
        const params = new URLSearchParams(searchParams);
        if (grade && grade !== 'ALL') {
            params.set('grade', grade);
        } else {
            params.delete('grade');
        }
        params.set("page", "1"); // Reset to page 1 for any new filter
        router.push(`?${params.toString()}`);
    };

    return (
        <Select onValueChange={handleValueChange} defaultValue={currentGrade}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Grade" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">All Grades</SelectItem>
                <SelectItem value="FIRST_YEAR">First Year Secondary</SelectItem>
                <SelectItem value="SECOND_YEAR">Second Year Secondary</SelectItem>
                <SelectItem value="THIRD_YEAR">Third Year Secondary</SelectItem>
            </SelectContent>
        </Select>
    );
}