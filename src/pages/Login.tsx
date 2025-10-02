import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertCircle } from 'lucide-react';
import { isStringDotString } from '@/services/scheduleService';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStringDotString(username)) {
      toast({
        title: "Format invalide",
        description: "Veuillez entrer votre nom au format prenom.nom",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Sauvegarder le username
    localStorage.setItem('username', username);
    
    // Rediriger vers le calendrier
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
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-base"
                autoComplete="off"
                autoFocus
              />
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Format attendu : prenom.nom (exemple : jean.dupont)</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium shadow-card hover:shadow-elevated transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Accéder à mon planning'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
