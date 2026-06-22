import {
  Box,
  Flex,
  VStack,
  Text,
  Avatar,
  IconButton,
  Badge,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiEdit2, FiCheck, FiStar } from 'react-icons/fi';
import { MdRadioButtonUnchecked } from 'react-icons/md';
import { useData } from '../../contexts/DataContext';
import { calculateScores } from '../../lib/scores';
import { getDailyTaskProgress } from '../../lib/taskProgress';
import { todayISO, getWeekRange, getMonthRange } from '../../lib/dateUtils';
import {
  AvatarProgressRing,
  ChildCardProgressWrapper,
  ProgressStatusBadge,
  DailyProgressBar,
} from './ChildProgressEffects';

const COLUMN_COLORS = ['playful', 'bubblegum', 'sunshine', 'mint', 'grape'];

export default function ChildColumn({ child, onEdit, colorIndex = 0 }) {
  const { taskList, completions, adjustments, selectedDate, toggleTaskCompletion } = useData();
  const color = COLUMN_COLORS[colorIndex % COLUMN_COLORS.length];

  const dateRange =
    selectedDate === 'week'
      ? getWeekRange()
      : selectedDate === 'month'
      ? getMonthRange()
      : { start: selectedDate, end: selectedDate };

  const scores = calculateScores(child.id, completions, adjustments, dateRange);
  const displayDate = selectedDate === 'week' || selectedDate === 'month' ? todayISO() : selectedDate;
  const progress = getDailyTaskProgress(child.id, taskList, completions, displayDate);

  return (
    <ChildCardProgressWrapper state={progress.state} color={color}>
      <Box
        w="full"
        bg="white"
        borderRadius="blob"
        overflow="hidden"
        boxShadow="fun"
        border="3px solid"
        borderColor={progress.state === 'finished' ? 'mint.300' : progress.state === 'near' ? 'sunshine.300' : `${color}.200`}
        transition="border-color 0.3s"
        _hover={{ transform: 'translateY(-4px)' }}
        position="relative"
        zIndex={0}
      >
        <Box
          bg={`${color}.100`}
          p={5}
          textAlign="center"
          position="relative"
          borderBottom="3px dashed"
          borderColor={`${color}.200`}
        >
          <IconButton
            icon={<FiEdit2 />}
            size="sm"
            variant="solid"
            colorScheme={color}
            aria-label="Redaktə et"
            position="absolute"
            top={3}
            right={3}
            borderRadius="full"
            onClick={() => onEdit(child)}
            zIndex={4}
          />

          {progress.state !== 'none' && (
            <Box mb={3} display="flex" justifyContent="center">
              <ProgressStatusBadge state={progress.state} remaining={progress.remaining} />
            </Box>
          )}

          <AvatarProgressRing state={progress.state} color={color}>
            <Avatar
              size="xl"
              name={child.first_name}
              src={child.photo_url}
              mb={3}
              mx="auto"
              border="4px solid white"
              boxShadow="pop"
            />
          </AvatarProgressRing>

          <Text fontFamily="heading" fontWeight="700" fontSize="lg" color="navy.800" mt={3}>
            {child.first_name} {child.last_name || ''}
          </Text>
          <HStack justify="center" mt={3} spacing={2}>
            <Badge colorScheme={color} fontSize="sm" px={3} py={1} display="flex" alignItems="center" gap={1}>
              <Icon as={FiStar} boxSize={3} />
              {scores.points} bal
            </Badge>
            {scores.stars > 0 && (
              <HStack spacing={0.5} color="sunshine.600">
                {Array.from({ length: Math.min(scores.stars, 5) }).map((_, i) => (
                  <FiStar key={i} fill="#FAB005" stroke="#FAB005" size={16} />
                ))}
              </HStack>
            )}
          </HStack>
        </Box>

        <DailyProgressBar percent={progress.percent} state={progress.state} color={color} />

        <VStack align="stretch" p={3} spacing={2}>
          {taskList.map((task) => {
            const completion = completions.find(
              (c) =>
                c.child_id === child.id &&
                c.task_id === task.id &&
                c.completed_date === displayDate
            );
            const isDone = !!completion;

            return (
              <Flex
                key={task.id}
                align="center"
                gap={3}
                p={3}
                borderRadius="fun"
                cursor="pointer"
                bg={isDone ? 'mint.50' : 'cream.50'}
                border="2px solid"
                borderColor={isDone ? 'mint.200' : 'transparent'}
                _hover={{
                  bg: isDone ? 'mint.100' : `${color}.50`,
                  borderColor: `${color}.200`,
                }}
                onClick={() => toggleTaskCompletion(child.id, task)}
                transition="all 0.15s"
              >
                <Box color={isDone ? 'mint.500' : 'gray.300'} flexShrink={0} fontSize="xl">
                  {isDone ? <FiCheck size={22} strokeWidth={3} /> : <MdRadioButtonUnchecked size={24} />}
                </Box>
                <Text flex={1} fontSize="sm" fontWeight="600" color="navy.800" noOfLines={2}>
                  {task.name}
                </Text>
                {isDone && (
                  <Badge colorScheme="mint" fontSize="xs" flexShrink={0}>
                    +{completion.points_earned}
                  </Badge>
                )}
              </Flex>
            );
          })}
        </VStack>
      </Box>
    </ChildCardProgressWrapper>
  );
}
