import { useState, useEffect } from "react";

export interface ProgressMarker {
  id: string;
  disciplina: string;
  resumo: string;
  text: string;
  position: number;
  timestamp: Date;
  title: string;
}

export const useProgressMarkers = (disciplina: string, resumo: string) => {
  const [markers, setMarkers] = useState<ProgressMarker[]>([]);

  // Carregar marcações do localStorage ao inicializar
  useEffect(() => {
    const savedMarkers = localStorage.getItem(`progress_markers_${disciplina}_${resumo}`);
    if (savedMarkers) {
      const parsed = JSON.parse(savedMarkers);
      setMarkers(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    }
  }, [disciplina, resumo]);

  // Salvar marcações no localStorage quando alteradas
  useEffect(() => {
    if (markers.length > 0) {
      localStorage.setItem(`progress_markers_${disciplina}_${resumo}`, JSON.stringify(markers));
    }
  }, [markers, disciplina, resumo]);

  const addMarker = (text: string, position: number, title: string) => {
    const newMarker: ProgressMarker = {
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      disciplina,
      resumo,
      text: text.length > 100 ? text.substring(0, 100) + "..." : text,
      position,
      timestamp: new Date(),
      title
    };

    setMarkers(prev => [...prev, newMarker].sort((a, b) => a.position - b.position));
    return newMarker;
  };

  const removeMarker = (markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId));
  };

  const clearAllMarkers = () => {
    setMarkers([]);
    localStorage.removeItem(`progress_markers_${disciplina}_${resumo}`);
  };

  return {
    markers,
    addMarker,
    removeMarker,
    clearAllMarkers
  };
};