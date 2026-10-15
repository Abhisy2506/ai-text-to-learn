import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './blocks.css';

export default function ParagraphBlock({ block }) {
  if (!block?.text) return null;

  let formattedText = block.text
    .replace(/\s*•\s*/g, '\n\n- ')
    .replace(/(^|\n)(\d+\.\d+)\s+([^\n]+)/g, '$1#### $2 $3')
    .replace(/(^|\n)([1-9]\d?\.)\s+([A-Z][A-Za-z0-9\s&,–—'-]{2,50})(?=\n|$)/g, '$1### $2 $3');

  return (
    <div className="block-paragraph markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {formattedText}
      </ReactMarkdown>
    </div>
  );
}