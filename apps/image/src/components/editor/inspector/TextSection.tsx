import { useProjectStore } from '../../../stores/project-store';
import type { TextLayer, TextStyle } from '../../../types/project';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';

interface Props {
  layer: TextLayer;
}

const FONT_FAMILIES = [
  'Inter',
  'DM Sans',
  'Poppins',
  'Montserrat',
  'Playfair Display',
  'Roboto',
  'Open Sans',
  'Lato',
  'Oswald',
  'Bebas Neue',
  'Pacifico',
  'Lobster',
  'Dancing Script',
  'Great Vibes',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128];

export function TextSection({ layer }: Props) {
  const { updateLayer } = useProjectStore();

  const handleContentChange = (content: string) => {
    updateLayer<TextLayer>(layer.id, { content });
  };

  const handleStyleChange = (updates: Partial<TextStyle>) => {
    updateLayer<TextLayer>(layer.id, {
      style: { ...layer.style, ...updates },
    });
  };

  const toggleBold = () => {
    handleStyleChange({
      fontWeight: layer.style.fontWeight >= 700 ? 400 : 700,
    });
  };

  const toggleItalic = () => {
    handleStyleChange({
      fontStyle: layer.style.fontStyle === 'italic' ? 'normal' : 'italic',
    });
  };

  const toggleUnderline = () => {
    handleStyleChange({
      textDecoration: layer.style.textDecoration === 'underline' ? 'none' : 'underline',
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Text
      </h4>

      <div>
        <label className="block text-[10px] text-muted-foreground mb-1">Content</label>
        <textarea
          value={layer.content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px] resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Font</label>
          <select
            value={layer.style.fontFamily}
            onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Size</label>
          <select
            value={layer.style.fontSize}
            onChange={(e) => handleStyleChange({ fontSize: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-1">
        <button
          onClick={toggleBold}
          className={`p-2 rounded-md transition-colors ${
            layer.style.fontWeight >= 700
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={toggleItalic}
          className={`p-2 rounded-md transition-colors ${
            layer.style.fontStyle === 'italic'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={toggleUnderline}
          className={`p-2 rounded-md transition-colors ${
            layer.style.textDecoration === 'underline'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
          title="Underline"
        >
          <Underline size={14} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={() => handleStyleChange({ textAlign: 'left' })}
          className={`p-2 rounded-md transition-colors ${
            layer.style.textAlign === 'left'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </button>
        <button
          onClick={() => handleStyleChange({ textAlign: 'center' })}
          className={`p-2 rounded-md transition-colors ${
            layer.style.textAlign === 'center'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
          title="Align Center"
        >
          <AlignCenter size={14} />
        </button>
        <button
          onClick={() => handleStyleChange({ textAlign: 'right' })}
          className={`p-2 rounded-md transition-colors ${
            layer.style.textAlign === 'right'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
          title="Align Right"
        >
          <AlignRight size={14} />
        </button>
      </div>

      <div>
        <label className="block text-[10px] text-muted-foreground mb-1">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={layer.style.color}
            onChange={(e) => handleStyleChange({ color: e.target.value })}
            className="w-8 h-8 rounded border border-input cursor-pointer"
          />
          <input
            type="text"
            value={layer.style.color}
            onChange={(e) => handleStyleChange({ color: e.target.value })}
            className="flex-1 px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Line Height</label>
          <input
            type="number"
            value={layer.style.lineHeight}
            onChange={(e) => handleStyleChange({ lineHeight: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            step={0.1}
            min={0.5}
            max={3}
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Letter Spacing</label>
          <input
            type="number"
            value={layer.style.letterSpacing}
            onChange={(e) => handleStyleChange({ letterSpacing: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}
