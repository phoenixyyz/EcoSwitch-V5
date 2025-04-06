import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-6">What is EcoSwitch AI?</h1>
        
        <p className="mb-6 text-lg">
          <span className="text-cyan-500 dark:text-cyan-400 font-semibold">EcoSwitch AI</span> is a smart, cost-saving AI assistant that helps you use powerful AI tools without overpaying. Instead of locking you into one subscription, it lets you connect with multiple AI providers—like OpenAI, DeepSeek, or even free options.
        </p>

        <h2 className="text-xl font-semibold text-cyan-500 dark:text-cyan-400 mt-8 mb-4">What's an API Key?</h2>
        <p>An <strong>API key</strong> is like your personal access pass to advanced AI tools like ChatGPT. It tells the AI service, "This person is allowed to use this."</p>
        <p className="mt-2">By using your own key, you:</p>
        <ul className="list-disc pl-8 mt-2 space-y-1">
          <li>Get full control of your usage</li>
          <li>Only pay for what you use</li>
          <li>Keep your chats private to you</li>
        </ul>
        <p className="mt-2">If you don't have a key, EcoSwitch AI also includes a free fallback model so you can still chat without one.</p>

        <h2 className="text-xl font-semibold text-cyan-500 dark:text-cyan-400 mt-8 mb-4">Why Not Just Use ChatGPT Premium?</h2>
        
        {/* Responsive comparison for mobile screens */}
        <div className="md:hidden space-y-6 mb-4">
          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">50 AI-generated images</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">OpenAI API:</p>
                <p className="font-semibold">~$2.00</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ChatGPT Premium:</p>
                <p className="font-semibold">$20.00/month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Small text tasks</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">OpenAI API:</p>
                <p className="font-semibold">~$0.01–0.10</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ChatGPT Premium:</p>
                <p className="font-semibold">Included</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Cost when unused</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">OpenAI API:</p>
                <p className="font-semibold">$0.00</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ChatGPT Premium:</p>
                <p className="font-semibold">$20/month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Flexibility</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">OpenAI API:</p>
                <p className="font-semibold">High (choose models)</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ChatGPT Premium:</p>
                <p className="font-semibold">GPT-4 only</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Traditional table for desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-gray-50 dark:bg-slate-900 rounded-lg overflow-hidden mt-4">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-200 dark:bg-slate-700 text-left">Feature</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-slate-700 text-left">OpenAI API (Pay-as-you-go)</th>
                <th className="px-4 py-3 bg-gray-200 dark:bg-slate-700 text-left">ChatGPT Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">50 AI-generated images</td>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">~$2.00</td>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">$20.00/month</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">Small text tasks</td>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">~$0.01–0.10</td>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">Included</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">Cost when unused</td>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">$0.00</td>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">$20/month</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">Flexibility</td>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">High (choose models)</td>
                <td className="border border-gray-300 dark:border-slate-700 px-4 py-3">GPT-4 only</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold text-cyan-500 dark:text-cyan-400 mt-8 mb-4">How It Works:</h2>
        <ol className="list-decimal pl-8 space-y-2">
          <li>Paste your OpenAI or DeepSeek API key (or skip to use free mode)</li>
          <li>EcoSwitch AI routes your prompt to the smartest and cheapest AI available</li>
          <li>You only pay when your key is used—and only for what you need</li>
        </ol>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2">OpenRouter Free Credit</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            OpenRouter provides 1GB of free credit that can be used with any model. This is approximately:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>5,000+ text-only messages with Llama 3 or GPT-3.5</li>
            <li>25+ image analyses with multimodal models</li>
          </ul>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-500">
            Note: Usage is tracked by OpenRouter, not by EcoSwitch AI. Credit refreshes every month.
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          With EcoSwitch AI, you get smart results, lower costs, and total control.
        </p>

        <div className="mt-8">
          <Link href="/">
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white transform transition-transform hover:scale-105" 
              size="lg"
            >
              Back to App
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}