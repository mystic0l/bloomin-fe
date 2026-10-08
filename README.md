# BloomIn

### Give Every Small Shop a Digital Storefront

BloomIn is a lightweight web platform designed to help small shopkeepers digitize their businesses without requiring technical expertise or the cost of hiring a web developer.

---

## The Problem

Many small shop owners still do not have an online presence.

For a small business owner, creating a digital storefront can be difficult for several reasons:

- Hiring a developer may be too expensive.
- They may not have the technical knowledge to build a website themselves.
- They may not know where to find someone who can build one for them.
- Setting up and maintaining an online store can feel unnecessarily complicated.

Because of these barriers, many local businesses remain primarily offline and are difficult for customers to discover and access digitally.

### BloomIn's Approach

BloomIn was built around a simple idea:

> **A small shopkeeper should be able to create a digital storefront without needing to know how to build a website.**

Instead of requiring a shopkeeper to learn web development, hire a developer, or navigate complicated e-commerce software, BloomIn provides a guided setup process.

The shopkeeper provides basic information about their business and creates their digital storefront through a simple setup flow.

Once the shop is created, the shopkeeper can add products, manage orders, and generate a QR code that customers can scan to access the storefront.

The goal is not to turn every shopkeeper into a web developer.

The goal is to make getting online simple enough that they do not need to become one.

---

## How BloomIn Works

### For Shopkeepers

1. Sign up or log in using an email or Google account.
2. Complete the guided shop setup.
3. Create a digital storefront.
4. Add products with details such as name, price, quantity, and supported variants.
5. Manage products and incoming customer orders.
6. Update order statuses.
7. Generate a QR code for the storefront.
8. Share the QR code with customers.

### For Customers

1. Log in.
2. Browse available shops.
3. Open a shop and view its products.
4. Add products to the cart.
5. Choose pickup or delivery where supported.
6. Enter order details.
7. Place an order.
8. View order history and order status.

---

## Screenshots

### 1. Customer Storefront

Customers can browse available shops and discover local businesses through the platform.

**Screenshot:**

<img width="1600" height="736" alt="customerstorefront" src="https://github.com/user-attachments/assets/6ea36669-6910-4d35-9ed3-3300112d0e3b" />


---

### 2. Customer Cart

Customers can select products and review their cart before placing an order.

**Screenshot:**

<img width="1600" height="765" alt="customer" src="https://github.com/user-attachments/assets/a13e9a4f-f054-46b8-b13c-dbe1bdd250fb" />


---

### 3. Shopkeeper Dashboard

Shopkeepers can manage their digital storefront and business information from their dashboard.

The dashboard can be viewed in both English and Hindi, making BloomIn more accessible to shopkeepers who may be more comfortable using Hindi.

**Screenshot:**

<img width="1600" height="732" alt="shopkeeper dashboard" src="https://github.com/user-attachments/assets/4f3bf924-cbdb-458b-92d5-edfcd4843244" />


---

### 4. QR Storefront Access

Each shop can generate a QR code that customers can scan to access its digital storefront.

**Screenshot:**

<img width="1600" height="733" alt="QRcode" src="https://github.com/user-attachments/assets/ef8af91b-59e8-40a4-bb3a-41ab32146996" />


---

### 5. Guided Shop Setup & Product Addition

BloomIn is designed to keep the process of digitizing a shop simple.

Shopkeepers provide basic information during the guided setup process and can quickly add products to their storefront.

**Screenshot:**

<img width="1600" height="685" alt="productsname" src="https://github.com/user-attachments/assets/b1b38c21-42a0-4a27-8d4d-a4ebc7c7ca19" />


---

## Features

### Shopkeeper Features

- Guided shop setup
- Digital storefront creation
- Product management
- Product variants, flavors, quantities, and prices
- Order management
- Order status updates
- QR code generation
- Pickup and home delivery support
- Hindi and English language support

### Customer Features

- Browse available shops
- Search for products
- View shop and product details
- Add products to cart
- Place pickup or delivery orders
- Track order status
- View order history
- Select payment preferences

---

## Authentication

BloomIn uses Firebase Authentication for user authentication.

Authenticated users receive Firebase ID tokens, which are verified by the backend before protected operations are performed.

The backend uses the authenticated user's identity to enforce ownership of shopkeeper resources and customer orders.

This prevents users from simply supplying another user's shop, product, or order identifier to access resources they do not own.

---

## Architecture

BloomIn follows a client-server architecture with a Next.js frontend, an Express.js backend API, Firebase Authentication, and PostgreSQL for persistent data storage.

### System Architecture

~~~~text
                         BloomIn
                            │
              ┌─────────────┴─────────────┐
              │                           │
       Next.js Frontend              Firebase Auth
              │
              │ REST API Requests
              ▼
       Node.js + Express
              │
              │
              ▼
       PostgreSQL Database
~~~~

### Main Application Flow

~~~~text
User
  │
  ▼
