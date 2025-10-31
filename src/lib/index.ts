// Le fichier 'Barrel' ou 'baril' est un moyen de consolider les exportations de plusieurs modules 
// en un seul module pratique qui peut être importé à l'aide d'une seule instruction d'importation.
// voici une explication détaillée : https://flaming.codes/fr/posts/barrel-files-in-javascript
// Je conseille cependant de ne l'utiliser que pour les composants UI génériques et réutilisables.
// (ou alors d'utiliser { ... } pour n'exporter que ce qui est nécessaire de manière controlée).
// Cela évite les dépendances circulaires et garde une architecture claire : https://tkdodo.eu/blog/please-stop-using-barrel-files

export { Button, buttonVariants } from "../components/ui/button";
export { Input } from "../components/ui/input";
export * from "../components/ui/card";
export { Checkbox } from "../components/ui/checkbox";
export { Label } from "../components/ui/label";
export * from "../components/ui/popover";
export * from "../components/ui/select";
export { default as Footer } from "../components/ui/footer";
export * from "../components/ui/tabs";
export { Calendar } from "../components/ui/calendar";
export * from "../components/ui/toaster";
export { Toaster as Sonner } from "../components/ui/sonner";
export { TooltipProvider } from "../components/ui/tooltip";
export * from "../components/ui/sheet";
export * from "../components/ui/separator";
export * from "../components/ui/skeleton";
export * from "../components/ui/sidebar";
export * from "../components/ui/dialog";
export * from "../components/ui/switch";
export * from "../components/ui/slider";
export * from "../components/ui/toast";
export { default as AdBanner } from "../components/ui/AdBanner";

// export * exporte tout ce qui est exporté dans le fichier ciblé sauf les exports par défaut. donc toutes les fonctions, classes, types etc
// export { ... } exporte uniquement ce qui est spécifié entre les accolades, y compris les exports par défaut si spécifiés explicitement.
// "as" possède la même fonctionnalité que dans d'autres langages de programmation, permettant de renommer un export lors de son importation.