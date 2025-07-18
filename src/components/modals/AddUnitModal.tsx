import React, { useState,  } from 'react';
import { toast } from 'sonner';
import { CreateUnitDto, Unit, unitService } from '@/services/unitService';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (unit: Unit) =>  void; 
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [unitData, setUnitData] = useState<Unit>({
    name: '',
    symbol: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUnitData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitData.name || !unitData.symbol) {
      toast.error('Please fill all required fields');
      return;
    }
    
    onAdd(unitData);
    
    // Reset form and close modal
    setUnitData({
      name: '',
      symbol: '',
      description: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Add Unit of Measurement</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="Name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={unitData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required 
            />
          </div>
          
          <div>
            <label htmlFor="Symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Symbol <span className="text-red-500">*</span>
            </label>
            <input
              id="symbol"
              name="symbol"
              type="text"
              value={unitData.symbol}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={unitData.description || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              type="button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnitModal;
