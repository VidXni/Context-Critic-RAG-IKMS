import { useState } from 'react';
import { PDFUpload } from '../components/features/indexing/pdfupload';
import { QuestionForm } from '../components/features/qa/questionform';
import { AnswerDisplay } from '../components/features/qa/answerdisplay';
import { useIndexing } from '../hooks/useIndexing';
import { useQA } from '../hooks/useQA';
import { Card } from '../components/common/card';
import { CheckCircle, Sparkles } from 'lucide-react';

export const Home = () => {
  const { loading: uploadLoading, progress, result: uploadResult, uploadPDF }   = useIndexing();
  const { loading: qaLoading, answer, useCritic, submitQuestion, toggleCritic } = useQA();
  const [originalContext, setOriginalContext]                                   = useState(null);

  const handleQuestionSubmit = async (question) => {
      // Store original context for comparison if available
    const result = await submitQuestion(question);
    if (result && result.context) {
      setOriginalContext(result.raw_context || result.context);
    }
  };

  return (
    <div className = "min-h-[calc(100vh-4rem)] py-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header Section */}
      <div      className = "text-center mb-8">
      <div      className = "flex items-center justify-center gap-3 mb-4">
      <Sparkles className = "w-10 h-10 text-blue-400" />
      <h1       className = "text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                IKMS Multi-Agent RAG System
          </h1>
        </div>
      <div className = "max-w-4xl mx-auto space-y-3">
        <p   className = "text-lg text-gray-300">
            An intelligent document analysis system powered by multi-agent RAG (Retrieval-Augmented Generation) 
            technology with advanced context filtering. Upload your PDF documents to build a searchable knowledge base, 
            then ask questions in natural language to receive accurate, verified answers with complete source citations.
          </p>
          <div  className = "flex flex-wrap justify-center gap-8 text-sm text-gray-300 font-medium">
          <div  className = "flex items-center gap-2">
          <div  className = "w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
          <span className = "text-white font-bold">1</span>
              </div>
              <span>Retrieval</span>
            </div>
            <div  className = "flex items-center gap-2">
            <div  className = "w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
            <span className = "text-white font-bold">2</span>
              </div>
              <span>Context Filtering ✨</span>
            </div>
            <div  className = "flex items-center gap-2">
            <div  className = "w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center shadow-lg">
            <span className = "text-white font-bold">3</span>
              </div>
              <span>Summarization</span>
            </div>
            <div  className = "flex items-center gap-2">
            <div  className = "w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
            <span className = "text-white font-bold">4</span>
              </div>
              <span>Verification</span>
            </div>
          </div>
      </div>
    </div>

      {/* Single Column Vertical Layout */}
      <div className = "max-w-4xl mx-auto space-y-12">

        {/* Step 1 - Document Upload */}
        <div className = "space-y-6">
        <div className = "flex items-center gap-3 mb-6">
        <div className = "flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 shadow-lg ring-4 ring-blue-900">
        <span className = "text-white font-bold text-lg">1</span>
            </div>
            <div>
              <h2 className = "text-2xl font-bold text-white">
                Upload Documents
              </h2>
              <p className = "text-sm text-gray-400">
                Index PDF documents for querying
              </p>
            </div>
          </div>

          {/* Upload and Instructions Grid */}
          <div className = "grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className = "space-y-6 md:col-span-2">
              <PDFUpload
                onUpload = {uploadPDF}
                loading  = {uploadLoading}
                progress = {progress}
              />

              {uploadResult && (
                <Card        className = "animate-slide-up">
                <div         className = "flex items-start gap-3">
                <CheckCircle className = "w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className = "font-semibold text-gray-900 mb-1">
                        Document Indexed Successfully
                      </h3>
                      <p className = "text-sm text-gray-600">
                        {uploadResult.message || 'Your document has been processed and is ready for queries.'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <Card className = "bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-600 h-fit shadow-xl">
            <h4   className = "font-bold text-blue-100 mb-2 text-base">📋 Instructions</h4>
            <ul   className = "text-sm text-blue-200 space-y-1 font-medium">
                <li>• Upload PDF documents to index them</li>
                <li>• Wait for confirmation message</li>
                <li>• Then ask questions below ↓</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Step 2 - Q&A Section */}
        <div           className = "space-y-6 pt-8 border-t-4 border-gray-700">
        <div           className = "flex items-center gap-3 mb-6">
        <div           className = "flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 shadow-lg ring-4 ring-blue-900">
        <span          className = "text-white font-bold text-lg">2</span>
            </div>
            <div>
              <h2 className = "text-2xl font-bold text-white">
                Ask Questions
              </h2>
              <p className = "text-sm text-gray-400">
                Get intelligent answers with context filtering
              </p>
            </div>
          </div>

          <QuestionForm 
            onSubmit       = {handleQuestionSubmit}
            loading        = {qaLoading}
            useCritic      = {useCritic}
            onToggleCritic = {toggleCritic}
          />

          {/* Step 3 - Answers & Analysis Section */}
          {(qaLoading || answer) && (
            <div className="space-y-6 pt-8 border-t-4 border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 shadow-lg ring-4 ring-green-900">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Answers & Analysis
                  </h2>
                  <p className="text-sm text-gray-400">
                    AI-powered responses with context filtering and verification
                  </p>
                </div>
              </div>

              {qaLoading && (
                <Card className="bg-gray-800 border-2 border-blue-600">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
                      <Sparkles className="w-6 h-6 text-blue-400 absolute top-3 left-3 animate-pulse" />
                    </div>
                    <p className="mt-4 text-white font-bold">
                      {useCritic ? 'Filtering context and processing...' : 'Processing your question...'}
                    </p>
                    <p className="text-sm text-gray-300 mt-1 font-medium">
                      {useCritic && 'Context Critic is analyzing retrieved chunks'}
                    </p>
                  </div>
                </Card>
              )}

              {!qaLoading && answer && (
                <div className="animate-slide-up">
                  <AnswerDisplay answer={answer} originalContext={originalContext} />
                </div>
              )}
            </div>
          )}

          {!answer && !qaLoading && (
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-600 shadow-xl">
              <h4 className="font-bold text-blue-100 mb-2 flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-blue-300" />
                New: Context Critic Agent
              </h4>
              <ul className="text-sm text-blue-200 space-y-1 font-medium">
                <li>• ✅ Automatically filters irrelevant chunks</li>
                <li>• 📊 Ranks content by relevance</li>
                <li>• 🔍 Shows which chunks were used and why</li>
                <li>• 🎯 Improves answer accuracy</li>
                <li>• 🔄 Toggle on/off to compare results</li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};