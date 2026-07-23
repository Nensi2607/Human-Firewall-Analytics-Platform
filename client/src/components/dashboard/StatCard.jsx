import { motion } from "framer-motion";

const StatCard = ({ title, value, subtitle, icon, color }) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl
      bg-slate-800/60
      backdrop-blur-lg
      border border-slate-700
      p-6 shadow-xl"
    >
      {/* Glow Effect */}
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 ${color}`}
      />

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-400 text-sm">
            {title}
          </p>

          <h1 className="text-4xl font-bold mt-2">
            {value}
          </h1>

          <p className="text-slate-500 mt-2 text-sm">
            {subtitle}
          </p>

        </div>

        <div
          className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ${color}`}
        >
          {icon}
        </div>

      </div>

    </motion.div>
  );
};

export default StatCard;