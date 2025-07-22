import { useEffect, useRef, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatedCarousel } from './ui/animated-carousel';
import { InteractiveExplanation } from './ui/interactive-explanation';

interface CarouselRendererProps {
  content: string;
  className?: string;
}

export const CarouselRenderer = forwardRef<HTMLDivElement, CarouselRendererProps>(({ content, className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Renderizar o conteúdo HTML
    containerRef.current.innerHTML = content;

    // Encontrar e substituir elementos de carrossel
    const carouselElements = containerRef.current.querySelectorAll('[data-carousel]');
    
    carouselElements.forEach((element) => {
      const slidesData = element.getAttribute('data-slides');
      if (slidesData) {
        try {
          const slides = JSON.parse(slidesData);
          
          // Criar um container React para o carrossel
          const carouselContainer = document.createElement('div');
          carouselContainer.className = 'carousel-container my-4';
          
          // Substituir o elemento original
          element.parentNode?.replaceChild(carouselContainer, element);
          
          // Renderizar o componente React
          const root = createRoot(carouselContainer);
          root.render(
            <AnimatedCarousel
              slides={slides}
              editable={false}
              className="border border-border rounded-lg overflow-hidden"
            />
          );
        } catch (error) {
          console.error('Erro ao processar dados do carrossel:', error);
        }
      }
    });

    // Encontrar e substituir elementos de explicação interativa
    const explanationElements = containerRef.current.querySelectorAll('span[data-explanation]');
    console.log('Elementos de explicação encontrados:', explanationElements.length);
    
    explanationElements.forEach((element, index) => {
      const explanation = element.getAttribute('data-explanation');
      const textContent = element.textContent || '';
      
      console.log(`Processando explicação ${index}:`, { explanation, textContent });
      
      if (explanation) {
        // Criar um container React para a explicação
        const explanationContainer = document.createElement('span');
        explanationContainer.className = 'interactive-explanation-container';
        
        // Substituir o elemento original
        element.parentNode?.replaceChild(explanationContainer, element);
        
        // Renderizar o componente React
        const root = createRoot(explanationContainer);
        root.render(
          <InteractiveExplanation explanation={explanation}>
            {textContent}
          </InteractiveExplanation>
        );
        console.log(`Explicação ${index} renderizada com sucesso`);
      }
    });

    // Cleanup function
    return () => {
      carouselElements.forEach((element) => {
        const container = containerRef.current?.querySelector('.carousel-container');
        if (container) {
          // O React vai limpar automaticamente quando o componente for desmontado
        }
      });
    };
  }, [content]);

  return (
    <div 
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={className}
    />
  );
});

CarouselRenderer.displayName = 'CarouselRenderer';