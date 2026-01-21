import { useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '../../../stores/project-store';
import { useUIStore } from '../../../stores/ui-store';
import { useCanvasStore } from '../../../stores/canvas-store';
import type { Layer, ImageLayer, TextLayer, ShapeLayer } from '../../../types/project';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { project, selectedLayerIds, selectedArtboardId, updateLayerTransform, selectLayer, deselectAllLayers } = useProjectStore();
  const { zoom, panX, panY, setPan, activeTool, showGrid, gridSize } = useUIStore();
  const { setCanvasRef, setContainerRef, startDrag, updateDrag, endDrag, isDragging, dragMode, dragCurrentX, dragCurrentY } = useCanvasStore();

  const artboard = project?.artboards.find((a) => a.id === selectedArtboardId);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasRef(canvasRef.current);
    }
    if (containerRef.current) {
      setContainerRef(containerRef.current);
    }
  }, [setCanvasRef, setContainerRef]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !artboard || !project) return;

    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    ctx.save();
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2 + panX;
    const centerY = canvas.height / 2 + panY;
    const artboardX = centerX - (artboard.size.width * zoom) / 2;
    const artboardY = centerY - (artboard.size.height * zoom) / 2;

    ctx.save();
    ctx.translate(artboardX, artboardY);
    ctx.scale(zoom, zoom);

    if (artboard.background.type === 'color') {
      ctx.fillStyle = artboard.background.color ?? '#ffffff';
    } else if (artboard.background.type === 'transparent') {
      const patternSize = 10;
      for (let y = 0; y < artboard.size.height; y += patternSize) {
        for (let x = 0; x < artboard.size.width; x += patternSize) {
          ctx.fillStyle = (x + y) % (patternSize * 2) === 0 ? '#ffffff' : '#e5e5e5';
          ctx.fillRect(x, y, patternSize, patternSize);
        }
      }
    } else {
      ctx.fillStyle = '#ffffff';
    }
    if (artboard.background.type !== 'transparent') {
      ctx.fillRect(0, 0, artboard.size.width, artboard.size.height);
    }

    if (showGrid) {
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
      ctx.lineWidth = 1 / zoom;
      for (let x = 0; x <= artboard.size.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, artboard.size.height);
        ctx.stroke();
      }
      for (let y = 0; y <= artboard.size.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(artboard.size.width, y);
        ctx.stroke();
      }
    }

    const sortedLayerIds = [...artboard.layerIds].reverse();
    sortedLayerIds.forEach((layerId) => {
      const layer = project.layers[layerId];
      if (!layer || !layer.visible) return;
      renderLayer(ctx, layer, project);
    });

    ctx.restore();

    selectedLayerIds.forEach((layerId) => {
      const layer = project.layers[layerId];
      if (!layer) return;
      const { x, y, width, height, rotation } = layer.transform;

      ctx.save();
      ctx.translate(artboardX + x * zoom, artboardY + y * zoom);
      ctx.rotate((rotation * Math.PI) / 180);

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(0, 0, width * zoom, height * zoom);

      const handleSize = 8;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;

      const handles = [
        { x: 0, y: 0 },
        { x: width * zoom / 2, y: 0 },
        { x: width * zoom, y: 0 },
        { x: width * zoom, y: height * zoom / 2 },
        { x: width * zoom, y: height * zoom },
        { x: width * zoom / 2, y: height * zoom },
        { x: 0, y: height * zoom },
        { x: 0, y: height * zoom / 2 },
      ];

      handles.forEach((h) => {
        ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      });

      ctx.restore();
    });

    ctx.restore();
  }, [artboard, project, zoom, panX, panY, selectedLayerIds, showGrid, gridSize]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !artboard) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const canvasX = screenX - rect.left;
      const canvasY = screenY - rect.top;

      const centerX = canvas.width / 2 + panX;
      const centerY = canvas.height / 2 + panY;
      const artboardX = centerX - (artboard.size.width * zoom) / 2;
      const artboardY = centerY - (artboard.size.height * zoom) / 2;

      return {
        x: (canvasX - artboardX) / zoom,
        y: (canvasY - artboardY) / zoom,
      };
    },
    [artboard, zoom, panX, panY]
  );

  const findLayerAtPoint = useCallback(
    (x: number, y: number): string | null => {
      if (!artboard || !project) return null;

      for (const layerId of artboard.layerIds) {
        const layer = project.layers[layerId];
        if (!layer || !layer.visible || layer.locked) continue;

        const { transform } = layer;
        if (
          x >= transform.x &&
          x <= transform.x + transform.width &&
          y >= transform.y &&
          y <= transform.y + transform.height
        ) {
          return layerId;
        }
      }
      return null;
    },
    [artboard, project]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY);

      if (activeTool === 'hand' || e.button === 1) {
        startDrag('pan', e.clientX, e.clientY);
        return;
      }

      if (activeTool === 'select') {
        const layerId = findLayerAtPoint(x, y);
        if (layerId) {
          if (e.shiftKey) {
            selectLayer(layerId, true);
          } else if (!selectedLayerIds.includes(layerId)) {
            selectLayer(layerId);
          }
          startDrag('move', e.clientX, e.clientY);
        } else {
          deselectAllLayers();
        }
      }
    },
    [activeTool, screenToCanvas, findLayerAtPoint, selectLayer, deselectAllLayers, startDrag, selectedLayerIds]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      updateDrag(e.clientX, e.clientY);

      if (dragMode === 'pan') {
        const dx = e.clientX - dragCurrentX;
        const dy = e.clientY - dragCurrentY;
        setPan(panX + dx, panY + dy);
      } else if (dragMode === 'move' && selectedLayerIds.length > 0) {
        const dx = (e.clientX - dragCurrentX) / zoom;
        const dy = (e.clientY - dragCurrentY) / zoom;

        selectedLayerIds.forEach((layerId) => {
          const layer = project?.layers[layerId];
          if (layer) {
            updateLayerTransform(layerId, {
              x: layer.transform.x + dx,
              y: layer.transform.y + dy,
            });
          }
        });
      }
    },
    [isDragging, dragMode, dragCurrentX, dragCurrentY, panX, panY, setPan, zoom, selectedLayerIds, project, updateLayerTransform, updateDrag]
  );

  const handleMouseUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        useUIStore.getState().setZoom(zoom * delta);
      } else {
        setPan(panX - e.deltaX, panY - e.deltaY);
      }
    },
    [zoom, panX, panY, setPan]
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden cursor-crosshair"
      style={{
        cursor: activeTool === 'hand' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full"
      />
    </div>
  );
}

function renderLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  project: { assets: Record<string, { dataUrl?: string; blobUrl?: string }> }
) {
  const { transform } = layer;

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scaleX, transform.scaleY);
  ctx.globalAlpha = transform.opacity;

  switch (layer.type) {
    case 'image':
      renderImageLayer(ctx, layer as ImageLayer, project);
      break;
    case 'text':
      renderTextLayer(ctx, layer as TextLayer);
      break;
    case 'shape':
      renderShapeLayer(ctx, layer as ShapeLayer);
      break;
  }

  ctx.restore();
}

function renderImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  project: { assets: Record<string, { dataUrl?: string; blobUrl?: string }> }
) {
  const asset = project.assets[layer.sourceId];
  if (!asset) {
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, layer.transform.width, layer.transform.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Image', layer.transform.width / 2, layer.transform.height / 2);
    return;
  }

  const img = new window.Image();
  img.src = asset.dataUrl ?? asset.blobUrl ?? '';
  if (img.complete) {
    ctx.drawImage(img, 0, 0, layer.transform.width, layer.transform.height);
  }
}

function renderTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer) {
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

function renderShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer) {
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
