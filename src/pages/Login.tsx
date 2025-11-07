// src/pages/LoginPage.tsx
import React from 'react';
import { useProtectedLogin } from '@/hooks/useProtectedLogin';
import { InfoModal } from '@/components/InfoModal';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/lib';
import { AlertCircle, Calendar, Eye, EyeOff, Lock } from 'lucide-react';

export default function LoginPage() {
  const {
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
  } = useProtectedLogin();

  const onCloseInfo = () => {
    setInfoOpen(false);
    // Redirection après confirmation
    // Laisser un léger délai pour laisser l’animation se terminer
    setTimeout(() => {
      window.location.href = '/calendar';
    }, 150);
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
                onChange={(e) => onChangeUsername(e.target.value)}
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

                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    placeholder="Votre code PIN"
                    value={pin}
                    onChange={(e) => onChangePin(e.target.value)}
                    className="h-12 text-base pr-12"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPin}
                    aria-label={showPin ? 'Masquer le code' : 'Afficher le code'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-muted transition-colors"
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

      <InfoModal
        open={infoOpen}
        onClose={onCloseInfo}
        title="Information"
        description="Les données affichées sont issues d’un scrapping. Il peut y avoir des erreurs, notamment sur les noms de salles."
        confirmLabel="Compris"
      />
    </div>
  );
}
