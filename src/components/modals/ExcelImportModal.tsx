import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';
import api from '../../services/api';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (results: unknown) => void;
}

interface ImportPreview {
  summary: Record<string, unknown>;
  salesRecords: number;
  stockRecords: number;
  preview: {
    sales: Record<string, unknown>[];
    stock: Record<string, unknown>[];
  };
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'stockKeeping' | 'packingList'>('stockKeeping');
  const [step, setStep] = useState<'upload' | 'preview' | 'import' | 'complete'>('upload');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importResults, setImportResults] = useState<Record<string, unknown> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (allowedTypes.includes(selectedFile.type) || 
          selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        setFile(selectedFile);
      } else {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', file);
      formData.append('fileType', fileType);
      formData.append('previewRows', '10');

      const response = await api.post('/api/excel/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setPreview(response.data.data);
        setStep('preview');
        toast.success('File preview generated successfully');
      } else {
        toast.error(response.data.error || 'Failed to preview file');
      }
    } catch (error: unknown) {
      console.error('Preview error:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to preview file'
        : 'Failed to preview file';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', file);
      formData.append('fileType', fileType);
      formData.append('autoImport', 'true');
      formData.append('deleteAfterProcessing', 'true');

      const response = await api.post('/api/excel/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setImportResults(response.data.data);
        setStep('complete');
        toast.success('Data imported successfully');
        
        if (onImportComplete) {
          onImportComplete(response.data.data);
        }
      } else {
        toast.error(response.data.error || 'Failed to import data');
      }
    } catch (error: unknown) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to import data'
        : 'Failed to import data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setStep('upload');
    setPreview(null);
    setImportResults(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          File Type
        </label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value as 'stockKeeping' | 'packingList')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="stockKeeping">Stock Keeping (Sales & Stock)</option>
          <option value="packingList">Packing List (Stock Additions)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Excel File
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Supported Excel Formats:
        </h4>
        <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
          <li>Sales transactions with columns: Product, Color, Size, Quantity, Date, Customer</li>
          <li>Stock additions with columns: Product, Color, Size, Quantity, Date, Supplier</li>
          <li>Multiple sheets are supported</li>
          <li>Headers will be auto-detected</li>
        </ul>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
          <h4 className="font-medium text-green-800 dark:text-green-200">Sales Records</h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {preview?.salesRecords || 0}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
          <h4 className="font-medium text-blue-800 dark:text-blue-200">Stock Records</h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {preview?.stockRecords || 0}
          </p>
        </div>
      </div>

      {preview?.summary && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <h4 className="font-medium mb-2">File Summary</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sheets: {preview.summary.totalSheets} | 
            Total Records: {preview.summary.totalRecords}
          </p>
        </div>
      )}

      {preview?.preview?.sales && preview.preview.sales.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Sales Preview (First 5 records)</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-2 py-1 border">Product</th>
                  <th className="px-2 py-1 border">Color</th>
                  <th className="px-2 py-1 border">Size</th>
                  <th className="px-2 py-1 border">Quantity</th>
                  <th className="px-2 py-1 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview.sales.slice(0, 5).map((record, index) => (
                  <tr key={index}>
                    <td className="px-2 py-1 border">{record.productName}</td>
                    <td className="px-2 py-1 border">{record.productColor}</td>
                    <td className="px-2 py-1 border">{record.productSize}</td>
                    <td className="px-2 py-1 border">{record.productQuantity}</td>
                    <td className="px-2 py-1 border">
                      {record.addedDate ? new Date(record.addedDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview?.preview?.stock && preview.preview.stock.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Stock Preview (First 5 records)</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-2 py-1 border">Product</th>
                  <th className="px-2 py-1 border">Color</th>
                  <th className="px-2 py-1 border">Size</th>
                  <th className="px-2 py-1 border">Quantity</th>
                  <th className="px-2 py-1 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview.stock.slice(0, 5).map((record, index) => (
                  <tr key={index}>
                    <td className="px-2 py-1 border">{record.productName}</td>
                    <td className="px-2 py-1 border">{record.productColor}</td>
                    <td className="px-2 py-1 border">{record.productSize}</td>
                    <td className="px-2 py-1 border">{record.productQuantity}</td>
                    <td className="px-2 py-1 border">
                      {record.addedDate ? new Date(record.addedDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Complete!</h3>
      </div>

      {importResults && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
            <h4 className="font-medium text-green-800 dark:text-green-200">Sales Imported</h4>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {importResults.importResults?.sales?.success || 0}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Stock Imported</h4>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {importResults.importResults?.stock?.success || 0}
            </p>
          </div>
        </div>
      )}

      {importResults?.importResults && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Products created: {importResults.importResults.products?.created || 0}</p>
          <p>Total records processed: {importResults.salesRecords + importResults.stockRecords}</p>
        </div>
      )}
    </div>
  );

  const getStepButtons = () => {
    switch (step) {
      case 'upload':
        return (
          <>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!file || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Preview'}
            </button>
          </>
        );
      case 'preview':
        return (
          <>
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import Data'}
            </button>
          </>
        );
      case 'complete':
        return (
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Excel Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step indicator */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'upload' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-green-100 dark:bg-green-900/20'
              }`}>
                {step === 'upload' ? '1' : '✓'}
              </div>
              <span className="ml-2 text-sm font-medium">Upload</span>
            </div>
            
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            <div className={`flex items-center ${
              step === 'preview' ? 'text-blue-600' : 
              ['import', 'complete'].includes(step) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'preview' ? 'bg-blue-100 dark:bg-blue-900/20' : 
                ['import', 'complete'].includes(step) ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {['import', 'complete'].includes(step) ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Preview</span>
            </div>
            
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            <div className={`flex items-center ${
              step === 'complete' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'complete' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {step === 'complete' ? '✓' : '3'}
              </div>
              <span className="ml-2 text-sm font-medium">Import</span>
            </div>
          </div>

          {/* Step content */}
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'complete' && renderCompleteStep()}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {getStepButtons()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportModal;
