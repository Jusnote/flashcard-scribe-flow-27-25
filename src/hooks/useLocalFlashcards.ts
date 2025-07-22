import { useState, useEffect } from 'react';
import { Flashcard, Deck, StudyDifficulty } from '@/types/flashcard';
import { SpacedRepetition } from '@/lib/spaced-repetition';
import { useToast } from '@/hooks/use-toast';

const DECKS_KEY = 'flashcards_decks';
const CARDS_KEY = 'flashcards_cards';

export function useLocalFlashcards() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
    }
  }, [decks, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
    }
  }, [cards, loading]);

  const loadData = () => {
    try {
      const savedDecks = localStorage.getItem(DECKS_KEY);
      const savedCards = localStorage.getItem(CARDS_KEY);

      if (savedDecks) {
        const parsedDecks = JSON.parse(savedDecks).map((deck: any) => ({
          ...deck,
          created: new Date(deck.created),
        }));
        setDecks(parsedDecks);
      }

      if (savedCards) {
        const parsedCards = JSON.parse(savedCards).map((card: any) => ({
          ...card,
          created: new Date(card.created),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
          nextReview: new Date(card.nextReview),
        }));
        setCards(parsedCards);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createDeck = async (name: string, description?: string): Promise<Deck | null> => {
    try {
      const newDeck: Deck = {
        id: generateId(),
        name,
        description,
        created: new Date(),
        cardCount: 0,
        color: '#3B82F6',
      };

      setDecks(prev => [newDeck, ...prev]);
      
      toast({
        title: "Deck criado!",
        description: `O deck "${name}" foi criado com sucesso.`,
      });
      
      return newDeck;
    } catch (error) {
      console.error('Error creating deck:', error);
      toast({
        title: "Erro ao criar deck",
        description: "Não foi possível criar o deck.",
        variant: "destructive",
      });
      return null;
    }
  };

  const createCard = async (
    deckId: string, 
    front: string, 
    back: string, 
    parentId?: string, 
    type: 'traditional' | 'word-hiding' | 'true-false' = 'traditional',
    hiddenWordIndices?: number[],
    hiddenWords?: string[],
    explanation?: string
  ): Promise<Flashcard | null> => {
    try {
      const parentCard = parentId ? cards.find(c => c.id === parentId) : null;
      const level = parentCard ? parentCard.level + 1 : 0;
      
      // Calculate order among siblings
      const siblings = cards.filter(c => c.parentId === parentId && c.deckId === deckId);
      const order = siblings.length;

      const newCard: Flashcard = {
        id: generateId(),
        front,
        back,
        deckId,
        created: new Date(),
        lastReviewed: undefined,
        nextReview: new Date(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        difficulty: 'again',
        type,
        hiddenWordIndices,
        hiddenWords,
        explanation,
        parentId,
        childIds: [],
        level,
        order,
      };

      setCards(prev => [...prev, newCard]);

      // Update parent's childIds if this is a sub-card
      if (parentId) {
        setCards(prev => prev.map(card => 
          card.id === parentId 
            ? { ...card, childIds: [...card.childIds, newCard.id] }
            : card
        ));
      }

      // Update deck card count
      setDecks(prev => prev.map(deck => 
        deck.id === deckId 
          ? { ...deck, cardCount: deck.cardCount + 1 }
          : deck
      ));

      return newCard;
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: "Erro ao criar cartão",
        description: "Não foi possível criar o cartão.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCard = async (cardId: string, difficulty: StudyDifficulty): Promise<void> => {
    try {
      const card = cards.find(c => c.id === cardId);
      if (!card) return;

      const { interval, easeFactor, repetitions } = SpacedRepetition.calculateNextReview(card, difficulty);
      const nextReview = SpacedRepetition.getNextReviewDate(interval);

      setCards(prev => prev.map(c => {
        if (c.id !== cardId) return c;

        return {
          ...c,
          lastReviewed: new Date(),
          nextReview,
          interval,
          easeFactor,
          repetitions,
          difficulty,
        };
      }));
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Erro ao atualizar cartão",
        description: "Não foi possível atualizar o cartão.",
        variant: "destructive",
      });
    }
  };

  const deleteDeck = async (deckId: string): Promise<void> => {
    try {
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
      setCards(prev => prev.filter(card => card.deckId !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast({
        title: "Erro ao excluir deck",
        description: "Não foi possível excluir o deck.",
        variant: "destructive",
      });
    }
  };

  const updateCardContent = async (cardId: string, front: string, back: string, explanation?: string, hiddenWords?: string[]): Promise<void> => {
    try {
      setCards(prev => prev.map(card => 
        card.id === cardId 
          ? { 
              ...card, 
              front, 
              back, 
              explanation: explanation || card.explanation,
              hiddenWords: hiddenWords || card.hiddenWords
            }
          : card
      ));
    } catch (error) {
      console.error('Error updating card content:', error);
      toast({
        title: "Erro ao atualizar cartão",
        description: "Não foi possível atualizar o conteúdo do cartão.",
        variant: "destructive",
      });
    }
  };

  const deleteCard = async (cardId: string): Promise<void> => {
    try {
      const cardToDelete = cards.find(c => c.id === cardId);
      if (cardToDelete) {
        // Update deck card count
        setDecks(prev => prev.map(deck => 
          deck.id === cardToDelete.deckId 
            ? { ...deck, cardCount: Math.max(0, deck.cardCount - 1) }
            : deck
        ));
      }
      
      setCards(prev => prev.filter(c => c.id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Erro ao excluir cartão",
        description: "Não foi possível excluir o cartão.",
        variant: "destructive",
      });
    }
  };

  const getCardsByDeck = (deckId: string): Flashcard[] => {
    return cards.filter(card => card.deckId === deckId).sort((a, b) => {
      // Sort by creation date to maintain chronological order
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
  };

  const getDueCards = (deckId?: string): Flashcard[] => {
    const relevantCards = deckId ? getCardsByDeck(deckId) : cards;
    return SpacedRepetition.getDueCards(relevantCards);
  };

  const getDeckStats = (deckId: string) => {
    const deckCards = getCardsByDeck(deckId);
    const dueCards = getDueCards(deckId);
    
    return {
      total: deckCards.length,
      due: dueCards.length,
      reviewed: deckCards.filter(card => card.lastReviewed).length,
      new: deckCards.filter(card => !card.lastReviewed).length,
    };
  };

  // Helper functions for hierarchy
  const getChildCards = (parentId: string): Flashcard[] => {
    return cards.filter(card => card.parentId === parentId).sort((a, b) => a.order - b.order);
  };

  const getRootCards = (deckId?: string): Flashcard[] => {
    const relevantCards = deckId ? getCardsByDeck(deckId) : cards;
    return relevantCards.filter(card => !card.parentId).sort((a, b) => a.order - b.order);
  };

  const getCardHierarchy = (rootCard: Flashcard): Flashcard[] => {
    const hierarchy = [rootCard];
    
    const addChildren = (parentId: string) => {
      const children = getChildCards(parentId);
      children.forEach(child => {
        hierarchy.push(child);
        addChildren(child.id);
      });
    };
    
    addChildren(rootCard.id);
    return hierarchy;
  };

  return {
    decks,
    cards,
    loading,
    createDeck,
    createCard,
    updateCard,
    updateCardContent,
    deleteDeck,
    deleteCard,
    getCardsByDeck,
    getDueCards,
    getDeckStats,
    getChildCards,
    getRootCards,
    getCardHierarchy,
    loadData,
  };
}