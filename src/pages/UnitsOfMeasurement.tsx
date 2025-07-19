
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ActionButtons from "../components/ui/ActionButtons";
import AddUnitModal from "../components/modals/AddUnitModal";
import EditUnitModal from "../components/modals/EditUnitModal";
import AddColorsModal from "../components/modals/AddColorsModal";
import AddSizesModal from "../components/modals/AddSizesModal";
import { toast } from "sonner";
import { Color, colorService } from "@/services/colorService";
import { Size, sizeService } from "@/services/sizeService";
import { Unit, unitService } from "@/services/unitService";
import { useLanguage } from "../context/LanguageContext";
import { X } from "lucide-react";

const UnitsOfMeasurement: React.FC = () => {
  const { t } = useLanguage();
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Modal states
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Default colors and sizes
  const [defaultColors, setDefaultColors] = useState<Color[]>([]);
  const [defaultSizes, setDefaultSizes] = useState<Size[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const units = await unitService.getAllUnits();
        setUnits(units);
        toast.success(t("units.unitsFetched"));
      } catch (error) {
        toast.error(t("units.failedToFetch"));
      }
      try {
        const colors = await colorService.getAllColors();
        setDefaultColors(colors);
      } catch (error) {
        toast.error("Failed to fetch default colors");
      }
      try {
        const sizes = await sizeService.getAllSizes();
        setDefaultSizes(sizes);
      } catch (error) {
        toast.error("Failed to fetch default sizes");
      }
    };
    fetchData();
  }, [t]);

  // Filter units based on search query
  const filteredUnits = units.filter(unit => 
    unit.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    unit.description?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    unit.symbol?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  // Handle adding a new unit
  const handleAddUnit = async (newUnit: Omit<Unit, "unitId">) => {
    try {
      await unitService.createUnit(newUnit);
      toast.success(t("units.unitAdded"));
    } catch (error) {
      toast.error(t("units.failedToAdd"));
      return;
    }

    const unitWithId: Unit = {
      ...newUnit,
      unitId: Math.max(...units.map(unit => unit.unitId || 0), 0) + 1
    };
    
    setUnits([unitWithId, ...units]);
  };

  // Handle updating a unit
  const handleUpdateUnit = async (updatedUnit: Unit) => {
    try {
      await unitService.updateUnit(updatedUnit.unitId!, updatedUnit);
      setUnits(units.map(unit => 
        unit.unitId === updatedUnit.unitId ? updatedUnit : unit
      ));
      toast.success(t("units.unitUpdated"));
    } catch (error) {
      toast.error(t("units.failedToUpdate"));
    }
  };

  const handleAddColor = async (newColor: Omit<Color, "colorId">) => {
    try{
      const response = await colorService.createColor(newColor);
      toast.success("Color created in the database successfully");
    }
    catch (error) {
      toast.error("Failed to create color in database");
      return;
    }
    const colorWithId: Color = {
      ...newColor,
      colorId: Math.max(...defaultColors.map(color => color.colorId), 0) + 1
    };
    
    setDefaultColors([colorWithId, ...defaultColors]);
    toast.success(`Color "${newColor.name}" added successfully`);
  };

  const handleAddSize = async (newSize: Omit<Size, "sizeId">) => {
    try{
      const response = await sizeService.createSize(newSize);
      toast.success("Size created in the database successfully");
    }
    catch (error) {
      toast.error("Failed to create size in database");
      return;
    }

    const sizeWithId: Size = {
      ...newSize,
      sizeId: Math.max(...defaultSizes.map(size => size.sizeId), 0) + 1
    };
    
    setDefaultSizes([sizeWithId, ...defaultSizes]);
    toast.success(`Size "${newSize.name}" added successfully`);
  };

  const handleRemoveColor = async (index: number) => {
    try{
      const response = await colorService.deleteColor(defaultColors[index].colorId);
      toast.success("Color deleted successfully");
    }
    catch (error) {
      toast.error("Failed to delete color");
      return;
    }
    const updatedColors = [...defaultColors];
    updatedColors.splice(index, 1);
    setDefaultColors(updatedColors);
    toast.success("Color removed successfully");
  };

  const handleRemoveSize = async (index: number) => {
    try{
      const response = await sizeService.deleteSize(defaultSizes[index].sizeId);
      toast.success("Size deleted successfully");
    }
    catch (error) {
      toast.error("Failed to delete size");
      return;
    }
    const updatedSizes = [...defaultSizes];
    updatedSizes.splice(index, 1);
    setDefaultSizes(updatedSizes);
    toast.success("Size removed successfully");
  };

  // Handle deleting a unit
  const handleDeleteUnit = async (id: number) => {
    try {
      await unitService.deleteUnit(id);       
      toast.success(t("units.unitDeleted"));       
    } catch (error) {
      toast.error(t("units.failedToDelete"));
      return;
    }
    setUnits(units.filter(unit => unit.unitId !== id));
  };

  // Handle editing a unit
  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditUnitModalOpen(true);
  };

  return (
    <div className="animate-fade-in my-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("units.title")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/settings" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            {t("common.back")}
          </Link>
          <button 
            onClick={() => setIsUnitModalOpen(true)} 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t("units.addUnit")}
          </button>
        </div>
      </div>

      {/* Default Options Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Default Colors</h2>
            <button 
              onClick={() => setIsColorModalOpen(true)} 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-9 px-3 py-1.5"
            >
              Edit Colors
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {defaultColors.map((color, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" 
                  style={{ backgroundColor: color.hex }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{color.name}</span>
                <X
                  className="cursor-pointer text-gray-400 hover:text-gray-500"
                  onClick={() => handleRemoveColor(index)} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Default Sizes</h2>
            <button 
              onClick={() => setIsSizeModalOpen(true)} 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-9 px-3 py-1.5"
            >
              Edit Sizes
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {defaultSizes.map((size, index) => (
              <div className=" flex flex-row gap-x-2 flex-nowrap bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full"><span key={index} className="">
                {size.name}
              </span><X
                  className="cursor-pointer text-gray-400 hover:text-gray-500"
                  onClick={() => handleRemoveSize(index)} /></div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder={t("common.search") + " " + t("units.title")?.toLowerCase?.() + "..."}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                  {t("units.name")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("units.symbol")}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("units.description")}
                </th>               
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUnits.map(unit => (
                <tr key={unit.unitId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {unit.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {unit.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {unit.description}
                  </td>                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <ActionButtons 
                      onEdit={() => handleEditUnit(unit)}
                      onDelete={() => handleDeleteUnit(unit.unitId!)}
                    />
                  </td>
                </tr>
              ))}
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t("units.noUnits")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddUnitModal 
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        onAdd={handleAddUnit}
      />

      <EditUnitModal
        isOpen={isEditUnitModalOpen}
        onClose={() => setIsEditUnitModalOpen(false)}
        onUpdateUnit={handleUpdateUnit}
        unit={editingUnit}
      />

      <AddColorsModal 
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        onSave={(colors: Color[]) => setDefaultColors(colors)}
        onAdd={handleAddColor}
        onRemove={handleRemoveColor}
        currentColors={defaultColors}
      />

      <AddSizesModal 
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onSave={(sizes: Size[]) => setDefaultSizes(sizes)}
        onAdd={handleAddSize}
        onRemove={handleRemoveSize}
        currentSizes={defaultSizes}
      />
    </div>
  );
};

export default UnitsOfMeasurement;
