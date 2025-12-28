import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  onComplete?: () => void;
  className?: string;
  firstLineClassName?: string;
  restLineClassName?: string;
  firstLineStyle?: React.CSSProperties;
}

export function TypewriterText({
  texts,
  speed = 50,
  onComplete,
  className = '',
  firstLineClassName = '',
  restLineClassName = '',
  firstLineStyle
}: TypewriterTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [completedTexts, setCompletedTexts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentTextIndex >= texts.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const fullText = texts[currentTextIndex];
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setCurrentText(fullText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCompletedTexts([...completedTexts, fullText]);
          setCurrentTextIndex(currentTextIndex + 1);
          setCurrentText('');
        }, 800);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [currentTextIndex, texts, speed, onComplete, completedTexts]);

  const getLineClassName = (index: number) => {
    if (index === 0 && firstLineClassName) {
      return firstLineClassName;
    }
    return restLineClassName;
  };

  return (
    <div className={className}>
      {completedTexts.map((text, index) => (
        <div 
          key={index} 
          className={getLineClassName(index)}
          style={index === 0 && firstLineStyle ? firstLineStyle : undefined}
        >
          {text}
        </div>
      ))}
      <div 
        className={getLineClassName(completedTexts.length)}
        style={completedTexts.length === 0 && firstLineStyle ? firstLineStyle : undefined}
      >
        {currentText}
        {!isComplete && <span className="animate-pulse">|</span>}
      </div>
    </div>
  );
}
