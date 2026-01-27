'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Subsection {
  title?: string;
  content: string;
}

interface QASectionProps {
  question: string;
  answer: string | ReactNode;
  subsections?: Subsection[];
  bgColor?: 'sage' | 'tan' | 'cream' | 'transparent';
  highlightQuestion?: boolean;
  darkMode?: boolean;
}

export default function QASection({
  question,
  answer,
  subsections,
  bgColor = 'transparent',
  highlightQuestion = true,
  darkMode = false
}: QASectionProps) {
  const bgColorClasses = {
    sage: 'bg-sage-50',
    tan: 'bg-tan-50',
    cream: 'bg-warm-white',
    transparent: 'bg-transparent',
  };

  const questionColor = darkMode ? 'text-tan-light' : (highlightQuestion ? 'text-sage-dark' : 'text-sage');
  const answerColor = darkMode ? 'text-tan-200' : 'text-sage-dark/80';

  return (
    <motion.div
      initial={{ y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className={`
        ${bgColorClasses[bgColor]}
        rounded-lg
        px-6 md:px-8 lg:px-12
        py-8 md:py-10
        max-w-4xl
        mx-auto
        my-6
      `}
    >
      {/* Question */}
      <h3
        className={`
          font-accent
          text-xl md:text-2xl lg:text-3xl
          italic
          ${questionColor}
          mb-4 md:mb-6
          leading-relaxed
        `}
      >
        {question}
      </h3>

      {/* Answer */}
      <div className={`font-body text-base md:text-lg ${answerColor} leading-relaxed space-y-4`}>
        {typeof answer === 'string' ? (
          <p>{answer}</p>
        ) : (
          answer
        )}
      </div>

      {/* Subsections */}
      {subsections && subsections.length > 0 && (
        <div className="mt-6 md:mt-8 space-y-4">
          {subsections.map((subsection, index) => (
            <div key={index} className="ml-4 md:ml-6">
              {subsection.title && (
                <h4 className={`font-display text-lg md:text-xl font-semibold ${darkMode ? 'text-tan-light' : 'text-sage-dark'} mb-2`}>
                  {subsection.title}
                </h4>
              )}
              <p className={`font-body text-base md:text-lg ${answerColor} leading-relaxed pl-4 border-l-2 border-gold`}>
                {subsection.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface QAListProps {
  items: Array<{
    question: string;
    answer: string | ReactNode;
    subsections?: Subsection[];
  }>;
  alternateBackgrounds?: boolean;
  darkMode?: boolean;
}

export function QAList({ items, alternateBackgrounds = true, darkMode = false }: QAListProps) {
  const backgrounds: Array<'sage' | 'tan' | 'cream' | 'transparent'> = ['cream', 'tan'];

  return (
    <div className="space-y-6 md:space-y-8">
      {items.map((item, index) => (
        <QASection
          key={index}
          question={item.question}
          answer={item.answer}
          subsections={item.subsections}
          bgColor={alternateBackgrounds ? backgrounds[index % 2] : 'transparent'}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}
