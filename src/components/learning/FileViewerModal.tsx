import React from 'react';
import { X, Download, ExternalLink, FileText, File, Image as ImageIcon, Video, BookOpen } from 'lucide-react';
import { downloadFile, formatBytes } from '../../services/storageService';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  contentText?: string;
  externalUrl?: string;
  authorName?: string;
  date?: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  fileUrl,
  fileName,
  fileSize,
  mimeType,
  contentText,
  externalUrl,
  authorName,
  date,
}) => {
  if (!isOpen) return null;

  const isImage = mimeType?.startsWith('image/') || fileName?.match(/\.(png|jpg|jpeg|webp|gif)$/i);
  const isPdf = mimeType === 'application/pdf' || fileName?.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : isPdf ? <FileText className="w-5 h-5" /> : externalUrl ? <ExternalLink className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-foreground truncate">{title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {authorName && <span>By {authorName}</span>}
                {authorName && date && <span>•</span>}
                {date && <span>{new Date(date).toLocaleDateString()}</span>}
                {fileSize ? (
                  <>
                    <span>•</span>
                    <span>{formatBytes(fileSize)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fileUrl && (
              <button
                id="btn-modal-download"
                onClick={() => downloadFile(fileUrl, fileName || 'document')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
            {externalUrl && (
              <a
                id="btn-modal-open-ext"
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Resource</span>
              </a>
            )}
            <button
              id="btn-modal-close"
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {contentText && (
            <div className="p-5 rounded-xl bg-muted/30 border border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Note Content</h4>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans">{contentText}</p>
            </div>
          )}

          {isImage && fileUrl && (
            <div className="flex justify-center p-4 bg-muted/20 rounded-xl border border-border">
              <img
                src={fileUrl}
                alt={fileName || title}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {isPdf && fileUrl && (
            <div className="h-[65vh] w-full rounded-xl overflow-hidden border border-border bg-slate-900 flex flex-col">
              <iframe
                src={`${fileUrl}#toolbar=1`}
                title={title}
                className="w-full h-full border-0"
              />
            </div>
          )}

          {!isImage && !isPdf && fileUrl && (
            <div className="p-8 text-center bg-muted/20 rounded-xl border border-border flex flex-col items-center justify-center space-y-3">
              <File className="w-12 h-12 text-primary/70" />
              <div>
                <p className="text-sm font-semibold text-foreground">{fileName || 'Attached Document'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Preview is not directly embedded for this file type ({mimeType || 'Document'}).
                </p>
              </div>
              <button
                onClick={() => downloadFile(fileUrl, fileName || 'file')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download {fileName || 'File'}</span>
              </button>
            </div>
          )}

          {externalUrl && (
            <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-foreground">External Resource Link</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{externalUrl}</p>
              </div>
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                <span>Visit Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
