import { FlipHorizontal2, FlipVertical2, RotateCw, RotateCcw } from 'lucide-react';
import { useProjectStore } from '../../../stores/project-store';
import type { ImageLayer } from '../../../types/project';

interface Props {
  layer: ImageLayer;
}

export function ImageControlsSection({ layer }: Props) {
  const { updateLayer, updateLayerTransform } = useProjectStore();

  const handleFlipHorizontal = () => {
    updateLayer<ImageLayer>(layer.id, {
      flipHorizontal: !layer.flipHorizontal,
    });
  };

  const handleFlipVertical = () => {
    updateLayer<ImageLayer>(layer.id, {
      flipVertical: !layer.flipVertical,
    });
  };

  const handleRotate = (degrees: number) => {
    const currentRotation = layer.transform.rotation;
    updateLayerTransform(layer.id, {
      rotation: (currentRotation + degrees) % 360,
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Transform
      </h4>

      <div className="flex gap-2">
        <button
          onClick={handleFlipHorizontal}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
            layer.flipHorizontal
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          title="Flip Horizontal"
        >
          <FlipHorizontal2 size={16} />
          <span className="text-xs font-medium">Flip H</span>
        </button>

        <button
          onClick={handleFlipVertical}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
            layer.flipVertical
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          title="Flip Vertical"
        >
          <FlipVertical2 size={16} />
          <span className="text-xs font-medium">Flip V</span>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleRotate(-90)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title="Rotate 90° Counter-clockwise"
        >
          <RotateCcw size={16} />
          <span className="text-xs font-medium">-90°</span>
        </button>

        <button
          onClick={() => handleRotate(90)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title="Rotate 90° Clockwise"
        >
          <RotateCw size={16} />
          <span className="text-xs font-medium">+90°</span>
        </button>
      </div>
    </div>
  );
}
