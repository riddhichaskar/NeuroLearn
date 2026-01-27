import { motion } from 'framer-motion';
import { Zap, Eye, Shield, Clock, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

const WhyWeSection = () => {
  const progressBars = [
    { label: 'Response Time', value: 98, color: 'from-primary to-accent' },
    { label: 'Data Accuracy', value: 99, color: 'from-accent to-primary' },
    { label: 'Uptime', value: 100, color: 'from-primary via-accent to-primary' },
  ];

  return (
    <section id="dashboard" className="py-24 relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 blueprint-grid opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="container mx-auto px-12 md:px-20 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              <span className="text-foreground">Built for </span>
              <span className="gradient-text">speed</span>
              <span className="text-foreground">.</span>
              <br />
              <span className="text-foreground">Designed for </span>
              <span className="gradient-text">clarity</span>
              <span className="text-foreground">.</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {[
                { icon: Zap, text: 'Real-time data processing under 50ms' },
                { icon: Eye, text: 'AI-powered noise reduction' },
                { icon: Shield, text: 'Enterprise-grade security' },
                { icon: Clock, text: '24/7 monitoring & alerts' },
              ].map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 group p-2"
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors glow-border">
                    <point.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-foreground font-medium leading-tight">{point.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <a href="#features" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-all group">
                <span className="font-semibold text-lg">Learn more about our approach</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </a>
            </motion.div>
          </motion.div>

          {/* Right Side - Rectangular Performance Monitor with Hover Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            {/* Glow effect only visible on group hover */}
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative glass-panel p-6 md:p-8 border-border hover:border-primary/50 transition-all duration-300 w-full max-w-[650px] ml-auto lg:aspect-[16/9] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Performance Monitor</h3>
                </div>
                <span className="text-[10px] text-primary font-bold font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  LIVE
                </span>
              </div>

              <div className="space-y-6">
                {progressBars.map((bar, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground font-medium">{bar.label}</span>
                      <span className="text-sm font-mono font-bold text-foreground">{bar.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.value}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                        style={{ boxShadow: 'group-hover:0 0 15px hsl(var(--primary) / 0.4)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">All systems operational</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Updated: 2s ago
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WhyWeSection;