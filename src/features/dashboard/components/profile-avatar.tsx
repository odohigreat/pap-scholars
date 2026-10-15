"use client";

import Image from "next/image";
import { useState } from "react";

export function ProfileAvatar({ src, size, alt, className = "" }: { src: string | null; size: number; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return <Image unoptimized src={src && src !== failedSrc ? src : "/images/branding/default-avatar.svg"} alt={alt} width={size} height={size} onError={() => setFailedSrc(src)} className={`rounded-full object-cover ${className}`} />;
}
