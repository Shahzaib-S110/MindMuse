import './globals.css'

export const metadata = {
  title: 'MindMuse',
  description: 'Built with Next.js + Tailwind',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
