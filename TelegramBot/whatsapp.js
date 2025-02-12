const TelegramBot = require("node-telegram-bot-api");

// Replace with your bot token from BotFather
const token = "7568983450:AAHZnN7sLPks2vcvIc0oW5zAYfMMjYbC49c";

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

// In-memory session storage
const sessions = {};

// Product database (for demonstration)
const products = [
    { name: "Tomato", price: 30, district: "Coimbatore", farmer: "Farmer1", availability: 7 },
    { name: "Cabbage", price: 40, district: "Coimbatore", farmer: "Farmer2", availability: 5 },
];

// Helper function to get user session
const getSession = (chatId) => {
    if (!sessions[chatId]) {
        sessions[chatId] = { state: "IDLE" }; // Initialize session
    }
    return sessions[chatId];
};

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const session = getSession(chatId);

    session.state = "MAIN_MENU";
    bot.sendMessage(chatId, "Welcome! Are you a farmer or a buyer?", {
        reply_markup: {
            keyboard: [["Farmer", "Buyer"]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
});

// Handle farmer login
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const session = getSession(chatId);

    if (session.state === "MAIN_MENU" && text === "Farmer") {
        session.state = "FARMER_LOGIN";
        bot.sendMessage(chatId, "Please provide product details (name, price, quantity, and availability).");
    } else if (session.state === "FARMER_LOGIN") {
        // Parse product details (for simplicity, assume input is in the correct format)
        const [name, price, quantity, availability] = text.split(" ");
        products.push({ name, price: parseInt(price), quantity: parseInt(quantity), availability: parseInt(availability), farmer: `Farmer${chatId}` });

        session.state = "IDLE";
        bot.sendMessage(chatId, "Product added successfully!");
    }
});

// Handle buyer login
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const session = getSession(chatId);

    if (session.state === "MAIN_MENU" && text === "Buyer") {
        session.state = "BUYER_MENU";
        bot.sendMessage(chatId, "Hi! How can I assist you today?", {
            reply_markup: {
                keyboard: [["Search for products", "Compare prices", "Place an order"]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    } else if (session.state === "BUYER_MENU" && text === "Search for products") {
        session.state = "BUYER_SEARCH";
        bot.sendMessage(chatId, "Enter the product name and district (e.g., Tomatoes Coimbatore):");
    } else if (session.state === "BUYER_SEARCH") {
        const [productName, district] = text.split(" ");
        const filteredProducts = products.filter(
            (p) => p.name.toLowerCase() === productName.toLowerCase() && p.district.toLowerCase() === district.toLowerCase()
        );

        if (filteredProducts.length > 0) {
            const productList = filteredProducts.map((p) => `${p.name} (₹${p.price}/kg)`).join("\n");
            bot.sendMessage(chatId, `Here are the available products:\n${productList}`);
        } else {
            bot.sendMessage(chatId, "No products found.");
        }
        session.state = "BUYER_MENU";
    } else if (session.state === "BUYER_MENU" && text === "Place an order") {
        session.state = "BUYER_ORDER";
        bot.sendMessage(chatId, "Enter the product name, price, and quantity (e.g., Tomato 28 50):");
    } else if (session.state === "BUYER_ORDER") {
        const [productName, price, quantity] = text.split(" ");
        const product = products.find((p) => p.name.toLowerCase() === productName.toLowerCase());

        if (product) {
            bot.sendMessage(chatId, `Order placed for ${quantity} kg of ${productName} at ₹${price}/kg.`);
            // Trigger negotiation (for demonstration)
            bot.sendMessage(chatId, "Negotiation started with the farmer. Please wait for confirmation.");
        } else {
            bot.sendMessage(chatId, "Product not found.");
        }
        session.state = "IDLE";
    }
});

console.log("Bot is running...");