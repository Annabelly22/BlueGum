import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BlueGum Studio',
  description: 'Turn automation ideas into Gumroad products – automatically.',
  icons: {
    icon: '/favicon.ico', // You can replace this later with your custom icon
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts for Montserrat (used in logo) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        {/* Header with BlueGum logo */}
        <header className="border-b bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Logo container */}
            <div className="flex items-center gap-3">
              {/* SVG Icon – Gum leaf with integrated gear */}
              <div className="w-10 h-10 sm:w-12 sm:h-12">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    className="leaf"
                    d="M30 50 C20 30 40 10 60 20 C70 25 80 40 70 60 C60 80 40 80 30 60 C25 50 25 50 30 50Z"
                    fill="#1E3A8A"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                  <path
                    d="M58 22 L70 10"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <g transform="translate(48 38) scale(0.6)">
                    <circle cx="20" cy="20" r="12" fill="white" stroke="#3B82F6" strokeWidth="2" />
                    <circle cx="20" cy="20" r="5" fill="#3B82F6" />
                    <line x1="32" y1="20" x2="40" y2="20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="20" y1="32" x2="20" y2="40" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="20" x2="0" y2="20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="20" y1="8" x2="20" y2="0" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="28" y1="28" x2="34" y2="34" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="28" x2="6" y2="34" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="12" x2="6" y2="6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="28" y1="12" x2="34" y2="6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
              {/* Wordmark */}
              <span className="font-['Montserrat'] text-2xl sm:text-3xl font-bold text-[#1E3A8A] tracking-tight">
                Blue<span className="text-[#3B82F6]">Gum</span>
              </span>
            </div>

            {/* Optional navigation or placeholder – you can add links later */}
            <nav className="flex items-center gap-6 text-sm text-gray-600">
              {/* Example links (commented out) */}
              {/* <a href="#" className="hover:text-blue-600">Products</a>
              <a href="#" className="hover:text-blue-600">Dashboard</a> */}
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>

        {/* Optional simple footer */}
        <footer className="border-t bg-white py-4 text-center text-sm text-gray-500">
          <div className="max-w-6xl mx-auto px-4">
            © {new Date().getFullYear()} BlueGum Studio. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}
