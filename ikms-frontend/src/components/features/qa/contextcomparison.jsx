import { Card } from '../../common/card';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export const ContextComparison = ({ beforeContext, afterContext, chunks }) => {
  const [showBefore, setShowBefore] = useState(false);
  const [showAfter, setShowAfter] = useState(true);

  if (!beforeContext && !afterContext) return null;

  const beforeChunks = beforeContext?.split('\n\n') || [];
  const afterChunks = afterContext?.split('\n\n') || [];

  return (
    <Card title="Context Filtering Analysis">
      <div className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-600">{beforeChunks.length}</div>
            <div className="text-xs text-blue-800">Retrieved</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xl font-bold text-green-600">{afterChunks.length}</div>
            <div className="text-xs text-green-800">Kept</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xl font-bold text-red-600">
              {beforeChunks.length - afterChunks.length}
            </div>
            <div className="text-xs text-red-800">Filtered</div>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Context */}
          <div className="space-y-2">
            <button
              onClick={() => setShowBefore(!showBefore)}
              className="flex items-center justify-between w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {showBefore ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="font-semibold text-gray-900">Before Critic</span>
                <span className="text-xs text-gray-600">({beforeChunks.length} chunks)</span>
              </div>
              {showBefore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showBefore && (
              <div className="max-h-96 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {beforeChunks.map((chunk, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      Chunk {idx}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-3">
                      {chunk.replace(/\[Chunk \d+\]/, '').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* After Context */}
          <div className="space-y-2">
            <button
              onClick={() => setShowAfter(!showAfter)}
              className="flex items-center justify-between w-full p-3 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {showAfter ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="font-semibold text-gray-900">After Critic</span>
                <span className="text-xs text-gray-600">({afterChunks.length} chunks)</span>
              </div>
              {showAfter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showAfter && (
              <div className="max-h-96 overflow-y-auto space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
                {afterChunks.map((chunk, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-green-300">
                    <div className="text-xs font-semibold text-green-600 mb-1">
                      Chunk {idx} ✓
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-3">
                      {chunk.replace(/\[Chunk \d+\]/, '').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};