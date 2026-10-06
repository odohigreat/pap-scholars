import learningImage from "../public/images/courses/learning-styles.webp";
import financeImage from "../public/images/courses/financial-intelligence.webp";
import emotionalImage from "../public/images/courses/emotional-intelligence.webp";
import academicImage from "../public/images/courses/academic-excellence.webp";
import communicationImage from "../public/images/courses/effective-communication.webp";
import leadershipImage from "../public/images/courses/nation-building.webp";
import type { JournalArticle } from "../types/blog";

export const journalArticles: JournalArticle[] = [
  {
    slug: "understanding-your-learning-style",
    category: "Academic Excellence",
    title: "Understanding Your Learning Style",
    excerpt: "Notice how you approach a new idea, then build a study routine that helps you understand it more deeply.",
    date: "2026-10-01", image: learningImage,
    alt: "Student studying with a notebook, illustrated textbook, and headphones in a library",
    introduction: "Think about the last time a difficult idea finally made sense. Perhaps you drew a diagram, talked it through with a friend, or worked through an example. That moment offers a useful starting point for reflecting on how you study.",
    sections: [
      { heading: "Start with curiosity, rather than a label", paragraphs: [
        "You may prefer pictures, conversation, or hands-on activities. Treat these preferences as options to explore, rather than fixed categories that define what you can learn. Different subjects ask for different approaches.",
        "Instead of deciding that you are one kind of learner, ask what the topic needs. A map can clarify a geographical relationship; working through a problem can show you how a mathematical method works.",
      ] },
      { heading: "Try more than one way in", paragraphs: [
        "Choose a concept from your current studies. Read a short explanation, sketch its main relationships, and explain it aloud without looking at your notes. Notice which parts remain unclear.",
        "Then test your understanding with a question or a practical example. Feeling comfortable with a page of notes is different from being able to use the idea on your own.",
      ] },
      { heading: "Build a routine you can adjust", paragraphs: [
        "Keep a brief record of what you tried and what you could explain afterwards. A few sentences are enough. Over time, this gives you something more useful than a label: a collection of approaches you can choose from.",
        "Your next step can be small. In your next study session, replace ten minutes of rereading with a short explanation from memory, then check what you missed.",
      ] },
    ],
  },
  {
    slug: "building-financial-intelligence-early", category: "Financial Intelligence",
    title: "Building Financial Intelligence Early",
    excerpt: "Small, thoughtful habits can make everyday money decisions feel clearer and more intentional.",
    date: "2026-09-28", image: financeImage,
    alt: "Student reviewing a budget with a calculator and notebook",
    introduction: "Learning about money begins with everyday choices. Transport, lunch, mobile data, and a purchase you have been looking forward to all compete for the same limited resources. Paying attention to those choices is a practical place to start.",
    sections: [
      { heading: "Understand your everyday pattern", paragraphs: [
        "Write down what comes in and what goes out over a normal week. Include the small purchases you might otherwise forget. The purpose is to see your pattern clearly, without judging yourself.",
        "Look for costs that are essential, costs that are flexible, and costs that surprised you. Your circumstances will shape those categories; someone else's budget is unlikely to fit your life exactly.",
      ] },
      { heading: "Give a goal a clear purpose", paragraphs: [
        "A goal becomes easier to think about when it has a name. You might be planning for study materials, a project, or a future expense. Write down why it matters and what you need to learn about its cost.",
        "Consider the trade-offs before deciding. A smaller purchase today may delay something you value more, while an essential expense may need to come first. Thoughtful planning leaves room for real life.",
      ] },
      { heading: "Make asking questions a habit", paragraphs: [
        "Before agreeing to a financial product or offer, take time to understand the terms. Ask about fees, obligations, and anything you cannot explain in your own words. Avoid making a decision simply because someone is rushing you.",
        "This article is a starting point for financial literacy, rather than a recommendation for a particular product. Begin with awareness: review one week of spending and choose one question you want to understand better.",
      ] },
    ],
  },
  {
    slug: "why-emotional-intelligence-matters", category: "Personal Development",
    title: "Why Emotional Intelligence Matters",
    excerpt: "Self-awareness and empathy create room for more thoughtful conversations and stronger relationships.",
    date: "2026-09-24", image: emotionalImage,
    alt: "Two students listening to each other during a conversation on campus",
    introduction: "A group project rarely depends on knowledge alone. It also involves disappointment, competing priorities, and the challenge of working with people who see things differently. How you respond in those moments matters.",
    sections: [
      { heading: "Notice before you respond", paragraphs: [
        "When a conversation becomes difficult, pause long enough to name what you are feeling. Frustration, embarrassment, and uncertainty can look similar from the outside, but they may call for different responses.",
        "A pause does not mean ignoring the issue. It gives you time to choose words that explain your concern instead of making the disagreement larger.",
      ] },
      { heading: "Listen for the other person's meaning", paragraphs: [
        "Try summarising what you heard before offering your own view. A simple question such as 'Have I understood you correctly?' can reveal a misunderstanding early.",
        "Empathy does not require agreement. You can understand why someone feels strongly and still hold a different position. The aim is to make the conversation more accurate and respectful.",
      ] },
      { heading: "Put reflection into practice", paragraphs: [
        "After a challenging interaction, consider what helped and what you would do differently. Focus on actions you can change, rather than trying to control another person's feelings.",
        "In your next group discussion, try one deliberate pause and one clarifying question. Small choices can change the tone of a conversation.",
      ] },
    ],
  },
  {
    slug: "academic-habits-that-improve-performance", category: "Academic Excellence",
    title: "Academic Habits That Improve Performance",
    excerpt: "Move beyond last-minute revision with a study rhythm built around attention, practice, and reflection.",
    date: "2026-09-20", image: academicImage,
    alt: "Student concentrating on notes and an open textbook in a library",
    introduction: "A useful study routine does not need to be elaborate. It needs to help you begin, notice gaps in your understanding, and return to important ideas before they disappear from memory.",
    sections: [
      { heading: "Make the next task specific", paragraphs: [
        "'Study chemistry' is a large instruction. 'Explain today's reaction and complete three practice questions' gives you a clear starting point and a way to judge what you accomplished.",
        "Choose a realistic task for the time available. Leave space for reviewing mistakes; finishing a page is less useful if you have not understood why an answer works.",
      ] },
      { heading: "Practise without the answer in front of you", paragraphs: [
        "Close your notes and write what you remember about a topic. Try a question before looking at the worked solution. These moments show you where your understanding needs more attention.",
        "When you get something wrong, record the reason in a short sentence. Was it a missing concept, a misunderstood question, or an avoidable calculation error? Your next action should respond to that reason.",
      ] },
      { heading: "Return, review, and adjust", paragraphs: [
        "Plan a short return to important topics across the week. A routine should support your learning, rather than become another standard you feel you must meet perfectly.",
        "At the end of the week, ask which tasks helped you explain or solve something more independently. Keep those approaches, adjust what did not work, and set one concrete task for tomorrow.",
      ] },
    ],
  },
  {
    slug: "becoming-a-more-effective-communicator", category: "Communication",
    title: "Becoming a More Effective Communicator",
    excerpt: "Clear communication begins with a purpose, an attentive listener, and the willingness to check understanding.",
    date: "2026-09-16", image: communicationImage,
    alt: "Student presenting an idea to classmates during a group discussion",
    introduction: "Whether you are presenting in class or sending a message to a project team, communication works best when the other person can understand what matters and what should happen next.",
    sections: [
      { heading: "Know what you want to communicate", paragraphs: [
        "Before you begin, finish this sentence: 'After this conversation, I want the other person to understand…' That gives your message a centre.",
        "Lead with the main point, then provide the context that makes it useful. A short example often explains more than several abstract statements.",
      ] },
      { heading: "Make space for listening", paragraphs: [
        "A conversation is more than a well-prepared speech. Listen for questions, hesitation, or a different interpretation. Give the other person time to respond.",
        "If you are unsure, ask a focused question instead of guessing. Checking what someone means can prevent a long exchange built on the wrong assumption.",
      ] },
      { heading: "End with a clear next step", paragraphs: [
        "For a group task, agree on who will do what and when you will check in. For an explanation, invite the listener to describe the idea in their own words.",
        "Practise with one everyday message. Remove any detail that hides the main point, add the context the reader needs, and make the requested next step easy to find.",
      ] },
    ],
  },
  {
    slug: "the-role-of-young-people-in-nation-building", category: "Leadership",
    title: "The Role of Young People in Nation Building",
    excerpt: "Thoughtful leadership can begin close to home, through service, responsibility, and steady participation.",
    date: "2026-09-12", image: leadershipImage,
    alt: "Young volunteers working together on a community planting project",
    introduction: "Nation building can sound distant from student life. Yet the habits that support a stronger community often begin in familiar places: a classroom, a neighbourhood, or a team working toward a shared goal.",
    sections: [
      { heading: "Pay attention to the community around you", paragraphs: [
        "Start by listening. What do people in your community say they need? Which efforts already exist, and where could your time or skills be useful?",
        "A good contribution responds to a real need. Joining an existing effort can be more useful than starting something new without understanding the context.",
      ] },
      { heading: "Build trust through everyday responsibility", paragraphs: [
        "Keep the commitments you make, acknowledge mistakes, and treat other people's time with care. These actions may feel small, but they shape whether people can depend on you.",
        "Leadership also means sharing the work and recognising contributions. A project becomes stronger when its success belongs to the group, rather than one person.",
      ] },
      { heading: "Choose a manageable contribution", paragraphs: [
        "You might support a reading group, help organise a community activity, or share a skill with younger students. Choose something that fits your capacity and the priorities of the people involved.",
        "Ask a local group how you can help before making a plan. A thoughtful first step, followed by consistent effort, is a meaningful way to begin.",
      ] },
    ],
  },
];

export const featuredPosts = journalArticles.slice(0, 3);
export const getArticle = (slug: string) => journalArticles.find(article => article.slug === slug);
export function formatArticleDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date));
}
export function readingTime(article: JournalArticle) {
  const words = [article.introduction, ...article.sections.flatMap(section => [section.heading, ...section.paragraphs])].join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
