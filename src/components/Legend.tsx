import React from "react";
import { motion } from "framer-motion";

const Legend: React.FC = () => {
  const legendItems = [
    {
      emoji: "🏠",
      title: "Distanciel",
      description: "Le cours a lieu en visio (Teams/Zoom).",
    },
    {
      emoji: "🚪", // Ou 🏫
      title: "Salle de cours",
      description: "Numéro de salle standard (ex: B102).",
    },
    {
      emoji: "⚠️",
      title: "Format Inconnu",
      description: "Code salle complexe (ex: B102-MXEA-).",
      isError: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto mt-4 p-4 rounded-2xl shadow-lg bg-card border border-border/50"
    >
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white ml-1">
        Légende du planning
      </h3>
      
      <div className="flex flex-col gap-3">
        {legendItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            {/* Zone de l'emoji / Icône */}
            <div className={`
              w-10 h-10 flex items-center justify-center text-xl rounded-xl bg-background shadow-sm
              ${item.isError ? "bg-red-50 text-red-500 dark:bg-red-900/20" : ""}
            `}>
              {item.emoji}
            </div>

            {/* Texte */}
            <div className="flex flex-col flex-1">
              <span className={`text-sm font-semibold ${item.isError ? "text-red-500" : "text-gray-900 dark:text-gray-100"}`}>
                {item.title}
              </span>
              <p className="text-xs text-gray-400 line-clamp-1">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Legend;