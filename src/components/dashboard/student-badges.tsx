import type { Student } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { Award, Star, TrendingUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type BadgeInfo = {
  condition: boolean;
  label: string;
  icon: React.ElementType;
  className: string;
};

export function StudentBadges({ student }: { student: Student }) {
  const badges: BadgeInfo[] = [
    {
      condition: student.progress > 90,
      label: 'Top Performer',
      icon: Award,
      className: 'bg-yellow-500 hover:bg-yellow-500/80',
    },
    {
      condition: student.experimentScore > 90,
      label: 'Experiment Whiz',
      icon: TrendingUp,
      className: 'bg-green-500 hover:bg-green-500/80',
    },
    {
      condition: student.activityScore > 90,
      label: 'Activity Star',
      icon: Star,
      className: 'bg-blue-500 hover:bg-blue-500/80',
    },
  ];

  const awardedBadges = badges.filter((badge) => badge.condition);

  if (awardedBadges.length === 0) {
    return <span className="text-xs text-muted-foreground">No badges yet</span>;
  }

  return (
    <TooltipProvider>
      <div className="flex gap-1">
        {awardedBadges.map((badge) => (
          <Tooltip key={badge.label}>
            <TooltipTrigger>
              <Badge variant="default" className={badge.className}>
                <badge.icon className="h-3 w-3" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{badge.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
