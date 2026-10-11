import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Loader2, Check } from 'lucide-react';
import './pdfExporter.css';

export default function LessonPDFExporter({ lesson }) {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const printContainerRef = useRef(null);

  const handleExportPDF = async () => {
    if (!lesson || !printContainerRef.current) return;

    try {
      setIsExporting(true);

      const element = printContainerRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let positionHeight = 0;
      let remainingHeight = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, positionHeight, imgWidth, imgHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        positionHeight = remainingHeight - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, positionHeight, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      const sanitizedTitle = (lesson.title || 'lesson')
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '_');

      pdf.save(`${sanitizedTitle}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to generate lesson PDF document:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pdf-exporter-wrapper">
      <button
        type="button"
        className={`pdf-icon-btn ${downloadSuccess ? 'success' : ''}`}
        onClick={handleExportPDF}
        disabled={isExporting || !lesson}
        aria-label="Download as PDF"
      >
        {isExporting ? (
          <Loader2 className="spinner" size={16} />
        ) : downloadSuccess ? (
          <Check size={16} />
        ) : (
          <Download size={16} />
        )}

        <span className="pdf-tooltip">
          {isExporting ? 'Building PDF...' : downloadSuccess ? 'Saved!' : 'Download as PDF'}
        </span>
      </button>

      {/* Hidden print surface captured by html2canvas */}
      <div className="pdf-print-container" ref={printContainerRef}>
        <h1 className="pdf-title">{lesson?.title}</h1>
        <hr className="pdf-divider" />

        {Array.isArray(lesson?.objectives) && lesson.objectives.length > 0 && (
          <div className="pdf-objectives-box">
            <h3 className="pdf-objectives-heading">Objectives</h3>
            <ul className="pdf-objectives-list">
              {lesson.objectives.map((obj, i) => (
                <li key={`pdf-obj-${i}`}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pdf-blocks-wrapper">
          {Array.isArray(lesson?.content) &&
            lesson.content.map((block, i) => {
              if (block.type === 'heading') {
                return (
                  <h2 key={`pdf-blk-${i}`} className="pdf-heading">
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'paragraph') {
                return (
                  <p key={`pdf-blk-${i}`} className="pdf-paragraph">
                    {block.text}
                  </p>
                );
              }

              if (block.type === 'code') {
                return (
                  <pre key={`pdf-blk-${i}`} className="pdf-code-block">
                    <code>{block.text}</code>
                  </pre>
                );
              }

              if (block.type === 'mcq') {
                return (
                  <div key={`pdf-blk-${i}`} className="pdf-mcq-box">
                    <p className="pdf-mcq-question">Question: {block.question}</p>
                    <div className="pdf-mcq-options">
                      {block.options?.map((opt, optIdx) => {
                        const isCorrect = optIdx === block.answer;
                        return (
                          <div
                            key={`pdf-opt-${optIdx}`}
                            className={`pdf-mcq-option ${isCorrect ? 'correct' : ''}`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}{' '}
                            {isCorrect ? '(Correct Answer)' : ''}
                          </div>
                        );
                      })}
                    </div>
                    {block.explanation && (
                      <p className="pdf-mcq-explanation">
                        Explanation: {block.explanation}
                      </p>
                    )}
                  </div>
                );
              }

              return null;
            })}
        </div>
      </div>
    </div>
  );
}