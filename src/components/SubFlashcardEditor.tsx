import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlashcardParser } from '@/lib/flashcard-parser';
import { ArrowRight, Plus, Link2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubFlashcardEditorProps {
  parentCard: { id: string; front: string; back: string };
  onSave: (front: string, back: string, parentId: string) => void;
  onCancel: () => void;
}

export function SubFlashcardEditor({ parentCard, onSave, onCancel }: SubFlashcardEditorProps) {
  const [text, setText] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(FlashcardParser.isValidFormat(text));
  }, [text]);

  const handleSave = () => {
    const parsed = FlashcardParser.parse(text);
    if (parsed) {
      onSave(parsed.front, parsed.back, parentCard.id);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && isValid) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const separatorIndex = text.indexOf(FlashcardParser.SEPARATOR);
  const hasPartialSeparator = separatorIndex !== -1;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Parent card context */}
      <Card className="p-4 bg-accent/30 border-l-4 border-l-primary">
        <div className="text-sm text-muted-foreground mb-1">Contexto do card pai:</div>
        <div className="space-y-2">
          <div><strong>Pergunta:</strong> {parentCard.front}</div>
          <div><strong>Resposta:</strong> {parentCard.back}</div>
        </div>
      </Card>

      <Card className="p-6 shadow-card bg-gradient-card border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Criar Sub-Flashcard
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma pergunta complementar == Digite a resposta"
              className={cn(
                "w-full min-h-[100px] p-4 border-2 rounded-lg resize-none",
                "bg-background text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "transition-all duration-200",
                hasPartialSeparator && !isValid && "border-warning/50",
                isValid && "border-success/50"
              )}
              autoFocus
            />
            
            {hasPartialSeparator && (
              <div className="absolute right-3 top-3">
                <ArrowRight className="h-5 w-5 text-primary animate-pulse" />
              </div>
            )}
          </div>

          {text && (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">Prévia:</span>
                <span className="text-foreground">
                  {FlashcardParser.getPreview(text)}
                </span>
              </div>
              {hasPartialSeparator && !isValid && (
                <p className="text-warning mt-1">
                  Continue digitando a resposta após "=="
                </p>
              )}
              {isValid && (
                <p className="text-success mt-1">
                  Sub-flashcard pronto! Pressione Ctrl+Enter ou clique em Salvar
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              onClick={onCancel}
              variant="outline"
              className="gap-2"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!isValid}
              variant="study"
              size="study"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Salvar Sub-Flashcard
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + Enter</kbd> para salvar • 
            <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">Esc</kbd> para cancelar
          </div>
        </div>
      </Card>
    </div>
  );
}