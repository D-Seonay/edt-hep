const getRoomInfo = (roomName: string | undefined | null) => {
  if (!roomName) return { icon: "📍", text: "Salle inconnue", isError: false };

  const r = roomName.trim();

  // 1. Priorité : Cas Distanciel
  if (
    r.toUpperCase().startsWith("SALLE") ||
    r.toLowerCase().includes("distanciel") ||
    r.toLowerCase().includes("visio")
  ) {
    return { icon: "🏠", text: "Distanciel", isError: false };
  }

  // 2. Cas Salle Valide (Doit commencer par 'N')
  if (
    r.startsWith("N") ||
    r.toUpperCase().includes("EPSI")
  ){
    return { icon: "🚪", text: r, isError: false };
  }

  // 3. Cas par défaut : Si ce n'est pas Distanciel et ne commence pas par N
  // C'est considéré comme un bug (ex: B102-MXEA-...)
  return { icon: "⚠️", text: r, isError: true };
};

export default getRoomInfo;