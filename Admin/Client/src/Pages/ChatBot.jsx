import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Bot,
  User,
  Paperclip,
  Image,
  MoreHorizontal,
  Send,
} from "lucide-react";

const ChatBot = () => {

  const productCategories = {
    vegetables: [
      "tomato",
      "potato",
      "onion",
      "carrot",
      "cabbage",
      "broccoli",
      "spinach",
      "cucumber",
      "lettuce",
      "pepper",
      "beetroot",
      "corn",
      "peas",
      "beans",
      "cauliflower",
      "eggplant",
      "celery",
      "asparagus",
      "garlic",
      "green chilly",
      "green beans",
      "bell pepper",
      "lady finger",
      "bitter gourd",
      "bottle gourd",
      "ridge gourd",
      "snake gourd",
      "ivy gourd",
      "cluster beans",
    ],
    fruits: [
      "apple",
      "banana",
      "orange",
      "grape",
      "mango",
      "strawberry",
      "pineapple",
      "watermelon",
      "kiwi",
      "peach",
      "pear",
      "plum",
      "cherry",
      "blueberry",
      "raspberry",
      "blackberry",
      "pomegranate",
      "papaya",
      "guava",
      "fig",
      "dragonfruit",
      "passion fruit",
      "lychee",
      "coconut",
    ],
    grains: [
      "rice",
      "wheat",
      "corn",
      "barley",
      "oats",
      "millet",
      "quinoa",
      "rye",
      "sorghum",
      "buckwheat",
      "amaranth",
      "teff",
      "wild rice",
      "kamut",
      "spelt",
      "triticale",
    ],
  };

  const determineCategory = (productName) => {
    const lowerProduct = productName.toLowerCase();

    // Check for exact matches first
    for (const [category, products] of Object.entries(productCategories)) {
      if (products.includes(lowerProduct)) {
        return category;
      }
    }

    // Check for partial matches
    for (const [category, products] of Object.entries(productCategories)) {
      for (const product of products) {
        if (lowerProduct.includes(product) || product.includes(lowerProduct)) {
          return category;
        }
      }
    }

    return "other"; // Default category if no match is found
  };
  
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
  const [currentProduct, setCurrentProduct] = useState(null);
  const [awaitingPrice, setAwaitingPrice] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [awaitingDetails, setAwaitingDetails] = useState(false); // For multi-step add product flow
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (text, isError = false) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "bot",
        text: text,
        loading: false,
        isError: isError,
      },
    ]);
  };

  const processMessage = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Handle multi-step flows
    if (awaitingPrice) {
      return handlePriceInput(userMessage);
    }
    if (awaitingConfirmation) {
      return handleConfirmation(userMessage);
    }
    if (awaitingDetails) {
      return handleAddProductDetails(userMessage);
    }

    // Detect intent
    if (lowerMessage.includes("update") && lowerMessage.includes("price")) {
      return handleUpdatePrice(userMessage);
    } else if (lowerMessage.includes("delete")) {
      return handleDelete(userMessage);
    } else if (
      lowerMessage.includes("add") ||
      lowerMessage.includes("insert")
    ) {
      return handleAdd(userMessage);
    } else if (lowerMessage.includes("show") || lowerMessage.includes("list")) {
      return handleListProducts(userMessage);
    } else if (lowerMessage.includes("help")) {
      return `I can help you with:
- Updating product prices
- Adding new products
- Deleting products
- Showing product listings
What would you like to do?`;
    } else {
      return "I'm sorry, I didn't understand that. Type 'help' for a list of commands.";
    }
  };

  const handleUpdatePrice = async (message) => {
    const productMatch = message.match(
      /(?:price of|update)\s+(\w+)(?:\s+to\s+(\d+))?/i
    );
    if (!productMatch) {
      return "Could you specify which product you'd like to update?";
    }

    const productName = productMatch[1];
    const newPrice = productMatch[2];

    try {
      const response = await axios.get(
        `http://localhost:5000/singleProduct/${productName}`
      );
      setCurrentProduct(response.data);

      if (!newPrice) {
        setAwaitingPrice(true);
        return `Could you please provide the new price for ${productName}?`;
      }

      return handlePriceUpdate(productName, newPrice);
    } catch (error) {
      return `I couldn't find ${productName} in our database. Please check the product name.`;
    }
  };

  const handlePriceInput = async (message) => {
    const priceMatch = message.match(/(\d+)/);
    if (!priceMatch) {
      return "Please provide a valid price in numbers.";
    }

    setAwaitingPrice(false);
    return handlePriceUpdate(currentProduct.name, priceMatch[1]);
  };

  const handlePriceUpdate = async (productName, newPrice) => {
    try {
      const response = await axios.put(`/api/products/${productName}`, {
        price: newPrice,
      });

      setAwaitingConfirmation(true);
      return `I'll update the price of ${productName} from Rs.${currentProduct.price} to Rs.${newPrice}. Is this correct? (Yes/No)`;
    } catch (error) {
      return "Sorry, I couldn't update the price. Please try again.";
    }
  };

  const handleConfirmation = async (message) => {
    setAwaitingConfirmation(false);

    if (message.toLowerCase().includes("yes")) {
      try {
        await axios.put(`/api/products/${currentProduct.name}`, {
          price: currentProduct.newPrice,
        });
        return "Great! I've updated the price successfully.";
      } catch (error) {
        return "Sorry, there was an error updating the price.";
      }
    } else {
      return "Okay, I won't update the price. Is there anything else I can help you with?";
    }
  };

  const handleDelete = async (message) => {
    const productMatch = message.match(/delete\s+(\w+)/i);
    if (!productMatch) {
      return "Which product would you like to delete?";
    }

    const productName = productMatch[1];
    try {
      await axios.delete(`/api/products/${productName}`);
      return `I've deleted ${productName} from the database.`;
    } catch (error) {
      return `I couldn't delete ${productName}. Please check if the product exists.`;
    }
  };

  const handleAdd = async (message) => {
    const productMatch = message.match(/add\s+([a-zA-Z\s]+)/i);
    if (!productMatch) {
      return "Which product would you like to add?";
    }

    const productName = productMatch[1].trim();
    setCurrentProduct({ name: productName });
    setAwaitingDetails(true);
    return `Please provide details for ${productName} in this format:
- Quantity: [number]
- Price: [number]
- Freshness: [fresh/good/average]
- Location: [location]`;
  };

  const handleAddProductDetails = async (message) => {
    const detailsMatch = message.match(
      /quantity\s+(\d+).*price\s+(\d+).*freshness\s+(\w+).*location\s+([a-zA-Z\s]+)/i
    );
    if (!detailsMatch) {
      return "Please provide all required details in the correct format.";
    }

    const [, quantity, price, freshness, location] = detailsMatch;
    const category = determineCategory(currentProduct.name);

    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format

      const response = await axios.post("http://localhost:5000/addproduct", {
        productName: currentProduct.name,
        productPrice: parseInt(price),
        productQuantity: parseInt(quantity),
        HarvestDate: formattedDate,
        productFreshness: freshness,
        productCategory: category,
        productLocation: location,
        productUnit: "kg",
      });

      setAwaitingDetails(false);
      return `I've added ${currentProduct.name} with the following details:
- Category: ${category}
- Price: Rs.${price}
- Quantity: ${quantity}
- Freshness: ${freshness}
- Location: ${location}
- Harvest Date: ${formattedDate}`;
    } catch (error) {
      console.error("Error adding product:", error);
      return "Sorry, I couldn't add the product. Please try again.";
    }
  };

  const handleListProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getproduct");
      const products = response.data.data;
      return `Here are the current products:\n${products
        .map(
          (p) =>
            `- ${p.productName}: Rs.${p.productPrice} (Quantity: ${p.productQuantity})`
        )
        .join("\n")}`;
    } catch (error) {
      return "Sorry, I couldn't retrieve the product list.";
    }
  };

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
      const botResponse = await processMessage(userMessage.text);
      addBotMessage(botResponse);
    } catch (error) {
      console.error("Chat Error:", error);
      addBotMessage(
        "An error occurred while processing your request. Please try again.",
        true
      );
      setError(error.message);
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
          } rounded-lg p-4 max-w-[80%] whitespace-pre-wrap`}
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
