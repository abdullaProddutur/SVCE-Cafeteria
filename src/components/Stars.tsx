"use client";

export default function Stars({
  value,
  onChange,
  size = "text-lg",
  readonly = false,
}: {
  value: number; // 0..5
  onChange?: (v: number) => void;
  size?: string;
  readonly?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={`${i <= value ? "text-blue-600" : "text-gray-300"} ${readonly ? "cursor-default" : ""}`}
          onClick={() => !readonly && onChange?.(i)}
          aria-label={`star-${i}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
