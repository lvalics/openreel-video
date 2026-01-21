import { useProjectStore } from '../../../stores/project-store';
import type { ImageLayer, Filter } from '../../../types/project';
import { Sun, Contrast, Palette, Thermometer, Focus, Sparkles } from 'lucide-react';

interface Props {
  layer: ImageLayer;
}

interface AdjustmentSliderProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
  unit?: string;
}

function AdjustmentSlider({ icon, label, value, min, max, defaultValue, onChange, unit = '' }: AdjustmentSliderProps) {
  const isModified = value !== defaultValue;
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{icon}</span>
          <label className="text-[11px] text-foreground font-medium">{label}</label>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[11px] font-mono ${isModified ? 'text-primary' : 'text-muted-foreground'}`}>
            {value}{unit}
          </span>
          {isModified && (
            <button
              onClick={() => onChange(defaultValue)}
              className="text-[9px] text-muted-foreground hover:text-foreground px-1 py-0.5 rounded hover:bg-secondary transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 appearance-none bg-secondary rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--secondary)) ${percentage}%, hsl(var(--secondary)) 100%)`
          }}
        />
      </div>
    </div>
  );
}

export function ImageAdjustmentsSection({ layer }: Props) {
  const { updateLayer } = useProjectStore();

  const handleFilterChange = (key: keyof Filter, value: number) => {
    updateLayer<ImageLayer>(layer.id, {
      filters: { ...layer.filters, [key]: value },
    });
  };

  const resetAllFilters = () => {
    updateLayer<ImageLayer>(layer.id, {
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
        sharpen: 0,
      },
    });
  };

  const hasModifications =
    layer.filters.brightness !== 100 ||
    layer.filters.contrast !== 100 ||
    layer.filters.saturation !== 100 ||
    layer.filters.hue !== 0 ||
    layer.filters.blur !== 0 ||
    layer.filters.sharpen !== 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Adjustments
        </h4>
        {hasModifications && (
          <button
            onClick={resetAllFilters}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
        <AdjustmentSlider
          icon={<Sun size={12} />}
          label="Brightness"
          value={layer.filters.brightness}
          min={0}
          max={200}
          defaultValue={100}
          onChange={(v) => handleFilterChange('brightness', v)}
          unit="%"
        />

        <AdjustmentSlider
          icon={<Contrast size={12} />}
          label="Contrast"
          value={layer.filters.contrast}
          min={0}
          max={200}
          defaultValue={100}
          onChange={(v) => handleFilterChange('contrast', v)}
          unit="%"
        />

        <AdjustmentSlider
          icon={<Palette size={12} />}
          label="Saturation"
          value={layer.filters.saturation}
          min={0}
          max={200}
          defaultValue={100}
          onChange={(v) => handleFilterChange('saturation', v)}
          unit="%"
        />

        <AdjustmentSlider
          icon={<Thermometer size={12} />}
          label="Temperature"
          value={layer.filters.hue}
          min={-180}
          max={180}
          defaultValue={0}
          onChange={(v) => handleFilterChange('hue', v)}
          unit="°"
        />

        <AdjustmentSlider
          icon={<Focus size={12} />}
          label="Blur"
          value={layer.filters.blur}
          min={0}
          max={50}
          defaultValue={0}
          onChange={(v) => handleFilterChange('blur', v)}
          unit="px"
        />

        <AdjustmentSlider
          icon={<Sparkles size={12} />}
          label="Sharpen"
          value={layer.filters.sharpen}
          min={0}
          max={100}
          defaultValue={0}
          onChange={(v) => handleFilterChange('sharpen', v)}
          unit="%"
        />
      </div>
    </div>
  );
}
