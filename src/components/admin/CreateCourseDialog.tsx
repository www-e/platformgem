// src/components/admin/CreateCourseDialog.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CreateCourseForm } from '@/app/admin/courses/_components/create-course-form';
import { PlusCircle } from 'lucide-react';

export default function CreateCourseDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة دورة جديدة
                </Button>
            </DialogTrigger>
            <DialogContent>
                <CreateCourseForm onFormSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}