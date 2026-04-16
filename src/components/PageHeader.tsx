"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, back = true, right }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#DFFFA0] shrink-0">
      <div className="w-8">
        {back && (
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 transition-colors"
          >
            <ChevronLeft size={18} className="text-[#1A1A1A]" />
          </button>
        )}
      </div>
      <h1 className="text-base font-semibold text-[#1A1A1A]">{title}</h1>
      <div className="w-8 flex justify-end">{right}</div>
    </div>
  );
}
