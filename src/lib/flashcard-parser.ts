/**
 * Parses text input to extract flashcard front and back
 * Format: "front content == back content"
 */
export class FlashcardParser {
  static SEPARATOR = '==';
  
  static parse(text: string): { front: string; back: string } | null {
    const separatorIndex = text.indexOf(this.SEPARATOR);
    
    if (separatorIndex === -1) {
      return null;
    }
    
    const front = text.substring(0, separatorIndex).trim();
    const back = text.substring(separatorIndex + this.SEPARATOR.length).trim();
    
    if (!front || !back) {
      return null;
    }
    
    return { front, back };
  }
  
  static isValidFormat(text: string): boolean {
    return this.parse(text) !== null;
  }
  
  static getPreview(text: string): string {
    const separatorIndex = text.indexOf(this.SEPARATOR);
    
    if (separatorIndex === -1) {
      return text;
    }
    
    const front = text.substring(0, separatorIndex).trim();
    return front || 'Flashcard em construção...';
  }

  // Funções para parsing de palavras ocultas com sintaxe {{ }}
  static parseHiddenWords(text: string): { text: string; hiddenWords: string[] } {
    const hiddenWords: string[] = [];
    const cleanText = text.replace(/\{\{([^}]+)\}\}/g, (match, word) => {
      hiddenWords.push(word.trim());
      return word.trim();
    });
    
    return { text: cleanText, hiddenWords };
  }

  static createHiddenWordIndices(text: string, hiddenWords: string[]): number[] {
    const words = text.split(/(\s+)/).filter(word => word.trim());
    const indices: number[] = [];
    
    hiddenWords.forEach(hiddenWord => {
      const wordIndex = words.findIndex(word => word.trim().toLowerCase() === hiddenWord.toLowerCase());
      if (wordIndex !== -1 && !indices.includes(wordIndex)) {
        indices.push(wordIndex);
      }
    });
    
    return indices;
  }

  static hasHiddenWordSyntax(text: string): boolean {
    return /\{\{[^}]+\}\}/.test(text);
  }
}