Next.js Frontend
  │
  │ API Request + Firebase ID Token
  ▼
Express REST API
  │
  ├── Authentication
  │
  ├── Authorization
  │
  └── Business Logic
          │
          ▼
   PostgreSQL Database
~~~~

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- PostgreSQL
- `pg`

### Authentication

- Firebase Authentication
- Firebase Admin SDK

### Other Tools

- Lucide React
- `qrcode`

---

## Database

BloomIn uses PostgreSQL for persistent application data.

The database stores information related to:

- Users
- Shops
- Products
- Orders
- Order items
- Order status information

The backend communicates with PostgreSQL using the `pg` Node.js client.

### Core Data Flow

~~~~text
Shopkeeper
    │
    ▼
Create Shop
    │
    ▼
Add Products
    │
    ▼
PostgreSQL
    │
    ▼
Customer Browses Shop
    │
    ▼
Creates Order
    │
    ▼
Order Stored in PostgreSQL
    │
    ▼
Shopkeeper Views Order
~~~~

---

## User Flows

### Shopkeeper Flow

~~~~text
Register / Login
       ↓
Shop Setup
       ↓
Create Digital Storefront
       ↓
Add Products
       ↓
Manage Products
       ↓
Receive Customer Orders
       ↓
Update Order Status
       ↓
Generate QR Code
~~~~

### Customer Flow

~~~~text
Register / Login
       ↓
Browse Available Shops
       ↓
Open Shop
       ↓
View Products
       ↓
Add Products to Cart
       ↓
Checkout
       ↓
Order Created
       ↓
Order History / Status
~~~~

---

## Payment

BloomIn does not currently process online payments directly.

The current application supports payment preferences such as:

- Cash on Delivery
- UPI on Delivery

Payments are handled directly between customers and shopkeepers.

---

## Language Support

BloomIn currently supports:

- English
- Hindi (हिंदी)

The bilingual interface is intended to make the platform more accessible to shopkeepers who may prefer using Hindi.

---

## QR Storefront Access

BloomIn provides QR code generation for shops.

The intended flow is:

~~~~text
Shopkeeper Creates Shop
        ↓
Generate QR Code
        ↓
Customer Scans QR
        ↓
Customer Opens Shop
        ↓
Customer Browses Products
~~~~

This allows a physical shop to provide customers with a direct way to access its digital storefront.

---

## Deployment

BloomIn is deployed using:

- **Frontend:** Vercel
- **Backend API:** Render
- **Database:** Neon PostgreSQL

### Production Architecture

~~~~text
                 Production
                     │
                     ▼
              Vercel Frontend
                     │
                     │ API Requests
                     ▼
               Render API
                     │
                     ▼
              Neon PostgreSQL
~~~~

Production configuration uses environment variables rather than hard-coded local API or database settings.

---

## Running Locally

### 1. Clone the Repository

~~~~bash
git clone <repository-url>
cd bloomin-fe
~~~~

### 2. Install Frontend Dependencies

~~~~bash
npm install
~~~~

### 3. Install Backend Dependencies

~~~~bash
cd backend
npm install
~~~~

### 4. Configure Environment Variables

Create the required environment variables for the frontend and backend.

The frontend requires the production or local API URL through the appropriate environment variable.

The backend requires database and Firebase configuration.

Do not commit:

- Database passwords
- Firebase service-account files
- API secrets
- Other private credentials

### 5. Start the Backend

From the `backend` directory:

~~~~bash
node server.js
~~~~

The backend will start on the configured `PORT`.

### 6. Start the Frontend

From the project root:

~~~~bash
npm run dev
~~~~

The frontend can then be accessed through the local Next.js development server.

---

## Known Limitations

BloomIn is designed as a lightweight small-business digitization platform rather than a full enterprise e-commerce system.

Current limitations include:

- Online payment processing is not implemented.
- Payment preferences are currently handled directly between customers and shopkeepers.
- Image storage is currently basic and is not backed by a dedicated cloud image-storage service.
- Advanced real-time notification infrastructure is outside the current scope.
- The application is not intended to represent enterprise-scale infrastructure.

---

## Future Improvements

Possible future improvements include:

- Voice-assisted shop setup
- Advanced sales analytics
- Additional language support
- Payment gateway integration
- Bulk product uploads
- Dedicated cloud image storage
- Enhanced notification capabilities

---

## Why BloomIn?

BloomIn is built around a simple goal:

> **Make going digital accessible to small businesses that may not have the money, technical expertise, or resources to build a digital storefront themselves.**

Instead of asking a shopkeeper to learn web development, hire a developer, or figure out complicated e-commerce software, BloomIn aims to give them a simpler path:

~~~~text
Basic Shop Information
        ↓
Digital Storefront
        ↓
Add Products
        ↓
Generate QR
        ↓
Customers Discover & Order
~~~~

The name **BloomIn** reflects the idea of helping small businesses establish a digital presence and grow in an increasingly digital marketplace.
