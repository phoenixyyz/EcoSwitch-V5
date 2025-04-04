import { useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/context/ChatContext";
import { ConversationType } from "@/lib/types";

export default function PromptHistoryList() {
  const { conversations, selectConversation, clearHistory } = useChat();
  
  const formatTimestamp = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, "p"); // e.g. "3:30 PM"
    } else if (isYesterday(timestamp)) {
      return "Yesterday";
    } else {
      return format(timestamp, "MMM d"); // e.g. "Jan 1"
    }
  };
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Prompt History</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={() => clearHistory()}
        >
          Clear All
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {conversations.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {conversations.map((conversation) => (
              <HistoryItem
                key={conversation.id}
                conversation={conversation}
                onSelect={selectConversation}
                formatTime={formatTimestamp}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No prompt history yet
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface HistoryItemProps {
  conversation: ConversationType;
  onSelect: (id: number) => void;
  formatTime: (timestamp: Date) => string;
}

function HistoryItem({ conversation, onSelect, formatTime }: HistoryItemProps) {
  const handleClick = () => {
    if (conversation.id) {
      onSelect(conversation.id);
    }
  };
  
  const timestamp = conversation.timestamp ? new Date(conversation.timestamp) : new Date();
  const timeDisplay = formatTime(timestamp);
  
  return (
    <div 
      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
      onClick={handleClick}
    >
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
        {conversation.title}
      </p>
      <div className="flex items-center mt-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">{timeDisplay}</span>
        <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {conversation.model === "gpt-4o" ? "GPT-4" : conversation.model === "gpt-3.5-turbo" ? "GPT-3.5" : conversation.model}
        </span>
      </div>
    </div>
  );
}
