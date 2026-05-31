import { useState } from 'react';
import { Bot, Send, Lightbulb, TrendingUp, Dumbbell, Apple } from 'lucide-react';
import { getAIAnswer } from '../utils/aiAssistance';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

export default function AIAssistant({ profile }: Props) {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    const answer = getAIAnswer(question, profile);
    setAnswers(prev => [...prev, `Q: ${question}`, `A: ${answer}`]);
    setQuestion('');
    setIsLoading(false);
  };

  const quickQuestions = [
    { icon: <Dumbbell className="w-4 h-4" />, q: 'What workout should I do today?' },
    { icon: <Apple className="w-4 h-4" />, q: 'How many calories should I eat?' },
    { icon: <TrendingUp className="w-4 h-4" />, q: 'Am I making progress?' },
    { icon: <Lightbulb className="w-4 h-4" />, q: 'How much protein do I need?' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-light" />
        </div>
        <div>
          <h3 className="font-semibold">AI Fitness Assistant</h3>
          <p className="text-xs text-dark-text">Ask anything about your fitness journey</p>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="mb-4">
        <p className="text-xs text-dark-text mb-2">Quick Questions:</p>
        <div className="space-y-2">
          {quickQuestions.map((item, i) => (
            <button
              key={i}
              onClick={() => setQuestion(item.q)}
              className="w-full text-left p-2.5 rounded-lg bg-dark/40 hover:bg-dark-border/50 transition-colors text-sm flex items-start gap-2"
            >
              {item.icon}
              <span>{item.q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat History */}
      <div className="max-h-60 overflow-y-auto mb-4 space-y-2 text-sm">
        {answers.length > 0 &&
          answers.map((a, i) => (
            <div key={i} className={a.startsWith('Q:') ? 'text-right' : 'text-left'}>
              <p className={a.startsWith('Q:') ? 'text-dark-text-light' : 'text-dark-text'}>
                {a.replace(/^Q: |^A: /g, '')}
              </p>
            </div>
          ))}
        {answers.length === 0 && (
          <p className="text-center text-dark-text py-4">
            Ask me anything about your fitness plan, nutrition, or workouts!
          </p>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && askAI()}
          placeholder="Ask me anything..."
          className="flex-1 px-3 py-2 bg-dark border border-dark-border rounded-lg text-sm focus:outline-none focus:border-primary"
        />
        <button
          onClick={askAI}
          disabled={isLoading || !question.trim()}
          className="px-3 py-2 rounded-lg gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? '...' : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setQuestion('What workout should I do today?')}
          className="flex-1 text-xs px-2 py-1.5 rounded bg-dark/40 text-dark-text hover:text-dark-text-light"
        >
          💪 Workout Ideas
        </button>
        <button
          onClick={() => setQuestion('How many calories should I eat to lose weight?')}
          className="flex-1 text-xs px-2 py-1.5 rounded bg-dark/40 text-dark-text hover:text-dark-text-light"
        >
          🔥 Calories
        </button>
      </div>
    </div>
  );
}