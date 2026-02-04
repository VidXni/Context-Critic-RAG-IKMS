import React, { useState, useRef } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Upload, File, X } from 'lucide-react';

export const PDFUpload = ({ onUpload, loading, progress }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card title="Upload PDF Document">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
            disabled={loading}
          />
          
          {!selectedFile ? (
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Click to upload PDF</p>
              <p className="text-sm text-gray-500">or drag and drop</p>
            </label>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-primary-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-gray-500 hover:text-red-600"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {progress > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-center text-gray-600">{progress}% uploaded</p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          loading={loading}
          className="w-full"
        >
          <Upload className="w-4 h-4" />
          Index Document
        </Button>
      </div>
    </Card>
  );
};