import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface UserBadgesProps {
  userId: string;
  limit?: number;
  className?: string;
}

type BadgeWithDetails = Tables<'user_badges'> & {
  badges: Tables<'badges'>;
};

export function UserBadges({ userId, limit = 3, className }: UserBadgesProps) {
  const [badges, setBadges] = useState<BadgeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data, error } = await supabase
          .from('user_badges')
          .select(`
            *,
            badges (*)
          `)
          .eq('user_id', userId)
          .order('earned_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setBadges(data as BadgeWithDetails[]);
      } catch (error) {
        console.error('Error fetching user badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId, limit]);

  if (loading) {
    return <div className="flex gap-1">
      {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
        <div key={i} className="h-6 w-12 bg-muted animate-pulse rounded" />
      ))}
    </div>;
  }

  if (!badges.length) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {badges.map((userBadge) => (
        <Badge
          key={userBadge.id}
          className={`text-xs ${getTierColor(userBadge.badges.tier)}`}
          title={userBadge.badges.description}
        >
          {userBadge.badges.icon} {userBadge.badges.name}
        </Badge>
      ))}
    </div>
  );
}