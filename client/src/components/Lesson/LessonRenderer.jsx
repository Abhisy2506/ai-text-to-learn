import { XCircle, Loader2 } from 'lucide-react';
import HeadingBlock from '../blocks/HeadingBlock';
import ParagraphBlock from '../blocks/ParagraphBlock';
import CodeBlock from '../blocks/CodeBlock';
import VideoBlock from '../blocks/VideoBlock';
import MCQBlock from '../blocks/MCQBlock';
import './pdfExporter.css';

export default function LessonRenderer({ lesson, isGenerationStopped }) {
  if (!lesson) {
    return null;
  }

  const { title, objectives, content } = lesson;
  const hasContent = Array.isArray(content) && content.length > 0;

  return (
    <article className="lesson-renderer-root">
      {/* Lesson Header & Title */}
      <header className="lesson-header">
        <h1 className="lesson-main-title">{title}</h1>
      </header>

      {/* Structured Lesson Objectives */}
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

      {/* Dynamic Content Block Iterator */}
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
                console.warn(`Unsupported lesson block encountered: ${block.type}`);
                return null;
            }
          })
        ) : isGenerationStopped ? (
          /* User Stopped / Quit State */
          <div 
            className="stopped-lesson-notice" 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card, #0d1117)',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #30363d)',
              margin: '2rem 0'
            }}
          >
            <XCircle 
              size={42} 
              color="var(--accent-coral, #ff6b57)" 
              style={{ marginBottom: '12px' }} 
            />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Response Stopped
            </h3>
            <p style={{ color: 'var(--text-secondary, #8b949e)', fontSize: '0.95rem', margin: 0 }}>
              You stopped the response by quitting it.
            </p>
          </div>
        ) : (
          /* Normal Generation / Loading Fallback */
          <div 
            className="empty-content-notice"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '2.5rem 1rem',
              color: 'var(--text-secondary, #8b949e)'
            }}
          >
            <Loader2 className="spinner" size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>Lesson material is being formulated or has not yet been populated.</span>
          </div>
        )}
      </section>
    </article>
  );
}