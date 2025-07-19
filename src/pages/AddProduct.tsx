import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { unitService, Unit } from "@/services/unitService";
import { colorService, Color } from "@/services/colorService";
import { sizeService, Size} from "@/services/sizeService";

import { categoryService, Category } from "@/services/categoryService";
import { productService, ProductStock } from "@/services/productService";
import { LoaderPinwheel } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ActivityLogger } from "@/services/activityLogger";

const AddProduct: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors]= useState<Color[]>([]);
  const [sizes, setSizes]= useState<Size[]>([]);

  const [mainCategories, setMainCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);




  
  const [productData, setProductData] = useState({
    name: "",
    unit: "",
    categoryId: "",
    description: "",
    thresholdProductQuantity: "", 
    productColor: "",
    productSize: "",
    actualProductQuantity: "",
  });

  useEffect(() => {
    
      const fetchUnits = async () => {
        try {
          const data = await unitService.getAllUnits();
          setUnits(data);
          toast.success("All units have been loaded successfully");
        } catch (error) {
          console.error("Error loading units:", error);
          toast.error("Failed to load units");
        }
      };

      const fetchSizes = async () => {
        try {
          const data = await sizeService.getAllSizes();
          setSizes(data);
          setSubCategories(data.map(size => size.name));
          toast.success("All sizes have been loaded successfully");
        } catch (error) {
          console.error("Error loading sizes:", error);
          toast.error("Failed to load sizes");
        }
      };

      const fetchColors = async () => {
        try {
          const data = await colorService.getAllColors();
          setColors(data);
          setMainCategories(data.map(color => color.name));
          toast.success("All colors have been loaded successfully");
        } catch (error) {
          console.error("Error loading colors:", error);
          toast.error("Failed to load colors");
        }
      };

      const fetchAllData = async () => {
        setLoading(true);
        try {
          
            await fetchUnits();
            await fetchColors();
            await fetchSizes();
          
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();

    
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleUnitChange = (value: string) => {
    setProductData(prev => ({ ...prev, unit: value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, productColor: value })); 
      
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, productSize: value }));
  };

  const handleCategoryChange = (value: string) => {
    setProductData(prev => ({ ...prev, categoryId: value }));
  };

  const handleAddCategory = (type: 'main' | 'sub') => {
    const value = type === 'main' ? productData.productColor.trim() : productData.productSize.trim();
    if (!value) return;

    if (type === 'main') {
      if (!mainCategories.includes(value)) {
        setMainCategories(prev => [...prev, value]);
        
        setProductData(prev => ({ ...prev, productColor: '' }));
      }
    } else {
      if (!subCategories.includes(value)) {
        setSubCategories(prev => [...prev, value]);
        setProductData(prev => ({ ...prev, productSize: '' }));
      }
    }
  };

  const handleRemoveCategory = (type: 'main' | 'sub', category: string) => {
    if (type === 'main') {
      setMainCategories(prev => prev.filter(cat => cat !== category));
    } else {
      setSubCategories(prev => prev.filter(cat => cat !== category));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!productData.name) {
        toast.error("Product name is required");
        return;
      }

      if (!productData.unit) {
        toast.error("Product unit is required");
        return;
      }

      

      if (mainCategories.length === 0) {
        toast.error("Product color is required atleast one");
        return;
      }

      if (subCategories.length === 0) {
        toast.error("Product size is required atleast one");
        return;
      }

      for(const color of mainCategories){
         for(const size of subCategories){
            try{
            const productVariant = {
              productName: productData.name,
              productUnit: productData.unit,
              thresholdProductQuantity: parseInt(productData.thresholdProductQuantity) || 0,
              productColor: color,
              productSize: size,
              actualProductQuantity: parseInt(productData.actualProductQuantity) || 0,
              productId: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            await productService.createProduct(productVariant);
            await ActivityLogger.logProductCreate(productVariant);
            toast.success("Product variant added successfully");
            }catch(error){
              console.error("Error adding product variant:", error);
              toast.error("Failed to add product variant");
            }
         }
      }

     
      toast.success("Product has been created successfully");
      // Log the completion of the product creation process
      await ActivityLogger.logProductCreate({
        name: productData.name,
        variants: mainCategories.length * subCategories.length
      });
      navigate("/settings/products");
    } catch (error) {
      toast.error("Failed to add product");
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  };

  if(loading){
    return <div className="flex justify-center items-center h-screen">
      <LoaderPinwheel className="w-10 h-10 animate-spin" />
    </div>
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("addProduct.title")}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/settings/products" className="btn-outline flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            {t("addProduct.backToProducts")}
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg border shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t("addProduct.productName")}
            </label>
            <input
              id="name"
              name="name"
              value={productData.name}
              onChange={handleChange}
              placeholder={t("addProduct.enterProductName")}
              className="input-field"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-medium">
              {t("addProduct.productUnit")}
            </label>
            <Select value={productData.unit} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("addProduct.selectUnit")} />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.unitId} value={unit.name}>
                    {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="mainCategory" className="text-sm font-medium">
              Colors
            </label>
            <div className="relative">
              <input
                id="mainCategory"
                name="mainCategory"
                value={productData.productColor}
                onChange={handleColorChange}
                placeholder="Enter main product categories"
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => handleAddCategory('main')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {mainCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1"
                >
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory('main', category)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subCategory" className="text-sm font-medium">
              Sizes
            </label>
            <div className="relative">
              <input
                id="subCategory"
                name="subCategory"
                value={productData.productSize}
                onChange={handleSizeChange}
                placeholder="Enter sub product categories"
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => handleAddCategory('sub')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {subCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1"
                >
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory('sub', category)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="thresholdProductQuantity" className="text-sm font-medium">
            Low Threshold Value
          </label>
          <input
            id="thresholdProductQuantity"
            name="thresholdProductQuantity"
            type="number"
            value={productData.thresholdProductQuantity}
            onChange={handleChange}
            placeholder="Enter low threshold value"
            className="input-field"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={productData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            className="input-field min-h-[100px]"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};


export default AddProduct;
