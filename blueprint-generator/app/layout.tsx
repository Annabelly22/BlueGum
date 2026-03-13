import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BlueGum Studio',
  description: 'Digital Product Studio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#010608' }}>
      <body style={{ background: '#010608', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
