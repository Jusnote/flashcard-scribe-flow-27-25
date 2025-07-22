import { NodeViewWrapper } from '@tiptap/react';
import { AnimatedCarousel } from './animated-carousel';
import { useState, useEffect } from 'react';

export function CarouselNodeView({ node, updateAttributes }: any) {
  const [slides, setSlides] = useState(node.attrs.slides || []);

  useEffect(() => {
    setSlides(node.attrs.slides || []);
  }, [node.attrs.slides]);

  const handleSlideContentChange = (slideIndex: number, content: string) => {
    const updatedSlides = slides.map((slide: any, index: number) => 
      index === slideIndex ? { ...slide, content } : slide
    );
    
    setSlides(updatedSlides);
    updateAttributes({ slides: updatedSlides });
  };

  return (
    <NodeViewWrapper className="carousel-wrapper">
      <AnimatedCarousel
        slides={slides}
        editable={true}
        onSlideContentChange={handleSlideContentChange}
        className="my-4"
      />
    </NodeViewWrapper>
  );
}