# Business Digitalizer - Progressive Web App

A lightweight web platform to help small shopkeepers digitize their business without requiring technical knowledge. Built as a fully-featured Progressive Web App (PWA) with offline support, installable capability, and responsive design.

## Features

### For Shopkeepers
- Quick setup with 6-7 simple questions
- Digital storefront auto-generated
- Product management with variants, flavors, quantities, and prices
- Order notifications with sound alerts
- Real-time order tracking and status updates
- QR code generation for customer access
- Support for both takeout and home delivery
- UPI payment option for delivery orders
- Hindi and English language support

### For Customers
- Browse nearby shops by category
- Search products across all shops
- View detailed product information in table format
- Add items to cart with quantity selection
- Place orders with delivery/pickup details
- Track order status in real-time
- Order history and details
- Payment preference selection (Cash/UPI on delivery)

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **QR Code Generation**: qrcode library
- **PWA**: Service Worker, Web App Manifest
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Application Structure

```
src/
├── components/          # Reusable components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Auth.tsx        # Authentication
│   ├── customer/       # Customer-specific pages
│   │   ├── ShopList.tsx
│   │   ├── ShopView.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   └── Orders.tsx
│   └── shopkeeper/     # Shopkeeper-specific pages
│       ├── ShopSetup.tsx
│       ├── Dashboard.tsx
│       └── ProductManagement.tsx
├── store/              # State management
│   └── index.ts        # Zustand store
├── types/              # TypeScript types
│   └── index.ts
├── i18n/               # Internationalization
│   └── translations.ts # Hindi/English translations
├── hooks/              # Custom hooks
│   └── useTranslation.ts
└── utils/              # Utility functions
    ├── qrcode.ts       # QR code generation
    └── notifications.ts # Push notifications
```

## User Flows

### Shopkeeper Flow
1. Register/Login as shopkeeper
2. Complete quick shop setup (name, type, address, service type, language)
3. Add products with variants (name, flavor, price, quantity, image)
4. Receive order notifications with sound
5. Update order status (Pending → Accepted → Ready → Completed)
6. Download QR code for customers

### Customer Flow
1. Browse shops or search for products
2. Filter by category
3. View shop products in table format
4. Add items to cart
5. Proceed to checkout
6. Enter delivery/pickup details
7. Select payment method (if delivery)
8. Place order and receive confirmation
9. Track order status

## PWA Features

- **Installable**: Can be installed on mobile devices and desktops
- **Offline Support**: Service worker caches essential resources
- **Responsive Design**: Works on all screen sizes
- **App-like Experience**: Standalone display mode
- **Fast Loading**: Optimized assets and code splitting

## Payment Flow (Phase 1)

- Platform does NOT process payments
- All payments happen synchronously at delivery/pickup time
- Cash on Delivery is the default method
- UPI on Delivery option available for shops that provide UPI details
- Customers scan shopkeeper's UPI QR code at delivery time

## Language Support

- English (default)
- Hindi (हिंदी)
- Toggle available in navigation bar
- All UI elements translated
- RTL support can be added in future

## Notifications

- Browser notifications for new orders
- Audio notification sound
- Requires user permission
- Works even when tab is in background

## Data Storage

- All data stored in browser's localStorage via Zustand persist
- Data persists across sessions
- No backend required for demo purposes
- Ready for Supabase database integration

## Future Enhancements (Phase 2)

- Voice input for shopkeepers
- Advanced analytics (sales, top products, repeat customers)
- Multi-language expansion
- Payment gateway integration
- Bulk product upload
- Image uploads to cloud storage
- Real-time database sync with Supabase
- Push notifications via FCM

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

This project follows React best practices and TypeScript conventions. When contributing:
- Use TypeScript for type safety
- Follow the existing code structure
- Add translations for new UI text
- Test on multiple screen sizes
- Ensure PWA features work correctly

## License

MIT License

## Notes

- Demo uses mock authentication (no actual backend validation)
- Product images support URLs only (no upload feature in Phase 1)
- Order notifications require browser permission
- For production, integrate with Supabase for data persistence
- Add actual PWA icons (192x192 and 512x512 PNG files) to public/ folder
