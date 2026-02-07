import { Card } from '../../common/card';
import { CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import { ChunkRelevanceDisplay } from './chunkrelevancedisplay';
import { ContextComparison } from './contextcomparison';

export const AnswerDisplay = ({ answer, originalContext }) => {
  if (!answer) return null;

  const hasContextCritic = answer.chunk_relevance_scores && answer.chunk_relevance_scores.length > 0;

  return (
    <div className = "space-y-4">
      {/* Answers Grid - Final and Draft Side by Side */}
      <div className = "grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Answer - Show First - Highlighted */}
        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-4 border-green-500 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 shadow-lg ring-4 ring-green-700">
              <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-100 mb-3 flex items-center gap-2">
                Final Answer
                <span className="text-xs font-bold px-3 py-1 bg-green-500 text-gray-900 rounded-full shadow-md">✓ Verified</span>
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-100 leading-relaxed whitespace-pre-wrap font-semibold">
                  {answer.answer}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Draft Answer (Optional) - Show Second */}
        {answer.draft_answer && answer.draft_answer !== answer.answer && (
          <Card className="bg-gray-800 border-2 border-blue-600">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-base font-bold text-blue-200 mb-2">Draft Answer (Before Verification)</h4>
                <p className="text-sm text-gray-300 italic font-medium">
                  {answer.draft_answer}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Context Critic Analysis */}
      {hasContextCritic && (
        <>
          <ChunkRelevanceDisplay
            scores    = {answer.chunk_relevance_scores}
            rationale = {answer.context_rationale}
          />

          {/* Context Comparison */}
          {originalContext && answer.context && (
            <ContextComparison
              beforeContext = {originalContext}
              afterContext  = {answer.context}
              chunks        = {answer.chunk_relevance_scores}
            />
          )}
        </>
      )}

      {/* No Critic Warning */}
      {!hasContextCritic && (
        <Card className="bg-gray-800 border-2 border-blue-600">
          <div         className = "flex items-start gap-3 p-3 bg-blue-900 rounded-lg border-2 border-blue-600">
          <AlertCircle className = "w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className = "text-sm font-bold text-blue-100">Context Critic Disabled</p>
              <p className = "text-xs text-blue-200 mt-1 font-medium">
                All retrieved chunks were used without filtering. Enable Context Critic for better results.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Sources */}
      {answer.sources && answer.sources.length > 0 && (
        <Card title="📚 Sources" className="bg-gray-800 border-2 border-gray-600">
          <div className="space-y-3">
            {answer.sources.map((source, idx) => (
              <div key={idx} className="p-3 bg-gray-700 rounded-lg flex items-start gap-3 border-2 border-gray-600">
                <FileText className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-200 font-medium">{source.content || source}</p>
                  {source.metadata && (
                    <div className="mt-1 text-xs text-gray-400 flex gap-3 font-medium">
                      {source.metadata.source && <span>📄 {source.metadata.source}</span>}
                      {source.metadata.page && <span>📖 Page {source.metadata.page}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};