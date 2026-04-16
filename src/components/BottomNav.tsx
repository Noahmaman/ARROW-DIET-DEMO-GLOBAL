"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Camera, Calendar, BarChart2 } from "lucide-react";

const items = [
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/scan", icon: Camera, label: "Scanner" },
  { href: "/rdv", icon: Calendar, label: "RDV" },
  { href: "/rapport", icon: BarChart2, label: "Rapport" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-[60px]">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all ${
                active ? "text-[#8DC63F]" : "text-gray-400"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? "text-[#8DC63F]" : "text-gray-400"}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
