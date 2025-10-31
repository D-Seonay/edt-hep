// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib';
import { Calendar, AlertCircle, Lock } from 'lucide-react';
import { isStringDotString } from '@/services/scheduleService';
import { toast } from '@/hooks/use-toast';
import { getProcessedUsername } from '@/utils/usernameShortcuts';
import { getUserRule } from "@/utils/userAds";

// Helper: lit variables d'env (Vite)
const protectedUsersEnv = (import.meta as any).env?.VITE_PROTECTED_USERS || '';
const protectedPinEnv = (import.meta as any).env?.VITE_PROTECTED_PIN || '';

const getProtectedUsers = (): Set<string> => {
  // Nettoyage: espace, lowercase
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

    // Vérifie si l'user est dans la liste protégée via .env
    const protectedUser = isUserProtected(processedUsername);

    // Si protégé, et qu'on n'a pas encore demandé le PIN, on active le champ PIN
    if (protectedUser && !needsPin) {
      setNeedsPin(true);
      toast({
        title: "Vérification supplémentaire",
        description: "Veuillez saisir votre code PIN pour continuer.",
        variant: "default",
      });
      return;
    }

    // Si protégé, valider le PIN
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

    // Sauvegarder le username traité et le statut 'protected'
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
                  // Si on change d'user, reset le besoin de PIN
                  if (needsPin) setNeedsPin(false);
                  setPin('');
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
                <Input
                  id="pin"
                  type="password"
                  placeholder="Votre code PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="h-12 text-base"
                  autoComplete="off"
                />
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
