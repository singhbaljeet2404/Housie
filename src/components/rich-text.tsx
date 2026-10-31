// Renders admin-edited plain text: blank lines separate blocks, "## " starts a
// heading and lines starting with "- " form a bullet list. No HTML is interpreted.
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return <h2 key={i} className="mt-8 text-xl font-semibold text-slate-900">{block.slice(3)}</h2>;
        }
        const lines = block.split("\n");
        if (lines.every((l) => l.trimStart().startsWith("- "))) {
          return (
            <ul key={i} className="mt-3 list-disc space-y-1 pl-6">
              {lines.map((l, j) => <li key={j}>{l.trimStart().slice(2)}</li>)}
            </ul>
          );
        }
        return <p key={i} className="mt-3 whitespace-pre-line">{block}</p>;
      })}
    </div>
  );
}
