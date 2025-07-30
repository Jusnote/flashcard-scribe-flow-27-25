
import { ModernFlashcardEditor } from '@/components/ModernFlashcardEditor';
import { BlockBasedFlashcardEditor } from '@/components/BlockBasedFlashcardEditor';

interface FlashcardEditorProps {
  onSave: (front: string, back: string, type?: 'traditional' | 'word-hiding' | 'true-false', hiddenWordIndices?: number[], hiddenWords?: string[], explanation?: string, parentId?: string, deckId?: string) => Promise<string | null>;
  placeholder?: string;
  useBlockEditor?: boolean;
  deckId?: string; // Nova prop para identificar o deck
}

export function FlashcardEditor({ onSave, placeholder, useBlockEditor = false, deckId }: FlashcardEditorProps) {
  if (useBlockEditor) {
    return <BlockBasedFlashcardEditor onSave={onSave} placeholder={placeholder} deckId={deckId} />;
  }
  
  return (
    <ModernFlashcardEditor onSave={onSave} placeholder={placeholder} />
  );
}
