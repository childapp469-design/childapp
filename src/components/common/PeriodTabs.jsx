import { Button, ButtonGroup } from '@chakra-ui/react';
import { todayISO } from '../../lib/dateUtils';

export default function PeriodTabs({ selectedDate, setSelectedDate }) {
  const tabs = [
    { key: 'daily', label: 'Günlük', isActive: selectedDate !== 'week' && selectedDate !== 'month', onClick: () => setSelectedDate(todayISO()) },
    { key: 'week', label: 'Həftəlik', isActive: selectedDate === 'week', onClick: () => setSelectedDate('week') },
    { key: 'month', label: 'Aylıq', isActive: selectedDate === 'month', onClick: () => setSelectedDate('month') },
  ];

  return (
    <ButtonGroup spacing={2} flexWrap="wrap">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          size="md"
          colorScheme={tab.isActive ? 'playful' : 'gray'}
          variant={tab.isActive ? 'solid' : 'outline'}
          onClick={tab.onClick}
          bg={tab.isActive ? undefined : 'white'}
          borderColor={tab.isActive ? undefined : 'gray.200'}
          color={tab.isActive ? undefined : 'navy.700'}
        >
          {tab.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
