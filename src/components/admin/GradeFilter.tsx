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
                <SelectValue placeholder="فلترة حسب المرحلة" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">كل المراحل</SelectItem>
                <SelectItem value="FIRST_YEAR">الصف الأول الثانوي</SelectItem>
                <SelectItem value="SECOND_YEAR">الصف الثاني الثانوي</SelectItem>
                <SelectItem value="THIRD_YEAR">الصف الثالث الثانوي</SelectItem>
            </SelectContent>
        </Select>
    );
}