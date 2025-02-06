import React, { useState, useRef, useEffect } from "react";
import { HfInference } from "@huggingface/inference"; // Import Hugging Face API
import {
  Send,
  Bot,
  User,
  Paperclip,
  Image,
  MoreHorizontal,
} from "lucide-react";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm your farming assistant. How can I help you with your products today?",
      loading: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize Hugging Face Inference client
  const client = new HfInference("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"); // Replace with your Hugging Face API key

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: newMessage.trim(),
      loading: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);
    setError(null);

    try {
      const maxRetries = 3;
      let retryCount = 0;
      let lastError;

      while (retryCount < maxRetries) {
        try {
          const stream =  client.chatCompletionStream({
            model: "google/gemma-2-2b-it", // Replace with your model of choice
            messages: [
              {
                role: "user",
                content: `
You are an AI assistant designed to help farmers manage their products and inventory.
Recognize user intents such as:
- "Show me vegetables"
- "Update price for tomatoes"
- "What is the availability for mangoes?"

Allow users to dynamically add, update, or delete products during the session.

Capture and handle the following key product attributes:
- Product name
- Price per unit
- Available quantity
- Harvest season/date
- Location details

Your goal is to help farmers efficiently manage their product listings and pricing, ensuring real-time updates and ease of access to inventory details.
`,
              },
              ...messages.map((msg) => ({
                role: msg.type === "user" ? "user" : "assistant",
                content: msg.text,
              })),
            ],
            max_tokens: 500,
          });

          let botResponse = "";
          for await (const chunk of stream) {
            if (chunk.choices && chunk.choices.length > 0) {
              const newContent = chunk.choices[0].delta.content;
              botResponse += newContent;
            }
          }

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: "bot",
              text: botResponse,
              loading: false,
            },
          ]);
          return;
        } catch (err) {
          lastError = err;
          retryCount++;

          if (!err.message.includes("500")) {
            throw err;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 8000))
          );
        }
      }

      throw lastError;
    } catch (error) {
      console.error("Chat Error:", error);

      let errorMessage =
        "An unexpected error occurred. Please try again later.";

      if (error.message.includes("500")) {
        errorMessage =
          "The server is temporarily unavailable. Please try again in a few moments.";
      } else if (error.message.includes("429")) {
        errorMessage =
          "Too many requests. Please wait a moment before trying again.";
      } else if (error.message.includes("401")) {
        errorMessage =
          "Authentication error. Please check your API credentials.";
      }

      setError(error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: errorMessage,
          loading: false,
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const Message = ({ message }) => (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`flex ${
          message.type === "user" ? "flex-row-reverse" : "flex-row"
        } items-end space-x-2`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            message.type === "user" ? "bg-blue-500 ml-2" : "bg-gray-700 mr-2"
          }`}
        >
          {message.type === "user" ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
        <div
          className={`${
            message.type === "user"
              ? "bg-blue-600 text-white"
              : message.isError
              ? "bg-red-900 text-white"
              : "bg-gray-800 text-gray-100"
          } rounded-lg p-4 max-w-[80%]`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Farming Assistant
            </h2>
            <p className="text-sm text-gray-400">
              {error ? "Error Connecting" : isTyping ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-full">
          <MoreHorizontal className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex space-x-2 bg-gray-800 rounded-lg p-4">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <Paperclip className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <Image className="w-5 h-5 text-gray-400" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me about your farming products..."
            className="flex-1 bg-gray-800 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !newMessage.trim()}
            className={`p-2 rounded-full transition-colors ${
              isTyping || !newMessage.trim()
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
