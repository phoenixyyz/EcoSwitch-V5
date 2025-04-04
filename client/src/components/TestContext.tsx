import { useChat } from "@/context/ChatContext";

export default function TestContext() {
  const { apiKey } = useChat();
  
  return (
    <div>
      <h1>Context Test</h1>
      <p>API Key is {apiKey ? 'set' : 'not set'}</p>
    </div>
  );
}