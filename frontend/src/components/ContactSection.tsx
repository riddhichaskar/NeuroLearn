import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_brehypc';
const TEMPLATE_ID = 'template_46iyuxg';
const PUBLIC_KEY = 'fKyqSIy6l9wnYWeK-';

const ContactSection = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setLoading(true);
    setSuccess(null);

    try {
      await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        formRef.current,
        PUBLIC_KEY
      );
      setSuccess(true);
      formRef.current.reset();
    } catch (error) {
      console.error(error);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-12 md:px-20 lg:px-24 relative z-10">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Get in Touch</span>
            </h2>
            <p className="text-muted-foreground text-base">
              Have a question or want to collaborate? Send us a message.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-6 md:p-8 glow-border"
          >
            <form ref={formRef} onSubmit={sendEmail} className="space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-medium ml-1">Name</label>
                  <input
                    name="from_name"
                    required
                    placeholder="John Doe"
                    className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium ml-1">Email</label>
                  <input
                    name="from_email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium ml-1">Subject</label>
                <input
                  name="subject"
                  required
                  placeholder="How can I help you?"
                  className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium ml-1">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="Your message here..."
                  className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full group bg-primary text-primary-foreground py-5 text-lg font-bold flex items-center justify-center gap-2 glow-border"
              >
                {loading ? (
                  <>
                    Sending <Loader2 className="animate-spin w-4 h-4" />
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </Button>

              {/* Feedback */}
              {success === true && (
                <p className="text-green-400 text-sm text-center mt-2">
                  ✅ Message sent successfully!
                </p>
              )}
              {success === false && (
                <p className="text-red-400 text-sm text-center mt-2">
                  ❌ Failed to send message. Try again later.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
