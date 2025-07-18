import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    "nav": {
      "dashboard": "Dashboard",
      "sales": "Sales",
      "stock": "Stock Additions",
      "products": "Products",
      "adjustments": "Adjustments",
      "reports": "Reports",
      "settings": "Settings"
    },
    // App
    "app": {
      "name": "My Inventory",
      "logout": "Logout"
    },
    // Dashboard
    "dashboard": {
      "title": "Dashboard",
      "last7days": "Last 7 days",
      "totalProductsSold": "Total Product Quantity Sold",
      "totalProductsAdded": "Total Product Quantity Added",
      "totalProductsInStore": "Total Product Quantity In Store",
      "monthlySalesOverview": "Monthly Sales Overview",
      "topSellingProducts": "Top Selling Products",
      "bestSeller": "Best",
      "recentTransactions": "Recent Transactions",
      "last5transactions": "Last 5 transactions"
    },
    // Add Product Page
    "addProduct": {
      "title": "Add New Product",
      "backToProducts": "Back to Products",
      "productName": "Product Name",
      "enterProductName": "Enter product name",
      "productUnit": "Product Unit",
      "selectUnit": "Select a unit",
      "mainCategory": "Main Category",
      "subCategory": "Sub Category",
      "lowThreshold": "Low Threshold",
      "description": "Description",
      "cancel": "Cancel",
      "addProduct": "Add Product",
      "saving": "Saving...",
      "productAdded": "Product added successfully"
    },
    // Add Sale Transaction Page
    "addSale": {
      "title": "Record Sale Transaction",
      "subtitle": "Add products sold to track inventory changes",
      "backToSales": "Back to Sales",
      "saleDate": "Sale Date",
      "productItems": "Product Items",
      "searchProducts": "Search products...",
      "productName": "Product Name",
      "productColor": "Product Color",
      "productSize": "Product Size",
      "quantity": "Quantity",
      "selectedItems": "Selected Items",
      "noProductsFound": "No products found",
      "noProductsSelected": "No products selected for sale",
      "remove": "Remove",
      "cancel": "Cancel",
      "saveSaleTransaction": "Save Sale Transaction",
      "saving": "Saving..."
    },
    // Add Stock Addition Page
    "addStock": {
      "title": "Add Stock Addition",
      "subtitle": "Add new stock to increase inventory levels",
      "backToStockAdditions": "Back to Stock Additions",
      "stockAdditionDate": "Stock Addition Date",
      "productItems": "Product Items",
      "searchProducts": "Search products...",
      "productName": "Product Name",
      "productColor": "Product Color", 
      "productSize": "Product Size",
      "quantity": "Quantity",
      "selectedItems": "Selected Items",
      "noProductsFound": "No products found",
      "noProductsSelected": "No products selected for addition",
      "remove": "Remove",
      "cancel": "Cancel",
      "saveStockAddition": "Save Stock Addition",
      "saving": "Saving..."
    },
    // Add Inventory Adjustment Page
    "addAdjustment": {
      "title": "Add Inventory Adjustment",
      "subtitle": "Adjust inventory levels for discrepancies",
      "backToAdjustments": "Back to Adjustments",
      "adjustmentDate": "Adjustment Date",
      "adjustmentReason": "Adjustment Reason",
      "selectReason": "Select a reason",
      "reasons": {
        "damaged": "Damaged",
        "expired": "Expired",
        "lost": "Lost",
        "found": "Found",
        "recount": "Recount",
        "other": "Other"
      },
      "description": "Description",
      "enterDescription": "Enter adjustment description",
      "productItems": "Product Items",
      "searchProducts": "Search products...",
      "productName": "Product Name",
      "productColor": "Product Color",
      "productSize": "Product Size",
      "currentQuantity": "Current Quantity in System",
      "adjustedQuantity": "Actual Quantity in Store",
      "difference": "Difference",
      "selectedItems": "Selected Items",
      "noProductsFound": "No products found",
      "noProductsSelected": "No products selected for adjustment",
      "remove": "Remove",
      "cancel": "Cancel",
      "saveAdjustment": "Save Adjustment",
      "saving": "Saving..."
    },
    // Products
    "products": {
      "title": "Products",
      "name": "Product Name",
      "color": "Color",
      "size": "Size",
      "quantity": "Quantity",
      "unit": "Unit",
      "threshold": "Threshold",
      "status": "Status",
      "addProduct": "Add Product",
      "editProduct": "Edit Product",
      "deleteProduct": "Delete Product",
      "productAdded": "Product added successfully",
      "productUpdated": "Product updated successfully",
      "productDeleted": "Product deleted successfully",
      "productsFetched": "Products fetched successfully",
      "failedToFetch": "Failed to fetch products",
      "failedToUpdate": "Failed to update product",
      "failedToDelete": "Failed to delete product",
      "noProducts": "No products found",
      "search": "Search products..."
    },
    // Stock
    "stock": {
      "title": "Stock Additions",
      "addStock": "Add Stock",
      "quantity": "Quantity",
      "date": "Date",
      "search": "Search stock...",
      "noStock": "No stock found",
      "editStockAddition": "Edit Stock Addition",
      "deleteStockAddition": "Delete Stock Addition",
      "stockUpdated": "Stock updated successfully",
      "stockDeleted": "Stock deleted successfully",
      "dataFetched": "Stock data fetched successfully",
      "dataLoaded": "Stock data loaded successfully",
      "failedToLoad": "Failed to load stock data"
    },
    // Sales
    "sales": {
      "transactions": {
        "title": "Sales Transactions"
      },
      "searchSales": "Search sales...",
      "fromDate": "From Date",
      "toDate": "To Date",
      "clearFilters": "Clear Filters",
      "importCSV": "Import CSV",
      "exportCSV": "Export CSV",
      "recordSale": "Record Sale",
      "productName": "Product Name",
      "productColor": "Product Color",
      "productSize": "Product Size",
      "quantitySold": "Quantity Sold",
      "saleDate": "Sale Date",
      "noSales": "No sales found",
      "showing": "Showing",
      "to": "to",
      "of": "of",
      "entries": "entries",
      "editSale": "Edit Sale",
      "deleteSale": "Delete Sale",
      "saleUpdated": "Sale updated successfully",
      "saleDeleted": "Sale deleted successfully",
      "dataFetched": "Data fetched successfully",
      "failedToFetch": "Failed to fetch data"
    },
    // Settings
    "settings": {
      "title": "Settings",
      "organization": "Organization",
      "organizationDesc": "Manage organization settings",
      "users": "Users Management",
      "usersDesc": "Manage user accounts and permissions",
      "products": "Products Management",
      "productsDesc": "Manage product catalog",
      "units": "Units of Measurement",
      "unitsDesc": "Manage measurement units",
      "language": "Language",
      "english": "English",
      "kiswahili": "Kiswahili"
    },
    // Reports
    "reports": {
      "title": "Reports",
      "dailySales": "Daily Sales Report",
      "dailySalesDesc": "View daily sales performance",
      "monthlySales": "Monthly Sales Report",
      "monthlySalesDesc": "View monthly sales trends",
      "yearlySales": "Yearly Sales Report",
      "yearlySalesDesc": "View annual sales overview",
      "dailyStock": "Daily Stock Report",
      "dailyStockDesc": "View daily stock movements",
      "monthlyStock": "Monthly Stock Report",
      "monthlyStockDesc": "View monthly stock trends",
      "yearlyStock": "Yearly Stock Report",
      "yearlyStockDesc": "View annual stock overview"
    },
    // Authentication
    "auth": {
      "username": "Username",
      "password": "Password",
      "forgotPassword": "Forgot Password?",
      "signIn": "Sign In",
      "noAccount": "Don't have an account?",
      "createAccount": "Create Account",
      "login": {
        "title": "Login",
        "subtitle": "Enter your credentials to access the system",
        "usernamePlaceholder": "Enter your username",
        "passwordPlaceholder": "Enter your password",
        "slogan": "Your Own Inventory Management Solution",
        "feature1Title": "Secure & Reliable",
        "feature1Desc": "Enterprise-grade security for your data",
        "feature2Title": "Real-time Analytics",
        "feature2Desc": "Track sales and stock changes in real-time",
        "feature3Title": "Easy Records",
        "feature3Desc": "Record new sales and stock easily"
      },
      "signup": {
        "success": "Account created successfully!",
        "slogan": "Join us to manage your inventory",
        "usernamePlaceholder": "Create a username",
        "emailPlaceholder": "Enter your email",
        "phonePlaceholder": "Enter your phone number",
        "passwordPlaceholder": "Create a password",
        "confirmPassword": "Confirm Password",
        "confirmPasswordPlaceholder": "Confirm your password"
      },
      "validation": {
        "usernameRequired": "Username is required",
        "emailRequired": "Email is required",
        "phoneRequired": "Phone number is required",
        "passwordRequired": "Password is required",
        "passwordsNoMatch": "Passwords do not match"
      }
    },
    // Users
    "users": {
      "title": "Users Management",
      "addUser": "Add User",
      "name": "Name",
      "email": "Email",
      "role": "Role",
      "status": "Status",
      "lastLogin": "Last Login",
      "actions": "Actions",
      "editUser": "Edit User",
      "deleteUser": "Delete User",
      "confirmPassword": "Confirm Password",
      "userAdded": "User added successfully",
      "userUpdated": "User updated successfully",
      "userDeleted": "User deleted successfully"
    },
    // Units
    "units": {
      "title": "Units of Measurement",
      "addUnit": "Add Unit",
      "name": "Name",
      "symbol": "Symbol",
      "description": "Description",
      "editUnit": "Edit Unit",
      "deleteUnit": "Delete Unit",
      "unitAdded": "Unit added successfully",
      "unitUpdated": "Unit updated successfully",
      "unitDeleted": "Unit deleted successfully",
      "unitsFetched": "Units fetched successfully",
      "failedToFetch": "Failed to fetch units",
      "failedToAdd": "Failed to add unit",
      "failedToUpdate": "Failed to update unit",
      "failedToDelete": "Failed to delete unit",
      "noUnits": "No units found"
    },
    // Common
    "common": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "add": "Add",
      "search": "Search",
      "actions": "Actions",
      "loading": "Loading...",
      "success": "Success",
      "error": "Error",
      "confirm": "Confirm",
      "close": "Close",
      "back": "Back"
    },
    // Notifications
    "notifications": {
      "title": "Notifications",
      "markAllRead": "Mark all as read",
      "noNotifications": "No notifications",
      "newNotification": "New notification"
    },
    "colors": "Colors",
    "sizes": "Sizes",
    "lowThresholdValue": "Low Threshold Value",
    "description": "Description",
    "adding": "Adding...",
    "cancel": "Cancel",
    "createAccount": "Create Account",
    "signIn": "Sign in",
    "phoneNumber": "Phone Number"
  },
  sw: {
    // Navigation
    "nav": {
      "dashboard": "Dashibodi",
      "sales": "Mauzo",
      "stock": "Maongezo ya Bidhaa",
      "products": "Bidhaa",
      "adjustments": "Marekebisho ya Hifadhi",
      "reports": "Ripoti",
      "settings": "Mipangilio"
    },
    // App
    "app": {
      "name": "Hifadhi Yangu",
      "logout": "Toka"
    },
    // Dashboard
    "dashboard": {
      "title": "Dashibodi",
      "last7days": "Siku 7 zilizopita",
      "totalProductsSold": "Jumla ya Bidhaa Zilizouzwa",
      "totalProductsAdded": "Jumla ya Bidhaa Zilizoongezwa",
      "totalProductsInStore": "Jumla ya Bidhaa Dukani",
      "monthlySalesOverview": "Muhtasari wa Mauzo ya Kila Mwezi",
      "topSellingProducts": "Bidhaa Zinazouzwa Zaidi",
      "bestSeller": "Bora",
      "recentTransactions": "Miamala ya Hivi Karibuni",
      "last5transactions": "Miamala 5 ya mwisho"
    },
    // Add Product Page
    "addProduct": {
      "title": "Ongeza Bidhaa Mpya",
      "backToProducts": "Rudi kwenye Bidhaa",
      "productName": "Jina la Bidhaa",
      "enterProductName": "Ingiza jina la bidhaa",
      "productUnit": "Kipimo cha Bidhaa",
      "selectUnit": "Chagua kipimo",
      "mainCategory": "Kundi Kuu",
      "subCategory": "Kundi Ndogo",
      "lowThreshold": "Kiwango cha Chini",
      "description": "Maelezo",
      "cancel": "Ghairi",
      "addProduct": "Ongeza Bidhaa",
      "saving": "Inahifadhi...",
      "productAdded": "Bidhaa imeongezwa kwa mafanikio"
    },
    // Add Sale Transaction Page
    "addSale": {
      "title": "Rekodi Muamala wa Uuzaji",
      "subtitle": "Ongeza bidhaa zilizouzwa kufuatilia mabadiliko ya hisa",
      "backToSales": "Rudi kwenye Mauzo",
      "saleDate": "Tarehe ya Uuzaji",
      "productItems": "Bidhaa",
      "searchProducts": "Tafuta bidhaa...",
      "productName": "Jina la Bidhaa",
      "productColor": "Rangi ya Bidhaa",
      "productSize": "Ukubwa wa Bidhaa",
      "quantity": "Kiasi",
      "selectedItems": "Bidhaa Zilizochaguliwa",
      "noProductsFound": "Hakuna bidhaa zilizopatikana",
      "noProductsSelected": "Hakuna bidhaa zilizochaguliwa kwa uuzaji",
      "remove": "Ondoa",
      "cancel": "Ghairi",
      "saveSaleTransaction": "Hifadhi Muamala wa Uuzaji",
      "saving": "Inahifadhi..."
    },
    // Add Stock Addition Page
    "addStock": {
      "title": "Ongeza Hisa",
      "subtitle": "Ongeza hisa mpya kuongeza viwango vya hisa",
      "backToStockAdditions": "Rudi kwenye Kuongeza Hisa",
      "stockAdditionDate": "Tarehe ya Kuongeza Hisa",
      "productItems": "Bidhaa",
      "searchProducts": "Tafuta bidhaa...",
      "productName": "Jina la Bidhaa",
      "productColor": "Rangi ya Bidhaa",
      "productSize": "Ukubwa wa Bidhaa",
      "quantity": "Kiasi",
      "selectedItems": "Bidhaa Zilizochaguliwa",
      "noProductsFound": "Hakuna bidhaa zilizopatikana",
      "noProductsSelected": "Hakuna bidhaa zilizochaguliwa kwa kuongeza",
      "remove": "Ondoa",
      "cancel": "Ghairi",
      "saveStockAddition": "Hifadhi Uongezaji wa Hisa",
      "saving": "Inahifadhi..."
    },
    // Add Inventory Adjustment Page
    "addAdjustment": {
      "title": "Ongeza Marekebisho ya Hisa",
      "subtitle": "Rekebisha viwango vya hisa kwa tofauti",
      "backToAdjustments": "Rudi kwenye Marekebisho",
      "adjustmentDate": "Tarehe ya Marekebisho",
      "adjustmentReason": "Sababu ya Marekebisho",
      "selectReason": "Chagua sababu",
      "reasons": {
        "damaged": "Imeharibiwa",
        "expired": "Imeisha muda",
        "lost": "Imepotea",
        "found": "Imepatikana",
        "recount": "Kuhesabu upya",
        "other": "Nyingine"
      },
      "description": "Maelezo",
      "enterDescription": "Ingiza maelezo ya marekebisho",
      "productItems": "Bidhaa",
      "searchProducts": "Tafuta bidhaa...",
      "productName": "Jina la Bidhaa",
      "productColor": "Rangi ya Bidhaa",
      "productSize": "Ukubwa wa Bidhaa",
      "currentQuantity": "Kiasi cha Sasa Kwenye Mfumo",
      "adjustedQuantity": "Kiasi Halisi Kilichopo Dukani",
      "difference": "Tofauti",
      "selectedItems": "Bidhaa Zilizochaguliwa",
      "noProductsFound": "Hakuna bidhaa zilizopatikana",
      "noProductsSelected": "Hakuna bidhaa zilizochaguliwa kwa marekebisho",
      "remove": "Ondoa",
      "cancel": "Ghairi",
      "saveAdjustment": "Hifadhi Marekebisho",
      "saving": "Inahifadhi..."
    },
    // Products
    "products": {
      "title": "Bidhaa",
      "name": "Jina la Bidhaa",
      "color": "Rangi",
      "size": "Ukubwa",
      "quantity": "Kiasi",
      "unit": "Kipimo",
      "threshold": "Kiwango",
      "status": "Hali",
      "addProduct": "Ongeza Bidhaa",
      "editProduct": "Hariri Bidhaa",
      "deleteProduct": "Futa Bidhaa",
      "productAdded": "Bidhaa imeongezwa kwa mafanikio",
      "productUpdated": "Bidhaa imesasishwa kwa mafanikio",
      "productDeleted": "Bidhaa imefutwa kwa mafanikio",
      "productsFetched": "Bidhaa zimepatikana kwa mafanikio",
      "failedToFetch": "Imeshindwa kupata bidhaa",
      "failedToUpdate": "Imeshindwa kusasisha bidhaa",
      "failedToDelete": "Imeshindwa kufuta bidhaa",
      "noProducts": "Hakuna bidhaa",
      "search": "Tafuta bidhaa..."
    },
    // Stock
    "stock": {
      "title": "Maongezi ya Bidhaa",
      "addStock": "Ongeza Bidhaa",
      "quantity": "Kiasi",
      "date": "Tarehe",
      "search": "Tafuta hisa...",
      "noStock": "Hakuna hisa",
      "editStockAddition": "Hariri Uongezaji wa Bidhaa",
      "deleteStockAddition": "Futa Uongezaji wa Bidhaa",
      "stockUpdated": "Hifadhi imesasishwa kwa mafanikio",
      "stockDeleted": "Hifadhi imefutwa kwa mafanikio",
      "dataFetched": "Data ya hifadhi imepatikana kwa mafanikio",
      "failedToLoad": "Imeshindwa kupakia data ya hifadhi",
      "dataLoaded": "Data ya hifadhi imepakiwa kwa mafanikio",
    },
    // Sales
    "sales": {
      "transactions": {
        "title": "Rekodi ya Mauzo"
      },
      "searchSales": "Tafuta mauzo...",
      "fromDate": "Kutoka Tarehe",
      "toDate": "Hadi Tarehe",
      "clearFilters": "Futa Vichujio",
      "importCSV": "Leta CSV",
      "exportCSV": "Hamisha CSV",
      "recordSale": "Rekodi Uuzaji",
      "productName": "Jina la Bidhaa",
      "productColor": "Rangi ya Bidhaa",
      "productSize": "Ukubwa wa Bidhaa",
      "quantitySold": "Kiasi Kilichouzwa",
      "saleDate": "Tarehe ya Uuzaji",
      "noSales": "Hakuna mauzo",
      "showing": "Inaonyesha",
      "to": "hadi",
      "of": "ya",
      "entries": "maingizo",
      "editSale": "Hariri Uuzaji",
      "deleteSale": "Futa Uuzaji",
      "saleUpdated": "Uuzaji umesasishwa kwa mafanikio",
      "saleDeleted": "Uuzaji umefutwa kwa mafanikio",
      "dataFetched": "Data imepatikana kwa mafanikio",
      "failedToFetch": "Imeshindwa kupata data",
    },
    // Settings
    "settings": {
      "title": "Mipangilio",
      "organization": "Shirika",
      "organizationDesc": "Dhibiti mipangilio ya shirika",
      "users": "Usimamizi wa Watumiaji",
      "usersDesc": "Dhibiti akaunti za watumiaji na ruhusa",
      "products": "Usimamizi wa Bidhaa",
      "productsDesc": "Dhibiti katalogi ya bidhaa",
      "units": "Vipimo",
      "unitsDesc": "Dhibiti vipimo",
      "language": "Lugha",
      "english": "Kiingereza",
      "kiswahili": "Kiswahili"
    },
    // Reports
    "reports": {
      "title": "Ripoti",
      "dailySales": "Ripoti ya Mauzo ya Kila Siku",
      "dailySalesDesc": "Ona utendaji wa mauzo ya kila siku",
      "monthlySales": "Ripoti ya Mauzo ya Kila Mwezi",
      "monthlySalesDesc": "Ona mwelekeo wa mauzo ya kila mwezi",
      "yearlySales": "Ripoti ya Mauzo ya Kila Mwaka",
      "yearlySalesDesc": "Ona muhtasari wa mauzo ya kila mwaka",
      "dailyStock": "Ripoti ya Hisa ya Kila Siku",
      "dailyStockDesc": "Ona harakati za hisa za kila siku",
      "monthlyStock": "Ripoti ya Hisa ya Kila Mwezi",
      "monthlyStockDesc": "Ona mwelekeo wa hisa za kila mwezi",
      "yearlyStock": "Ripoti ya Hisa ya Kila Mwaka",
      "yearlyStockDesc": "Ona muhtasari wa hisa za kila mwaka"
    },
    // Authentication
    "auth": {
      "username": "Jina la mtumiaji",
      "password": "Nenosiri",
      "forgotPassword": "Umesahau nenosiri?",
      "signIn": "Ingia",
      "noAccount": "Huna akaunti?",
      "createAccount": "Unda Akaunti",
      "login": {
        "title": "Ingia",
        "subtitle": "Ingiza maelezo yako ya kuingia ili kufikia mfumo",
        "usernamePlaceholder": "Ingiza jina lako la mtumiaji",
        "passwordPlaceholder": "Ingiza nenosiri lako",
        "slogan": "Suluhisho Lako la Usimamizi wa Hifadhi",
        "feature1Title": "Salama & Zaidi ya Kuaminika",
        "feature1Desc": "Usalama wa kiwango cha biashara kwa data yako",
        "feature2Title": "Analytiki za Wakati Halisi",
        "feature2Desc": "Fuatilia mauzo na mabadiliko ya hisa kwa wakati halisi",
        "feature3Title": "Rekodi Rahisi",
        "feature3Desc": "Rekodi mauzo mapya na maongezo ya bidhaa kwa urahisi"
      },
      "signup": {
        "success": "Akaunti imeundwa kwa mafanikio!",
        "slogan": "Jiunge nasi ili kudhibiti hifadhi yako",
        "usernamePlaceholder": "Unda jina la mtumiaji",
        "emailPlaceholder": "Ingiza barua yako ya pepe",
        "phonePlaceholder": "Ingiza nambari yako ya simu",
        "passwordPlaceholder": "Unda nenosiri",
        "confirmPassword": "Thibitisha Nenosiri",
        "confirmPasswordPlaceholder": "Thibitisha nenosiri lako"
      },
      "validation": {
        "usernameRequired": "Jina la mtumiaji linahitajika",
        "emailRequired": "Barua pepe inahitajika",
        "phoneRequired": "Nambari ya simu inahitajika",
        "passwordRequired": "Nenosiri linahitajika",
        "passwordsNoMatch": "Nenosiri halilingani"
      }
    },
    // Users
    "users": {
      "title": "Usimamizi wa Watumiaji",
      "addUser": "Ongeza Mtumiaji",
      "name": "Jina",
      "email": "Barua Pepe",
      "role": "Jukumu",
      "status": "Hali",
      "lastLogin": "Ingiza Mwisho",
      "actions": "Hatua",
      "editUser": "Hariri Mtumiaji",
      "deleteUser": "Futa Mtumiaji",
      "confirmPassword": "Thibitisha Nenosiri",
      "userAdded": "Mtumiaji ameongezwa kwa mafanikio",
      "userUpdated": "Mtumiaji amesasishwa kwa mafanikio",
      "userDeleted": "Mtumiaji ameondolewa kwa mafanikio"
    },
    // Units
    "units": {
      "title": "Vipimo vya Kipimo",
      "addUnit": "Ongeza Kipimo",
      "name": "Jina",
      "symbol": "Alama",
      "description": "Maelezo",
      "editUnit": "Hariri Kipimo",
      "deleteUnit": "Futa Kipimo",
      "unitAdded": "Kipimo kimeongezwa kwa mafanikio",
      "unitUpdated": "Kipimo kimesasishwa kwa mafanikio",
      "unitDeleted": "Kipimo kimeondolewa kwa mafanikio",
      "unitsFetched": "Vipimo vimepatikana kwa mafanikio",
      "failedToFetch": "Imeshindwa kupata vipimo",
      "failedToAdd": "Imeshindwa kuongeza kipimo",
      "failedToUpdate": "Imeshindwa kusasisha kipimo",
      "failedToDelete": "Imeshindwa kufuta kipimo",
      "noUnits": "Hakuna vipimo vilivyopatikana"
    },
    // Common
    "common": {
      "save": "Hifadhi",
      "cancel": "Ghairi",
      "delete": "Futa",
      "edit": "Hariri",
      "add": "Ongeza",
      "search": "Tafuta",
      "actions": "Hatua",
      "loading": "Inapakia...",
      "success": "Mafanikio",
      "error": "Kosa",
      "confirm": "Thibitisha",
      "close": "Funga",
      "back": "Rudi"
    },
    // Notifications
    "notifications": {
      "title": "Arifa",
      "markAllRead": "Mark all as read",
      "noNotifications": "No notifications",
      "newNotification": "New notification"
    },
    "colors": "Rangi",
    "sizes": "Sizes",
    "lowThresholdValue": "Thamani ya Kiwango cha Chini",
    "description": "Maelezo",
    "adding": "Inahifadhi...",
    "cancel": "Ghairi",
    "createAccount": "Unda Akaunti",
    "signIn": "Ingia",
    "phoneNumber": "Nambari ya Simu"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as string;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = (key: string) => {
    const keys = key.split('.');
    let translation: Record<string, unknown> = translations[language];

    for (const k of keys) {
      if (translation && Object.prototype.hasOwnProperty.call(translation, k)) {
        translation = translation[k] as Record<string, unknown>;
      } else {
        return key; // fallback to key if not found
      }
    }

    // If translation is a string, return it. If not, fallback to key.
    return typeof translation === 'string' ? translation : key;
  };

  const value = { language, setLanguage, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
