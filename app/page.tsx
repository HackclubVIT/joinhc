import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  Shield,
  Zap,
  Sparkles,
  Code,
  Rocket,
  Star,
  Globe,
  Award,
} from "lucide-react";
import { HackClubLogo } from "@/components/hackclub-logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col modern-bg page-transition">
      <header className="nav-glass sticky top-0 z-50">
        <div className="content-container h-20">
          <div className="flex h-full items-center justify-between">
            <HackClubLogo size="lg" href="/" />
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="font-medium text-foreground hover:text-primary transition-all duration-300 rounded-xl px-6"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <button className="premium-button">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="py-20 sm:py-32 relative overflow-hidden">
          <div className="content-container text-center relative z-10">
            <div className="mx-auto max-w-6xl space-y-12 px-4">
              {/* Floating Logo */}
              <div className="flex justify-center mb-12 floating-element">
                <div className="relative">
                  <div className="absolute inset-0 blur-3xl opacity-30">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500"></div>
                  </div>
                  <HackClubLogo
                    size="xl"
                    showText={false}
                    className="relative z-10"
                  />
                </div>
              </div>

              {/* Hero Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">
                    Join 500+ Amazing Developers
                  </span>
                </div>

                <h1 className="hero-title">
                  Build the{" "}
                  <span className="gradient-text-secondary">Future</span> of
                  <br />
                  <span className="gradient-text">Technology</span>
                </h1>

                <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  Where innovation meets creativity. Join our elite community of
                  <span className="gradient-text font-bold">
                    {" "}
                    builders, creators, and visionaries{" "}
                  </span>
                  shaping tomorrow's digital landscape.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                <Link href="/register">
                  <button className="premium-button text-lg px-12 py-6 group">
                    <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                    Start Your Journey
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="neo-card px-12 py-6 text-lg font-semibold text-white border border-white/20 hover:border-primary/50 transition-all duration-300 group">
                    <Code className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    Access Dashboard
                  </button>
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
                <div className="stats-card floating-element">
                  <div className="text-4xl font-black gradient-text mb-2">
                    500+
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Active Members
                  </div>
                  <div className="absolute top-4 right-4">
                    <Users className="h-5 w-5 text-primary/60" />
                  </div>
                </div>
                <div className="stats-card floating-element">
                  <div className="text-4xl font-black gradient-text-secondary mb-2">
                    50+
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Projects Built
                  </div>
                  <div className="absolute top-4 right-4">
                    <Rocket className="h-5 w-5 text-purple-400/60" />
                  </div>
                </div>
                <div className="stats-card floating-element">
                  <div className="text-4xl font-black gradient-text-accent mb-2">
                    10+
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Departments
                  </div>
                  <div className="absolute top-4 right-4">
                    <Globe className="h-5 w-5 text-cyan-400/60" />
                  </div>
                </div>
                <div className="stats-card floating-element">
                  <div className="text-4xl font-black gradient-text mb-2">
                    24/7
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Support
                  </div>
                  <div className="absolute top-4 right-4">
                    <Shield className="h-5 w-5 text-green-400/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-32 relative">
          <div className="content-container">
            <div className="text-center mb-20 px-4">
              <h2 className="section-title gradient-text-secondary mb-8">
                Why Choose <span className="gradient-text">HackClub</span>?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the next generation of{" "}
                <span className="gradient-text-accent font-bold">
                  community-driven development
                </span>
              </p>
            </div>

            <div className="feature-grid px-4">
              <div className="feature-card">
                <div className="feature-icon bg-gradient-to-br from-pink-500/20 to-red-500/20 border-pink-500/30">
                  <Users className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-4">
                  Elite Community
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Join an exclusive network of passionate developers, designers,
                  and innovators who push the boundaries of what's possible.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/30">
                  <Shield className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold gradient-text-secondary mb-4">
                  Learn by Creating
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Master cutting-edge technologies through hands-on projects
                  that solve real-world problems and make an impact.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
                  <Rocket className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold gradient-text-accent mb-4">
                  Ship at Light Speed
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Transform your wildest ideas into reality with our rapid
                  prototyping culture and cutting-edge development stack.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32 relative">
          <div className="content-container">
            <div className="neo-card p-16 text-center relative overflow-hidden card-stack">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-8">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Ready to Get Started?
                  </span>
                </div>

                <h2 className="section-title gradient-text mb-8">
                  Ready to{" "}
                  <span className="gradient-text-secondary">Level Up</span>?
                </h2>
                <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                  Join thousands of developers who are already building the
                  future. Your journey to greatness starts here.
                </p>
                <Link href="/register">
                  <button className="premium-button text-xl px-16 py-8 group">
                    <Sparkles className="mr-4 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                    Start Your Journey
                    <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="nav-glass border-t border-border/50 py-12">
        <div className="content-container">
          <div className="flex flex-col md:flex-row items-center justify-between px-4">
            <HackClubLogo size="md" />
            <div className="mt-4 md:mt-0">
              <p className="text-muted-foreground">
                © 2024 HackClub. Crafted with{" "}
                <span className="gradient-text">❤️</span> by the community.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
