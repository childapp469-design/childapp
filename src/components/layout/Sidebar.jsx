import {
  Box,
  Flex,
  VStack,
  Text,
  Button,
  Badge,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  FiHome,
  FiUserPlus,
  FiClipboard,
  FiCheckCircle,
  FiBarChart2,
  FiRefreshCw,
  FiSettings,
  FiLogOut,
  FiStar,
  FiUser,
  FiWifi,
  FiWifiOff,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Əsas panel', icon: FiHome, color: 'playful' },
  { id: 'add-child', label: 'Uşaq əlavə et', icon: FiUserPlus, color: 'bubblegum' },
  { id: 'tasks', label: 'Tapşırıqlar', icon: FiClipboard, color: 'sunshine' },
  { id: 'results', label: 'Nəticələr', icon: FiCheckCircle, color: 'mint' },
  { id: 'reports', label: 'Hesabatlar', icon: FiBarChart2, color: 'grape' },
  { id: 'sync', label: 'Sinxronizasiya', icon: FiRefreshCw, color: 'playful' },
  { id: 'settings', label: 'Parametrlər', icon: FiSettings, color: 'navy' },
];

const ICON_BG = {
  playful: 'playful.100',
  bubblegum: 'bubblegum.100',
  sunshine: 'sunshine.100',
  mint: 'mint.100',
  grape: 'grape.100',
  navy: 'gray.100',
};

const ICON_COLOR = {
  playful: 'playful.600',
  bubblegum: 'bubblegum.600',
  sunshine: 'sunshine.600',
  mint: 'mint.600',
  grape: 'grape.600',
  navy: 'navy.700',
};

function DesktopNav({ activeView, onViewChange, user, isOnline, logout }) {
  return (
    <>
      <Box px={5} py={6}>
        <Flex align="center" gap={3}>
          <Flex
            w="48px"
            h="48px"
            borderRadius="full"
            bg="linear-gradient(135deg, #FFD93D, #FF6B6B)"
            align="center"
            justify="center"
            boxShadow="pop"
          >
            <Icon as={FiStar} boxSize={6} color="white" />
          </Flex>
          <Box>
            <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="navy.800" lineHeight="1.2">
              Uşaqlar App
            </Text>
            <Badge colorScheme={isOnline ? 'mint' : 'bubblegum'} fontSize="xs" mt={1} display="flex" alignItems="center" gap={1}>
              <Icon as={isOnline ? FiWifi : FiWifiOff} boxSize={3} />
              {isOnline ? 'Onlayn' : 'Oflayn'}
            </Badge>
          </Box>
        </Flex>
      </Box>

      <VStack align="stretch" spacing={1} px={3} flex={1}>
        {MENU_ITEMS.map((item) => {
          const active = activeView === item.id;
          const bgKey = item.color === 'navy' ? 'gray' : item.color;
          return (
            <Button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              justifyContent="flex-start"
              variant="ghost"
              h="auto"
              py={3}
              px={3}
              borderRadius="fun"
              bg={active ? `${bgKey}.100` : 'transparent'}
              _hover={{ bg: `${bgKey}.100`, transform: 'translateX(4px)' }}
              leftIcon={
                <Flex
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg={active ? 'white' : ICON_BG[item.color]}
                  align="center"
                  justify="center"
                  boxShadow={active ? 'pop' : 'none'}
                >
                  <Icon as={item.icon} boxSize={5} color={ICON_COLOR[item.color]} />
                </Flex>
              }
            >
              <Text fontWeight={active ? '700' : '600'} color={active ? 'navy.800' : 'navy.700'} fontSize="md">
                {item.label}
              </Text>
            </Button>
          );
        })}
      </VStack>

      <Box p={4} mx={3} mb={4} bg="white" borderRadius="fun" boxShadow="card" border="2px solid" borderColor="playful.100">
        <Flex align="center" gap={2} mb={2}>
          <Icon as={FiUser} boxSize={3.5} color="navy.600" />
          <Text fontSize="xs" color="navy.700" fontWeight="600" noOfLines={1} flex={1}>
            {user?.email}
          </Text>
        </Flex>
        <Button w="full" size="md" variant="outline" colorScheme="bubblegum" leftIcon={<FiLogOut />} onClick={logout}>
          Çıxış
        </Button>
      </Box>
    </>
  );
}

export default function Sidebar({ activeView, onViewChange }) {
  const { logout, user } = useAuth();
  const { isOnline } = useData();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  if (isMobile) {
    return (
      <Box
        as="nav"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={100}
        bg="white"
        borderTop="3px solid"
        borderColor="playful.200"
        boxShadow="0 -4px 20px rgba(0,0,0,0.08)"
        px={2}
        py={2}
      >
        <Flex justify="space-around" overflowX="auto">
          {MENU_ITEMS.map((item) => {
            const active = activeView === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                flexDirection="column"
                h="auto"
                py={2}
                px={2}
                minW="52px"
                onClick={() => onViewChange(item.id)}
                color={active ? ICON_COLOR[item.color] : 'gray.500'}
              >
                <Icon as={item.icon} boxSize={5} mb={1} />
                <Text fontSize="2xs" fontWeight="700" noOfLines={1}>
                  {item.label.split(' ')[0]}
                </Text>
              </Button>
            );
          })}
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      as="aside"
      w="260px"
      minH="100vh"
      bg="linear-gradient(180deg, #FFFBF5 0%, #E8F7FF 100%)"
      borderRight="3px solid"
      borderColor="playful.100"
      display="flex"
      flexDirection="column"
      flexShrink={0}
    >
      <DesktopNav
        activeView={activeView}
        onViewChange={onViewChange}
        user={user}
        isOnline={isOnline}
        logout={logout}
      />
    </Box>
  );
}
