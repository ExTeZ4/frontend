// Два едва заметных размытых пятна (opacity 0.15), плавно плавающих по фону (см. globals.css)
export default function Nebula() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="nebula-blob nebula-a absolute -left-1/4 -top-1/4 h-[70vmax] w-[70vmax] rounded-full bg-brand-muted/15 blur-[100px]" />
      <div className="nebula-blob nebula-b absolute -bottom-1/4 -right-1/4 h-[60vmax] w-[60vmax] rounded-full bg-brand-gray/15 blur-[110px]" />
    </div>
  );
}
