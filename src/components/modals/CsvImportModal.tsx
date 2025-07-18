import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { downloadCSV } from '@/utils/csvUtils';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, unknown>[]) => void;
  title?: string;
  templateData?: Record<string, unknown>[];
}

const CsvImportModal: React.FC<CsvImportModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport, 
  title = 'Import CSV',
  templateData = []
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownloadTemplate = () => {
    if (templateData.length > 0) {
      downloadCSV(templateData, `${title?.toLowerCase?.().replace(/\s+/g, '_')}_template`);
      toast.success('Template downloaded successfully');
    } else {
      // Fallback template
      const defaultTemplate = [
        {
          name: 'Sample Item',
          description: 'Sample description',
          date: new Date().toISOString().split('T')[0]
        }
      ];
      downloadCSV(defaultTemplate, 'csv_template');
      toast.success('Template downloaded successfully');
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const entry: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      
      result.push(entry);
    }
    
    return result;
  };

  const handleImportClick = () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = parseCSV(e.target?.result as string);
        onImport(csvData);
        toast.success('CSV data imported successfully!');
        onClose();
      } catch (error) {
        toast.error('Failed to parse CSV file');
        console.error('CSV parsing error:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Download Template Button */}
        <div className="mb-4">
          <button
            onClick={handleDownloadTemplate}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download CSV Template
          </button>
        </div>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {file 
              ? file.name 
              : 'Drag & drop your CSV file here'}
          </p>
          
          {!file && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              or
            </p>
          )}
          
          <button
            onClick={handleBrowseClick}
            className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            type="button"
          >
            {file ? 'Change File' : 'Browse Files'}
          </button>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleImportClick}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            type="button"
            disabled={!file}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default CsvImportModal;
