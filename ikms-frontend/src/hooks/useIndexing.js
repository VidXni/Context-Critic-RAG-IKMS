import { useState } from 'react';
import { indexPDF } from '../api/client';
import toast from 'react-hot-toast';

export const useIndexing = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const uploadPDF = async (file) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setProgress(0);
    
    try {
      // Simulate progress (since we don't have real progress from backend)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const result = await indexPDF(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(result);
      toast.success('PDF indexed successfully!');
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to index PDF';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return {
    loading,
    progress,
    result,
    uploadPDF,
  };
};