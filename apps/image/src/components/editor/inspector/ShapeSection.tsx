import { useProjectStore } from '../../../stores/project-store';
import type { ShapeLayer, ShapeStyle } from '../../../types/project';

interface Props {
  layer: ShapeLayer;
}

export function ShapeSection({ layer }: Props) {
  const { updateLayer } = useProjectStore();

  const handleStyleChange = (updates: Partial<ShapeStyle>) => {
    updateLayer<ShapeLayer>(layer.id, {
      shapeStyle: { ...layer.shapeStyle, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Shape
      </h4>

      <div>
        <label className="block text-[10px] text-muted-foreground mb-1">Fill Color</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStyleChange({ fill: layer.shapeStyle.fill ? null : '#3b82f6' })}
            className={`w-8 h-8 rounded border border-input flex items-center justify-center ${
              layer.shapeStyle.fill ? '' : 'bg-background'
            }`}
            style={{ backgroundColor: layer.shapeStyle.fill ?? undefined }}
            title={layer.shapeStyle.fill ? 'Remove fill' : 'Add fill'}
          >
            {!layer.shapeStyle.fill && (
              <span className="text-xs text-muted-foreground">∅</span>
            )}
          </button>
          {layer.shapeStyle.fill && (
            <>
              <input
                type="color"
                value={layer.shapeStyle.fill}
                onChange={(e) => handleStyleChange({ fill: e.target.value })}
                className="w-8 h-8 rounded border border-input cursor-pointer"
              />
              <input
                type="text"
                value={layer.shapeStyle.fill}
                onChange={(e) => handleStyleChange({ fill: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </>
          )}
        </div>
      </div>

      {layer.shapeStyle.fill && (
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Fill Opacity</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={layer.shapeStyle.fillOpacity * 100}
              onChange={(e) => handleStyleChange({ fillOpacity: Number(e.target.value) / 100 })}
              min={0}
              max={100}
              className="flex-1 h-1 accent-primary"
            />
            <span className="text-[10px] text-muted-foreground w-8 text-right">
              {Math.round(layer.shapeStyle.fillOpacity * 100)}%
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-[10px] text-muted-foreground mb-1">Stroke Color</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStyleChange({ stroke: layer.shapeStyle.stroke ? null : '#000000' })}
            className={`w-8 h-8 rounded border-2 flex items-center justify-center ${
              layer.shapeStyle.stroke ? '' : 'border-input bg-background'
            }`}
            style={{ borderColor: layer.shapeStyle.stroke ?? undefined }}
            title={layer.shapeStyle.stroke ? 'Remove stroke' : 'Add stroke'}
          >
            {!layer.shapeStyle.stroke && (
              <span className="text-xs text-muted-foreground">∅</span>
            )}
          </button>
          {layer.shapeStyle.stroke && (
            <>
              <input
                type="color"
                value={layer.shapeStyle.stroke}
                onChange={(e) => handleStyleChange({ stroke: e.target.value })}
                className="w-8 h-8 rounded border border-input cursor-pointer"
              />
              <input
                type="text"
                value={layer.shapeStyle.stroke}
                onChange={(e) => handleStyleChange({ stroke: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </>
          )}
        </div>
      </div>

      {layer.shapeStyle.stroke && (
        <>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">Stroke Width</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={layer.shapeStyle.strokeWidth}
                onChange={(e) => handleStyleChange({ strokeWidth: Number(e.target.value) })}
                min={1}
                max={20}
                className="flex-1 h-1 accent-primary"
              />
              <span className="text-[10px] text-muted-foreground w-6 text-right">
                {layer.shapeStyle.strokeWidth}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">Stroke Opacity</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={layer.shapeStyle.strokeOpacity * 100}
                onChange={(e) => handleStyleChange({ strokeOpacity: Number(e.target.value) / 100 })}
                min={0}
                max={100}
                className="flex-1 h-1 accent-primary"
              />
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {Math.round(layer.shapeStyle.strokeOpacity * 100)}%
              </span>
            </div>
          </div>
        </>
      )}

      {(layer.shapeType === 'rectangle') && (
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Corner Radius</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={layer.shapeStyle.cornerRadius}
              onChange={(e) => handleStyleChange({ cornerRadius: Number(e.target.value) })}
              min={0}
              max={100}
              className="flex-1 h-1 accent-primary"
            />
            <span className="text-[10px] text-muted-foreground w-6 text-right">
              {layer.shapeStyle.cornerRadius}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
