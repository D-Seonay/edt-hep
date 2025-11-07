// src/hooks/useProtectedLogin.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { isStringDotString } from '@/services/scheduleService';
import { getProcessedUsername } from '@/utils/usernameShortcuts';
import { getUserRule } from '@/utils/userAds';

// Lire les variables d'environnement (Vite)
const protectedUsersEnv = (import.meta as any).env?.VITE_PROTECTED_USERS || '';
const protectedPinEnv = (import.meta as any).env?.VITE_PROTECTED_PIN || '';

const getProtectedUsers = (): Set<string> => {
  return new Set(
    protectedUsersEnv
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
  );
};

const isUserProtected = (processedUsername: string): boolean => {
  const users = getProtectedUsers();
  return users.has(processedUsername.toLowerCase());
};

export type UseProtectedLoginReturn = {
  username: string;
  pin: string;
  needsPin: boolean;
  showPin: boolean;
  isLoading: boolean;
  infoOpen: boolean;
  setInfoOpen: (open: boolean) => void;
  onChangeUsername: (value: string) => void;
  onChangePin: (value: string) => void;
  toggleShowPin: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export const useProtectedLogin = (): UseProtectedLoginReturn => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [needsPin, setNeedsPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const navigate = useNavigate();

  const onChangeUsername = useCallback((value: string) => {
    setUsername(value);
    setNeedsPin(false);
    setPin('');
    setShowPin(false);
  }, []);

  const onChangePin = useCallback((value: string) => {
    setPin(value);
  }, []);

  const toggleShowPin = useCallback(() => {
    setShowPin(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const processedUsername = getProcessedUsername(username);

    if (!isStringDotString(processedUsername)) {
      toast({
        title: 'Format invalide',
        description: 'Veuillez entrer votre nom au format prenom.nom',
        variant: 'destructive',
      });
      return;
    }

    const protectedUser = isUserProtected(processedUsername);

    if (protectedUser && !needsPin) {
      setNeedsPin(true);
      toast({
        title: 'Vérification supplémentaire',
        description: 'Veuillez saisir votre code PIN pour continuer.',
        variant: 'default',
      });
      return;
    }

    if (protectedUser) {
      const expectedPin = protectedPinEnv;
      if (!pin || pin !== expectedPin) {
        toast({
          title: 'PIN incorrect',
          description: 'Le code PIN saisi est invalide.',
          variant: 'destructive',
        });
        return;
      }
    }

    const userRule = getUserRule(processedUsername);
    if (userRule?.redirect) {
      window.open(userRule.redirect, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsLoading(true);

    // Sauvegardes locales
    localStorage.setItem('username', processedUsername);
    localStorage.setItem('userRule', JSON.stringify(userRule || {}));
    localStorage.setItem('isProtectedUser', String(protectedUser));

    toast({
      title: 'Connexion réussie',
      description: 'Bonjour ' + processedUsername + ' !',
      variant: 'default',
    });

    // Ouvre le modal d’information
    setInfoOpen(true);
  }, [username, needsPin, pin, navigate]);

  return {
    username,
    pin,
    needsPin,
    showPin,
    isLoading,
    infoOpen,
    setInfoOpen,
    onChangeUsername,
    onChangePin,
    toggleShowPin,
    handleSubmit,
  };
};
