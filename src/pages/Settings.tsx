// src/pages/Settings.tsx
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { usePrimaryColor } from "@/hooks/usePrimaryColor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { getShortcuts, saveShortcuts, getProcessedUsername } from "@/utils/userShortcuts";
import { getRecentUsernames, removeRecentUsername } from "@/utils/recentUsernames";
import { Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { primaryColor, setPrimaryColor } = usePrimaryColor("#4169e1");

  // State for landing page preference
  const [showLandingPage, setShowLandingPage] = useState(() => {
    return localStorage.getItem("showLandingPage") !== "false";
  });

  // State for shortcuts
  const [shortcuts, setShortcuts] = useState(getShortcuts());
  const [newShortcutKey, setNewShortcutKey] = useState("");
  const [newShortcutValue, setNewShortcutValue] = useState("");

  // State for recent usernames
  const [recentUsernames, setRecentUsernames] = useState(getRecentUsernames());

  useEffect(() => {
    localStorage.setItem("showLandingPage", JSON.stringify(showLandingPage));
  }, [showLandingPage]);

  // State for notifications
  const [showNotifications, setShowNotifications] = useState(() => {
    return localStorage.getItem("showNotifications") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("showNotifications", JSON.stringify(showNotifications));
  }, [showNotifications]);

  const handleAddShortcut = () => {
    if (!newShortcutKey || !newShortcutValue) {
      toast({ title: "Erreur", description: "Les deux champs doivent être remplis.", variant: "destructive" });
      return;
    }
    const updatedShortcuts = { ...shortcuts, [newShortcutKey.toLowerCase()]: newShortcutValue };
    setShortcuts(updatedShortcuts);
    saveShortcuts(updatedShortcuts);
    setNewShortcutKey("");
    setNewShortcutValue("");
    toast({ title: "Succès", description: "Raccourci ajouté." });
  };

  const handleRemoveShortcut = (key: string) => {
    const { [key]: _, ...remainingShortcuts } = shortcuts;
    setShortcuts(remainingShortcuts);
    saveShortcuts(remainingShortcuts);
    toast({ title: "Succès", description: "Raccourci supprimé." });
  };

  const handleRemoveRecent = (username: string) => {
    removeRecentUsername(username);
    setRecentUsernames(getRecentUsernames());
    toast({ title: "Succès", description: `"${username}" a été retiré des récents.` });
  };

  const handleClearAllRecent = () => {
    // This assumes `removeRecentUsername` can clear all if called without args, or we can loop.
    // Let's implement a clear all function.
    localStorage.removeItem('recentUsernames');
    setRecentUsernames([]);
    toast({ title: "Succès", description: "L'historique des utilisateurs récents a été effacé." });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 py-6 max-w-2xl"
    >
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
      <div className="space-y-10">
        {/* Appearance Section */}
        <div className="bg-card p-6 rounded-2xl shadow-soft border border-border/50">
          <h2 className="text-xl font-semibold mb-6">Apparence</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle" className="text-base">Thème sombre</Label>
              <Switch id="theme-toggle" checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="primary-color-picker" className="text-base">Couleur primaire</Label>
              <div className="flex items-center gap-4">
                <Input id="primary-color-hex" type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-28" />
                <div className="relative">
                  <Input id="primary-color-picker" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 p-1 appearance-none bg-transparent border-none cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-card p-6 rounded-2xl shadow-soft border border-border/50">
          <h2 className="text-xl font-semibold mb-6">Préférences</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="landing-page-toggle" className="text-base">Afficher la page de bienvenue au démarrage</Label>
              <Switch id="landing-page-toggle" checked={showLandingPage} onCheckedChange={setShowLandingPage} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-toggle" className="text-base">
                Afficher les notifications (connexion, succès, etc.)
              </Label>
              <Switch
                id="notifications-toggle"
                checked={showNotifications}
                onCheckedChange={setShowNotifications}
              />
            </div>
          </div>
        </div>

        {/* Shortcuts Section */}
        <div className="bg-card p-6 rounded-2xl shadow-soft border border-border/50">
          <h2 className="text-xl font-semibold mb-6">Raccourcis de nom d'utilisateur</h2>
          <div className="space-y-4">
            {Object.entries(shortcuts).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <div>
                  <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">{key}</span>
                  <span className="mx-2 text-muted-foreground">→</span>
                  <span className="font-semibold">{value}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveShortcut(key)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4">
            <Input placeholder="Raccourci (ex: 'md')" value={newShortcutKey} onChange={(e) => setNewShortcutKey(e.target.value)} />
            <Input placeholder="Nom d'utilisateur (ex: 'matheo.delaunay')" value={newShortcutValue} onChange={(e) => setNewShortcutValue(e.target.value)} />
            <Button onClick={handleAddShortcut}><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
          </div>
        </div>

        {/* Local Data Section */}
        <div className="bg-card p-6 rounded-2xl shadow-soft border border-border/50">
          <h2 className="text-xl font-semibold mb-6">Données locales</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Gérez les données stockées dans votre navigateur.</p>
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Historique des utilisateurs</h3>
                <Button variant="destructive" onClick={handleClearAllRecent}>Tout effacer</Button>
            </div>
            <div className="space-y-2 pt-2">
                {recentUsernames.map(user => (
                    <div key={user.value} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <span className="font-semibold">{user.value}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveRecent(user.value)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                {recentUsernames.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun utilisateur récent.</p>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
