import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WordHidingDisplayProps {
  text: string;
  hiddenWordIndices: number[];
  isStudyMode?: boolean;
}

export function WordHidingDisplay({ text, hiddenWordIndices, isStudyMode = true }: WordHidingDisplayProps) {
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());

  // Divide o texto em palavras, mantendo a pontuação
  const words = text.split(/(\s+)/).filter(word => word.trim());
  
  const revealWord = (index: number) => {
    if (isStudyMode && hiddenWordIndices.includes(index)) {
      setRevealedWords(prev => new Set([...prev, index]));
    }
  };

  const revealAllWords = () => {
    setRevealedWords(new Set(hiddenWordIndices));
  };

  const hideAllWords = () => {
    setRevealedWords(new Set());
  };

  const remainingHiddenWords = hiddenWordIndices.filter(index => !revealedWords.has(index));

  return (
    <div className="space-y-4">
      <div className="text-lg leading-relaxed">
        {words.map((word, index) => {
          const isWhitespace = !word.trim();
          const shouldBeHidden = hiddenWordIndices.includes(index);
          const isCurrentlyHidden = shouldBeHidden && !revealedWords.has(index);
          
          if (isWhitespace) {
            return <span key={index}>{word}</span>;
          }
          
          return (
            <span
              key={index}
              onClick={() => revealWord(index)}
              className={cn(
                "relative inline-block transition-all duration-200",
                shouldBeHidden && "font-medium",
                isCurrentlyHidden && "bg-muted border border-dashed border-muted-foreground/30 rounded px-2 py-1 text-transparent select-none cursor-pointer hover:bg-muted/80 animate-pulse",
                shouldBeHidden && revealedWords.has(index) && "bg-success/20 text-success-foreground"
              )}
              title={isCurrentlyHidden ? "Clique para revelar" : undefined}
            >
              {isCurrentlyHidden ? "____" : word}
            </span>
          );
        })}
      </div>

      {isStudyMode && hiddenWordIndices.length > 0 && (
        <div className="pt-4 border-t border-border/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {remainingHiddenWords.length} de {hiddenWordIndices.length} palavra{hiddenWordIndices.length !== 1 ? 's' : ''} ainda oculta{hiddenWordIndices.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button onClick={hideAllWords} variant="outline" size="sm" disabled={revealedWords.size === 0}>
                Ocultar Todas
              </Button>
              <Button onClick={revealAllWords} variant="outline" size="sm" disabled={remainingHiddenWords.length === 0}>
                Revelar Todas
              </Button>
            </div>
          </div>
          {remainingHiddenWords.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Clique nas palavras ocultas para revelá-las
            </p>
          )}
        </div>
      )}
    </div>
  );
}