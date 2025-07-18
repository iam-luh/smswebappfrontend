
import React, { useState } from 'react';
import { Color, CreateColorDto } from '../services/colorService';

interface ColorFormProps {
    onSubmit: (color: CreateColorDto) => void;
    initialData?: Color;
}

const ColorForm: React.FC<ColorFormProps> = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = useState<CreateColorDto>({
        Name: initialData?.name || '',
        Hex: initialData?.hex || ''
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
                <label htmlFor="Hex" className="block text-sm font-medium text-gray-700">
                    Hex Color
                </label>
                <input
                    type="text"
                    id="Hex"
                    name="Hex"
                    value={formData.Hex}
                    onChange={handleChange}
                    placeholder="#FFFFFF"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                {initialData ? 'Update Color' : 'Create Color'}
            </button>
        </form>
    );
};

export default ColorForm;
