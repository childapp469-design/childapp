import { Flex, Box } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import SetupBanner from '../common/SetupBanner';
import { useData } from '../../contexts/DataContext';

export default function MainLayout({ activeView, onViewChange, children }) {
  const { schemaReady, recheckSchema } = useData();

  return (
    <Flex minH="100vh" bg="cream.50">
      <Sidebar activeView={activeView} onViewChange={onViewChange} />
      <Box
        as="main"
        flex={1}
        minW={0}
        p={{ base: 4, md: 6, lg: 8 }}
        pb={{ base: '88px', lg: 8 }}
        bg="cream.50"
        backgroundImage="radial-gradient(circle at 10% 20%, rgba(255,217,61,0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0,153,255,0.1) 0%, transparent 40%)"
      >
        <Box maxW="1400px" mx="auto">
          <SetupBanner schemaReady={schemaReady} onRecheck={recheckSchema} />
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
