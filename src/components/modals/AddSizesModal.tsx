
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Color } from '@/services/colorService';
import { Size } from '@/services/sizeService';

interface SizeOption {
  name: string;
  sortOrder: number;
}

interface AddSizesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sizes: Size[]) => void;
  onAdd: (size: Size) => void;
  onRemove: (index: number) => void;
  currentSizes: Size[];
}

const AddSizesModal: React.FC<AddSizesModalProps> = ({ isOpen, onClose, onSave, onAdd, onRemove, currentSizes }) => {
  const [sizes, setSizes] = useState<Size[]>(currentSizes);
  const [newSize, setNewSize] = useState<Size>({
    sizeId: 0,
    name: '', 
    description: ''
   });

  if (!isOpen) return null;
  
  const handleAddSize = () => {
    if (!newSize.name.trim()) {
      toast.error('Please enter a size name');
      return;
    }
    
    if (sizes.some(size => size.name?.toLowerCase?.() === newSize.name?.toLowerCase?.())) {
      toast.error('This size already exists');
      return;
    }
    
    setSizes([...sizes, { ...newSize }]);
    onAdd(newSize);
    setNewSize({ sizeId: 0, name: '', description: '' });
  };
  
  const handleRemoveSize = (index: number) => {
    const updatedSizes = [...sizes];
    updatedSizes.splice(index, 1);
    
    // Reorder the remaining sizes
    const reorderedSizes = updatedSizes.map((size, idx) => ({
      ...size,
      sortOrder: idx + 1
    }));
    
    setSizes(reorderedSizes);
    onRemove(index);
  };
  
 
  
  const handleSave = () => {
    onSave(sizes);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Default Size Options</h3>
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
        
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="sizeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Size Name
              </label>
              <input
                id="sizeName"
                type="text"
                value={newSize.name}
                onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter size name"
              />
            </div>
            <button
              onClick={handleAddSize}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              type="button"
            >
              Add
            </button>
          </div>
          
          <div className="mt-4 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Current Sizes (Order matters):</h4>
            {sizes.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No sizes added yet</p>
            ) : (
              <ul className="space-y-2">
                {sizes.map((size, index) => (
                  <li 
                    key={index} 
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{size.name}</span>
                    <div className="flex items-center gap-1">
                     
                      <button
                        onClick={() => handleRemoveSize(index)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              type="button"
            >
              Cancel
            </button>
            {/* <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              type="button"
            >
              Save Sizes
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSizesModal;
