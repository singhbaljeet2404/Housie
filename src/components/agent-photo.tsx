import Image from "next/image";

export function AgentPhoto({ photo, name, size = 160 }: { photo?: string; name: string; size?: number }) {
  if (!photo) return null;
  return (
    <Image
      src={`/media/${photo}`}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className="rounded-full object-cover shadow-md"
      style={{ width: size, height: size }}
    />
  );
}
