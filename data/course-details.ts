import { featuredCourses } from "./courses";

// Demo curriculum only. No enrolment, session, or lesson-player integration.
const curricula = {
  "financial-intelligence": {
    duration: "2 hours", overview: "Money skills start with everyday choices. Build a practical foundation for managing what you have, planning for what matters, and making informed decisions as a student.",
    outcomes: ["Create a realistic student budget", "Set savings goals and track your progress", "Distinguish needs from wants", "Recognise financial risks and make thoughtful choices"],
    modules: [
      { title: "Your relationship with money", lessons: ["Money habits and values", "Needs, wants, and priorities", "Setting financial goals", "Understanding income and expenses"] },
      { title: "Budgeting and saving", lessons: ["Tracking your spending", "Building a student budget", "Saving with intention", "Preparing for unexpected costs"] },
      { title: "Decisions for the future", lessons: ["Creating a budget that works", "Understanding borrowing", "Recognising financial risks", "Your personal money plan"] },
    ],
  },
  "learning-styles": {
    duration: "1 hour 30 minutes", overview: "There is more than one way to approach a learning task. Reflect on your preferences, experiment with evidence-informed study techniques, and build a flexible toolkit instead of limiting yourself to a single learning style.",
    outcomes: ["Reflect on your learning habits", "Choose strategies that suit the task", "Use retrieval practice and spaced revision", "Build and adjust a personal study routine"],
    modules: [
      { title: "Understand your approach", lessons: ["Reflecting on your study habits", "Preferences versus effective strategies", "Finding your study rhythm"] },
      { title: "Expand your toolkit", lessons: ["Making useful visual notes", "Learning through explanation", "Practising with examples", "Retrieval practice and spaced revision"] },
      { title: "Make learning work for you", lessons: ["Choosing a strategy for the task", "Designing your study routine", "Reflecting and adapting"] },
    ],
  },
  "academic-excellence": {
    duration: "1 hour 20 minutes", overview: "Academic growth is built through small, consistent actions. Turn your goals into a manageable plan and develop habits that help you prepare, participate, and revise with purpose.",
    outcomes: ["Set achievable academic goals", "Plan your time around priorities", "Take notes that support revision", "Prepare for assessments with confidence"],
    modules: [
      { title: "Build your foundation", lessons: ["Defining academic success", "Setting goals you can act on", "Planning your study week"] },
      { title: "Study with intention", lessons: ["Active reading and useful notes", "Revision that supports recall", "Preparing for assessments"] },
      { title: "Keep your momentum", lessons: ["Using feedback to improve", "Putting your study plan into practice"] },
    ],
  },
  "emotional-intelligence": {
    duration: "1 hour 30 minutes", overview: "Understanding your emotions can help you respond thoughtfully to everyday challenges. Explore self-awareness, empathy, and practical ways to build healthier relationships in your student life.",
    outcomes: ["Name and reflect on your emotions", "Recognise everyday emotional triggers", "Practise empathy and perspective-taking", "Respond thoughtfully during disagreements"],
    modules: [
      { title: "Know yourself", lessons: ["Understanding your emotions", "Recognising emotional triggers", "Developing self-awareness"] },
      { title: "Respond with intention", lessons: ["Pausing before reacting", "Managing everyday stress", "Building helpful habits"] },
      { title: "Connect with others", lessons: ["Practising empathy", "Seeing another perspective", "Navigating disagreements", "Your reflection plan"] },
    ],
  },
  "effective-communication": {
    duration: "1 hour 20 minutes", overview: "Clear communication brings ideas and people together. Practise expressing yourself, listening attentively, and adapting your message across classroom discussions, teamwork, and everyday conversations.",
    outcomes: ["Structure a clear message", "Listen actively and ask useful questions", "Give and receive constructive feedback", "Speak with greater confidence in a group"],
    modules: [
      { title: "Make your message clear", lessons: ["The purpose of communication", "Organising your ideas", "Choosing words with care"] },
      { title: "Listen and connect", lessons: ["Active listening", "Asking better questions", "Understanding nonverbal cues"] },
      { title: "Put it into practice", lessons: ["Giving and receiving feedback", "Speaking in a group", "Communicating through disagreement"] },
    ],
  },
  "nation-building": {
    duration: "1 hour 40 minutes", overview: "Strong communities grow through participation, responsibility, and shared purpose. Explore what citizenship means in everyday life and identify practical ways to contribute to your community.",
    outcomes: ["Explain the role of responsible citizenship", "Recognise shared values across differences", "Identify a need in your community", "Plan a small, meaningful community initiative"],
    modules: [
      { title: "Citizenship and shared values", lessons: ["What nation building means", "Rights and responsibilities", "Shared values and belonging"] },
      { title: "Leadership in everyday life", lessons: ["Leading through service", "Working across differences", "Making responsible choices"] },
      { title: "Contribute to your community", lessons: ["Identifying community needs", "Planning a small initiative", "Working with others", "Reflecting on your contribution"] },
    ],
  },
} satisfies Record<string, { duration: string; overview: string; outcomes: string[]; modules: { title: string; lessons: string[] }[] }>;

export const demoCourses = featuredCourses.map(course => {
  const curriculum = curricula[course.id as keyof typeof curricula];
  return { ...course, ...curriculum, lessonCount: curriculum.modules.reduce((total, module) => total + module.lessons.length, 0) };
});

export type DemoCourse = (typeof demoCourses)[number];
export function getDemoCourse(slug: string) {
  return demoCourses.find(course => course.id === slug);
}
