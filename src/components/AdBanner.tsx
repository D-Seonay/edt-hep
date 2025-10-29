import React from "react";
import { motion } from "framer-motion";
import { getUserRule } from "@/utils/userAds";

interface AdBannerProps {
  username: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ username }) => {
  const rule = getUserRule(username);
  const ad = rule?.ad;

  if (!ad) return null; // Aucune pub à afficher

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto mt-4 p-3 rounded-2xl shadow-lg bg-card flex items-center gap-3 hover:scale-[1.02] transition-transform"
    >
      {ad.image && (
        <img
          src={ad.image}
          alt={ad.title}
          className="w-16 h-16 rounded-xl object-cover"
        />
      )}
      <div className="flex flex-col flex-1">
        <h3 className="dark:text-white text-gray-900 font-semibold text-sm">{ad.title}</h3>
        {ad.description && (
          <p className="text-gray-400 text-xs line-clamp-2">{ad.description}</p>
        )}

        {ad.link && (
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-accent mt-1 underline"
        >
          En savoir plus →
        </a>
        )}
      </div>
        
    </motion.div>
  );
};

export default AdBanner;