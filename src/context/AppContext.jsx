import { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Core Filter State - dates are blank by default, only logDir has a default
  const [fromDate, setFromDate] = useState(""); // Blank on fresh login
  const [toDate, setToDate] = useState("");     // Blank on fresh login
  const [logDir, setLogDir] = useState("C:/RGS/LOGS"); // Always has default
  
  // UI State (Global Search & Sidebar)
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Helper to clear all filters when switching RGS projects
  const resetFilters = useCallback(() => {
    setFromDate("");
    setToDate("");
    setGlobalSearch("");
    // logDir is NOT reset - it keeps its value
  }, []);

  // Validation: Ensure the date range is logical for log analysis
  const isDateRangeValid = fromDate && toDate ? new Date(fromDate) <= new Date(toDate) : true;

  const value = {
    // State
    fromDate,
    toDate,
    logDir,
    globalSearch,
    isSidebarOpen,
    isDateRangeValid,
    
    // Setters
    setFromDate,
    setToDate,
    setLogDir,
    setGlobalSearch,
    setIsSidebarOpen,
    resetFilters
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};