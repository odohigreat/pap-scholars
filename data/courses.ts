import type { FeaturedCourse } from "../types/course";
import image0 from "../public/images/courses/financial-intelligence.webp";
import image1 from "../public/images/courses/learning-styles.webp";
import image2 from "../public/images/courses/academic-excellence.webp";
import image3 from "../public/images/courses/emotional-intelligence.webp";
import image4 from "../public/images/courses/effective-communication.webp";
import image5 from "../public/images/courses/nation-building.webp";

// Initial catalogue with editable introductory copy; no enrolment data yet.
export const featuredCourses: readonly FeaturedCourse[] = [
  {
    id: "financial-intelligence",
    title: "Financial Intelligence",
    description: "Build a healthier relationship with money. Explore budgeting, saving, and thoughtful financial decisions.",
    category: "Personal finance",
    image: image0,
    imageAlt: "Student reviewing a budget with a calculator, notebook, and savings jar",
  },
  {
    id: "learning-styles",
    title: "Understanding and Utilizing Your Learning Styles",
    description: "Reflect on how you approach learning and explore study strategies you can adapt to different tasks.",
    category: "Learning strategies",
    image: image1,
    imageAlt: "Student studying with a textbook, visual notes, tablet, and headphones",
  },
  {
    id: "academic-excellence",
    title: "Academic Excellence Tips",
    description: "Bring more intention to your studies with practical approaches to planning, revision, and academic goals.",
    category: "Academic growth",
    image: image2,
    imageAlt: "Student preparing for academic work with textbooks, notebooks, and a study planner",
  },
  {
    id: "emotional-intelligence",
    title: "Emotional Intelligence",
    description: "Develop self-awareness, understand your emotions, and approach relationships with greater empathy.",
    category: "Personal development",
    image: image3,
    imageAlt: "Two students having a thoughtful conversation in a campus courtyard",
  },
  {
    id: "effective-communication",
    title: "Effective Communication",
    description: "Express your ideas clearly, listen with purpose, and build confidence in everyday conversations.",
    category: "Communication",
    image: image4,
    imageAlt: "Student explaining an idea to two attentive classmates during a discussion",
  },
  {
    id: "nation-building",
    title: "Nation Building",
    description: "Explore responsible citizenship, shared values, and the role you can play in strengthening your community.",
    category: "Citizenship & leadership",
    image: image5,
    imageAlt: "Young community volunteers working together to plant a tree near a school",
  },
];
