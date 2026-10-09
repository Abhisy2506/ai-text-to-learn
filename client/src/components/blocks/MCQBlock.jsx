import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import './blocks.css';

export default function MCQBlock({ block }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleSelect = (index) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
  };

  const isAnswered = selectedIndex !== null;
  const isCorrect = selectedIndex === block.answer;

  return (
    <div className="block-mcq-container">
      <h4 className="mcq-question">{block.question}</h4>
      
      <div className="mcq-options">
        {block.options?.map((option, idx) => {
          let itemClass = "mcq-option";
          if (isAnswered) {
            if (idx === block.answer) itemClass += " mcq-correct";
            else if (idx === selectedIndex) itemClass += " mcq-incorrect";
            else itemClass += " mcq-disabled";
          }

          return (
            <button
              key={idx}
              className={itemClass}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
            >
              <span className="mcq-option-text">{option}</span>
              {isAnswered && idx === block.answer && <CheckCircle2 size={18} />}
              {isAnswered && idx === selectedIndex && idx !== block.answer && <XCircle size={18} />}
            </button>
          );
        })}
      </div>

      {isAnswered && block.explanation && (
        <div className={`mcq-explanation ${isCorrect ? 'text-green' : 'text-red'}`}>
          <strong>{isCorrect ? 'Correct!' : 'Incorrect.'}</strong> {block.explanation}
        </div>
      )}
    </div>
  );
}