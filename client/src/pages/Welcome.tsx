import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useChat } from '@/context/ChatContext';

export default function Welcome() {
  const { createNewConversation } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [typedText, setTypedText] = useState('');
  const subtitle = "The intelligent assistant that optimizes AI usage costs";
  
  // Typing animation effect
  useEffect(() => {
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= subtitle.length) {
        setTypedText(subtitle.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, 40); // Adjust the typing speed
    
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    setIsLoading(true);
    createNewConversation();
    // The Link component will navigate to the main app
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-slate-900 bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            EcoSwitch AI
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm md:text-base whitespace-nowrap overflow-hidden">
            <span className="inline-block animate-cursor">
              {typedText}
              <span className="inline-block h-4 w-px bg-cyan-500 animate-blink"></span>
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="my-6 flex flex-col gap-4">
            <Link href="/chat">
              <Button 
                className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                size="lg"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Get Started"}
              </Button>
            </Link>
            
            <Link href="/about">
              <Button 
                variant="outline" 
                className="w-full py-6 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300" 
                size="lg"
              >
                What is This?
              </Button>
            </Link>
          </div>
          
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
            <p>No account needed. Use your own API keys or try the free mode.</p>
          </div>
        </div>
      </div>
    </div>
  );
}