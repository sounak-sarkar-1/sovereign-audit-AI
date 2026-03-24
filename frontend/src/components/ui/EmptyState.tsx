import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center rounded-xl border-2 border-dashed border-bg-mid dark:border-[#3d2a5a] bg-bg-warm/20 dark:bg-[#1a0d35]/30",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-white dark:bg-[#2d1f45] shadow-card flex items-center justify-center mb-6">
        <Icon size={32} className="text-bg-muted" />
      </div>
      <h3 className="text-lg font-bold text-dark dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-bg-muted max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="rounded-full shadow-elevated gap-2">
          {action.icon && <action.icon size={16} />}
          {action.label}
        </Button>
      )}
    </div>
  );
};
