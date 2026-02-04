import { useState } from 'react';
import { askQuestion } from '../api/client';
import toast from 'react-hot-toast';

export const useQA = () => {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  const submitQuestion = async (question) => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await askQuestion(question);
      setAnswer(result);
      toast.success('Answer retrieved successfully!');
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to get answer';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    answer,
    error,
    submitQuestion,
  };
};