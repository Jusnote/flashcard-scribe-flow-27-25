import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FlashcardParser } from '@/lib/flashcard-parser';
import { FileText, EyeOff, Check, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Flashcard } from '@/types/flashcard';

interface ModernFlashcardEditorProps {
  onSave: (front: string, back: string, type?: 'traditional' | 'word-hiding' | 'true-false', hiddenWordIndices?: number[], hiddenWords?: string[], explanation?: string) => void;
  placeholder?: string;
  existingCards?: Flashcard[];
  onUpdateCard?: (cardId: string, front: string, back: string, explanation?: string, hiddenWords?: string[]) => void;
}

export function ModernFlashcardEditor({ onSave, placeholder, existingCards = [], onUpdateCard }: ModernFlashcardEditorProps) {
  const [text, setText] = useState('');
  const [lines, setLines] = useState(['']);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [showTrueFalseOptions, setShowTrueFalseOptions] = useState(false);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);
  const [currentLineType, setCurrentLineType] = useState<'traditional' | 'word-hiding' | 'true-false' | null>(null);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Identificar flashcards no texto atual
  const identifyFlashcards = () => {
    const textLines = text.split('\n');
    const flashcards = [];
    
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i].trim();
      if (!line) continue;
      
      let type: 'traditional' | 'word-hiding' | 'true-false' = 'traditional';
      let isValid = false;
      
      if (line.includes('{{') && line.includes('}}')) {
        type = 'word-hiding';
        isValid = true;
      } else if (line.includes(' == ')) {
        type = 'traditional';
        isValid = true;
      } else if (line.length > 0) {
        // Assume certo/errado se não for outros tipos
        type = 'true-false';
        isValid = true;
      }
      
      if (isValid) {
        flashcards.push({
          lineIndex: i,
          type,
          content: line,
          startChar: textLines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0),
          endChar: textLines.slice(0, i + 1).join('\n').length
        });
      }
    }
    
    return flashcards;
  };
  
  const flashcards = identifyFlashcards();

  // Inicializar editor com flashcards existentes
  useEffect(() => {
    if (existingCards.length > 0) {
      const cardTexts = existingCards.map(card => {
        if (card.type === 'traditional') {
          return `${card.front} == ${card.back}`;
        } else if (card.type === 'word-hiding') {
          return card.back; // Texto original sem marcações
        } else if (card.type === 'true-false') {
          return card.front;
        }
        return `${card.front} == ${card.back}`;
      });
      
      const initialText = cardTexts.join('\n') + '\n';
      setText(initialText);
      setLines(initialText.split('\n'));
    }
  }, [existingCards]);

  // Calcular altura de cada linha dinamicamente
  const calculateLineHeights = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textLines = text.split('\n');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Aplicar mesmo estilo do textarea
    const computedStyle = getComputedStyle(textarea);
    context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    
    const lineHeight = 24; // Altura padrão de linha
    const textareaWidth = textarea.clientWidth - 24; // Descontar padding lateral
    
    const heights = textLines.map(line => {
      if (!line.trim()) return lineHeight;
      
      const textWidth = context.measureText(line).width;
      const wrappedLines = Math.ceil(textWidth / textareaWidth) || 1;
      return wrappedLines * lineHeight;
    });

    setLineHeights(heights);
  }, [text]);

  // Auto-resize textarea e calcular alturas das linhas
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      
      // Calcular alturas das linhas após um pequeno delay para garantir que o textarea foi redimensionado
      setTimeout(calculateLineHeights, 0);
    }
  }, [text, calculateLineHeights]);

  // Update text when lines change
  useEffect(() => {
    setText(lines.join('\n'));
  }, [lines]);

  const getCurrentLine = () => {
    const textarea = textareaRef.current;
    if (!textarea) return '';
    
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    return lines[lines.length - 1];
  };

  const getCurrentLineIndex = () => {
    const textarea = textareaRef.current;
    if (!textarea) return 0;
    
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    return textBeforeCursor.split('\n').length - 1;
  };

  const saveCurrentLine = () => {
    const currentLine = getCurrentLine().trim();
    if (!currentLine) return;

    // Verificar tipo de flashcard baseado no conteúdo da linha
    if (currentLine.includes('{{') && currentLine.includes('}}')) {
      // Flashcard de ocultação de palavras
      const cleanText = currentLine.replace(/\{\{([^}]+)\}\}/g, '$1');
      const words = hiddenWords;
      const hiddenWordIndices = FlashcardParser.createHiddenWordIndices(cleanText, words);
      onSave("Texto com palavras ocultas", cleanText, 'word-hiding', hiddenWordIndices, words);
    } else if (trueFalseAnswer !== null) {
      // Flashcard certo/errado
      const explanation = trueFalseAnswer ? "Correto" : "Incorreto";
      onSave(currentLine, trueFalseAnswer ? "Verdadeiro" : "Falso", 'true-false', undefined, undefined, explanation);
    } else if (currentLine.includes(' == ')) {
      // Flashcard tradicional
      const parsed = FlashcardParser.parse(currentLine);
      if (parsed) {
        onSave(parsed.front, parsed.back, 'traditional');
      }
    } else {
      // Texto livre - criar como tradicional simples
      onSave(currentLine, "Resposta a ser definida", 'traditional');
    }

    // Reset para próxima linha
    setHiddenWords([]);
    setTrueFalseAnswer(null);
    setShowTrueFalseOptions(false);
    setCurrentLineType(null);
  };

  const handleTraditionalType = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    
    const newText = beforeCursor + ' == ' + afterCursor;
    setText(newText);
    setCurrentLineType('traditional');
    
    // Posicionar cursor após o separador
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition + 4, cursorPosition + 4);
    }, 0);
  };

  const handleWordHiding = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return; // Nenhum texto selecionado

    const selectedText = text.substring(start, end);
    const beforeSelection = text.substring(0, start);
    const afterSelection = text.substring(end);
    
    // Marcar palavra para ocultar com {{}}
    const newText = beforeSelection + `{{${selectedText}}}` + afterSelection;
    setText(newText);
    
    // Adicionar à lista de palavras ocultas
    if (!hiddenWords.includes(selectedText)) {
      setHiddenWords([...hiddenWords, selectedText]);
    }
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + selectedText.length + 4, start + selectedText.length + 4);
    }, 0);
  };

  const handleTrueFalseType = () => {
    setShowTrueFalseOptions(true);
  };

  const handleTrueFalseSelect = (answer: boolean) => {
    setTrueFalseAnswer(answer);
    setShowTrueFalseOptions(false);
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCurrentLine();
      
      // Adicionar nova linha
      const lines = text.split('\n');
      const currentLineIndex = getCurrentLineIndex();
      lines[currentLineIndex + 1] = '';
      
      setText(lines.join('\n'));
      
      // Mover cursor para próxima linha
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          const newPosition = text.split('\n').slice(0, currentLineIndex + 1).join('\n').length + 1;
          textarea.setSelectionRange(newPosition, newPosition);
          textarea.focus();
        }
      }, 0);
    }
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      setSelectedText(text.substring(start, end));
    } else {
      setSelectedText('');
    }
  };

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto p-6 flex flex-col">
      {/* Área de escrita principal */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 p-8 shadow-card bg-gradient-card">
          <div className="relative h-full">
            {/* Barrinhas coloridas de identificação - acompanham altura do texto */}
            <div className="absolute left-0 top-0 w-1 h-full pointer-events-none z-10">
              {flashcards.map((flashcard, index) => {
                const colors = {
                  'traditional': 'bg-blue-500',
                  'word-hiding': 'bg-amber-500', 
                  'true-false': 'bg-green-500'
                };
                
                // Calcular posição e altura baseadas nas alturas reais das linhas
                let topPosition = 8; // padding inicial
                let barHeight = 24; // altura padrão
                
                if (lineHeights.length > 0) {
                  // Somar todas as alturas das linhas anteriores
                  topPosition = lineHeights.slice(0, flashcard.lineIndex).reduce((sum, height) => sum + height, 8);
                  
                  // Usar a altura real da linha atual
                  barHeight = lineHeights[flashcard.lineIndex] || 24;
                }
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "absolute left-2 w-1 rounded-full transition-all duration-300 ease-out",
                      colors[flashcard.type]
                    )}
                    style={{
                      top: `${topPosition}px`,
                      height: `${Math.max(barHeight - 4, 20)}px` // altura mínima de 20px
                    }}
                    title={`${flashcard.type.charAt(0).toUpperCase() + flashcard.type.slice(1)}: ${flashcard.content.slice(0, 50)}...`}
                  />
                );
              })}
            </div>
            
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onSelect={handleTextSelection}
              placeholder={placeholder || "Digite cada linha como um flashcard. Pressione Enter para salvar e ir para o próximo..."}
              className={cn(
                "min-h-[200px] w-full text-lg leading-relaxed resize-none border-0 bg-transparent overflow-hidden pl-6",
                "focus:outline-none focus:ring-0 focus-visible:ring-0",
                "placeholder:text-muted-foreground/50"
              )}
              style={{ height: 'auto', lineHeight: '24px' }}
            />
            
            {/* Indicador de texto selecionado */}
            {selectedText && (
              <div className="absolute top-4 right-4 px-3 py-2 bg-primary/10 rounded-lg text-sm text-primary">
                "{selectedText}" selecionado
              </div>
            )}
          </div>
        </Card>
        
        {/* Opções Certo/Errado */}
        {showTrueFalseOptions && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">Selecione a resposta correta:</p>
            <div className="flex gap-3">
              <Button
                variant={trueFalseAnswer === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleTrueFalseSelect(true)}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Certo
              </Button>
              <Button
                variant={trueFalseAnswer === false ? "default" : "outline"}
                size="sm"
                onClick={() => handleTrueFalseSelect(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Errado
              </Button>
            </div>
          </div>
        )}

        {/* Palavras ocultas */}
        {hiddenWords.length > 0 && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Palavras que serão ocultas:</p>
            <div className="flex flex-wrap gap-2">
              {hiddenWords.map((word, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/20 text-primary rounded text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Painel inferior com ícones */}
      <div className="mt-6 flex items-center justify-center bg-card p-4 rounded-xl border shadow-sm">
        {/* Ícones de tipo de flashcard */}
        <div className="flex gap-4">
          {/* Flashcard Tradicional */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleTraditionalType}
            className={cn(
              "h-12 w-12 rounded-xl border-2 transition-all duration-200",
              "hover:scale-105 hover:shadow-md",
              text.includes(' == ') && "border-primary bg-primary/10"
            )}
            title="Flashcard Tradicional (Pergunta == Resposta)"
          >
            <FileText className="h-6 w-6" />
          </Button>

          {/* Ocultação de Palavras */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleWordHiding}
            disabled={!selectedText}
            className={cn(
              "h-12 w-12 rounded-xl border-2 transition-all duration-200",
              "hover:scale-105 hover:shadow-md",
              selectedText && "border-primary bg-primary/10",
              !selectedText && "opacity-50 cursor-not-allowed",
              hiddenWords.length > 0 && "border-primary bg-primary/10"
            )}
            title="Ocultar Palavras (Selecione o texto primeiro)"
          >
            <EyeOff className="h-6 w-6" />
          </Button>

          {/* Certo/Errado */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleTrueFalseType}
            className={cn(
              "h-12 w-12 rounded-xl border-2 transition-all duration-200",
              "hover:scale-105 hover:shadow-md",
              (showTrueFalseOptions || trueFalseAnswer !== null) && "border-primary bg-primary/10"
            )}
            title="Flashcard Certo/Errado"
          >
            <Check className="h-6 w-6" />
          </Button>

          {/* Indicadores de estado */}
          <div className="flex items-center gap-2 ml-4">
            {text.includes(' == ') && (
              <div className="w-2 h-2 bg-primary rounded-full" title="Tradicional ativo" />
            )}
            {hiddenWords.length > 0 && (
              <div className="w-2 h-2 bg-secondary rounded-full" title="Ocultação ativa" />
            )}
            {(showTrueFalseOptions || trueFalseAnswer !== null) && (
              <div className="w-2 h-2 bg-accent rounded-full" title="Certo/Errado ativo" />
            )}
          </div>
        </div>
      </div>

      {/* Dicas de uso */}
      <div className="mt-4 p-4 bg-muted/20 rounded-lg">
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Dicas:</strong></p>
          <p>• Cada linha será um flashcard - pressione Enter para salvar</p>
          <p>• <FileText className="inline h-3 w-3" /> Tradicional: Clique no ícone para inserir " == " e separar pergunta da resposta</p>
          <p>• <EyeOff className="inline h-3 w-3" /> Ocultação: Selecione texto e clique no ícone para marcar como oculto</p>
          <p>• <Check className="inline h-3 w-3" /> Certo/Errado: Clique no ícone e escolha a resposta correta</p>
        </div>
      </div>
    </div>
  );
}