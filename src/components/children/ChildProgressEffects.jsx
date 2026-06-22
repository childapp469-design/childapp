import { Box, Flex, Text, Progress, Icon } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiZap, FiAward } from 'react-icons/fi';
import { MdCelebration } from 'react-icons/md';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const CONFETTI_COLORS = ['#FFD93D', '#FF6B6B', '#0099FF', '#51CF66', '#845EF7', '#FAB005'];

function ConfettiBurst() {
  return (
    <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden" borderRadius="blob" zIndex={2}>
      {CONFETTI_COLORS.map((color, i) => (
        <MotionBox
          key={i}
          position="absolute"
          top="40%"
          left={`${12 + i * 14}%`}
          w="8px"
          h="8px"
          borderRadius={i % 2 === 0 ? 'full' : '2px'}
          bg={color}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: [0, -60 - i * 8, 120 + i * 10],
            x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 6), (i % 2 === 0 ? -1 : 1) * 10],
            opacity: [1, 1, 0],
            rotate: [0, 180 + i * 40, 360],
            scale: [1, 1.2, 0.6],
          }}
          transition={{
            duration: 1.8 + i * 0.1,
            repeat: Infinity,
            repeatDelay: 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </Box>
  );
}

function SparkleOrbit({ color }) {
  const positions = [
    { top: '-4px', left: '50%', x: '-50%' },
    { top: '50%', right: '-4px', y: '-50%' },
    { bottom: '-2px', left: '20%' },
    { top: '20%', left: '-4px' },
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <MotionBox
          key={i}
          position="absolute"
          {...pos}
          color={`${color}.500`}
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
        >
          <Icon as={HiOutlineSparkles} boxSize={4} />
        </MotionBox>
      ))}
    </>
  );
}

export function ProgressStatusBadge({ state, remaining }) {
  if (state === 'finished') {
    return (
      <MotionFlex
        align="center"
        justify="center"
        gap={1.5}
        px={3}
        py={1}
        borderRadius="full"
        bg="linear-gradient(135deg, #FFD93D, #FF6B6B)"
        color="white"
        fontWeight="800"
        fontSize="xs"
        boxShadow="pop"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      >
        <Icon as={MdCelebration} boxSize={4} />
        <Text>Tamamlandı!</Text>
      </MotionFlex>
    );
  }

  if (state === 'near') {
    return (
      <MotionFlex
        align="center"
        justify="center"
        gap={1.5}
        px={3}
        py={1}
        borderRadius="full"
        bg="sunshine.400"
        color="navy.800"
        fontWeight="800"
        fontSize="xs"
        boxShadow="pop"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <Icon as={FiZap} boxSize={3.5} />
        <Text>Finişə az qaldı! ({remaining} qaldı)</Text>
      </MotionFlex>
    );
  }

  return null;
}

export function AvatarProgressRing({ state, color, children }) {
  return (
    <Box position="relative" display="inline-block" mx="auto">
      {state === 'near' && (
        <>
          <MotionBox
            position="absolute"
            inset="-8px"
            borderRadius="full"
            border="3px solid"
            borderColor={`${color}.400`}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <MotionBox
            position="absolute"
            inset="-14px"
            borderRadius="full"
            border="2px dashed"
            borderColor="sunshine.400"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <SparkleOrbit color={color} />
        </>
      )}

      {state === 'finished' && (
        <>
          <MotionBox
            position="absolute"
            inset="-10px"
            borderRadius="full"
            border="3px solid"
            borderColor="sunshine.400"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255, 217, 61, 0.4)',
                '0 0 0 8px rgba(255, 107, 107, 0.2)',
                '0 0 0 0 rgba(0, 153, 255, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <MotionBox
            position="absolute"
            top="-6px"
            right="-6px"
            bg="sunshine.400"
            borderRadius="full"
            p={1.5}
            boxShadow="pop"
            zIndex={3}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
          >
            <Icon as={FiAward} boxSize={5} color="white" />
          </MotionBox>
        </>
      )}

      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
}

export function ChildCardProgressWrapper({ state, color, children }) {
  const isNear = state === 'near';
  const isFinished = state === 'finished';

  return (
    <MotionBox
      position="relative"
      w="full"
      borderRadius="blob"
      overflow="hidden"
      animate={
        isFinished
          ? { boxShadow: ['0 8px 32px rgba(255, 107, 107, 0.25)', '0 8px 40px rgba(0, 153, 255, 0.35)', '0 8px 32px rgba(255, 217, 61, 0.3)'] }
          : isNear
          ? { boxShadow: ['0 4px 20px rgba(255, 217, 61, 0.2)', '0 8px 28px rgba(255, 217, 61, 0.4)', '0 4px 20px rgba(255, 217, 61, 0.2)'] }
          : {}
      }
      transition={{ duration: 2, repeat: isNear || isFinished ? Infinity : 0 }}
      sx={
        isFinished
          ? {
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                padding: '3px',
                background: 'linear-gradient(135deg, #FFD93D, #FF6B6B, #0099FF, #51CF66)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animation: 'rainbow-border 3s linear infinite',
                pointerEvents: 'none',
                zIndex: 1,
              },
            }
          : undefined
      }
    >
      <AnimatePresence>{isFinished && <ConfettiBurst />}</AnimatePresence>
      {children}
    </MotionBox>
  );
}

export function DailyProgressBar({ percent, state, color }) {
  if (state === 'none') return null;

  return (
    <Box px={4} pb={3}>
      <Flex justify="space-between" align="center" mb={1}>
        <Text fontSize="xs" fontWeight="700" color="navy.700">
          Gündəlik irəliləyiş
        </Text>
        <Text fontSize="xs" fontWeight="800" color={`${color}.600`}>
          {percent}%
        </Text>
      </Flex>
      <Progress
        value={percent}
        size="sm"
        borderRadius="full"
        colorScheme={state === 'finished' ? 'mint' : 'sunshine'}
        bg={`${color}.100`}
        sx={{
          '& > div': {
            transition: 'width 0.5s ease',
            ...(state === 'near' && {
              animation: 'progress-pulse 1.5s ease-in-out infinite',
            }),
          },
        }}
      />
    </Box>
  );
}
