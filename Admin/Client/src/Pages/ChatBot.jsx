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
  DollarSign,
  Package,
} from "lucide-react";

const Chat = () => {
  const HUGGING_FACE_API_KEY = "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";
  const CLAUDE_API_KEY =
    "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";
  const AI_MODEL_URL =
    "https://api-inference.huggingface.co/models/google/flan-t5-large";

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
  const [aiContext, setAiContext] = useState([]);

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

const getAIResponse = async (userMessage) => {
  try {
    const systemMessage = `You are an AI assistant. Answer briefly and clearly.`;
    const inputMessage = `${systemMessage}\n\nUser: ${userMessage}\nAI: `;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/gpt2-medium", // Updated model
      {
        inputs: inputMessage,
        parameters: {
          max_length: 100, // Limit the response length
          temperature: 0.7, // Adjust randomness
          top_p: 0.9, // For coherent responses
          do_sample: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`, // Replace with your key
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText = response.data.generated_text.trim();
    setAiContext((prev) => [...prev, userMessage, generatedText]);

    return generatedText || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("GPT API Error:", error);
    return "Sorry, there was an error processing your request. Please try again.";
  }
};





 const processMessage = async (userMessage) => {
   const updatePriceRegex =
     /(?:update|change)\s+(?:the\s+)?price\s+of\s+(\w+)/i;
   const lowerMessage = userMessage.toLowerCase();

   // Handle existing command flows first
    if (awaitingPrice) return handlePriceInput(userMessage); // Handle price input
    if (awaitingConfirmation) return handleConfirmation(userMessage);
    if (awaitingDetails) return handleAddProductDetails(userMessage);

   // Check for specific commands
   if (updatePriceRegex.test(lowerMessage)) {
     const productMatch = lowerMessage.match(updatePriceRegex);
     const productName = productMatch[1]; // Extract the product name
     return handleUpdatePrice(productName);
   } else if (lowerMessage.includes("delete")) {
     return handleDelete(userMessage);
   } else if (lowerMessage.includes("add") || lowerMessage.includes("insert")) {
     return handleAdd(userMessage);
   } else if (lowerMessage.includes("show") || lowerMessage.includes("list")) {
     return handleListProducts(userMessage);
   } else if (lowerMessage.includes("help")) {
     return `I can help you with:
- Updating product prices
- Adding new products
- Deleting products
- Showing product listings
- General farming advice and questions
What would you like to do?`;
   }

   // If no specific command is matched, use AI for response
   const aiResponse = await getAIResponse(userMessage);
   if (aiResponse) {
     return aiResponse;
   }

   // Fallback response if AI fails
   return "I'm sorry, I couldn't understand that. Type 'help' for a list of commands or ask me any farming-related questions.";
 };

const handleUpdatePrice = async (productName) => {
  try {
    // Step 1: Check if the product exists
    const productResponse = await axios.get(
      `http://localhost:5000/singleproduct/${productName}`
    );
    const product = productResponse.data;

    if (!product) {
      return `I couldn't find a product named "${productName}" in the database. Please check the product name.`;
    }

    // Step 2: Set the current product in the state
    setCurrentProduct(product); // Save the product for later use

    // Step 3: Ask the user for the new price
    setAwaitingPrice(true); // Set awaitingPrice to true
    return `Please provide the new price for ${productName}.`;
  } catch (error) {
    return "Sorry, there was an error fetching the product details.";
  }
};

  let PRODUCT_NAME = "" 
 const handlePriceInput = async (message) => {
   const priceMatch = message.match(/(\d+)/);

   if (!priceMatch) {
     return "Please provide a valid price in numbers.";
   }

   const newPrice = parseFloat(priceMatch[1]); // Convert the price to a number
   if (isNaN(newPrice)) {
     return "Please provide a valid price in numbers.";
   }

   // Check if currentProduct is null
   if (!currentProduct) {
     return "Sorry, I couldn't find the product details. Please try again.";
   }

   PRODUCT_NAME = currentProduct.productName;
   console.log("product", currentProduct);
   setAwaitingPrice(false); // Reset awaitingPrice to false
   return handlePriceUpdate(PRODUCT_NAME, newPrice); // Proceed to update the price
 };

const handlePriceUpdate = async (product, newPrice) => {
  // Check if product is null
  if (!product) {
    return "Sorry, I couldn't find the product details. Please try again.";
  }

  try {
    // Step 1: Prepare the update payload
    const updatePayload = { productPrice: newPrice };

    // Log the payload for debugging
    console.log("Sending update payload:", updatePayload);

    // Step 2: Send the update request to the API
    const response = await axios.put(
      `http://localhost:5000/updateProduct/${product}`,
      updatePayload
    );

    // Log the API response for debugging
    console.log("API response:", response.data);

    // Step 3: Update the state with the new price
    setCurrentProduct((prevProduct) => ({ ...prevProduct, price: newPrice }));

    // Step 4: Ask for confirmation
    setAwaitingConfirmation(true); // Set awaitingConfirmation to true
    return `I'll update the price of ${product} from Rs.${product.price} to Rs.${newPrice}. Is this correct? (Yes/No)`;
  } catch (error) {
    console.error(
      "Error updating price:",
      error.response?.data || error.message
    );
    return "Sorry, I couldn't update the price. Please try again.";
  }
};

 const handleConfirmation = async (message) => {
   setAwaitingConfirmation(false);

   if (message.toLowerCase().includes("yes")) {
     try {
       await axios.put(
         `http://localhost:5000/updateProduct/${currentProduct.name}`,
         {
           productPrice: currentProduct.newPrice,
         }
       );
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
      await axios.delete(`http://localhost:5000/deleteproduct/${productName}`);
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

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: newMessage.trim(),
      loading: false,
    };

    const loadingMessage = {
      id: Date.now() + 1,
      type: "bot",
      loading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setAiContext((prev) => [...prev, userMessage.text]);
    setNewMessage("");
    setIsTyping(true);
    setError(null);

    try {
      const botResponse = await processMessage(userMessage.text);
      // Remove loading message and add actual response
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingMessage.id)
          .concat({
            id: Date.now() + 2,
            type: "bot",
            text: botResponse,
            loading: false,
          })
      );
    } catch (error) {
      console.error("Chat Error:", error);
      // Remove loading message and add error message
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingMessage.id)
          .concat({
            id: Date.now() + 2,
            type: "bot",
            text: "I encountered an error processing your request. Please try again.",
            loading: false,
            isError: true,
          })
      );
      setError(error.message);
    } finally {
      setIsTyping(false);
    }
  };

  const Message = ({ message }) => {
    if (message.loading) {
      return (
        <div className="flex justify-start mb-4">
          <div className="flex flex-row items-end space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center space-x-2">
              <span className="text-gray-300">Thinking</span>
              <div className="flex space-x-1">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="w-2 h-2 bg-blue-500 mt-3 rounded-full animate-bounce"
                    style={{
                      animationDuration: "1s",
                      animationDelay: `${index * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
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
  };

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