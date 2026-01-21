import { useProjectStore } from '../../../stores/project-store';
import { TransformSection } from './TransformSection';
import { AlignmentSection } from './AlignmentSection';
import { AppearanceSection } from './AppearanceSection';
import { EffectsSection } from './EffectsSection';
import { ImageAdjustmentsSection } from './ImageAdjustmentsSection';
import { FilterPresetsSection } from './FilterPresetsSection';
import { CropSection } from './CropSection';
import { BackgroundRemovalSection } from './BackgroundRemovalSection';
import { TextSection } from './TextSection';
import { ShapeSection } from './ShapeSection';
import { ArtboardSection } from './ArtboardSection';
import type { Layer, ImageLayer, TextLayer, ShapeLayer } from '../../../types/project';

export function Inspector() {
  const { project, selectedLayerIds, selectedArtboardId } = useProjectStore();

  const selectedLayers = selectedLayerIds
    .map((id) => project?.layers[id])
    .filter((layer): layer is Layer => layer !== undefined);

  const singleLayer = selectedLayers.length === 1 ? selectedLayers[0] : null;

  if (selectedLayers.length === 0) {
    const artboard = project?.artboards.find((a) => a.id === selectedArtboardId);
    if (artboard) {
      return (
        <div className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Artboard</h3>
          <ArtboardSection artboard={artboard} />
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Select a layer to edit its properties
        </p>
      </div>
    );
  }

  if (selectedLayers.length > 1) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            {selectedLayers.length} layers selected
          </h3>
        </div>
        <AlignmentSection layers={selectedLayers} />
      </div>
    );
  }

  if (!singleLayer) return null;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-1 truncate">
          {singleLayer.name}
        </h3>
        <p className="text-xs text-muted-foreground capitalize">{singleLayer.type} layer</p>
      </div>

      <TransformSection layer={singleLayer} />

      <AlignmentSection layers={[singleLayer]} />

      <AppearanceSection layer={singleLayer} />

      <EffectsSection layer={singleLayer} />

      {singleLayer.type === 'image' && (
        <>
          <CropSection layer={singleLayer as ImageLayer} />
          <BackgroundRemovalSection layer={singleLayer as ImageLayer} />
          <FilterPresetsSection layer={singleLayer as ImageLayer} />
          <ImageAdjustmentsSection layer={singleLayer as ImageLayer} />
        </>
      )}

      {singleLayer.type === 'text' && (
        <TextSection layer={singleLayer as TextLayer} />
      )}

      {singleLayer.type === 'shape' && (
        <ShapeSection layer={singleLayer as ShapeLayer} />
      )}
    </div>
  );
}
