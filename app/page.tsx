import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">Quiz Live</h1>
            <p className="text-gray-600">Real-time interactive quiz game</p>
          </div>

          <div className="space-y-4">
            <Link href="/admin" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6">
                Admin Panel
              </Button>
            </Link>

            <Link href="/player" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6">
                Join Game
              </Button>
            </Link>

            <Link href="/dashboard" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6">
                Screen Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Real-time quiz platform with instant scoring</p>
          </div>
        </div>
      </div>
    </div>
  )
}
