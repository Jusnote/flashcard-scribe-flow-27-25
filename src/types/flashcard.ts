export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  created: Date;
  lastReviewed?: Date;
  nextReview: Date;
  interval: number; // days
  easeFactor: number;
  repetitions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'again';
  type: 'traditional' | 'word-hiding' | 'true-false'; // Tipo do flashcard
  hiddenWordIndices?: number[]; // Índices das palavras ocultadas (para word-hiding)
  hiddenWords?: string[]; // Palavras ocultadas (novo método com sintaxe {{ }})
  explanation?: string; // Explicação opcional (para flashcards true-false)
  
  // Hierarchy fields
  parentId?: string; // ID of parent flashcard
  childIds: string[]; // IDs of child flashcards
  level: number; // 0 = root, 1 = first level child, etc.
  order: number; // Order among siblings
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  created: Date;
  cardCount: number;
  color: string;
}

export interface StudySession {
  id: string;
  deckId: string;
  started: Date;
  ended?: Date;
  cardsStudied: number;
  accuracy: number;
}

export type StudyDifficulty = 'again' | 'hard' | 'medium' | 'easy';