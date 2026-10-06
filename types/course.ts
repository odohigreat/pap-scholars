import type { StaticImageData } from "next/image";

export interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  image: StaticImageData;
  imageAlt: string;
}
