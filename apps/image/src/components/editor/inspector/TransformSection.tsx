import { useProjectStore } from '../../../stores/project-store';
import type { Layer } from '../../../types/project';

interface Props {
  layer: Layer;
}

export function TransformSection({ layer }: Props) {
  const { updateLayerTransform } = useProjectStore();

  const { x, y, width, height, rotation, opacity } = layer.transform;

  const handleChange = (key: string, value: number) => {
    updateLayerTransform(layer.id, { [key]: value });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Transform
      </h4>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">X</label>
          <input
            type="number"
            value={Math.round(x)}
            onChange={(e) => handleChange('x', Number(e.target.value))}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Y</label>
          <input
            type="number"
            value={Math.round(y)}
            onChange={(e) => handleChange('y', Number(e.target.value))}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Width</label>
          <input
            type="number"
            value={Math.round(width)}
            onChange={(e) => handleChange('width', Number(e.target.value))}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            min={1}
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Height</label>
          <input
            type="number"
            value={Math.round(height)}
            onChange={(e) => handleChange('height', Number(e.target.value))}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            min={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Rotation</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={Math.round(rotation)}
              onChange={(e) => handleChange('rotation', Number(e.target.value))}
              className="flex-1 px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">°</span>
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Opacity</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={Math.round(opacity * 100)}
              onChange={(e) => handleChange('opacity', Number(e.target.value) / 100)}
              className="flex-1 px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              min={0}
              max={100}
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
