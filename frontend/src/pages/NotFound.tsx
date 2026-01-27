import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Terminal, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Your core brand color
const ACCENT = "#00faee";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "ACCESS_DENIED: Route does not exist in the current namespace:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      {/* Background Decorative Element */}
      <div 
        className="absolute h-[500px] w-[500px] rounded-full opacity-[0.03] blur-[120px] pointer-events-none"
        style={{ backgroundColor: ACCENT }}
      />

      <div className="relative z-10 text-center">
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8 flex justify-center"
        >
          <div 
            className="flex h-20 w-20 items-center justify-center rounded-2xl border"
            style={{ 
              backgroundColor: `${ACCENT}05`, 
              borderColor: `${ACCENT}20`,
              boxShadow: `0 0 30px ${ACCENT}10`
            }}
          >
            <AlertTriangle className="h-10 w-10" style={{ color: ACCENT }} />
          </div>
        </motion.div>

        {/* 404 Heading with Neon Glitch Effect */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-2 text-8xl font-black tracking-tighter text-white"
          style={{ textShadow: `0 0 20px ${ACCENT}40` }}
        >
          404
        </motion.h1>

        <div className="mb-8 space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-[#00faee]">
            Protocol Error
          </p>
          <p className="mx-auto max-w-[280px] text-sm font-medium leading-relaxed text-zinc-500">
            The requested namespace <span className="text-zinc-300 font-mono">"{location.pathname}"</span> could not be resolved by the neural link.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
              style={{ backgroundColor: ACCENT, color: "#000" }}
            >
              <Home className="h-3.5 w-3.5" />
              Return to Base
            </motion.button>
          </Link>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-700"
          >
            <Terminal className="h-3 w-3" />
            System_Offline
          </motion.div>
        </div>
      </div>

      {/* Grid Overlay for Tactical Look */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
};

export default NotFound;