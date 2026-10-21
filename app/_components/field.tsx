"use client";

import { useId } from "react";

/* 16 px on a phone: anything smaller makes iOS zoom the page on focus. */
export const inputCls =
  "w-full rounded-xl border border-forest/15 bg-cream-soft px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink/55 focus:border-forest sm:text-sm";

/**
 * A labelled control.
 *
 * The label also gets an id, so a control that is not a native form element —
 * a button that opens a picker — can still be named by it with
 * `aria-labelledby`.
 */
export function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string | null;
  children: (id: string, labelId: string) => React.ReactElement;
}) {
  const id = useId();
  const labelId = `${id}-label`;

  return (
    <div>
      <label id={labelId} htmlFor={id} className="mb-2 flex justify-between text-xs font-medium text-forest/80">
        {label}
        {optional && <span className="font-normal text-ink/65">Facultatif</span>}
      </label>
      <div className={error ? "[&_input]:border-[#b4533a] [&_select]:border-[#b4533a]" : ""}>{children(id, labelId)}</div>
      {error && <p className="mt-1.5 text-xs text-[#b4533a]">{error}</p>}
    </div>
  );
}
