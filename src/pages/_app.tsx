import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '../components/ui/Header'
import { AuthProvider } from '../lib/auth'
import PushSetup from '../components/ui/PushSetup'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-deepBlack text-gray-100">
        <Header />
        <PushSetup vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''} />
        <main className="max-w-5xl mx-auto p-4">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  )
}
