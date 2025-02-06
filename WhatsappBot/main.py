from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
import requests

app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def webhook():
    incoming_msg = request.form.get("Body").lower()
    response = MessagingResponse()

    if "order status" in incoming_msg:
        # Fetch order status from your e-commerce database
        order_id = incoming_msg.split()[-1]  # Extract order ID
        status = get_order_status(order_id)  # Custom function
        response.message(f"Your order status is: {status}")
    elif "search" in incoming_msg:
        # Search for products
        query = incoming_msg.replace("search", "").strip()
        products = search_products(query)  # Custom function
        response.message(f"Here are the products: {products}")
    else:
        response.message("How can I assist you today?")

    return str(response)

def get_order_status(order_id):
    # Fetch order status from your database
    return "Shipped"  # Example

def search_products(query):
    # Search products in your database
    return "Product 1, Product 2, Product 3"  # Example

if __name__ == "__main__":
    app.run(debug=True)