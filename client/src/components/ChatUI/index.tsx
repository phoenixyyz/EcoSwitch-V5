import { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { useChat } from "@/context/ChatContext";

export default function ChatUI() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { apiKey, messages, isLoading } = useChat();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <MainContent 
        toggleSidebar={toggleSidebar}
        isAuthenticated={!!apiKey}
        hasMessages={messages.length > 0}
        isLoading={isLoading}
      />
    </div>
  );
}
