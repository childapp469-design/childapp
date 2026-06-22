import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  Link,
  Box,
} from '@chakra-ui/react';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { SUPABASE_SQL_EDITOR_URL } from '../../lib/supabase';
import { checkSupabaseSchema } from '../../lib/schemaCheck';

export default function SetupBanner({ schemaReady, onRecheck }) {
  if (schemaReady) return null;

  const handleRecheck = async () => {
    await checkSupabaseSchema();
    onRecheck?.();
  };

  return (
    <Alert
      status="warning"
      variant="subtle"
      borderRadius="fun"
      mb={6}
      border="3px solid"
      borderColor="sunshine.300"
      bg="sunshine.50"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'flex-start', md: 'center' }}
      gap={3}
    >
      <AlertIcon color="sunshine.600" />
      <Box flex={1}>
        <AlertTitle fontFamily="heading" color="navy.800">
          Supabase cədvəlləri yaradılmayıb (404)
        </AlertTitle>
        <AlertDescription color="navy.700" fontWeight="600" mt={1}>
          Verilənlər bazası boşdur — API sorğuları 404 qaytarır. Supabase SQL Editor-də{' '}
          <strong>supabase/migrations/001_initial_schema.sql</strong> faylını icra edin.
          Hal-hazırda məlumatlar brauzerdə (IndexedDB) saxlanılır.
        </AlertDescription>
      </Box>
      <HStack flexShrink={0}>
        <Button
          as={Link}
          href={SUPABASE_SQL_EDITOR_URL}
          isExternal
          size="sm"
          colorScheme="playful"
          leftIcon={<FiExternalLink />}
        >
          SQL Editor
        </Button>
        <Button size="sm" variant="outline" colorScheme="playful" leftIcon={<FiRefreshCw />} onClick={handleRecheck}>
          Yenidən yoxla
        </Button>
      </HStack>
    </Alert>
  );
}
