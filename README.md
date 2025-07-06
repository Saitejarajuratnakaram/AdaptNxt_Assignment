#  E-commerce API & Frontend

Welcome to a modern, full-featured e-commerce backend and frontend project! This app lets you browse products, manage your cart, place orders, and—if you're an admin—manage products and view all users and their orders. The UI is clean, responsive, and feels like a real online store.

---

## 🚀 Features

- **Product Listings:**
  - Browse all products with images, prices, and categories
  - Search by name or category
  - Pagination for easy navigation

- **Cart Management:**
  - Add products to your cart
  - Update quantities or remove items
  - See a running total and product images in a modern popup cart

- **Order Creation:**
  - Place an order directly from your cart
  - View your order history

- **User Authentication & Roles:**
  - Register and log in securely (JWT-based)
  - Two roles: `customer` and `admin`
  - Customers can shop and order; admins can manage products and view all users/orders

- **Admin Dashboard:**
  - Add, edit, and delete products (with instant updates and pagination)
  - View all users and their orders in a professional table
  - Cancel edit mode, confirmation dialogs, and more

- **Modern Frontend:**
  - Responsive, mobile-friendly design
  - Toast notifications, loading spinners, and smooth UI
  - Sticky header, card layouts, and professional color palette

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Frontend:** HTML, CSS, JavaScript (Fetch API)
- **Other:** dotenv, cors, nodemon

---

## ⚡ Getting Started

1. **Clone the repo & install dependencies:**
   ```sh
   git clone <your-repo-url>
   cd ecommerce-api
   npm install
   ```

2. **Set up your `.env` file:**
   Create a `.env` file in the root with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

3. **Start the server:**
   ```sh
   npm run dev
   ```
   The app will run at [http://localhost:5000](http://localhost:5000)

4. **Seed products (first time only):**
   Use Postman or curl to POST to `/products/seed` to add demo products.

---

## 👤 User & Admin Guide

### Customers
- Register and log in from the homepage.
- Browse, search, and paginate products.
- Add items to your cart, update quantities, or remove them.
- Place orders and view your order history.

### Admins
- To make a user an admin, set their `role` to `admin` in your MongoDB database (Atlas UI or MongoDB client).
- Log in as admin to see the "Admin" dashboard button.
- In the admin dashboard, you can:
  - Add, edit, and delete products (with instant updates and pagination)
  - View all users and their orders in a professional table
  - Cancel editing a product with the "Cancel Edit" button
  - See confirmation dialogs before deleting products

---

## 🖼️ Screenshots & UX Notes
- **Sticky header** keeps navigation always visible
- **Cart popup** slides in with product images, prices, and a running total
- **Admin dashboard** is clean, paginated, and easy to use
- **Toast notifications** and spinners provide instant feedback
- **Fully responsive**—works great on mobile and desktop

---

## 💡 Tips
- All protected routes require a valid JWT (handled automatically by the frontend after login)
- Only admins can access product management and user/order views
- You can further customize the UI, add dark mode, or extend features as you wish!

---

## 📬 Questions or Feedback?
Feel free to open an issue or suggest improvements. Enjoy your new e-commerce platform! 
