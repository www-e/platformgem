// src/app/(student)/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">
            مرحباً، {session.user?.name}
          </h1>
          <p className="text-gray-300 text-xl">
            أهلاً بك في لوحة التحكم الخاصة بك
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-lg mb-2">دوراتي</h3>
              <p className="text-gray-400">عرض جميع الدورات المسجل بها</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-lg mb-2">التقدم</h3>
              <p className="text-gray-400">متابعة تقدمك في التعلم</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-lg mb-2">الامتحانات</h3>
              <p className="text-gray-400">نتائج الامتحانات والدرجات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
