import React from 'react';
import { InteractiveExplanation } from './ui/interactive-explanation';

interface InteractiveContentRendererProps {
  content: string;
  className?: string;
}

export function InteractiveContentRenderer({ content, className }: InteractiveContentRendererProps) {
  const renderInteractiveContent = (htmlContent: string) => {
    // Função para processar o HTML e substituir elementos com data-explanation
    const processContent = (html: string): React.ReactNode => {
      // Se não há data-explanation, retorna o HTML normalmente
      if (!html.includes('data-explanation')) {
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
      }

      // Regex para encontrar elementos com data-explanation
      const explanationRegex = /<span[^>]*data-explanation="([^"]*)"[^>]*>(.*?)<\/span>/gi;
      
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = explanationRegex.exec(html)) !== null) {
        // Adiciona o conteúdo antes do match
        if (match.index > lastIndex) {
          const beforeContent = html.slice(lastIndex, match.index);
          if (beforeContent.trim()) {
            parts.push(
              <span 
                key={`before-${match.index}`}
                dangerouslySetInnerHTML={{ __html: beforeContent }} 
              />
            );
          }
        }

        // Decodifica a explicação (se necessário)
        const explanation = match[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        const textContent = match[2];

        // Adiciona o componente InteractiveExplanation
        parts.push(
          <InteractiveExplanation 
            key={`explanation-${match.index}`}
            explanation={explanation}
          >
            <span dangerouslySetInnerHTML={{ __html: textContent }} />
          </InteractiveExplanation>
        );

        lastIndex = match.index + match[0].length;
      }

      // Adiciona o conteúdo restante
      if (lastIndex < html.length) {
        const remainingContent = html.slice(lastIndex);
        if (remainingContent.trim()) {
          parts.push(
            <span 
              key={`remaining-${lastIndex}`}
              dangerouslySetInnerHTML={{ __html: remainingContent }} 
            />
          );
        }
      }

      return <div className="interactive-content">{parts}</div>;
    };

    return processContent(htmlContent);
  };

  return (
    <div className={className}>
      {renderInteractiveContent(content)}
    </div>
  );
}