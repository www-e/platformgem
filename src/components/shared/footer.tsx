// src/components/shared/footer.tsx
import Link from "next/link";
import { Button } from "../ui/button";
import { Copyright } from "lucide-react";

// Custom inline SVG for the WhatsApp icon for a cleaner implementation
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.001-1.04 3.837 3.837-1.039zm7.948-9.532c-.272 0-.544.101-.75.312l-.986.985c-.166.166-.36.208-.538.163-.178-.046-1.157-.454-2.21-1.49-.934-.91-1.558-2.022-1.698-2.292-.14-.272-.104-.447.042-.593l.639-.737c.14-.162.24-.37.24-.593s-.1-.431-.24-.593l-1.581-1.581c-.164-.164-.37-.25-.593-.25-.225 0-.431.086-.594.25l-.833.833c-.163.163-.25.37-.25.593s.086.431.25.593c.383.383 1.045 1.719 2.508 3.183s2.8.2505 3.184 2.508c.163.163.37.25.593.25.224 0 .431-.086.593-.25l.833-.833c.164-.164.25-.37.25-.593s-.086-.431-.25-.593l-1.581-1.581c-.162-.146-.37-.22-.593-.22z" />
  </svg>
);

export default function Footer() {
  // IMPORTANT: Please replace "YOUR_NUMBER" with your actual WhatsApp number including country code.
  const whatsappUrl = "https://wa.me/201154688628";

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          
          {/* Column 1: Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start">
              <h3 className="text-lg font-bold text-foreground">EduPlatform</h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                <Copyright className="w-4 h-4" />
                <span>{new Date().getFullYear()} جميع الحقوق محفوظة.</span>
              </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start">
             <h3 className="text-lg font-bold text-foreground">روابط سريعة</h3>
             <nav className="flex flex-col gap-2 mt-2 text-muted-foreground">
                <Link href="/#features" className="hover:text-primary transition-colors">الميزات</Link>
                <Link href="/#instructor" className="hover:text-primary transition-colors">عن المعلم</Link>
                {/* We will add the FAQ link later when the component is created */}
                {/* <Link href="/#faq" className="hover:text-primary transition-colors">الأسئلة الشائعة</Link> */}
             </nav>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold text-foreground">تواصل معنا</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              لديك استفسار؟ تواصل مع أ/عمر مباشرة عبر واتساب.
            </p>
            <Button asChild className="bg-green-500 hover:bg-green-600 text-white rounded-full btn-hover-effect px-6 py-3">
              <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="ml-2 h-5 w-5" />
                عمر
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </footer>
  );
}