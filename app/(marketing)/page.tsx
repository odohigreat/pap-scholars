import { HomepageScroll } from "../../components/animations/homepage-scroll";
import { Hero } from "../../components/home/hero";
import { Intro } from "../../components/home/intro";
import { FeaturedCourses } from "../../components/home/featured-courses";
import { FeaturedBlog } from "../../components/home/featured-blog";
import { FinalCta } from "../../components/home/final-cta";

export default function HomePage() {
  return (
    <>
      <HomepageScroll />
      <Hero />
      <Intro />
      <FeaturedCourses />
      {/* <WhyPapScholars /> */}
      {/* <HowLearningWorks /> */}
      <FeaturedBlog />
      <FinalCta />
    </>
  );
}
