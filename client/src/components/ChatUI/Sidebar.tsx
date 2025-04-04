import { useState } from "react";
import { X } from "lucide-react";
import APIKeySection from "./APIKeySection";
import SettingsSection from "./SettingsSection";
import PromptHistoryList from "./PromptHistoryList";
import UsageSection from "./UsageSection";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  return (
    <div 
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-full md:w-80 flex-shrink-0 
        ${isOpen ? 'flex' : 'hidden'} md:flex flex-col transition-all duration-300 z-10 h-screen relative`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-cyan-500 text-transparent bg-clip-text">EcoSwitch AI</h1>
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <APIKeySection />
        <SettingsSection />
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <UsageSection />
        </div>
        <PromptHistoryList />
        
        {/* Add padding to ensure last items aren't cut off */}
        <div className="h-16"></div>
      </div>
      
      {/* Made by tag */}
      <div className="absolute bottom-2 left-3 opacity-50 text-xs text-gray-500 dark:text-gray-400">
        Made by Phoenix_YYZ
      </div>
    </div>
  );
}
