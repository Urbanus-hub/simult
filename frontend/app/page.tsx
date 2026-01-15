"use client";

import { motion } from "framer-motion";
import { 
  HiBars3, 
  HiXMark, 
  HiCheck, 
  HiPlay, 
  HiArrowRight,
  HiBolt,
  HiChatBubbleLeftRight,
  HiUserGroup,
  HiShieldCheck,
  HiGlobeAlt
} from "react-icons/hi2";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/Button";

// Minimal components replacing the complex Glass ones
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-primary">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="relative p-6">
    <div className="text-6xl font-black text-secondary/30 mb-4">{number}</div>
    <h3 className="text-xl font-bold mb-3 text-primary">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/10">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <HiBolt className="w-5 h-5" />
            </div>
            Simult
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Button variant="primary" href="/register">Get Started</Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden border-t border-border bg-background px-6 py-4 space-y-4"
          >
            <Link href="#features" className="block text-muted-foreground hover:text-primary">Features</Link>
            <Link href="#how-it-works" className="block text-muted-foreground hover:text-primary">How it works</Link>
            <Link href="#pricing" className="block text-muted-foreground hover:text-primary">Pricing</Link>
            <div className="pt-4 flex flex-col gap-3">
              <Button variant="secondary" href="/login" className="w-full justify-center">Log in</Button>
              <Button variant="primary" href="/register" className="w-full justify-center">Get Started</Button>
            </div>
          </motion.div>
        )}
      </nav>

      <main className="pt-32 pb-16 px-6">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium mb-8">
              <span className="flex w-2 h-2 rounded-full bg-primary/60"></span>
              v2.0 is now available
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-8 text-balance">
              Collaboration happens in <span className="text-muted-foreground">real-time.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
              Create rooms, chat instantly, and coordinate tasks without missing a beat. 
              The simple, fast way for teams to stay in sync.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" href="/register" className="min-w-[160px]">
                Start for free
              </Button>
              <Button variant="secondary" size="lg" href="/demo" className="min-w-[160px] gap-2">
                <HiPlay className="w-4 h-4" />
                Watch Demo
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <HiCheck className="w-4 h-4" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <HiCheck className="w-4 h-4" /> Free for small teams
              </div>
            </div>
          </motion.div>
        </section>

        {/* Social Proof */}
        <section className="max-w-7xl mx-auto mb-32 border-y border-border py-12">
          <p className="text-center text-sm font-semibold text-muted-foreground mb-8 tracking-wide uppercase">Trusted by forward-thinking teams</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos - implementing as text for now */}
             <div className="text-xl font-bold text-primary">Acme Corp</div>
             <div className="text-xl font-bold text-primary">GlobalTech</div>
             <div className="text-xl font-bold text-primary">Nebula</div>
             <div className="text-xl font-bold text-primary">Vertex</div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features that keep your team in sync, wrapped in a clean interface.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<HiChatBubbleLeftRight className="w-6 h-6" />}
              title="Real-time Messaging"
              description="Instant delivery, typing indicators, and read receipts. Communication that feels natural."
            />
            <FeatureCard 
              icon={<HiUserGroup className="w-6 h-6" />}
              title="Team Presence"
              description="See who is online, what they are working on, and jump into conversations instantly."
            />
            <FeatureCard 
              icon={<HiShieldCheck className="w-6 h-6" />}
              title="Secure by Default"
              description="End-to-end encryption for private rooms. Your data stays yours, always."
            />
             <FeatureCard 
              icon={<HiBolt className="w-6 h-6" />}
              title="Lighting Fast"
              description="Built on the edge. Low latency global distribution ensures updates happen instantly."
            />
            <FeatureCard 
              icon={<HiGlobeAlt className="w-6 h-6" />}
              title="Universal Access"
              description="Works on every device with a browser. No heavy downloads or installations needed."
            />
            <FeatureCard 
              icon={<HiCheck className="w-6 h-6" />}
              title="Task Management"
              description="Simple to-do lists that sync with your conversations. Keep track of what matters."
            />
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto mb-32 bg-secondary/30 rounded-3xl p-8 md:p-16">
          <div className="grid md:grid-cols-3 gap-12">
             <StepCard 
               number="01"
               title="Create a Room"
               description="Start a new workspace in seconds. No complex setup involved."
             />
             <StepCard 
               number="02"
               title="Invite your Team"
               description="Share a simple link. Teammates join instantly without hurdles."
             />
             <StepCard 
               number="03"
               title="Start Collaborating"
               description="Chat, share files, and manage tasks together in real-time."
             />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">Start for free, upgrade when you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl border border-border bg-card">
              <h3 className="text-lg font-semibold text-primary mb-2">Starter</h3>
              <div className="text-4xl font-bold text-primary mb-6">$0</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> Up to 5 members
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> 3 Active rooms
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> 1GB Storage
                </li>
              </ul>
              <Button variant="secondary" className="w-full justify-center" href="/register">Start Free</Button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl border-2 border-primary bg-card relative shadow-2xl">
              <div className="absolute top-0 right-0 -mt-4 mr-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">Pro</h3>
              <div className="text-4xl font-bold text-primary mb-6">$12<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> Unlimited members
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> Unlimited rooms
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> 10GB Storage
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> Priority keys
                </li>
              </ul>
              <Button variant="primary" className="w-full justify-center" href="/register">Get Pro</Button>
            </div>

             {/* Enterprise Tier */}
             <div className="p-8 rounded-2xl border border-border bg-card">
              <h3 className="text-lg font-semibold text-primary mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-primary mb-6">Custom</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> SSO/SAML
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> Audit logs
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HiCheck className="w-5 h-5 text-primary" /> 24/7 Support
                </li>
              </ul>
              <Button variant="secondary" className="w-full justify-center" href="/contact">Contact Sales</Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto text-center py-20 bg-primary/5 rounded-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Ready to work better together?</h2>
          <p className="text-lg text-muted-foreground mb-8">Join the thousands of teams using Simult to power their daily collaboration.</p>
          <div className="flex justify-center gap-4">
             <Button variant="primary" size="lg" href="/register">Get Started Now</Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center">
                <HiBolt className="w-4 h-4" />
              </div>
              Simult
            </Link>
            <p className="text-sm text-muted-foreground">
              Built for modern teams who need clarity and speed.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/changelog" className="hover:text-primary">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-semibold mb-4 text-primary">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
            </ul>
             <div className="flex gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary"><FaTwitter className="w-5 h-5"/></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><FaGithub className="w-5 h-5"/></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><FaLinkedin className="w-5 h-5"/></a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Simult Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
