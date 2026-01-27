import { motion } from 'framer-motion';
import ParticleNetwork from './ParticleNetwork';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const HeroSection = () => {
  // Helper function for smooth scrolling
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Navbar Integration */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="container mx-auto flex items-center justify-between px-4">
          
          {/* Logo and Title Group - Aligned to the absolute left corner */}
          <div 
            className="flex items-center gap-2 cursor-pointer -ml-4" 
            onClick={() => scrollToSection('home')}
          >
            {/* Logo Container - Static, no hover effects */}
            <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg">
              <img 
                src="/logoimg.png" 
                alt="NeuroLearn Logo" 
                className="w-full h-full object-contain pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            
            {/* Website Title - Reduced size and closer to image */}
            <div className="text-lg md:text-xl font-bold gradient-text tracking-tight">
              NeuroLearn
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</button>
            <button onClick={() => scrollToSection('dashboard')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</button>
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact us</button>
          </div>
        </div>
      </nav>

      {/* Gradient overlays - Strictly Kept Same */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.1),transparent_50%)]" />
      
      {/* Particle Network - Strictly Kept Same */}
      <ParticleNetwork />

      {/* Content - Aligned Left with Wider Margin */}
      <div className="relative z-10 container mx-auto px-12 md:px-20 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          {/* Heading - Title Only */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-left">
            <span className="gradient-text">NeuroLearn</span>
          </h1>

          {/* Subtitle - Updated Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 text-left"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            NeuroLearn is an Agentic AI–powered learning intelligence platform that transforms real-time tech signals into meaningful learning insights. 
            It helps you understand what to learn now and what will matter next.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              size="lg" 
              onClick={() => scrollToSection('features')}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg glow-border"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Stats - Aligned Left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 grid grid-cols-3 gap-12 max-w-2xl"
          >
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '1M+', label: 'Data Points' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-left">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;