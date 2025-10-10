import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business Digitalizer - Bring Your Shop Online',
  description: 'Digitalize your small business and connect with customers',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
}

export const viewport = {
  themecolor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

