import './blocks.css';

export default function ParagraphBlock({ block }) {
  return (
    <p className="block-paragraph">
      {block.text}
    </p>
  );
}