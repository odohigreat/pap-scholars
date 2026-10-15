"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { submitAssessment } from "@/features/assessments/actions";
import { AssessmentRefresh } from "@/features/assessments/components/assessment-refresh";
import type { CourseAssessment, AssessmentResult, AssessmentState } from "@/features/assessments/types";

function Result({ result, bestScore, onRetry }: { result: AssessmentResult; bestScore: number | null; onRetry: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className="assessment-results">
    <div className={`assessment-score-card ${result.passed ? "is-passed" : ""}`}>
      <div className="assessment-score-ring" style={{ background: `conic-gradient(${result.passed ? "#326e60" : "#2456a6"} ${result.score}%, #e0e8f2 0)` }}><span><strong>{result.score}%</strong><small>Your score</small></span></div>
      <div><p className="learning-eyebrow">ASSESSMENT RESULT</p><h2 ref={heading} tabIndex={-1}>{result.passed ? "Well done. You passed!" : "Keep learning. Try again."}</h2><p>{result.correct} of {result.total} answers correct · Pass mark: {result.passMark}%</p><p>Best score: {Math.max(bestScore ?? 0, result.score)}% · Saved to your account</p></div>
    </div>
    <div className="assessment-result-actions"><Link href="/dashboard#my-courses" className="learning-button learning-primary">Back to my courses</Link><button type="button" onClick={onRetry} className="learning-previous-button">Retake assessment</button></div>
    <div className="assessment-review-heading"><h3>Review your answers</h3><p>Use the explanations to see what went well and what to revisit.</p></div>
    {result.review.map((question, index) => {
      const correct = question.selectedIndex === question.correctIndex;
      return <article key={question.id} className="assessment-review-item"><div className="assessment-question-meta"><span>Question {index + 1}</span><span className={correct ? "assessment-correct" : "assessment-incorrect"}>{correct ? "✓ Correct" : "Review this answer"}</span></div><h3>{question.prompt}</h3><p>Your answer: <strong>{question.options[question.selectedIndex]}</strong></p>{!correct && <p>Correct answer: <strong>{question.options[question.correctIndex]}</strong></p>}<div className="assessment-explanation">{question.explanation}</div></article>;
    })}
  </section>;
}

function AssessmentForm({ courseId, assessment, onResult }: { courseId: string; assessment: CourseAssessment; onResult: (result: AssessmentResult) => void }) {
  const [state, action, pending] = useActionState(submitAssessment.bind(null, courseId), { error: "", result: null } as AssessmentState);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answered = Object.keys(answers).length;
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (state.result) onResult(state.result); }, [state.result, onResult]);
  useEffect(() => { if (state.error) errorRef.current?.focus(); }, [state]);
  return <form action={action} className="assessment-form" aria-busy={pending}>
    <input type="hidden" name="revision" value={assessment.revision} />
    <div className="assessment-answer-progress"><div><strong>{answered} of {assessment.questions.length} answered</strong><span>No time limit</span></div><progress max={assessment.questions.length} value={answered} aria-label="Questions answered" /></div>
    <fieldset disabled={pending}>
      <legend className="sr-only">Course assessment questions</legend>
      {assessment.questions.map((question, index) => <fieldset key={question.id} className="assessment-question"><legend><span className="assessment-question-number">QUESTION {String(index + 1).padStart(2, "0")}</span><span className="assessment-question-title">{question.prompt}</span></legend><div className="assessment-options">{question.options.map((option, optionIndex) => <label key={optionIndex} className={`assessment-option ${answers[question.id] === String(optionIndex) ? "is-selected" : ""}`}><input type="radio" name={`question-${question.id}`} value={optionIndex} required checked={answers[question.id] === String(optionIndex)} onChange={event => setAnswers(current => ({ ...current, [question.id]: event.target.value }))} /><span className="assessment-option-letter" aria-hidden="true">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span></label>)}</div></fieldset>)}
      {state.error && <p ref={errorRef} tabIndex={-1} role="alert" className="learning-error">{state.error}</p>}
      <div className="assessment-submit"><p>Your score and answer explanations appear after submission.</p><button type="submit" disabled={pending || answered !== assessment.questions.length} className="learning-button learning-primary">{pending ? "Grading & saving…" : "Submit assessment →"}</button></div>
    </fieldset>
  </form>;
}

export function CourseAssessmentView({ courseId, assessment }: { courseId: string; assessment: CourseAssessment }) {
  const [result, setResult] = useState(assessment.latestResult);
  const [bestScore, setBestScore] = useState(assessment.bestScore);
  const heading = useRef<HTMLHeadingElement>(null);
  function retry() {
    if (result) setBestScore(Math.max(bestScore ?? 0, result.score));
    setResult(null);
    requestAnimationFrame(() => heading.current?.focus());
  }
  if (assessment.needsReview) {
    const saved = assessment.latestResult ?? assessment.previousResult;
    return <section className="assessment-empty"><p className="learning-eyebrow">CONTENT REVIEW</p><h2>Assessment awaiting review</h2><p>The questions need to be reviewed and published before this assessment opens. You can continue reviewing your lessons in the meantime.</p>{saved && <p>Your previous result is safe: {saved.score}% ({saved.correct} of {saved.total} correct).</p>}<div className="assessment-result-actions"><AssessmentRefresh /><Link href="/dashboard#my-courses" className="learning-previous-button">Back to my courses</Link></div></section>;
  }
  return <>
    {assessment.previousResult && !result && <p className="assessment-version-note">This is an updated assessment. Your previous score of {assessment.previousResult.score}% is saved separately.</p>}
    {!result && <div className="assessment-intro"><p className="learning-eyebrow">PUT YOUR LEARNING INTO PRACTICE</p><h2 ref={heading} tabIndex={-1}>A final check of what you’ve learned.</h2><p>Answer {assessment.questions.length} questions about this course. Score {assessment.passMark}% or higher to pass. You can review your answers and retake the assessment.</p><div className="assessment-facts"><span>{assessment.questions.length} questions</span><span>Pass mark {assessment.passMark}%</span><span>Unlimited retries</span>{bestScore !== null && <span>Best score {bestScore}%</span>}</div></div>}
    {result ? <Result result={result} bestScore={bestScore} onRetry={retry} /> : <AssessmentForm courseId={courseId} assessment={assessment} onResult={setResult} />}
  </>;
}
