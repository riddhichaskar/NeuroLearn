import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Newspaper, TrendingUp, Github, ArrowUpRight, Users, FileText, Star } from 'lucide-react';

const ServicesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Intelligence Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay informed with real-time developer news, trend analysis, and repository insights.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Card 1 - devNews */}
          <motion.div variants={itemVariants} className="h-full">
            <Link 
              to="/devnews" 
              className="glass-panel card-hover p-8 group relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.1),transparent_50%)]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-border">
                    <Newspaper className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">DevNews</h3>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                  Real-time developer news curated from across the tech ecosystem and summarized using AI for faster understanding.
                </p>
                <div className="grid grid-cols-1 gap-3 mb-8 mt-auto">
                   <div className="glass-panel p-3 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Articles/Day</span>
                    <span className="text-lg font-bold gradient-text">2.4K</span>
                  </div>
                   <div className="glass-panel p-3 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                    <span className="text-lg font-bold gradient-text">98%</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 2 - Tech Trends */}
          <motion.div variants={itemVariants} className="h-full">
            <Link 
              to="/tech-trends" 
              className="glass-panel card-hover p-8 group relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.1),transparent_60%)]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">Tech Trends</h3>
                <div className="text-muted-foreground mb-8 text-sm leading-relaxed space-y-4">
                  <p>AI-driven analysis of emerging technologies, frameworks, and adoption patterns across the developer ecosystem.</p>
                <p>Helps you understand which technologies are growing, stabilizing, or declining — so you can learn what matters next.</p>
                </div>
                <div className="space-y-4 mt-auto">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>AI/ML</span>
                      <span className="text-accent">+47%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full w-[80%] bg-gradient-to-r from-primary to-accent" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>12.4K Tracking</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 3 - GitHub Intel (LINKED) */}
          <motion.div variants={itemVariants} className="h-full">
            <Link 
              to="/github-intel" 
              className="glass-panel card-hover p-8 group relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Github className="w-6 h-6 text-primary" />
                  </div>
                  {/* Visual Cue Arrow */}
                  <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <h3 className="text-3xl font-bold text-foreground mb-4">GitHub Intel</h3>
                <div className="text-muted-foreground mb-8 text-sm leading-relaxed space-y-4">
                  <p>In-depth analysis of trending and high-impact GitHub repositories to uncover popular tech stacks, contributor activity, and project health.</p>
                  <p>Turn real open-source development signals into clear insights on what technologies developers are actually building with.</p>
                </div>

                <div className="space-y-4 mt-auto">
                  <div className="flex items-center gap-3 p-3 glass-panel rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-lg font-bold">50K+</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Repositories</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 glass-panel rounded-lg">
                    <Star className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-lg font-bold">1.2M</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Total Stars</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;