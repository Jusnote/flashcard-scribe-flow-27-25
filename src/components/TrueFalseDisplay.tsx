import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrueFalseDisplayProps {
  statement: string;
  correctAnswer: string; // "Certo" ou "Errado"
  explanation?: string; // Explicação personalizada opcional
  onAnswer: (userAnswer: 'true' | 'false', isCorrect: boolean) => void;
  hasAnswered?: boolean;
  userAnswer?: 'true' | 'false';
  isCorrect?: boolean;
}

export function TrueFalseDisplay({
  statement,
  correctAnswer,
  explanation,
  onAnswer,
  hasAnswered = false,
  userAnswer,
  isCorrect
}: TrueFalseDisplayProps) {
  const correctIsTrue = correctAnswer === 'Certo';

  const handleAnswerClick = (answer: 'true' | 'false') => {
    if (hasAnswered) return;
    
    const correct = (answer === 'true' && correctIsTrue) || (answer === 'false' && !correctIsTrue);
    onAnswer(answer, correct);
  };

  const getExplanation = () => {
    if (!hasAnswered) return null;
    
    if (isCorrect) {
      return {
        type: 'success' as const,
        title: 'Parabéns! 🎉',
        message: explanation || `Você acertou! A resposta correta é "${correctAnswer}".`
      };
    } else {
      return {
        type: 'error' as const,
        title: 'Não foi desta vez! 😔',
        message: explanation || `A resposta correta é "${correctAnswer}". Continue estudando!`
      };
    }
  };

  const explanationData = getExplanation();

  return (
    <div className="space-y-6">
      {/* Statement */}
      <div className="text-center">
        <div className="text-lg font-medium text-foreground leading-relaxed">
          {statement}
        </div>
      </div>

      {/* Answer Options */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => handleAnswerClick('true')}
          disabled={hasAnswered}
          variant="outline"
          size="lg"
          className={cn(
            "flex items-center gap-3 min-w-[120px] transition-all duration-300",
            hasAnswered && userAnswer === 'true' && isCorrect && "bg-success/15 border-success text-foreground ring-1 ring-success/30",
            hasAnswered && userAnswer === 'true' && !isCorrect && "bg-destructive/10 border-destructive text-destructive-foreground",
            hasAnswered && userAnswer !== 'true' && correctIsTrue && "bg-success/15 border-success text-foreground ring-2 ring-success/30",
            !hasAnswered && "hover:bg-success/5 hover:border-success/30"
          )}
        >
          <Check className="h-5 w-5" />
          <span className="font-medium">Certo</span>
          {hasAnswered && correctIsTrue && userAnswer !== 'true' && (
             <Badge variant="outline" className="ml-2 text-xs bg-success/20 text-success border-success/30">
              Correto
            </Badge>
          )}
        </Button>

        <Button
          onClick={() => handleAnswerClick('false')}
          disabled={hasAnswered}
          variant="outline"
          size="lg"
          className={cn(
            "flex items-center gap-3 min-w-[120px] transition-all duration-300",
            hasAnswered && userAnswer === 'false' && isCorrect && "bg-success/15 border-success text-foreground ring-1 ring-success/30",
            hasAnswered && userAnswer === 'false' && !isCorrect && "bg-destructive/10 border-destructive text-destructive-foreground",
            hasAnswered && userAnswer !== 'false' && !correctIsTrue && "bg-success/15 border-success text-foreground ring-2 ring-success/30",
            !hasAnswered && "hover:bg-destructive/5 hover:border-destructive/30"
          )}
        >
          <X className="h-5 w-5" />
          <span className="font-medium">Errado</span>
          {hasAnswered && !correctIsTrue && userAnswer !== 'false' && (
            <Badge variant="outline" className="ml-2 text-xs bg-success/20 text-success border-success/30">
              Correto
            </Badge>
          )}
        </Button>
      </div>

      {/* Feedback */}
      {explanationData && (
        <div className={cn(
          "p-4 rounded-lg border-l-4 animate-fade-in",
          explanationData.type === 'success' && "bg-success/5 border-l-success text-success",
          explanationData.type === 'error' && "bg-destructive/5 border-l-destructive text-destructive-foreground"
        )}>
          <div className="flex items-start gap-3">
            <Lightbulb className={cn(
              "h-5 w-5 mt-0.5 flex-shrink-0",
              explanationData.type === 'success' && "text-success",
              explanationData.type === 'error' && "text-destructive"
            )} />
            <div>
              <div className="font-medium mb-1">{explanationData.title}</div>
              <div className="text-sm opacity-90">{explanationData.message}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}