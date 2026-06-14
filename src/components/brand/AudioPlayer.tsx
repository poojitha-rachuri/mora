"use client";
export default function AudioPlayer({ url }: { url?: string }) {
  if (!url) return <p className="text-xs text-slate-400">No recording available</p>;
  return (
    <audio controls className="w-full h-8 mt-2" src={url}>
      Your browser does not support audio playback.
    </audio>
  );
}
