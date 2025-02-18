import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Bot,
  User,
  Paperclip,
  Image,
  MoreHorizontal,
  Send,
  Package2,
} from "lucide-react";

import Emoji from "../data/Emoji";

import productCategories from "../data/ProductCategories";

const Chat = () => {
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
  const [awaitingDetails, setAwaitingDetails] = useState(false);
  const [awaitingOrderDetails, setAwaitingOrderDetails] = useState(false);
  const messagesEndRef = useRef(null);

  // Utility Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const determineCategory = (productName) => {
    const lowerProduct = productName.toLowerCase();

    for (const [category, products] of Object.entries(productCategories)) {
      if (products.includes(lowerProduct)) {
        return category;
      }
    }
    return "other";
  };

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
    let intentHandled = false; // Flag to track if intent was handled
    let botResponse = "";
    if (lowerMessage.includes("hello")) {
      botResponse =
        "Hello! I'm your Admin assistant. How can I help you with your products today?";
    }
    if (lowerMessage.includes("order")) {
      botResponse =
        "Please provide the order details in this format: Customer Name, Payment Method, Product Name and Quantity, Total Amount";
    }
    // Handle multi-step flows
    if (awaitingOrderDetails) {
      intentHandled = true;
      botResponse = await collectOrderDetails(userMessage);
    } else if (awaitingPrice) {
      intentHandled = true;
      botResponse = await handlePriceInput(userMessage);
    } else if (awaitingConfirmation) {
      intentHandled = true;
      botResponse = await handleConfirmation(userMessage);
    } else if (awaitingDetails) {
      intentHandled = true;
      botResponse = await handleAddProductDetails(userMessage);
    } else {
      // Detect intent
      if (lowerMessage.includes("update") && lowerMessage.includes("price")) {
        intentHandled = true;
        botResponse = await handleUpdatePrice(userMessage);
      } else if (
        lowerMessage.includes("place") ||
        lowerMessage.includes("order")
      ) {
        intentHandled = true;
        console.log("Order intent detected"); // Debugging log
        setAwaitingOrderDetails(true);
        botResponse = `Please provide the order details in this format:
Customer Name, Payment Method, Product Name and Quantity, Total Amount
For example: John Doe, Cash, Tomatoes 2kg, 500`;
      } else if (lowerMessage.includes("delete")) {
        intentHandled = true;
        botResponse = await handleDelete(userMessage);
      } else if (
        lowerMessage.includes("add") ||
        lowerMessage.includes("insert")
      ) {
        intentHandled = true;
        botResponse = await handleAdd(userMessage);
      } else if (
        lowerMessage.includes("show") ||
        lowerMessage.includes("list")
      ) {
        intentHandled = true;
        botResponse = await handleListProducts(userMessage);
      } else if (lowerMessage.includes("help")) {
        intentHandled = true;
        botResponse = `I can help you with:
- Updating product prices
- Adding new products
- Deleting products
- Showing product listings
- Placing orders
What would you like to do?`;
      }
    }

    // If intent was handled by custom logic, return the response
    if (intentHandled) {
      return botResponse;
    }

    // If intent was not handled, call the Hugging Face API
    return callHuggingFaceAPI(userMessage);
  };

  const callHuggingFaceAPI = async (userMessage) => {
    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/your-model-name",
        {
          inputs: userMessage,
        },
        {
          headers: {
            Authorization: `Bearer YOUR_HUGGING_FACE_API_KEY`,
          },
        }
      );
      return response.data[0].generated_text;
    } catch (error) {
      console.error("Error calling Hugging Face API:", error);
      return "Sorry, I couldn't process your request. Please try again.";
    }
  };

  // Order Handling
  const collectOrderDetails = async (message) => {
    console.log("Collecting order details:", message); // Debugging log

    // Split the message into details
    const details = message.split(",").map((detail) => detail.trim());

    // Validate the number of details provided
    if (details.length < 5) {
      return "Please provide all details in this format: Customer Name, Payment Method, Product Name and Quantity, Total Amount, Delivery Date (optional)";
    }

    // Extract details
    const [customerName, payment, products, total, deliveryDate] = details;

    // Set order date to today (as an array)
    const orderDate = [new Date().toISOString().split("T")[0]]; // Format: ["YYYY-MM-DD"]

    // Parse delivery date (if provided)
    const parsedDeliveryDate = deliveryDate
      ? new Date(deliveryDate)
      : new Date(); // Default to today if not provided

    // Create the order object
    const order = {
      orderId: "ORD" + Math.floor(Math.random() * 1000000), // Generate a random order ID
      customerName,
      payment,
      orderDate,
      products: [products], // Store products as an array
      total: parseFloat(total),
      status: "Pending", // Default status
      deliveryDate: parsedDeliveryDate, // Use provided date or default to today
    };

    try {
      // Send the order to the backend
      const response = await axios.post(
        "http://localhost:5000/placeorder",
        order
      );

      // Reset the state
      setAwaitingOrderDetails(false);

      // Return a success message with order details
      return `Order placed successfully!
Order ID: ${order.orderId}
Customer: ${customerName}
Payment Method: ${payment}
Products: ${products}
Total: Rs.${total}
Order Date: ${orderDate[0]}
Delivery Date: ${parsedDeliveryDate.toISOString().split("T")[0]}
Status: ${order.status}`;
    } catch (error) {
      console.error("Error placing order:", error);
      return "Sorry, I couldn't place the order. Please try again.";
    }
  };

  // Product Management
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
      await axios.put(`http://localhost:5000/updateProduct/${productName}`, {
        price: newPrice,
      });

      setAwaitingConfirmation(true);
      return `I'll update the price of ${productName} to Rs.${newPrice}. Is this correct? (Yes/No)`;
    } catch (error) {
      return "Sorry, I couldn't update the price. Please try again.";
    }
  };

  const handleAdd = async (message) => {
    // Check if the message contains an emoji
    const emoji = Object.keys(Emoji).find((emoji) =>
      message.includes(emoji)
    );

    // Replace the emoji with the corresponding product name
    let processedMessage = message;
    if (emoji) {
      processedMessage = processedMessage.replace(
        emoji,
        Emoji[emoji]
      );
    }

    const productMatch = processedMessage.match(/add\s+([a-zA-Z\s]+)/i);
    if (!productMatch) {
      return "Which product would you like to add?";
    }

    const productName = productMatch[1].trim();
    setCurrentProduct({ name: productName });
    setAwaitingDetails(true);
    return `Please provide details for ${productName} in this format:
Quantity [number], Price [number], Freshness [fresh/good/average], Location [location]`;
  };

  const handleAddProductDetails = async (message) => {
    try {
      // First check if the product exists
      try {
        const checkResponse = await axios.get(
          `http://localhost:5000/singleproduct/${currentProduct.name}`
        );

        if (checkResponse.data) {
          setAwaitingDetails(false);
          setCurrentProduct(null);
          return `A product with name "${currentProduct.name}" already exists in the database. Would you like to update it or add a different product?`;
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          throw error;
        }
      }
      if (
        message.toLowerCase().match(/cancel|exit|stop|don't|dont|no|never mind/)
      ) {
        setAwaitingDetails(false);
        setCurrentProduct(null);
        return "Product addition cancelled. What else can I help you with?";
      }

      const detailsMatch = message.match(
        /quantity\s+(\d+).*price\s+(\d+).*freshness\s+(\w+).*location\s+([a-zA-Z\s]+)/i
      );

      if (!detailsMatch) {
        return "Please provide all required details in the correct format.";
      }

      const [, quantity, price, freshness, location] = detailsMatch;
      const category = determineCategory(currentProduct.name);

      // If we get here, the product doesn't exist, so we can add it
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];

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

      if (response.data.data.status === 422) {
        setAwaitingDetails(false);
        setCurrentProduct(null);
        return "Product is already in the database. Please provide a new product name.";
      }

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
      setAwaitingDetails(false);
      setCurrentProduct(null);
      return "Sorry, I couldn't add the product. Please try again.";
    }
  };

  const handleListProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getproduct");
      const products = response.data.data;

      return (
        <div className="p-4 rounded-lg shadow-md w-full max-w-md mx-auto my-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">
              Here are the current products:
            </h2>
            <div className="space-y-2">
              {products.map((p) => (
                <div
                  className="flex justify-between items-center bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors"
                  key={p.productId}
                >
                  <div className="flex items-center gap-2">
                    <Package2 className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-white">
                      {p.productName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-white">
                      Rs.{p.productPrice}
                    </span>
                    <span className="block text-xs text-white">
                      Quantity: {p.productQuantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto my-2">
          <span className="text-xs text-gray-500">
            Bot • {new Date().toLocaleTimeString()}
          </span>
          <p className="mt-2 text-red-500">
            Sorry, I couldn't retrieve the product list.
          </p>
        </div>
      );
    }
  };

  const handleDelete = async (message) => {
    const productMatch = message.match(/delete\s+(\w+)/i);
    if (!productMatch) {
      return "Which product would you like to delete?";
    }

    const productName = productMatch[1];
    try {
      await axios.delete(`http://localhost:5000/deleteProduct/${productName}`);
      return `Deleted ${productName} from the database.`;
    } catch (error) {
      return `Couldn't delete ${productName}. Please check if it exists.`;
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

export default Chat;