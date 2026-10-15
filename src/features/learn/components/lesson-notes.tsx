export function LessonNotes({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\s*\n/).filter(Boolean);
  return <div className="learning-note-copy">{blocks.map((block, index) => {
    const lines = block.split("\n");
    if (lines.every(line => /^\s*[-*]\s+/.test(line))) return <ul key={index}>{lines.map((line, lineIndex) => <li key={lineIndex}>{line.replace(/^\s*[-*]\s+/, "")}</li>)}</ul>;
    if (lines.every(line => /^\s*\d+[.)]\s+/.test(line))) return <ol key={index}>{lines.map((line, lineIndex) => <li key={lineIndex}>{line.replace(/^\s*\d+[.)]\s+/, "")}</li>)}</ol>;
    return <div key={index}>{lines.map((line, lineIndex) => /^#{1,6}\s+/.test(line) ? <h3 key={lineIndex}>{line.replace(/^#{1,6}\s+/, "")}</h3> : <p key={lineIndex}>{line}</p>)}</div>;
  })}</div>;
}
