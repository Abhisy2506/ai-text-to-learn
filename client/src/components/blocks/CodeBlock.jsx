import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import './blocks.css';

export default function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!block.text) return;
    navigator.clipboard.writeText(block.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="block-code-container">
      <div className="block-code-header">
        <span className="code-lang">{block.language || 'code'}</span>
        <button className="code-copy-btn" onClick={handleCopy} aria-label="Copy code">
          {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="block-code-body">
        <code>{block.text}</code>
      </pre>
    </div>
  );
}