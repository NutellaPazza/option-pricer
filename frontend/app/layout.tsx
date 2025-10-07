import Link from 'next/link'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Option Pricer',
  description: 'Interactive options pricing with multiple models',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="w-full bg-black text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6 items-center">
            <Link href="/" className="font-bold text-lg">Option Pricer</Link>
            <Link href="/simple" className="navlink">Analisi semplice</Link>
            <Link href="/advanced" className="navlink">Analisi avanzata</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
