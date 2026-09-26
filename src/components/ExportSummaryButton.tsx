'use client';

import React, { useState } from 'react';
import { Download, Copy, Check, Loader2 } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';

interface ExportSummaryButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  roleTitle: string;
  score: number;
}

export const ExportSummaryButton: React.FC<ExportSummaryButtonProps> = ({
  targetRef,
  roleTitle,
  score
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const handleDownloadImage = async () => {
    if (!targetRef.current || isExporting) return;

    try {
      setIsExporting(true);

      // Render high-res PNG image
      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#242138',
        style: {
          borderRadius: '16px',
          padding: '24px'
        }
      });

      const cleanRole = roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const filename = `prepr-${cleanRole}-score-${score}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to export summary as image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!targetRef.current || isExporting) return;

    try {
      setIsExporting(true);

      const blob = await toBlob(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#242138',
        style: {
          borderRadius: '16px',
          padding: '24px'
        }
      });

      if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        // Fallback to download if ClipboardItem not supported
        handleDownloadImage();
      }
    } catch (err) {
      console.warn('Clipboard write failed, falling back to download:', err);
      handleDownloadImage();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDownloadImage}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium text-[#EDEBE6] bg-[#24232B] hover:bg-[#33323C] border border-[#33323C] transition-colors disabled:opacity-40"
        title="Download summary card as an image"
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C97B4A]" />
        ) : downloaded ? (
          <Check className="w-3.5 h-3.5 text-[#EDEBE6]" />
        ) : (
          <Download className="w-3.5 h-3.5 text-[#EDEBE6]" />
        )}
        <span>{downloaded ? 'SAVED' : 'DOWNLOAD'}</span>
      </button>

      <button
        type="button"
        onClick={handleCopyImage}
        disabled={isExporting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium text-[#8B899A] hover:text-[#EDEBE6] bg-[#1C1B22] border border-[#33323C] transition-colors disabled:opacity-40"
        title="Copy summary card to clipboard"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-[#EDEBE6]" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-[#8B899A]" />
        )}
        <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY'}</span>
      </button>
    </div>
  );
};
