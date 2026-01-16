import { PageLayout } from '@/types/editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface PageLayoutPanelProps {
  layout: PageLayout;
  onLayoutChange: (layout: PageLayout) => void;
}

export const PageLayoutPanel = ({
  layout,
  onLayoutChange,
}: PageLayoutPanelProps) => {
  const updateLayout = (updates: Partial<PageLayout>) => {
    onLayoutChange({ ...layout, ...updates });
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold text-foreground">Page Layout</h3>

      {/* Margins */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Margins (mm)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="margin-top" className="text-xs text-muted-foreground">Top</Label>
            <Input
              id="margin-top"
              type="number"
              min="0"
              max="50"
              value={layout.marginTop}
              onChange={(e) => updateLayout({ marginTop: parseInt(e.target.value) || 0 })}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="margin-bottom" className="text-xs text-muted-foreground">Bottom</Label>
            <Input
              id="margin-bottom"
              type="number"
              min="0"
              max="50"
              value={layout.marginBottom}
              onChange={(e) => updateLayout({ marginBottom: parseInt(e.target.value) || 0 })}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="margin-left" className="text-xs text-muted-foreground">Left</Label>
            <Input
              id="margin-left"
              type="number"
              min="0"
              max="50"
              value={layout.marginLeft}
              onChange={(e) => updateLayout({ marginLeft: parseInt(e.target.value) || 0 })}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="margin-right" className="text-xs text-muted-foreground">Right</Label>
            <Input
              id="margin-right"
              type="number"
              min="0"
              max="50"
              value={layout.marginRight}
              onChange={(e) => updateLayout({ marginRight: parseInt(e.target.value) || 0 })}
              className="h-8"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Header</Label>
          <Switch
            checked={layout.showHeader}
            onCheckedChange={(checked) => updateLayout({ showHeader: checked })}
          />
        </div>
        {layout.showHeader && (
          <div className="space-y-2">
            <Label htmlFor="header-text" className="text-xs text-muted-foreground">Header Text</Label>
            <Input
              id="header-text"
              value={layout.headerText}
              onChange={(e) => updateLayout({ headerText: e.target.value })}
              placeholder="Page {page} - {date}"
              className="h-8"
            />
            <div>
              <Label htmlFor="header-height" className="text-xs text-muted-foreground">Height (mm)</Label>
              <Input
                id="header-height"
                type="number"
                min="5"
                max="30"
                value={layout.headerHeight}
                onChange={(e) => updateLayout({ headerHeight: parseInt(e.target.value) || 10 })}
                className="h-8"
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Footer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Footer</Label>
          <Switch
            checked={layout.showFooter}
            onCheckedChange={(checked) => updateLayout({ showFooter: checked })}
          />
        </div>
        {layout.showFooter && (
          <div className="space-y-2">
            <Label htmlFor="footer-text" className="text-xs text-muted-foreground">Footer Text</Label>
            <Input
              id="footer-text"
              value={layout.footerText}
              onChange={(e) => updateLayout({ footerText: e.target.value })}
              placeholder="Page {page} of {total}"
              className="h-8"
            />
            <div>
              <Label htmlFor="footer-height" className="text-xs text-muted-foreground">Height (mm)</Label>
              <Input
                id="footer-height"
                type="number"
                min="5"
                max="30"
                value={layout.footerHeight}
                onChange={(e) => updateLayout({ footerHeight: parseInt(e.target.value) || 10 })}
                className="h-8"
              />
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Variables:</strong></p>
        <p>{'{page}'} - Current page number</p>
        <p>{'{total}'} - Total pages</p>
        <p>{'{date}'} - Current date</p>
        <p>{'{title}'} - Document title</p>
      </div>
    </div>
  );
};