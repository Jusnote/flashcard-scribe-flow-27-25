import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ModernFlashcardEditor } from '@/components/ModernFlashcardEditor';
import { FlashcardEditor } from '@/components/FlashcardEditor';
import { FlashcardDisplay } from '@/components/FlashcardDisplay';
import { SubFlashcardEditor } from '@/components/SubFlashcardEditor';
import { DeckCard } from '@/components/DeckCard';
import { DeckCardsList } from '@/components/DeckCardsList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useSupabaseFlashcards } from '@/hooks/useSupabaseFlashcards';
import { DataMigrationDialog } from '@/components/DataMigrationDialog';
import { Brain, Plus, BookOpen, Target, TrendingUp, ArrowLeft, CheckCircle, RotateCcw, Play, Edit3, Trash2, Eye, EyeOff, Blocks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Flashcard, StudyDifficulty } from '@/types/flashcard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { decks, cards, loading, isCreatingDeck, isCreatingCard, syncStatus, createDeck, createCard, updateCardContent, deleteCard, getCardsByDeck, getDueCards, getDeckStats, updateCard } = useSupabaseFlashcards();
  
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [showCardBacks, setShowCardBacks] = useState<{[key: string]: boolean}>({});
  
  // Verificar se está em modo de estudo
  const studyDeckId = searchParams.get('study');
  const isStudyMode = !!studyDeckId;
  
  // Estados para o modo de estudo
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [isStudyComplete, setIsStudyComplete] = useState(false);
  
  // Estados para sub-flashcards
  const [isCreatingSubCard, setIsCreatingSubCard] = useState(false);
  const [parentCardForSub, setParentCardForSub] = useState<Flashcard | null>(null);
  
  // Estado para controlar tipo de editor
  const [useBlockEditor, setUseBlockEditor] = useState(false);

  const totalCards = cards.length;
  const totalDueCards = getDueCards().length;
  const studiedToday = cards.filter(card => {
    if (!card.lastReviewed) return false;
    const today = new Date();
    const reviewDate = new Date(card.lastReviewed);
    return reviewDate.toDateString() === today.toDateString();
  }).length;

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) return;

    const deck = await createDeck(newDeckName.trim(), newDeckDescription.trim() || undefined);
    if (deck) {
      setSelectedDeckId(deck.id);
      setNewDeckName('');
      setNewDeckDescription('');
      setIsCreateDeckOpen(false);
    }
  };

  const handleCreateCard = async (front: string, back: string, type: 'traditional' | 'word-hiding' | 'true-false' = 'traditional', hiddenWordIndices?: number[], hiddenWords?: string[], explanation?: string, parentId?: string, deckId?: string): Promise<string | null> => {
    const targetDeckId = deckId || selectedDeckId;
    
    if (!targetDeckId) {
      toast({
        title: "Selecione um deck",
        description: "Primeiro você precisa selecionar ou criar um deck.",
        variant: "destructive",
      });
      return null;
    }

    console.log("handleCreateCard - calling createCard with:", { targetDeckId, front, back, parentId, type, hiddenWordIndices, hiddenWords, explanation });
    const cardId = await createCard(targetDeckId, front, back, parentId, type, hiddenWordIndices, hiddenWords, explanation);
    console.log("handleCreateCard - received cardId:", cardId);
    
    if (cardId) {
      console.log("handleCreateCard - returning cardId:", cardId);
    } else {
      console.log("handleCreateCard - cardId is null/undefined");
    }
    
    if (cardId) {
      toast({
        title: "Card criado!",
        description: "Seu flashcard foi adicionado ao deck.",
      });
      return cardId;
    }
    return null;
  };

  const handleStudyDeck = (deckId: string) => {
    console.log('Navegando para estudar deck:', deckId);
    navigate(`/flashcards?study=${deckId}`);
  };

  const selectedDeck = decks.find(deck => deck.id === selectedDeckId);
  const studyDeck = decks.find(deck => deck.id === studyDeckId);

  // Efeito para carregar cards para estudo
  useEffect(() => {
    if (isStudyMode && studyDeckId && studyDeck && !loading) {
      const dueCards = getDueCards().filter(card => card.deckId === studyDeckId);
      const allCards = getCardsByDeck(studyDeckId);
      
      const cardsToStudy = dueCards.length > 0 ? dueCards : allCards;
      
      if (cardsToStudy.length === 0) {
        toast({
          title: "Nenhum card para estudar",
          description: "Este deck não possui cards ou todos já foram revisados.",
        });
        navigate('/flashcards');
        return;
      }

      setStudyCards(cardsToStudy);
      setCurrentCardIndex(0);
      setCompletedCards([]);
      setIsStudyComplete(false);
    }
  }, [isStudyMode, studyDeckId, loading]);

  // Função para lidar com respostas do estudo
  const handleStudyAnswer = async (difficulty: StudyDifficulty) => {
    const currentCard = studyCards[currentCardIndex];
    if (!currentCard) return;

    // Atualizar o card com a resposta
    await updateCard(currentCard.id, difficulty);

    // Marcar card como completo
    setCompletedCards(prev => [...prev, currentCard.id]);

    // Verificar se terminou o estudo
    if (currentCardIndex >= studyCards.length - 1) {
      setIsStudyComplete(true);
      toast({
        title: "Estudo concluído! 🎉",
        description: `Você revisou ${studyCards.length} cards do deck "${studyDeck?.name}".`,
      });
    } else {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handleRestartStudy = () => {
    setCurrentCardIndex(0);
    setCompletedCards([]);
    setIsStudyComplete(false);
  };

  // Função para criar sub-flashcard
  const handleCreateSubCard = (parentCard: Flashcard) => {
    setParentCardForSub(parentCard);
    setIsCreatingSubCard(true);
  };

  // Função para salvar sub-flashcard
  const handleSaveSubCard = async (front: string, back: string, parentId: string) => {
    if (!studyDeckId) return;
    
    const subCardId = await createCard(studyDeckId, front, back, parentId, 'traditional');
    
    if (subCardId) {
      toast({
        title: "Sub-flashcard criado!",
        description: "A sub-pergunta foi adicionada com sucesso.",
      });
      
      setIsCreatingSubCard(false);
      setParentCardForSub(null);
    }
  };

  // Função para cancelar criação de sub-flashcard
  const handleCancelSubCard = () => {
    setIsCreatingSubCard(false);
    setParentCardForSub(null);
  };

  // Função para obter cards filhos
  const getChildCards = (parentId: string): Flashcard[] => {
    return cards.filter(card => card.parentId === parentId);
  };

  const studyProgress = studyCards.length > 0 ? (currentCardIndex / studyCards.length) * 100 : 0;
  const currentStudyCard = studyCards[currentCardIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Renderizar modo de estudo
  if (isStudyMode) {
    if (isStudyComplete) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold">Estudo Concluído!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Você revisou <strong>{studyCards.length} cards</strong> do deck <strong>"{studyDeck?.name}"</strong>
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={handleRestartStudy}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Estudar Novamente
                </Button>
                <Button 
                  onClick={() => navigate('/flashcards')}
                  className="flex-1 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar aos Decks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/flashcards')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">Estudando: {studyDeck?.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      Card {currentCardIndex + 1} de {studyCards.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={studyProgress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Study Area - Centralizada */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-4xl">
            {isCreatingSubCard && parentCardForSub ? (
              <SubFlashcardEditor
                parentCard={parentCardForSub}
                onSave={handleSaveSubCard}
                onCancel={handleCancelSubCard}
              />
            ) : currentStudyCard && (
              <FlashcardDisplay
                card={currentStudyCard}
                onAnswer={handleStudyAnswer}
                onCreateSubCard={handleCreateSubCard}
                getChildCards={getChildCards}
                showAnswer={false}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  const toggleCardBack = (cardId: string) => {
    setShowCardBacks(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getCardTypeLabel = (type: string) => {
    switch (type) {
      case 'true-false':
        return 'V/F';
      case 'word-hiding':
        return 'Ocultação';
      default:
        return 'Tradicional';
    }
  };

  const getCardStatusColor = (card: Flashcard) => {
    if (!card.lastReviewed) return 'bg-blue-500/10 text-blue-700 border-blue-200';
    const now = new Date();
    const nextReview = new Date(card.nextReview);
    if (nextReview <= now) return 'bg-red-500/10 text-red-700 border-red-200';
    return 'bg-green-500/10 text-green-700 border-green-200';
  };

  const getCardStatusText = (card: Flashcard) => {
    if (!card.lastReviewed) return 'Novo';
    const now = new Date();
    const nextReview = new Date(card.nextReview);
    if (nextReview <= now) return 'Para revisar';
    return 'Revisado';
  };

  return (
    <div className="bg-background">
      {/* Diálogo de Migração de Dados */}
      <DataMigrationDialog />
      
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">FlashCards</h1>
                <p className="text-sm text-muted-foreground">Aprendizado com repetição espaçada</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Indicador de Status de Sincronização */}
              {syncStatus !== 'idle' && (
                <div className="flex items-center gap-2 text-sm">
                  {syncStatus === 'syncing' && (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      <span className="text-muted-foreground">Sincronizando...</span>
                    </>
                  )}
                  {syncStatus === 'success' && (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">Sincronizado</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <>
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-red-600">Erro na sincronização</span>
                    </>
                  )}
                </div>
              )}
              
              <Dialog open={isCreateDeckOpen} onOpenChange={setIsCreateDeckOpen}>
                <DialogTrigger asChild>
                  <Button variant="study" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Deck
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Deck</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome do Deck</label>
                      <Input
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                        placeholder="Ex: Vocabulário em Inglês"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição (opcional)</label>
                      <Textarea
                        value={newDeckDescription}
                        onChange={(e) => setNewDeckDescription(e.target.value)}
                        placeholder="Descreva o conteúdo do seu deck..."
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateDeck}
                      disabled={!newDeckName.trim() || isCreatingDeck}
                      className="w-full"
                    >
                      {isCreatingDeck ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Criando...
                        </>
                      ) : (
                        'Criar Deck'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {selectedDeckId ? (
          // Modo de criação - foco no editor com seleção de deck
          <div className="space-y-6">
            {/* Botão para voltar */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedDeckId(null)}
                className="gap-2"
              >
                ← Voltar para Dashboard
              </Button>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">Criar Flashcards</h2>
                <p className="text-sm text-muted-foreground">Selecione um deck e crie seus flashcards</p>
              </div>
            </div>

            {/* Tabs de Seleção de Deck */}
            {decks.length > 0 && (
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-3">
                  <Tabs value={selectedDeckId} onValueChange={setSelectedDeckId}>
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 bg-muted p-1">
                      {decks.map((deck) => (
                        <TabsTrigger 
                          key={deck.id} 
                          value={deck.id}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm px-3 py-2"
                        >
                          {deck.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Controles do Editor */}
            {selectedDeck && (
              <Card className="p-4 bg-gradient-card border-border/50 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Modo de Criação</h3>
                    <p className="text-xs text-muted-foreground">
                      {useBlockEditor ? 'Editor baseado em blocos' : 'Editor tradicional'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseBlockEditor(!useBlockEditor)}
                    className="gap-2"
                  >
                    <Blocks className="h-4 w-4" />
                    {useBlockEditor ? 'Usar Editor Tradicional' : 'Usar Editor de Blocos'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Editor de criação integrado com cards existentes */}
            {selectedDeck && (
               <div className="animate-slide-down-in">
                 <FlashcardEditor
                   onSave={handleCreateCard}
                   placeholder={`Criando cards para "${selectedDeck?.name}"\n\nPergunta == Resposta`}
                   useBlockEditor={useBlockEditor}
                   deckId={selectedDeckId}
                 />
               </div>
            )}
          </div>
        ) : (
          // Modo dashboard - visão completa
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stats */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{totalCards}</p>
                        <p className="text-sm text-muted-foreground">Total de Cards</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-destructive" />
                      <div>
                        <p className="text-2xl font-bold">{totalDueCards}</p>
                        <p className="text-sm text-muted-foreground">Para Revisar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-success" />
                      <div>
                        <p className="text-2xl font-bold">{studiedToday}</p>
                        <p className="text-sm text-muted-foreground">Estudados Hoje</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Brain className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{decks.length}</p>
                        <p className="text-sm text-muted-foreground">Decks Ativos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Deck Selection & Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Deck Selector */}
              {decks.length > 0 && (
                <Card className="p-6 bg-gradient-card border-border/50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Selecionar Deck para Adicionar Cards
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {decks.map((deck) => (
                      <Button
                        key={deck.id}
                        variant={selectedDeckId === deck.id ? "default" : "outline"}
                        onClick={() => setSelectedDeckId(deck.id)}
                        className="justify-start h-auto p-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{deck.name}</div>
                          <div className="text-xs opacity-75">{deck.cardCount} cards</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Card Editor or Welcome */}
              {!selectedDeckId && (
                <Card className="p-8 text-center bg-gradient-card border-border/50">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Comece criando um deck</h3>
                  <p className="text-muted-foreground mb-4">
                    Organize seus flashcards em decks temáticos para um estudo mais eficiente.
                  </p>
                  <Button 
                    onClick={() => setIsCreateDeckOpen(true)}
                    variant="study"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Deck
                  </Button>
                </Card>
              )}
            </div>

            {/* Decks List */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Meus Decks
              </h3>
              
              {decks.length === 0 ? (
                <Card className="p-6 text-center bg-gradient-card border-border/50">
                  <p className="text-muted-foreground">
                    Nenhum deck criado ainda
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {decks.map((deck) => {
                    const stats = getDeckStats(deck.id);
                    return (
                      <DeckCard
                        key={deck.id}
                        deck={deck}
                        dueCount={stats.due}
                        totalCards={stats.total}
                        onStudy={() => handleStudyDeck(deck.id)}
                        onEdit={() => {/* TODO: Implement edit */}}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
