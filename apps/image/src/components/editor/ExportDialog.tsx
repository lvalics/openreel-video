import { useState, useMemo } from 'react';
import { Download, FileImage, Loader2 } from 'lucide-react';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { useProjectStore } from '../../stores/project-store';
import { useUIStore } from '../../stores/ui-store';
import {
  exportProject,
  downloadBlob,
  getExportFilename,
  type ExportFormat,
  type ExportQuality,
  type ExportOptions,
} from '../../services/export-service';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

type FormatInfo = {
  id: ExportFormat;
  name: string;
  description: string;
  supportsTransparency: boolean;
  supportsQuality: boolean;
};

const FORMATS: FormatInfo[] = [
  { id: 'png', name: 'PNG', description: 'Lossless, best for graphics', supportsTransparency: true, supportsQuality: false },
  { id: 'jpg', name: 'JPG', description: 'Smaller size, photos', supportsTransparency: false, supportsQuality: true },
  { id: 'webp', name: 'WebP', description: 'Modern, best compression', supportsTransparency: true, supportsQuality: true },
];

const QUALITY_PRESETS: { id: ExportQuality; name: string; value: number }[] = [
  { id: 'low', name: 'Low', value: 60 },
  { id: 'medium', name: 'Medium', value: 80 },
  { id: 'high', name: 'High', value: 92 },
  { id: 'max', name: 'Maximum', value: 100 },
];

const SCALE_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
  { value: 4, label: '4x' },
];

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { project, selectedArtboardId } = useProjectStore();
  const { showNotification } = useUIStore();

  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<ExportQuality>('high');
  const [scale, setScale] = useState(1);
  const [background, setBackground] = useState<'include' | 'transparent'>('include');
  const [exportAll, setExportAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const currentFormat = FORMATS.find((f) => f.id === format)!;
  const artboard = project?.artboards.find((a) => a.id === selectedArtboardId);

  const dimensions = useMemo(() => {
    if (!artboard) return null;
    return {
      width: Math.round(artboard.size.width * scale),
      height: Math.round(artboard.size.height * scale),
    };
  }, [artboard, scale]);

  const estimatedSize = useMemo(() => {
    if (!dimensions) return null;
    const pixels = dimensions.width * dimensions.height;
    const bytesPerPixel = format === 'png' ? 3 : format === 'jpg' ? 0.5 : 0.4;
    const qualityMultiplier = QUALITY_PRESETS.find((q) => q.id === quality)?.value ?? 80;
    const estimated = pixels * bytesPerPixel * (qualityMultiplier / 100);

    if (estimated > 1024 * 1024) {
      return `~${(estimated / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `~${Math.round(estimated / 1024)} KB`;
  }, [dimensions, format, quality]);

  const handleExport = async () => {
    if (!project) return;

    setIsExporting(true);
    setProgress(0);

    try {
      const options: ExportOptions = {
        format,
        quality,
        scale,
        background: currentFormat.supportsTransparency ? background : 'include',
        artboardIds: exportAll ? undefined : selectedArtboardId ? [selectedArtboardId] : undefined,
      };

      const blobs = await exportProject(project, options, (p, msg) => {
        setProgress(p);
        setProgressMessage(msg);
      });

      const artboards = exportAll
        ? project.artboards
        : project.artboards.filter((a) => a.id === selectedArtboardId);

      blobs.forEach((blob, index) => {
        const artboardName = artboards[index]?.name ?? `artboard-${index + 1}`;
        const filename = getExportFilename(project.name, artboardName, format);
        downloadBlob(blob, filename);
      });

      showNotification('success', `Exported ${blobs.length} artboard${blobs.length > 1 ? 's' : ''}`);
      onClose();
    } catch (error) {
      showNotification('error', 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  if (!project || !artboard) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Export Image"
      description="Choose format and quality settings"
      maxWidth="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === f.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileImage size={16} className={format === f.id ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="font-medium text-sm">{f.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{f.description}</p>
              </button>
            ))}
          </div>
        </div>

        {currentFormat.supportsQuality && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Quality
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUALITY_PRESETS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuality(q.id)}
                  className={`px-3 py-2 rounded-lg border text-center transition-all ${
                    quality === q.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-muted-foreground/50 hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-sm font-medium">{q.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{q.value}%</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Scale
          </label>
          <div className="flex gap-2">
            {SCALE_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setScale(s.value)}
                className={`flex-1 px-3 py-2 rounded-lg border text-center text-sm font-medium transition-all ${
                  scale === s.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-secondary/50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {currentFormat.supportsTransparency && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Background
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBackground('include')}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  background === 'include'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-secondary/50'
                }`}
              >
                Include Background
              </button>
              <button
                onClick={() => setBackground('transparent')}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  background === 'transparent'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-secondary/50'
                }`}
              >
                Transparent
              </button>
            </div>
          </div>
        )}

        {project.artboards.length > 1 && (
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exportAll}
                onChange={(e) => setExportAll(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/50"
              />
              <span className="text-sm">Export all artboards ({project.artboards.length})</span>
            </label>
          </div>
        )}

        <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dimensions</span>
            <span className="font-medium">
              {dimensions?.width} × {dimensions?.height} px
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated size</span>
            <span className="font-medium">{estimatedSize}</span>
          </div>
        </div>

        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progressMessage}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <button
          onClick={onClose}
          disabled={isExporting}
          className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download size={16} />
              Export
            </>
          )}
        </button>
      </DialogFooter>
    </Dialog>
  );
}
