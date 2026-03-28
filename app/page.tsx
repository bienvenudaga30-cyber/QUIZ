'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Users, Trophy, Play, Monitor, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <header className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold tracking-wider text-foreground">ARENA LIVE</span>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium tracking-wide">LIVE QUIZ GAMING</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Compete. Answer.{' '}
            <span className="text-primary">Dominate.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Join real-time quiz battles, climb the leaderboard, and prove your knowledge 
            in the ultimate competitive gaming experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/player">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 neon-border">
                <Play className="w-5 h-5 mr-2" />
                Join Game
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 text-lg px-8 py-6">
                <Monitor className="w-5 h-5 mr-2" />
                View Live Screen
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Future of Quiz Gaming
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Experience lightning-fast real-time competition with stunning visuals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Real-Time Action"
              description="Instant synchronization across all players. Every second counts in the arena."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Live Leaderboard"
              description="Watch your rank change in real-time as you compete against other players."
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="Compete & Win"
              description="Climb to the top of the leaderboard and claim your champion title."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value="50ms" label="Latency" />
            <StatCard value="1000+" label="Players" />
            <StatCard value="100%" label="Real-Time" />
            <StatCard value="24/7" label="Available" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-2xl neon-border bg-card/50 glass">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Enter the Arena?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of players competing in real-time quiz battles
            </p>
            <Link href="/player">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6">
                Start Playing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">ARENA LIVE</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time quiz gaming platform
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-all duration-300 group">
      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function StatCard({ value, label }: { value: string, label: string }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card/30 text-center">
      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{value}</div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  )
}
