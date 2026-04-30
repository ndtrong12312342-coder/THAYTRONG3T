import React from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
}

export default function MathText({ text }: MathTextProps) {
  if (!text) return null;
  
  // Replace \( \) with $ $ and \[ \] with $$ $$ for better KaTeX compatibility
  let processedText = text
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
    .replace(/\\\[/g, '$$$')
    .replace(/\\\]/g, '$$$');

  // Auto-detect unwrapped math (very common for short math options)
  if (!processedText.includes('$')) {
    const withoutCommands = processedText.replace(/\\[a-zA-Z]+/g, '');
    const withoutMathFuncs = withoutCommands.replace(/\b(sin|cos|tan|cot|sec|csc|log|ln|lim|max|min)\b/g, '');
    
    // Check if there are any "normal" words left (length >= 2, including Vietnamese)
    const hasNormalWords = /[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹĐđ]{2,}/i.test(withoutMathFuncs);
    
    // Check if it has any math-specific symbols
    const hasMathSpecifics = /[_^=+\-*\/<>|]|\\[a-zA-Z]+/.test(processedText);
    
    // If it's a pure math expression, wrap it in inline math delimiters
    if (!hasNormalWords && hasMathSpecifics) {
      processedText = `$${processedText}$`;
    }
  }

  return (
    <div className="math-text text-gray-800 leading-relaxed whitespace-pre-wrap">
      <Latex>{processedText}</Latex>
    </div>
  );
}
