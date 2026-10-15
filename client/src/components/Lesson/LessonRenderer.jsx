import { XCircle, Loader2 } from 'lucide-react';
import HeadingBlock from '../blocks/HeadingBlock';
import ParagraphBlock from '../blocks/ParagraphBlock';
import CodeBlock from '../blocks/CodeBlock';
import VideoBlock from '../blocks/VideoBlock';
import MCQBlock from '../blocks/MCQBlock';
import { isLessonStopped } from '../../utils/courseUtils';
import './pdfExporter.css';

export default function LessonRenderer({ lesson }) {
  if (!lesson) return null;

  const { title, objectives, content } = lesson;
  const hasContent = Array.isArray(content) && content.length > 0;
  const isStopped = isLessonStopped(lesson);

  return (
    <article className="lesson-renderer-root">
      <header className="lesson-header">
        <h1 className="lesson-main-title">{title}</h1>
      </header>

      {Array.isArray(objectives) && objectives.length > 0 && (
        <section className="lesson-objectives-card">
          <h3 className="objectives-title">Learning Objectives</h3>
          <ul className="objectives-list">
            {objectives.map((obj, index) => (
              <li key={`obj-${index}`} className="objective-item">
                {obj}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="lesson-content-blocks">
        {hasContent ? (
          content.map((block, index) => {
            const blockKey = `block-${block.type}-${index}`;
            switch (block.type) {
              case 'heading':
                return <HeadingBlock block={block} key={blockKey} />;
              case 'paragraph':
                return <ParagraphBlock block={block} key={blockKey} />;
              case 'code':
                return <CodeBlock block={block} key={blockKey} />;
              case 'video':
                return <VideoBlock block={block} key={blockKey} />;
              case 'mcq':
                return <MCQBlock block={block} key={blockKey} />;
              default:
                return null;
            }
          })
        ) : isStopped ? (
          <div className="stopped-lesson-notice">
            <XCircle size={36} className="stopped-icon" />
            <h3 className="stopped-title">Response Stopped</h3>
            <p className="stopped-subtitle">
              Lesson generation was halted or not completed for this lesson.
            </p>
          </div>
        ) : (
          <div className="empty-content-notice">
            <Loader2 className="spinner" size={25} color="var(--accent-color)"/>
            <span>Lesson material is being formulated...</span>
          </div>
        )}
      </section>
    </article>
  );
}