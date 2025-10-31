import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib';
import { Calendar, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { isStringDotString } from '@/services/scheduleService';
import { toast } from '@/hooks/use-toast';
import { getProcessedUsername } from '@/utils/usernameShortcuts';
import { getUserRule } from "@/utils/userAds";

// Helper: lit variables d'env (Vite)
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

const Login = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsPin, setNeedsPin] = useState(false);
  const [showPin, setShowPin] = useState(false); // contrôle visibilité du PIN
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const processedUsername = getProcessedUsername(username);

    if (!isStringDotString(processedUsername)) {
      toast({
        title: "Format invalide",
        description: "Veuillez entrer votre nom au format prenom.nom",
        variant: "destructive",
      });
      return;
    }

    const protectedUser = isUserProtected(processedUsername);

    if (protectedUser && !needsPin) {
      setNeedsPin(true);
      toast({
        title: "Vérification supplémentaire",
        description: "Veuillez saisir votre code PIN pour continuer.",
        variant: "default",
      });
      return;
    }

    if (protectedUser) {
      const expectedPin = protectedPinEnv;
      if (!pin || pin !== expectedPin) {
        toast({
          title: "PIN incorrect",
          description: "Le code PIN saisi est invalide.",
          variant: "destructive",
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

    localStorage.setItem('username', processedUsername);
    localStorage.setItem('userRule', JSON.stringify(userRule || {}));
    localStorage.setItem('isProtectedUser', String(protectedUser));

    toast({
      title: "Connexion réussie",
      description: "Bonjour " + processedUsername + " ! Redirection vers votre planning...",
      variant: "default",
    });

    setTimeout(() => {
      navigate('/calendar');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-elevated border-border/50">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-card">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mon Emploi du Temps
          </CardTitle>
          <CardDescription className="text-base">
            Consultez votre planning en temps réel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Identifiant
              </label>
              <Input
                id="username"
                type="text"
                placeholder="prenom.nom"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  // Reset si on change d'utilisateur
                  if (needsPin) setNeedsPin(false);
                  setPin('');
                  setShowPin(false);
                }}
                className="h-12 text-base"
                autoComplete="off"
                autoFocus
              />
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Format attendu : prenom.nom (exemple : jean.dupont)</span>
              </div>
            </div>

            {needsPin && (
              <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Code PIN
                </label>

                {/* Champ PIN avec bouton afficher/masquer */}
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    placeholder="Votre code PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="h-12 text-base pr-12"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    aria-label={showPin ? 'Masquer le code' : 'Afficher le code'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-primary transition-colors"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Un contrôle supplémentaire est requis pour cet utilisateur.
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium shadow-card hover:shadow-elevated transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : (needsPin ? 'Valider' : 'Accéder à mon planning')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
