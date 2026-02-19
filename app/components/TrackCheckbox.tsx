"use client";

type Props = {
  checked: boolean;
  onChange: () => void;
};

export default function TrackCheckbox({ checked, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`
        w-4 h-4 rounded-full border flex items-center justify-center
        transition-colors duration-150
        ${
          checked
            ? "bg-green-500 border-green-500"
            : "border-white/40 hover:border-white"
        }
      `}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
    </button>
  );
}
