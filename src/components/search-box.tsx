"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Suggestion } from "@/lib/listings/types";

export function SearchBox({
  placeholder = "Search by city, neighbourhood, address or MLS® #",
  onSelect,
  className = "",
}: {
  placeholder?: string;
  // When provided (e.g. on the map page), place selections are handled locally instead of navigating.
  onSelect?: (suggestion: Suggestion) => void;
  className?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = text.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data: { suggestions: Suggestion[] }) => {
          setSuggestions(data.suggestions);
          setActive(-1);
          setOpen(true);
        })
        .catch(() => {});
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const choose = (s: Suggestion) => {
    setOpen(false);
    setText(s.label);
    if (onSelect && s.kind === "city") onSelect(s);
    else router.push(s.href);
  };

  const visible = open && text.trim().length >= 2 && suggestions.length > 0;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <input
        type="search"
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Search listings"
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!visible) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(suggestions[Math.max(active, 0)]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      {visible && (
        <ul id={listId} role="listbox" className="absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={`${s.kind}-${s.href}-${s.label}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-4 py-2 ${i === active ? "bg-brand-50" : ""}`}
            >
              <p className="text-sm font-medium text-slate-900">{s.label}</p>
              {s.sublabel && <p className="text-xs text-slate-500">{s.sublabel}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
