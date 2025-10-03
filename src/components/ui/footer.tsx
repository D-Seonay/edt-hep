import { useEffect, useState } from 'react';

const Footer = () => {

  return (
    <footer className="bg-muted/30 text-muted-foreground py-4 mt-6 rounded-t-2xl border-t border-border/50 text-center fixed bottom-0 w-full">
      <div className="text-sm mb-1">
        &copy; {new Date().getFullYear()} EDT C&D — Fait avec <span className="text-red-500">❤️</span> par Mathéo
      </div>
    </footer>
  );
};

export default Footer;
