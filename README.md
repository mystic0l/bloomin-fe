# Business Digitalizer

A web platform designed to help small shopkeepers digitize and manage their businesses without requiring extensive technical knowledge.

The platform enables shopkeepers to manage their shops, products, and customer orders while providing customers with an easy way to browse shops, explore products, and place orders.

## Features

### For Shopkeepers

- Quick shop setup
- Digital storefront management
- Product management
- Support for product variants, flavors, quantities, and prices
- Order management and status updates
- QR code generation for customer access
- Support for pickup and home delivery
- Hindi and English language support

### For Customers

- Browse shops by category
- Search for products across shops
- View shop and product details
- Add products to the cart
- Place pickup or delivery orders
- Track order status
- View order history
- Select payment preferences

## Tech Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- PostgreSQL
- pg

### Other Tools

- Lucide React
- QR Code Generation using qrcode


## User Flows

### Shopkeeper Flow

1. Register or log in as a shopkeeper.
2. Complete the shop setup process.
3. Add and manage products.
4. Manage incoming customer orders.
5. Update order statuses.
6. Generate a QR code for customers to access the shop.

### Customer Flow

1. Browse available shops.
2. Search for products.
3. View shop and product details.
4. Add products to the cart.
5. Choose between pickup and delivery.
6. Enter the required order details.
7. Select a payment preference.
8. Place an order.
9. Track the order status.

## Payment Flow

The platform does not currently process payments directly.

Supported payment preferences include:

- Cash on Delivery
- UPI on Delivery

Payments are handled directly between customers and shopkeepers.

## Language Support

The application currently supports:

- English
- Hindi (हिंदी)

## Database

The application uses PostgreSQL for storing and managing application data, including:

- Users
- Shop details
- Products
- Orders
- Order status information

## Future Enhancements

- Voice input for shopkeepers
- Advanced sales analytics
- Additional language support
- Payment gateway integration
- Bulk product uploads
- Cloud image storage
- Enhanced notifications
