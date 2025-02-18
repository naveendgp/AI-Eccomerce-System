const TelegramBot = require("node-telegram-bot-api");
const { MongoClient } = require("mongodb");

// Replace these values with your actual credentials
const token = "7568983450:AAHZnN7sLPks2vcvIc0oW5zAYfMMjYbC49c";
const uri = "mongodb+srv://madhiuksha:madhi%40551@mernstack.ymu81.mongodb.net/";

// MongoDB database settings
const dbName = "Buyer";
const collectionName = "products";

// Create a new Telegram bot instance
const bot = new TelegramBot(token, { polling: true });

// In-memory sessions to track conversation state
const sessions = {};

// Helper: Connect to MongoDB
async function getCollection() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  return { collection, client };
}

// A helper to view all products
async function viewProducts(chatId) {
  try {
    const { collection, client } = await getCollection();
    const products = await collection.find().toArray();
    await client.close();

    if (products.length === 0) {
      return bot.sendMessage(chatId, "No products found.");
    }

    const response = products
      .map(
        (p) =>
          `Name: ${p.productName}\nCategory: ${p.productCategory}\nPrice: ${p.productPrice}\nQuantity: ${p.productQuantity}\nLocation: ${p.productLocation}\nUnit: ${p.productUnit}\nFreshness: ${p.productFreshness}\nHarvest Date: ${p.HarvestDate}`
      )
      .join("\n\n");
    bot.sendMessage(chatId, response);
  } catch (err) {
    console.error("Error fetching products:", err);
    bot.sendMessage(chatId, "Failed to fetch products. Please try again.");
  }
}

// /start command: shows a main menu with inline keyboard buttons
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sessions[chatId] = {}; // reset session

  const welcomeMessage =
    "Welcome to the Product Bot!\n\nPlease choose a command:";
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Add Product", callback_data: "addProduct" }],
        [{ text: "Delete Product", callback_data: "deleteProduct" }],
        [{ text: "Edit Product", callback_data: "editProduct" }],
        [{ text: "View All Products", callback_data: "viewProducts" }],
        [{ text: "View A Product", callback_data: "viewProduct" }],
      ],
    },
  };
  bot.sendMessage(chatId, welcomeMessage, options);
});

// Handle inline button presses (for main commands and suggestion choices)
bot.on("callback_query", (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;
  
  // If the data is one of the main commands, start fresh:
  if (["addProduct", "deleteProduct", "editProduct", "viewProducts", "viewProduct"].includes(data)) {
    sessions[chatId] = { command: data, step: null };
    if (data === "addProduct") {
      sessions[chatId].step = "awaitProductName";
      // Offer suggestions for product name with an "Other" option.
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Tomato", callback_data: "pn:Tomato" },
              { text: "Potato", callback_data: "pn:Potato" },
              { text: "Cabbage", callback_data: "pn:Cabbage" }
            ],
            [{ text: "Other", callback_data: "pn:Other" }]
          ]
        },
        parse_mode: "Markdown"
      };
      bot.sendMessage(chatId, "Choose a Product Name or tap 'Other' to type your own:", options);
    } else if (data === "deleteProduct") {
      bot.sendMessage(chatId, "Enter the product name to delete:");
    } else if (data === "editProduct") {
      bot.sendMessage(
        chatId,
        "For editing, please type in the following format:\n\n" +
          "productName newProductName newProductCategory newProductPrice newProductQuantity newProductLocation newProductUnit newProductFreshness",
        { parse_mode: "Markdown" }
      );
    } else if (data === "viewProducts") {
      viewProducts(chatId);
      sessions[chatId] = {};
    } else if (data === "viewProduct") {
      bot.sendMessage(chatId, "Enter the product name to view:");
    }
  }
  // Handle product name suggestions for addProduct
  else if (data.startsWith("pn:") && sessions[chatId]?.command === "addProduct" && sessions[chatId].step === "awaitProductName") {
    const value = data.split(":")[1];
    if (value === "Other") {
      // If "Other" is selected, prompt user to type product name.
      bot.sendMessage(chatId, "Please type the Product Name:");
    } else {
      sessions[chatId].productName = value;
      sessions[chatId].step = "awaitProductQuantity";
      // Offer quantity suggestions with an "Other" option.
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "10", callback_data: "qty:10" },
              { text: "50", callback_data: "qty:50" },
              { text: "100", callback_data: "qty:100" }
            ],
            [{ text: "Other", callback_data: "qty:Other" }]
          ]
        },
        parse_mode: "Markdown"
      };
      bot.sendMessage(chatId, "Choose a Product Quantity or tap 'Other' to type your own:", options);
    }
  }
  // Handle quantity suggestions for addProduct
  else if (data.startsWith("qty:") && sessions[chatId]?.command === "addProduct" && sessions[chatId].step === "awaitProductQuantity") {
    const value = data.split(":")[1];
    if (value === "Other") {
      bot.sendMessage(chatId, "Please type the Product Quantity:");
    } else {
      sessions[chatId].productQuantity = value;
      sessions[chatId].step = "awaitProductCategory";
      bot.sendMessage(chatId, "Enter the Product Category:");
    }
  }
  
  bot.answerCallbackQuery(callbackQuery.id);
});

