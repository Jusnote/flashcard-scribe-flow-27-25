import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrueFalseEditorProps {
  onSave: (front: string, back: string, type: 'true-false', explanation?: string) => void;
  placeholder?: string;
}

export function TrueFalseEditor({ onSave, placeholder }: TrueFalseEditorProps) {
  const [statement, setStatement] = useState('');
  const [answer, setAnswer] = useState<'true' | 'false' | null>(null);
  const [explanation, setExplanation] = useState('');

  const handleSave = () => {
    if (statement.trim() && answer) {
      const answerText = answer === 'true' ? 'Certo' : 'Errado';
      onSave(statement.trim(), answerText, 'true-false', explanation.trim() || undefined);
      setStatement('');
      setAnswer(null);
      setExplanation('');
    }
  };

  const canSave = statement.trim().length > 0 && answer !== null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Enunciado:
        </label>
        <Textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder={placeholder || "Digite uma afirmação para o flashcard de Certo/Errado..."}
          className="min-h-[100px]"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Resposta correta:
        </label>
        <div className="flex gap-3">
          <Button
            variant={answer === 'true' ? 'default' : 'outline'}
            onClick={() => setAnswer('true')}
            className={cn(
              "flex items-center gap-2 min-w-[100px]",
              answer === 'true' && "bg-success text-success-foreground hover:bg-success/90"
            )}
          >
            <Check className="h-4 w-4" />
            Certo
          </Button>
          <Button
            variant={answer === 'false' ? 'default' : 'outline'}
            onClick={() => setAnswer('false')}
            className={cn(
              "flex items-center gap-2 min-w-[100px]",
              answer === 'false' && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            <X className="h-4 w-4" />
            Errado
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Explicação (opcional):
        </label>
        <Textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Adicione uma explicação do porquê a resposta está certa ou errada..."
          className="min-h-[80px]"
        />
      </div>

      {statement && answer && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Prévia:</span>
          </div>
          <div className="text-foreground">
            <p className="mb-2">{statement}</p>
            <Badge 
              variant={answer === 'true' ? 'default' : 'destructive'}
              className="flex items-center gap-1 w-fit"
            >
              {answer === 'true' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {answer === 'true' ? 'Certo' : 'Errado'}
            </Badge>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!canSave}
          variant="study"
          size="study"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Salvar Flashcard
        </Button>
      </div>
    </div>
  );
}