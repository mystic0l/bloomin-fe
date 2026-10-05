import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BloomIn',
  description: 'Digitalize your small business and connect with customers',
  manifest: '/manifest.json',
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


