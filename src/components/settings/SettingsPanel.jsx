import { useState } from 'react';
import {
  Box,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  List,
  ListItem,
} from '@chakra-ui/react';
import { FiSave, FiSettings, FiLock, FiFileText, FiLayers } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../lib/dateUtils';
import { PageHeader, FunCard, SectionTitle } from '../ui/FunCard';

export default function SettingsPanel() {
  const { setAppPin } = useAuth();
  const { auditLogs } = useData();
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handlePinSave = (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      setMessageType('error');
      setMessage('PIN ən azı 4 rəqəm olmalıdır');
      return;
    }
    if (pin !== pinConfirm) {
      setMessageType('error');
      setMessage('PIN kodlar uyğun gəlmir');
      return;
    }
    setAppPin(pin);
    setMessageType('success');
    setMessage('PIN kod uğurla yeniləndi');
    setPin('');
    setPinConfirm('');
  };

  return (
    <Box>
      <PageHeader icon={FiSettings} title="Parametrlər" subtitle="PIN kod və audit jurnalı" />

      <FunCard mb={6}>
        <SectionTitle icon={FiLock}>PIN kod</SectionTitle>
        <Text fontSize="sm" color="navy.700" fontWeight="600" mb={4}>
          Tez giriş üçün PIN təyin edin (default: 1234)
        </Text>
        <form onSubmit={handlePinSave}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={4} align="flex-end" flexWrap="wrap">
              <FormControl flex={1} minW="140px">
                <FormLabel fontWeight="700">Yeni PIN</FormLabel>
                <Input variant="fun" type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={6} placeholder="****" />
              </FormControl>
              <FormControl flex={1} minW="140px">
                <FormLabel fontWeight="700">Təsdiq</FormLabel>
                <Input variant="fun" type="password" value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} maxLength={6} placeholder="****" />
              </FormControl>
            </HStack>
            {message && (
              <Alert status={messageType} borderRadius="fun">
                <AlertIcon />
                {message}
              </Alert>
            )}
            <Button type="submit" colorScheme="grape" leftIcon={<FiSave />} alignSelf="flex-start" size="lg">
              PIN saxla
            </Button>
          </VStack>
        </form>
      </FunCard>

      <FunCard mb={6}>
        <SectionTitle icon={FiFileText}>Audit jurnalı</SectionTitle>
        {auditLogs.length === 0 ? (
          <Text color="gray.500" fontWeight="600">
            Hələ audit qeydi yoxdur.
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="grape.50">
                  <Th>Tarix</Th>
                  <Th>İstifadəçi</Th>
                  <Th>Cədvəl</Th>
                  <Th>Əməliyyat</Th>
                </Tr>
              </Thead>
              <Tbody>
                {auditLogs.slice(0, 50).map((log) => (
                  <Tr key={log.id} _hover={{ bg: 'cream.100' }}>
                    <Td fontWeight="600">{formatDate(log.created_at, 'dd.MM.yyyy HH:mm')}</Td>
                    <Td>{log.user_email || '—'}</Td>
                    <Td>{log.table_name}</Td>
                    <Td>
                      <Text as="span" fontWeight="700" color="playful.600">
                        {log.action}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </FunCard>

      <FunCard bg="cream.100">
        <SectionTitle icon={FiLayers}>Dizayn</SectionTitle>
        <List spacing={2} fontSize="sm" fontWeight="600" color="navy.700">
          <ListItem>UI: Chakra UI v2 — uşaq dostu tema</ListItem>
          <ListItem>Font: Fredoka + Nunito</ListItem>
          <ListItem>Rənglər: Playful, Sunshine, Mint, Grape, Bubblegum</ListItem>
        </List>
      </FunCard>
    </Box>
  );
}
