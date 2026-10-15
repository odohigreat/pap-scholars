import type { StaticImageData } from "next/image";

export const journalCategories = [
  "Academic Excellence", "Personal Development", "Financial Intelligence",
  "Leadership", "Communication",
] as const;

export type JournalCategory = (typeof journalCategories)[number];
export type ArticleSection = { heading: string; paragraphs: string[] };
export type JournalArticle = {
  slug: string;
  title: string;
  category: JournalCategory;
  excerpt: string;
  date: string;
  image: StaticImageData;
  alt: string;
  introduction: string;
  sections: ArticleSection[];
};
