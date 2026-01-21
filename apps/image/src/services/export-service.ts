import type { Project, Artboard, Layer, ImageLayer, TextLayer, ShapeLayer } from '../types/project';

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'svg' | 'pdf';
export type ExportQuality = 'low' | 'medium' | 'high' | 'max';

export interface ExportOptions {
  format: ExportFormat;
  quality: ExportQuality;
  scale: number;
  background: 'include' | 'transparent';
  artboardIds?: string[];
}

const QUALITY_MAP: Record<ExportQuality, number> = {
  low: 0.6,
  medium: 0.8,
  high: 0.92,
  max: 1.0,
};

export async function exportProject(
  project: Project,
  options: ExportOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob[]> {
  const blobs: Blob[] = [];
  const artboards = options.artboardIds
    ? project.artboards.filter((a) => options.artboardIds!.includes(a.id))
    : project.artboards;

  for (let i = 0; i < artboards.length; i++) {
    const artboard = artboards[i];
    onProgress?.((i / artboards.length) * 100, `Exporting ${artboard.name}...`);

    const blob = await exportArtboard(project, artboard, options);
    blobs.push(blob);
  }

  onProgress?.(100, 'Export complete');
  return blobs;
}

export async function exportArtboard(
  project: Project,
  artboard: Artboard,
  options: ExportOptions
): Promise<Blob> {
  const { scale, format, quality, background } = options;
  const width = artboard.size.width * scale;
  const height = artboard.size.height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  if (background === 'include' || format === 'jpg') {
    if (artboard.background.type === 'color') {
      ctx.fillStyle = artboard.background.color ?? '#ffffff';
      ctx.fillRect(0, 0, artboard.size.width, artboard.size.height);
    } else if (artboard.background.type === 'transparent' && format === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, artboard.size.width, artboard.size.height);
    } else if (artboard.background.type === 'gradient' && artboard.background.gradient) {
      const { gradient } = artboard.background;
      const rad = (gradient.angle * Math.PI) / 180;
      const x1 = artboard.size.width / 2 - Math.cos(rad) * artboard.size.width / 2;
      const y1 = artboard.size.height / 2 - Math.sin(rad) * artboard.size.height / 2;
      const x2 = artboard.size.width / 2 + Math.cos(rad) * artboard.size.width / 2;
      const y2 = artboard.size.height / 2 + Math.sin(rad) * artboard.size.height / 2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.stops.forEach((stop) => {
        grad.addColorStop(stop.offset, stop.color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, artboard.size.width, artboard.size.height);
    }
  }

  const sortedLayerIds = [...artboard.layerIds].reverse();
  for (const layerId of sortedLayerIds) {
    const layer = project.layers[layerId];
    if (!layer || !layer.visible) continue;
    await renderLayerToContext(ctx, layer, project);
  }

  const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const qualityValue = format === 'png' ? undefined : QUALITY_MAP[quality];

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      mimeType,
      qualityValue
    );
  });
}

async function renderLayerToContext(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  project: Project
): Promise<void> {
  const { transform } = layer;

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scaleX, transform.scaleY);
  ctx.globalAlpha = transform.opacity;

  switch (layer.type) {
    case 'image':
      await renderImageLayerToContext(ctx, layer as ImageLayer, project);
      break;
    case 'text':
      renderTextLayerToContext(ctx, layer as TextLayer);
      break;
    case 'shape':
      renderShapeLayerToContext(ctx, layer as ShapeLayer);
      break;
  }

  ctx.restore();
}

async function renderImageLayerToContext(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  project: Project
): Promise<void> {
  const asset = project.assets[layer.sourceId];
  if (!asset) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, layer.transform.width, layer.transform.height);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = asset.dataUrl ?? asset.blobUrl ?? '';
  });
}

function renderTextLayerToContext(ctx: CanvasRenderingContext2D, layer: TextLayer): void {
  const { style, content, transform } = layer;

  ctx.fillStyle = style.color;
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
  ctx.textAlign = style.textAlign as CanvasTextAlign;
  ctx.textBaseline = 'top';

  const lines = content.split('\n');
  const lineHeight = style.fontSize * style.lineHeight;

  let textX = 0;
  if (style.textAlign === 'center') textX = transform.width / 2;
  else if (style.textAlign === 'right') textX = transform.width;

  lines.forEach((line, i) => {
    ctx.fillText(line, textX, i * lineHeight);
  });
}

function renderShapeLayerToContext(ctx: CanvasRenderingContext2D, layer: ShapeLayer): void {
  const { shapeType, shapeStyle, transform } = layer;
  const { width, height } = transform;

  ctx.beginPath();

  switch (shapeType) {
    case 'rectangle':
      if (shapeStyle.cornerRadius > 0) {
        const r = Math.min(shapeStyle.cornerRadius, width / 2, height / 2);
        ctx.moveTo(r, 0);
        ctx.lineTo(width - r, 0);
        ctx.quadraticCurveTo(width, 0, width, r);
        ctx.lineTo(width, height - r);
        ctx.quadraticCurveTo(width, height, width - r, height);
        ctx.lineTo(r, height);
        ctx.quadraticCurveTo(0, height, 0, height - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
      } else {
        ctx.rect(0, 0, width, height);
      }
      break;

    case 'ellipse':
      ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      break;

    case 'triangle':
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      break;

    case 'star': {
      const cx = width / 2;
      const cy = height / 2;
      const outerRadius = Math.min(width, height) / 2;
      const innerRadius = outerRadius * 0.4;
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }

    case 'line':
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      break;

    default:
      ctx.rect(0, 0, width, height);
  }

  if (shapeStyle.fill) {
    ctx.fillStyle = shapeStyle.fill;
    ctx.globalAlpha *= shapeStyle.fillOpacity;
    ctx.fill();
    ctx.globalAlpha /= shapeStyle.fillOpacity;
  }

  if (shapeStyle.stroke) {
    ctx.strokeStyle = shapeStyle.stroke;
    ctx.lineWidth = shapeStyle.strokeWidth;
    ctx.globalAlpha *= shapeStyle.strokeOpacity;
    ctx.stroke();
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getExportFilename(projectName: string, artboardName: string, format: ExportFormat): string {
  const safeName = `${projectName}-${artboardName}`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `${safeName}.${format}`;
}
