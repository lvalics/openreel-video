import { useState } from 'react';
import { Plus, FolderOpen, Image, Layout, FileText, Presentation, Smartphone, Monitor, Star } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { useUIStore } from '../../stores/ui-store';
import { CANVAS_PRESETS } from '../../types/project';

type Category = 'all' | 'Social Media' | 'Presentation' | 'Print' | 'Desktop' | 'Mobile' | 'Logo';

const categories: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: Layout },
  { id: 'Social Media', label: 'Social Media', icon: Star },
  { id: 'Presentation', label: 'Presentation', icon: Presentation },
  { id: 'Print', label: 'Print', icon: FileText },
  { id: 'Desktop', label: 'Desktop', icon: Monitor },
  { id: 'Mobile', label: 'Mobile', icon: Smartphone },
  { id: 'Logo', label: 'Logo', icon: Image },
];

export function WelcomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [showCustomSize, setShowCustomSize] = useState(false);

  const { createProject } = useProjectStore();
  const { setCurrentView } = useUIStore();

  const filteredPresets = selectedCategory === 'all'
    ? CANVAS_PRESETS
    : CANVAS_PRESETS.filter((p) => p.category === selectedCategory);

  const handleCreateProject = (width: number, height: number, name: string) => {
    createProject(name, { width, height });
    setCurrentView('editor');
  };

  const handleCreateCustom = () => {
    createProject('Untitled Design', { width: customWidth, height: customHeight });
    setCurrentView('editor');
  };

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <header className="flex items-center justify-between px-8 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Image size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">OpenReel Image</h1>
            <p className="text-sm text-muted-foreground">Professional Graphic Design Editor</p>
          </div>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <FolderOpen size={18} />
          Open Project
        </button>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">Start a new project</h2>

            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon size={16} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <button
                onClick={() => setShowCustomSize(!showCustomSize)}
                className="group flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all aspect-square"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Plus size={24} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Custom Size</span>
                <span className="text-xs text-muted-foreground mt-1">Set dimensions</span>
              </button>

              {filteredPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleCreateProject(preset.width, preset.height, preset.name)}
                  className="group flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all aspect-square"
                >
                  <div
                    className="bg-muted rounded-lg mb-3 flex items-center justify-center"
                    style={{
                      width: Math.min(80, (preset.width / Math.max(preset.width, preset.height)) * 80),
                      height: Math.min(80, (preset.height / Math.max(preset.width, preset.height)) * 80),
                    }}
                  >
                    <Layout size={20} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground text-center">{preset.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {preset.width} × {preset.height}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {showCustomSize && (
            <section className="mb-10 p-6 rounded-xl bg-card border border-border">
              <h3 className="text-base font-medium text-foreground mb-4">Custom Dimensions</h3>
              <div className="flex items-end gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-32 px-3 py-2.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min={1}
                    max={8000}
                  />
                </div>
                <span className="text-muted-foreground pb-2.5">×</span>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-32 px-3 py-2.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min={1}
                    max={8000}
                  />
                </div>
                <button
                  onClick={handleCreateCustom}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  Create Design
                </button>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Projects</h2>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderOpen size={28} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No recent projects</p>
              <p className="text-sm text-muted-foreground/70">
                Create a new project to get started
              </p>
            </div>
          </section>
        </div>
      </div>

      <footer className="px-8 py-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          OpenReel Image — Professional graphic design in your browser
        </p>
        <p className="text-xs text-muted-foreground">
          100% offline • No account required
        </p>
      </footer>
    </div>
  );
}
