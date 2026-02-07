import { Card } from '../../common/card';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';

export const ChunkRelevanceDisplay = ({ scores, rationale }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState(null);

  if (!scores || scores.length === 0) {
    return null;
  }

  const relevanceConfig = {
    HIGHLY_RELEVANT: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Highly Relevant',
      emoji: '✅'
    },
    MARGINAL: {
      icon: AlertTriangle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'Marginal',
      emoji: '⚠️'
    },
    IRRELEVANT: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Irrelevant',
      emoji: '❌'
    }
  };

  const keptChunks = scores.filter(s => s.keep);
  const filteredChunks = scores.filter(s => !s.keep);
  const highlyRelevant = scores.filter(s => s.relevance === 'HIGHLY_RELEVANT').length;
  const marginal = scores.filter(s => s.relevance === 'MARGINAL').length;
  const irrelevant = scores.filter(s => s.relevance === 'IRRELEVANT').length;

  return (
    <Card title="🎯 Context Critic Analysis">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{scores.length}</div>
          <div className="text-xs text-blue-800">Retrieved</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{keptChunks.length}</div>
          <div className="text-xs text-green-800">Kept</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">{filteredChunks.length}</div>
          <div className="text-xs text-red-800">Filtered</div>
        </div>
        <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-300">
          <div className="text-2xl font-bold text-blue-700">
            {keptChunks.length > 0 ? Math.round((keptChunks.length / scores.length) * 100) : 0}%
          </div>
          <div className="text-xs text-blue-800">Kept Rate</div>
        </div>
      </div>

      {/* Relevance Breakdown */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Relevance Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Highly Relevant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(highlyRelevant / scores.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8">{highlyRelevant}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">Marginal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(marginal / scores.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8">{marginal}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-700">Irrelevant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${(irrelevant / scores.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8">{irrelevant}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chunk Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Chunk-by-Chunk Analysis</h4>
        {scores.map((chunk) => {
          const config = relevanceConfig[chunk.relevance] || relevanceConfig.MARGINAL;
          const Icon = config.icon;
          const isExpanded = selectedChunk === chunk.chunk_id;

          return (
            <div
              key={chunk.chunk_id}
              className={`rounded-lg border-2 transition-all ${config.border} ${
                !chunk.keep ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => setSelectedChunk(isExpanded ? null : chunk.chunk_id)}
                className={`w-full p-3 ${config.bg} rounded-lg flex items-center justify-between hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        Chunk {chunk.chunk_id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium border ${config.border}`}>
                        {config.label}
                      </span>
                      {!chunk.keep && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                          FILTERED
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${config.color} line-clamp-1`}>
                      {chunk.rationale}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {isExpanded && (
                <div className="p-3 bg-white border-t-2 border-gray-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Detailed Rationale:</p>
                      <p className="text-sm text-gray-700">{chunk.rationale}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Relevance</p>
                      <p className="text-sm font-semibold text-gray-900">{config.emoji} {config.label}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Decision</p>
                      <p className={`text-sm font-semibold ${chunk.keep ? 'text-green-600' : 'text-red-600'}`}>
                        {chunk.keep ? '✓ Kept' : '✗ Filtered'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Rationale (Collapsible) */}
      {rationale && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Hide' : 'Show'} Full Analysis Log
          </button>
          
          {expanded && (
            <pre className="mt-3 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
              {rationale}
            </pre>
          )}
        </div>
      )}
    </Card>
  );
};