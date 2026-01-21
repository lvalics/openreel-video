import { useState, useMemo } from 'react';
import { useProjectStore } from '../../../stores/project-store';
import type { ImageLayer, Filter } from '../../../types/project';
import { Sparkles, Check } from 'lucide-react';

interface Props {
  layer: ImageLayer;
}

interface FilterPreset {
  id: string;
  name: string;
  category: 'basic' | 'vintage' | 'cinematic' | 'mood';
  filters: Filter;
  thumbnail?: string;
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'original',
    name: 'Original',
    category: 'basic',
    filters: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sharpen: 0 },
  },
  {
    id: 'vivid',
    name: 'Vivid',
    category: 'basic',
    filters: { brightness: 105, contrast: 115, saturation: 130, hue: 0, blur: 0, sharpen: 10 },
  },
  {
    id: 'warm',
    name: 'Warm',
    category: 'mood',
    filters: { brightness: 105, contrast: 105, saturation: 110, hue: 15, blur: 0, sharpen: 0 },
  },
  {
    id: 'cool',
    name: 'Cool',
    category: 'mood',
    filters: { brightness: 100, contrast: 105, saturation: 95, hue: -15, blur: 0, sharpen: 0 },
  },
  {
    id: 'bw',
    name: 'B&W',
    category: 'basic',
    filters: { brightness: 105, contrast: 115, saturation: 0, hue: 0, blur: 0, sharpen: 5 },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    category: 'vintage',
    filters: { brightness: 95, contrast: 90, saturation: 75, hue: 20, blur: 0, sharpen: 0 },
  },
  {
    id: 'fade',
    name: 'Fade',
    category: 'vintage',
    filters: { brightness: 110, contrast: 85, saturation: 80, hue: 0, blur: 0, sharpen: 0 },
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    category: 'cinematic',
    filters: { brightness: 95, contrast: 130, saturation: 90, hue: 0, blur: 0, sharpen: 15 },
  },
  {
    id: 'moody',
    name: 'Moody',
    category: 'mood',
    filters: { brightness: 90, contrast: 110, saturation: 85, hue: -10, blur: 0, sharpen: 5 },
  },
  {
    id: 'bright',
    name: 'Bright',
    category: 'basic',
    filters: { brightness: 120, contrast: 105, saturation: 105, hue: 0, blur: 0, sharpen: 0 },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    category: 'vintage',
    filters: { brightness: 105, contrast: 95, saturation: 40, hue: 35, blur: 0, sharpen: 0 },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    category: 'cinematic',
    filters: { brightness: 95, contrast: 115, saturation: 95, hue: -5, blur: 0, sharpen: 10 },
  },
  {
    id: 'pop',
    name: 'Pop',
    category: 'mood',
    filters: { brightness: 110, contrast: 120, saturation: 140, hue: 5, blur: 0, sharpen: 5 },
  },
  {
    id: 'matte',
    name: 'Matte',
    category: 'cinematic',
    filters: { brightness: 105, contrast: 85, saturation: 90, hue: 0, blur: 0, sharpen: 0 },
  },
  {
    id: 'retro',
    name: 'Retro',
    category: 'vintage',
    filters: { brightness: 100, contrast: 95, saturation: 70, hue: 25, blur: 0, sharpen: 0 },
  },
  {
    id: 'punch',
    name: 'Punch',
    category: 'basic',
    filters: { brightness: 100, contrast: 125, saturation: 115, hue: 0, blur: 0, sharpen: 20 },
  },
];

function filtersMatch(a: Filter, b: Filter): boolean {
  return (
    a.brightness === b.brightness &&
    a.contrast === b.contrast &&
    a.saturation === b.saturation &&
    a.hue === b.hue &&
    a.blur === b.blur &&
    a.sharpen === b.sharpen
  );
}

function interpolateFilters(target: Filter, intensity: number): Filter {
  const lerp = (defaultVal: number, targetVal: number) => defaultVal + (targetVal - defaultVal) * (intensity / 100);
  return {
    brightness: Math.round(lerp(100, target.brightness)),
    contrast: Math.round(lerp(100, target.contrast)),
    saturation: Math.round(lerp(100, target.saturation)),
    hue: Math.round(lerp(0, target.hue)),
    blur: Math.round(lerp(0, target.blur)),
    sharpen: Math.round(lerp(0, target.sharpen)),
  };
}

export function FilterPresetsSection({ layer }: Props) {
  const { updateLayer } = useProjectStore();
  const [intensity, setIntensity] = useState(100);
  const [activePresetId, setActivePresetId] = useState<string | null>(() => {
    const match = FILTER_PRESETS.find((p) => filtersMatch(layer.filters, p.filters));
    return match?.id ?? null;
  });

  const currentPreset = useMemo(
    () => FILTER_PRESETS.find((p) => p.id === activePresetId),
    [activePresetId]
  );

  const handlePresetSelect = (preset: FilterPreset) => {
    setActivePresetId(preset.id);
    const filters = intensity === 100 ? preset.filters : interpolateFilters(preset.filters, intensity);
    updateLayer<ImageLayer>(layer.id, { filters });
  };

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    if (currentPreset) {
      const filters = interpolateFilters(currentPreset.filters, newIntensity);
      updateLayer<ImageLayer>(layer.id, { filters });
    }
  };

  const isOriginal = activePresetId === 'original' || filtersMatch(layer.filters, FILTER_PRESETS[0].filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Filters
        </h4>
        {!isOriginal && (
          <button
            onClick={() => handlePresetSelect(FILTER_PRESETS[0])}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {activePresetId && activePresetId !== 'original' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-foreground">Intensity</label>
            <span className="text-[11px] font-mono text-muted-foreground">{intensity}%</span>
          </div>
          <input
            type="range"
            value={intensity}
            min={0}
            max={100}
            onChange={(e) => handleIntensityChange(Number(e.target.value))}
            className="w-full h-1.5 appearance-none bg-secondary rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {FILTER_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const previewStyle = getFilterPreviewStyle(preset.filters);

          return (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`relative group flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/20 ring-2 ring-primary'
                  : 'bg-secondary/50 hover:bg-secondary'
              }`}
            >
              <div
                className="w-10 h-10 rounded-md bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center overflow-hidden"
                style={previewStyle}
              >
                {preset.id === 'original' ? (
                  <Sparkles size={16} className="text-white/80" />
                ) : isActive ? (
                  <Check size={14} className="text-primary" />
                ) : null}
              </div>
              <span className={`text-[9px] font-medium truncate w-full text-center ${
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getFilterPreviewStyle(filters: Filter): React.CSSProperties {
  const filterParts: string[] = [];

  if (filters.brightness !== 100) {
    filterParts.push(`brightness(${filters.brightness}%)`);
  }
  if (filters.contrast !== 100) {
    filterParts.push(`contrast(${filters.contrast}%)`);
  }
  if (filters.saturation !== 100) {
    filterParts.push(`saturate(${filters.saturation}%)`);
  }
  if (filters.hue !== 0) {
    filterParts.push(`hue-rotate(${filters.hue}deg)`);
  }

  return {
    filter: filterParts.length > 0 ? filterParts.join(' ') : undefined,
  };
}
