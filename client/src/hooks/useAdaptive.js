import { useMemo } from 'react';

export function useAdaptive(difficulty) {
  const difficultyInfo = useMemo(() => {
    switch (difficulty) {
      case 1:
        return {
          label: 'Easy',
          color: '#10B981',
          bgColor: '#D1FAE5',
          multiplier: 1
        };
      case 2:
        return {
          label: 'Medium',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          multiplier: 1.5
        };
      case 3:
        return {
          label: 'Hard',
          color: '#EF4444',
          bgColor: '#FEE2E2',
          multiplier: 2
        };
      default:
        return {
          label: 'Easy',
          color: '#10B981',
          bgColor: '#D1FAE5',
          multiplier: 1
        };
    }
  }, [difficulty]);

  const getBadgeClass = () => {
    switch (difficulty) {
      case 1: return 'badge-easy';
      case 2: return 'badge-medium';
      case 3: return 'badge-hard';
      default: return 'badge-easy';
    }
  };

  return {
    ...difficultyInfo,
    badgeClass: getBadgeClass()
  };
}
