import { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  Input,
  Alert,
  AlertIcon,
  HStack,
  List,
  ListItem,
  Badge,
  Icon,
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiCloud,
  FiDatabase,
  FiInfo,
  FiWifi,
  FiWifiOff,
  FiFileText,
} from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import { exportYearToExcel, importFromExcel } from '../../lib/excel';
import { PageHeader, FunCard, IconBadge, SectionTitle } from '../ui/FunCard';

export default function SyncPanel() {
  const {
    manualSync,
    syncStatus,
    isOnline,
    childList,
    taskList,
    completions,
    adjustments,
    loadAll,
  } = useData();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [year, setYear] = useState(new Date().getFullYear());

  const handleSync = async () => {
    setMessage('');
    try {
      const result = await manualSync();
      setMessageType('success');
      setMessage(
        result.syncedItems > 0
          ? `Sinxronizasiya uğurlu! ${result.syncedItems} element sinxronizasiya edildi.`
          : 'Məlumatlar uğurla yeniləndi.'
      );
    } catch (err) {
      setMessageType('error');
      setMessage(`Xəta: ${err.message}`);
    }
  };

  const handleExport = () => {
    exportYearToExcel(
      { children: childList, tasks: taskList, completions, adjustments },
      year
    );
    setMessageType('success');
    setMessage(`${year}.xlsx faylı ixrac edildi.`);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await importFromExcel(file);
      setMessageType('success');
      setMessage(`Excel oxundu: ${data.daily?.length || 0} günlük qeyd tapıldı.`);
    } catch (err) {
      setMessageType('error');
      setMessage(`Import xətası: ${err.message}`);
    }
  };

  return (
    <Box>
      <PageHeader icon={FiRefreshCw} title="Sinxronizasiya" subtitle="Məlumatları bulud və Excel ilə idarə edin" />

      <FunCard
        mb={6}
        borderColor={isOnline ? 'mint.200' : 'bubblegum.200'}
        bg={isOnline ? 'mint.50' : 'bubblegum.50'}
      >
        <HStack mb={2}>
          <Icon as={isOnline ? FiWifi : FiWifiOff} boxSize={6} color={isOnline ? 'mint.500' : 'bubblegum.500'} />
          <Text fontFamily="heading" fontWeight="700" fontSize="lg">
            {isOnline ? 'Onlayn' : 'Oflayn'}
          </Text>
          <Badge colorScheme={isOnline ? 'mint' : 'bubblegum'}>
            {isOnline ? 'Bağlantı aktiv' : 'Oflayn rejim'}
          </Badge>
        </HStack>
        <Text color="navy.700" fontWeight="600">
          {isOnline
            ? 'Məlumatlar avtomatik sinxronizasiya olunur.'
            : 'Məlumatlar lokal IndexedDB-də saxlanılır.'}
        </Text>
      </FunCard>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={6}>
        <FunCard variant="colorful">
          <IconBadge icon={FiCloud} color="playful.600" />
          <Text fontFamily="heading" fontWeight="700" mb={2}>
            Supabase sinxronizasiya
          </Text>
          <Text fontSize="sm" color="navy.700" fontWeight="600" mb={4}>
            Lokal məlumatları bulud ilə sinxronizasiya edin.
          </Text>
          <Button
            colorScheme="playful"
            leftIcon={<FiRefreshCw />}
            onClick={handleSync}
            isDisabled={!isOnline}
            isLoading={syncStatus === 'syncing'}
          >
            Sinxronizasiya et
          </Button>
        </FunCard>

        <FunCard variant="colorful">
          <IconBadge icon={FiDownload} color="mint.600" />
          <Text fontFamily="heading" fontWeight="700" mb={2}>
            Excel ixrac
          </Text>
          <Text fontSize="sm" color="navy.700" fontWeight="600" mb={4}>
            İllik məlumatları Excel faylına ixrac edin.
          </Text>
          <HStack>
            <Input
              type="number"
              variant="fun"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min="2020"
              max="2099"
              w="100px"
            />
            <Button variant="outline" colorScheme="mint" leftIcon={<FiDownload />} onClick={handleExport}>
              İxrac et
            </Button>
          </HStack>
        </FunCard>

        <FunCard variant="colorful">
          <IconBadge icon={FiUpload} color="grape.600" />
          <Text fontFamily="heading" fontWeight="700" mb={2}>
            Excel import
          </Text>
          <Text fontSize="sm" color="navy.700" fontWeight="600" mb={4}>
            Excel faylından məlumat oxuyun.
          </Text>
          <Button as="label" variant="outline" colorScheme="grape" leftIcon={<FiUpload />} cursor="pointer">
            Fayl seç
            <Input type="file" accept=".xlsx,.xls" onChange={handleImport} display="none" />
          </Button>
        </FunCard>

        <FunCard variant="colorful">
          <IconBadge icon={FiRefreshCw} color="playful.600" />
          <Text fontFamily="heading" fontWeight="700" mb={2}>
            Yenilə
          </Text>
          <Text fontSize="sm" color="navy.700" fontWeight="600" mb={4}>
            Serverdən son məlumatları yükləyin.
          </Text>
          <Button variant="outline" colorScheme="playful" leftIcon={<FiRefreshCw />} onClick={loadAll} isDisabled={!isOnline}>
            Yenilə
          </Button>
        </FunCard>
      </SimpleGrid>

      {message && (
        <Alert status={messageType} borderRadius="fun" mb={6} fontWeight="600">
          <AlertIcon />
          {message}
        </Alert>
      )}

      <FunCard bg="cream.100" borderColor="playful.100">
        <SectionTitle icon={FiInfo} mb={3}>
          Texniki məlumat
        </SectionTitle>
        <List spacing={2} fontSize="sm" fontWeight="600" color="navy.700">
          <ListItem display="flex" alignItems="center" gap={2}>
            <Icon as={FiDatabase} boxSize={4} color="playful.500" />
            Oflayn: IndexedDB
          </ListItem>
          <ListItem display="flex" alignItems="center" gap={2}>
            <Icon as={FiCloud} boxSize={4} color="playful.500" />
            Backend: Supabase
          </ListItem>
          <ListItem display="flex" alignItems="center" gap={2}>
            <Icon as={FiFileText} boxSize={4} color="playful.500" />
            Excel: İxrac / Import
          </ListItem>
          <ListItem display="flex" alignItems="center" gap={2}>
            <Icon as={FiRefreshCw} boxSize={4} color="playful.500" />
            Sinxronizasiya: Avtomatik + əl ilə
          </ListItem>
        </List>
      </FunCard>
    </Box>
  );
}
