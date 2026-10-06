import './blocks.css';

export default function HeadingBlock({ block }) {
  return (
    <h2 className="block-heading">
      {block.text}
    </h2>
  );
}