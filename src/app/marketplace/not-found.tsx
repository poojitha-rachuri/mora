export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
      <div className="text-5xl mb-3">🔍</div>
      <h2 className="text-lg font-medium">Product Not Found</h2>
      <p className="text-sm mt-1">This product may have been removed or never existed.</p>
    </div>
  );
}
