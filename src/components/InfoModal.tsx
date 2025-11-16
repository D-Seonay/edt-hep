import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoModalProps } from '@/types/types';

export const InfoModal: React.FC<InfoModalProps> = ({
  open,
  onClose,
  title = 'Information',
  description = "Les données affichées proviennent d'un scrapping. Il peut y avoir des erreurs, notamment sur les noms de salles.",
  confirmLabel = 'OK',
  storageKey = 'infoModal:hidden',
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [doNotShowAgain, setDoNotShowAgain] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
      setDoNotShowAgain(saved === 'true');
    } catch {
    }
  }, [storageKey]);

  useEffect(() => {
    if (open && doNotShowAgain) {
      onClose();
    }
  }, [open, doNotShowAgain, onClose]);

  useEffect(() => {
    if (open && !doNotShowAgain) {
      const id = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(id);
    }
  }, [open, doNotShowAgain]);

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClose();
  };

  const onContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDoNotShowAgain(checked);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, checked ? 'true' : 'false');
      }
    } catch {
    }
  };

  return (
    <AnimatePresence>
      {open && !doNotShowAgain && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onBackdropClick}
        >
          {/* Backdrop avec légère blur pour glassmorphism */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Contenu du modal */}
          <motion.div
            key="content"
            className="relative mx-4 w-[92vw] max-w-md rounded-2xl p-5 shadow-2xl
                       bg-white/20 dark:bg-neutral-800/30
                       border border-white/30 dark:border-white/20
                       backdrop-blur-xl
                       text-neutral-900 dark:text-neutral-100
                       "
            onClick={onContentClick}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {/* Gradient overlay subtil pour glassmorphism */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl
                         bg-gradient-to-br from-white/30 via-white/10 to-transparent
                         dark:from-white/10 dark:via-white/5 dark:to-transparent"
            />

            <div className="relative">
              <h2 id="info-modal-title" className="text-xl font-semibold tracking-tight">
                {title}
              </h2>

              <p className="mt-2 text-sm leading-relaxed">
                {description}
              </p>

              {/* Option "Ne plus afficher" */}
              <label className="mt-4 flex items-center gap-2 text-sm select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-white/40 dark:border-white/20 bg-white/30 dark:bg-white/10"
                  checked={doNotShowAgain}
                  onChange={handleCheckboxChange}
                  aria-label="Ne plus afficher ce message"
                />
                <span>Ne plus afficher ce message</span>
              </label>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium
                             border border-white/40 dark:border-white/20
                             bg-white/30 dark:bg-white/10
                             hover:bg-white/50 dark:hover:bg-white/20
                             backdrop-blur-md
                             transition-colors
                             focus:outline-none focus:ring-2 focus:ring-white/60 dark:focus:ring-white/30"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>

            {/* Lignes décoratives pour “glass” */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 -right-6 h-24 w-24
                         rounded-full bg-gradient-to-tr from-fuchsia-400/30 via-indigo-400/20 to-cyan-300/10
                         blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24
                         rounded-full bg-gradient-to-tr from-sky-400/30 via-teal-300/20 to-emerald-300/10
                         blur-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
