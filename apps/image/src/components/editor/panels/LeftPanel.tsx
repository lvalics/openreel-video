import { useState } from 'react';
import {
  Layers,
  Image,
  LayoutTemplate,
  Type,
  Shapes,
  Upload,
  Search,
  Plus,
  Folder,
} from 'lucide-react';
import { useUIStore, Panel } from '../../../stores/ui-store';
import { useProjectStore } from '../../../stores/project-store';

const panels: { id: Panel; icon: React.ElementType; label: string }[] = [
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'assets', icon: Image, label: 'Assets' },
  { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'shapes', icon: Shapes, label: 'Shapes' },
  { id: 'uploads', icon: Upload, label: 'Uploads' },
];

export function LeftPanel() {
  const { activePanel, setActivePanel } = useUIStore();

  return (
    <div className="h-full flex">
      <div className="w-14 bg-background border-r border-border flex flex-col py-2">
        {panels.map((panel) => {
          const Icon = panel.icon;
          return (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${
                activePanel === panel.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              title={panel.label}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-1 font-medium">{panel.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden">
        {activePanel === 'layers' && <LayersPanel />}
        {activePanel === 'assets' && <AssetsPanel />}
        {activePanel === 'templates' && <TemplatesPanel />}
        {activePanel === 'text' && <TextPanel />}
        {activePanel === 'shapes' && <ShapesPanel />}
        {activePanel === 'uploads' && <UploadsPanel />}
      </div>
    </div>
  );
}

function LayersPanel() {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Layers</h3>
        <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent">
          <Plus size={16} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Layers appear here when you add elements to the canvas.
      </p>
    </div>
  );
}

function AssetsPanel() {
  const { project } = useProjectStore();
  const assets = project ? Object.values(project.assets) : [];

  return (
    <div className="p-3">
      <div className="mb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-8">
          <Folder size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">No assets yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload images to use in your design</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <button
              key={asset.id}
              className="aspect-square rounded-lg bg-muted overflow-hidden hover:ring-2 hover:ring-primary transition-all"
            >
              <img
                src={asset.thumbnailUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplatesPanel() {
  return (
    <div className="p-3">
      <div className="mb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="text-center py-8">
        <LayoutTemplate size={32} className="mx-auto text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">Templates coming soon</p>
      </div>
    </div>
  );
}

function TextPanel() {
  const { addTextLayer } = useProjectStore();

  const textStyles = [
    { label: 'Add a heading', fontSize: 48, fontWeight: 700 },
    { label: 'Add a subheading', fontSize: 32, fontWeight: 600 },
    { label: 'Add body text', fontSize: 18, fontWeight: 400 },
    { label: 'Add a caption', fontSize: 14, fontWeight: 400 },
  ];

  return (
    <div className="p-3">
      <h3 className="text-sm font-medium text-foreground mb-3">Add Text</h3>
      <div className="space-y-2">
        {textStyles.map((style) => (
          <button
            key={style.label}
            onClick={() => addTextLayer(style.label)}
            className="w-full p-3 text-left rounded-lg bg-background border border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span
              className="block text-foreground"
              style={{ fontSize: `${Math.min(style.fontSize / 3, 16)}px`, fontWeight: style.fontWeight }}
            >
              {style.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ShapesPanel() {
  const { addShapeLayer } = useProjectStore();

  const shapes: { type: 'rectangle' | 'ellipse' | 'triangle' | 'polygon' | 'star' | 'line'; label: string }[] = [
    { type: 'rectangle', label: 'Rectangle' },
    { type: 'ellipse', label: 'Circle' },
    { type: 'triangle', label: 'Triangle' },
    { type: 'polygon', label: 'Polygon' },
    { type: 'star', label: 'Star' },
    { type: 'line', label: 'Line' },
  ];

  return (
    <div className="p-3">
      <h3 className="text-sm font-medium text-foreground mb-3">Shapes</h3>
      <div className="grid grid-cols-3 gap-2">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            onClick={() => addShapeLayer(shape.type)}
            className="aspect-square flex flex-col items-center justify-center rounded-lg bg-background border border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Shapes size={24} className="text-muted-foreground mb-1" />
            <span className="text-[10px] text-muted-foreground">{shape.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadsPanel() {
  const { addAsset } = useProjectStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          addAsset({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            type: 'image',
            mimeType: file.type,
            size: file.size,
            width: img.width,
            height: img.height,
            thumbnailUrl: reader.result as string,
            dataUrl: reader.result as string,
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          addAsset({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            type: 'image',
            mimeType: file.type,
            size: file.size,
            width: img.width,
            height: img.height,
            thumbnailUrl: reader.result as string,
            dataUrl: reader.result as string,
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-3">
      <h3 className="text-sm font-medium text-foreground mb-3">Upload Files</h3>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-muted-foreground'
        }`}
      >
        <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground mb-1">
          Drag & drop files here
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          or click to browse
        </p>
        <label className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors">
          Browse Files
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Supports PNG, JPG, SVG, WebP
      </p>
    </div>
  );
}
