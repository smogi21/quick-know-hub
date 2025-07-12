import { Badge } from '@/components/ui/badge';

interface ReputationBadgeProps {
  reputation: number;
  className?: string;
}

export function ReputationBadge({ reputation, className }: ReputationBadgeProps) {
  const getReputationColor = (rep: number) => {
    if (rep >= 2000) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    if (rep >= 500) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    if (rep >= 100) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    if (rep >= 15) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Badge className={`${getReputationColor(reputation)} ${className}`}>
      {reputation.toLocaleString()}
    </Badge>
  );
}