interface QA {
  question: string;
  answer: string;
}

export default function CommonQuestions({ questions }: { questions: QA[] }) {
  if (!questions || questions.length === 0) {
    return <p className="text-sm text-slate-400">No common questions yet</p>;
  }
  return (
    <div className="space-y-3">
      {questions.map((qa, i) => (
        <div key={i} className="border-l-2 border-purple-200 pl-3">
          <p className="text-sm font-medium text-slate-800">Q: {qa.question}</p>
          <p className="text-sm text-slate-600 mt-1">A: {qa.answer}</p>
        </div>
      ))}
    </div>
  );
}
