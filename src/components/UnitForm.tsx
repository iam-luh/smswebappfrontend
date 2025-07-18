
import React, { useState } from 'react';
import { Unit, CreateUnitDto } from '../services/unitService';

interface UnitFormProps {
    onSubmit: (unit: CreateUnitDto) => void;
    initialData?: Unit;
}

const UnitForm: React.FC<UnitFormProps> = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = useState<CreateUnitDto>({
        Name: initialData?.name || '',
        Symbol: initialData?.symbol || '',
        Description: initialData?.description || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="Name" className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    id="Name"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="Symbol" className="block text-sm font-medium text-gray-700">
                    Symbol
                </label>
                <input
                    type="text"
                    id="Symbol"
                    name="Symbol"
                    value={formData.Symbol}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="Description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="Description"
                    name="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                {initialData ? 'Update Unit' : 'Create Unit'}
            </button>
        </form>
    );
};

export default UnitForm; 