// Handle text messages based on conversation state
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Ignore commands
  if (text.startsWith("/")) return;
  
  // If no session or command, ignore:
  if (!sessions[chatId] || !sessions[chatId].command) return;
  
  const command = sessions[chatId].command;
  
  // --- ADD PRODUCT Multi-step Process ---
  if (command === "addProduct") {
    // Check the current step and update session accordingly.
    if (sessions[chatId].step === "awaitProductName" && !sessions[chatId].productName) {
      // User typed product name when "Other" was selected.
      sessions[chatId].productName = text.trim();
      sessions[chatId].step = "awaitProductQuantity";
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "10", callback_data: "qty:10" },
              { text: "50", callback_data: "qty:50" },
              { text: "100", callback_data: "qty:100" }
            ],
            [{ text: "Other", callback_data: "qty:Other" }]
          ]
        },
        parse_mode: "Markdown"
      };
      bot.sendMessage(chatId, "Choose a Product Quantity or tap 'Other' to type your own:", options);
    } else if (sessions[chatId].step === "awaitProductQuantity" && !sessions[chatId].productQuantity) {
      // User typed a custom quantity.
      sessions[chatId].productQuantity = text.trim();
      sessions[chatId].step = "awaitProductCategory";
      bot.sendMessage(chatId, "Enter the Product Category:");
    } else if (sessions[chatId].step === "awaitProductCategory") {
      sessions[chatId].productCategory = text.trim();
      sessions[chatId].step = "awaitProductPrice";
      bot.sendMessage(chatId, "Enter the Product Price:");
    } else if (sessions[chatId].step === "awaitProductPrice") {
      sessions[chatId].productPrice = text.trim();
      sessions[chatId].step = "awaitProductLocation";
      bot.sendMessage(chatId, "Enter the Product Location:");
    } else if (sessions[chatId].step === "awaitProductLocation") {
      sessions[chatId].productLocation = text.trim();
      sessions[chatId].step = "awaitProductUnit";
      bot.sendMessage(chatId, "Enter the Product Unit (e.g., Kg, Ltr):");
    } else if (sessions[chatId].step === "awaitProductUnit") {
      sessions[chatId].productUnit = text.trim();
      sessions[chatId].step = "awaitProductFreshness";
      bot.sendMessage(chatId, "Enter the Product Freshness (e.g., Fresh, Old):");
    } else if (sessions[chatId].step === "awaitProductFreshness") {
      sessions[chatId].productFreshness = text.trim();
      
      // Automatically set Harvest Date to today's date (YYYY-MM-DD)
      const today = new Date();
      const year = today.getFullYear();
      const month = ("0" + (today.getMonth() + 1)).slice(-2);
      const day = ("0" + today.getDate()).slice(-2);
      sessions[chatId].HarvestDate = `${year}-${month}-${day}`;
      
      // Insert product into MongoDB
      try {
        const { collection, client } = await getCollection();
        await collection.insertOne({
          productName: sessions[chatId].productName,
          productQuantity: sessions[chatId].productQuantity,
          productCategory: sessions[chatId].productCategory,
          productPrice: sessions[chatId].productPrice,
          productLocation: sessions[chatId].productLocation,
          productUnit: sessions[chatId].productUnit,
          productFreshness: sessions[chatId].productFreshness,
          HarvestDate: sessions[chatId].HarvestDate
        });
        await client.close();
        bot.sendMessage(chatId, "Product added successfully!");
      } catch (err) {
        console.error("Error adding product:", err);
        bot.sendMessage(chatId, "Failed to add product. Please try again.");
      }
      sessions[chatId] = {};
    }
  }
  // --- DELETE PRODUCT ---
  else if (command === "deleteProduct") {
    const productName = text.trim();
    try {
      const { collection, client } = await getCollection();
      const result = await collection.deleteOne({ productName });
      await client.close();
      if (result.deletedCount > 0) {
        bot.sendMessage(chatId, "Product deleted successfully!");
      } else {
        bot.sendMessage(chatId, "Product not found.");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      bot.sendMessage(chatId, "Failed to delete product. Please try again.");
    }
    sessions[chatId] = {};
  }
  // --- EDIT PRODUCT ---
  else if (command === "editProduct") {
    const args = text.split(" ");
    if (args.length < 8) {
      bot.sendMessage(
        chatId,
        "Invalid format. Please enter details as:\n\n" +
          "productName newProductName newProductCategory newProductPrice newProductQuantity newProductLocation newProductUnit newProductFreshness",
        { parse_mode: "Markdown" }
      );
      return;
    }
    const [
      productName,
      newProductName,
      newProductCategory,
      newProductPrice,
      newProductQuantity,
      newProductLocation,
      newProductUnit,
      newProductFreshness,
    ] = args;
    try {
      const { collection, client } = await getCollection();
      const result = await collection.updateOne(
        { productName },
        {
          $set: {
            productName: newProductName,
            productCategory: newProductCategory,
            productPrice: newProductPrice,
            productQuantity: newProductQuantity,
            productLocation: newProductLocation,
            productUnit: newProductUnit,
            productFreshness: newProductFreshness,
          },
        }
      );
      await client.close();
      if (result.modifiedCount > 0) {
        bot.sendMessage(chatId, "Product updated successfully!");
      } else {
        bot.sendMessage(chatId, "Product not found or no changes made.");
      }
    } catch (err) {
      console.error("Error editing product:", err);
      bot.sendMessage(chatId, "Failed to edit product. Please try again.");
    }
    sessions[chatId] = {};
  }
  // --- VIEW SINGLE PRODUCT ---
  else if (command === "viewProduct") {
    const productName = text.trim();
    try {
      const { collection, client } = await getCollection();
      const product = await collection.findOne({ productName });
      await client.close();
      if (product) {
        const response =
          `Name: ${product.productName}\n` +
          `Category: ${product.productCategory}\n` +
          `Price: ${product.productPrice}\n` +
          `Quantity: ${product.productQuantity}\n` +
          `Location: ${product.productLocation}\n` +
          `Unit: ${product.productUnit}\n` +
          `Freshness: ${product.productFreshness}\n` +
          `Harvest Date: ${product.HarvestDate}`;
        bot.sendMessage(chatId, response);
      } else {
        bot.sendMessage(chatId, "Product not found.");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      bot.sendMessage(chatId, "Failed to fetch product. Please try again.");
    }
    sessions[chatId] = {};
  }
});

console.log("Telegram bot is running...");
