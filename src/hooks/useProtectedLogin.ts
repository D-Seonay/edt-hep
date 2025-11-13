// src/hooks/useProtectedLogin.ts
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { isStringDotString } from '@/services/scheduleService';
import { getProcessedUsername } from '@/utils/usernameShortcuts';
import { getUserRule } from '@/utils/userAds';
import { getRecentUsernames, addRecentUsername, removeRecentUsername } from '@/utils/recentUsernames';

export type UseProtectedLoginReturn = {
  username: string;
  pin: string;
  needsPin: boolean;
  showPin: boolean;
  isLoading: boolean;
  infoOpen: boolean;
  recent: { value: string; lastUsedAt: number }[];
  setInfoOpen: (open: boolean) => void;
  onChangeUsername: (value: string) => void;
  onChangePin: (value: string) => void;
  toggleShowPin: () => void;
  selectRecent: (value: string) => void;
  deleteRecent: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export const useProtectedLogin = (): UseProtectedLoginReturn => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [needsPin, setNeedsPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [recent, setRecent] = useState(getRecentUsernames());
  const navigate = useNavigate();

  useEffect(() => {
    setRecent(getRecentUsernames());
  }, []);

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

  // Sélection d’un username récent
  const selectRecent = useCallback((value: string) => {
    setUsername(value);
    setNeedsPin(false);
    setPin('');
    setShowPin(false);
  }, []);

  // Suppression d’un username récent
  const deleteRecent = useCallback((value: string) => {
    removeRecentUsername(value);
    setRecent(getRecentUsernames());
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

    const users = (import.meta as any).env?.VITE_PROTECTED_USERS || '';
    const protectedSet = new Set(users.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean));
    const protectedUser = protectedSet.has(processedUsername.toLowerCase());

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
      const expectedPin = (import.meta as any).env?.VITE_PROTECTED_PIN || '';
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
      addRecentUsername(processedUsername);
      setRecent(getRecentUsernames());
      return;
    }

    setIsLoading(true);

    localStorage.setItem('username', processedUsername);
    localStorage.setItem('userRule', JSON.stringify(userRule || {}));
    localStorage.setItem('isProtectedUser', String(protectedUser));

    addRecentUsername(processedUsername);
    setRecent(getRecentUsernames());

    toast({
      title: 'Connexion réussie',
      description: 'Bonjour ' + processedUsername + ' !',
      variant: 'default',
    });

    setInfoOpen(true);
  }, [username, needsPin, pin, navigate]);

  return {
    username,
    pin,
    needsPin,
    showPin,
    isLoading,
    infoOpen,
    recent,
    setInfoOpen,
    onChangeUsername,
    onChangePin,
    toggleShowPin,
    selectRecent,
    deleteRecent,
    handleSubmit,
  };
};
