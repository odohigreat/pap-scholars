import { HomepageScroll } from "@/components/animations/homepage-scroll";
import { Hero } from "@/features/home/components/hero";
import { LearningBenefits } from "@/features/home/components/learning-benefits";
import { Intro } from "@/features/home/components/intro";
import { FeaturedCourses } from "@/features/home/components/featured-courses";
import { FeaturedBlog } from "@/features/home/components/featured-blog";
import { FinalCta } from "@/features/home/components/final-cta";

export default function HomePage() {
  return (
    <>
      <HomepageScroll />
      <Hero />
      <LearningBenefits />
      <Intro />
      <FeaturedCourses />
      <FeaturedBlog />
      <FinalCta />
    </>
  );
}
