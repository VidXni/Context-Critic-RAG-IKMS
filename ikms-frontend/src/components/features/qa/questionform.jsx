import { useState } from 'react';
import { Button } from '../../common/Button';
import { Send, Sparkles, Info } from 'lucide-react';

export const QuestionForm = ({ onSubmit, loading, useCritic, onToggleCritic }) => {
  const [question, setQuestion] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
      setQuestion('');
    }
  };

  return (
    <form onSubmit = {handleSubmit} className = "space-y-4">
      <div>
        <textarea
          value       = {question}
          onChange    = {(e) => setQuestion(e.target.value)}
          placeholder = "Ask your question here..."
          className   = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          rows        = {4}
          disabled    = {loading}
        />
      </div>

      {/* Context Critic Toggle */}
      <div className = "space-y-2">
      <div className = "flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
      <div className = "flex items-center gap-3">
      <div className = "p-2 bg-white rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">Context Critic Agent</p>
                <button
                  type="button"
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600">
                {useCritic 
                  ? 'Filtering and ranking chunks for better accuracy' 
                  : 'Using all retrieved chunks without filtering'}
              </p>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-slide-down">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">How Context Critic Works:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>Analyzes</strong> each retrieved chunk for relevance</li>
              <li>• <strong>Filters</strong> irrelevant or noisy chunks</li>
              <li>• <strong>Ranks</strong> remaining chunks by importance</li>
              <li>• <strong>Improves</strong> answer quality by reducing noise</li>
              <li>• <strong>Shows</strong> which chunks were kept and why</li>
            </ul>
          </div>
        )}
      </div>

      <Button type="submit" loading={loading} className="w-full" disabled={!question.trim()}>
        <Send className="w-4 h-4" />
        {loading ? 'Processing...' : 'Ask Question'}
      </Button>
    </form>
  );
};