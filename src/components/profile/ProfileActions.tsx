// src/components/profile/ProfileActions.tsx
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function ProfileActions() {
  return (
    <form action={async () => {
        "use server";
        await signOut({ redirect: true, callbackUrl: "/" });
    }}>
        <Button type="submit" variant="outline" className="w-full">
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
        </Button>
    </form>
  );
}