"use client";

interface Props {
  chips: string[];
  onSelect: (chip: string) => void;
  disabled?: boolean;
}

export default function SuggestionChips({ chips, onSelect, disabled }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4">
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          disabled={disabled}
          className="shrink-0 px-4 py-2 rounded-full bg-white text-[#1A1A1A] text-xs font-medium border border-gray-100 hover:border-[#8DC63F] hover:text-[#8DC63F] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
