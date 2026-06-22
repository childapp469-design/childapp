import { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  Input,
  Spinner,
  Center,
  VStack,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiHome, FiUsers } from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import ChildColumn from '../children/ChildColumn';
import ChildForm from '../children/ChildForm';
import ConfirmDialog from '../common/ConfirmDialog';
import SearchBar from '../common/SearchBar';
import PeriodTabs from '../common/PeriodTabs';
import { PageHeader } from '../ui/FunCard';
import { todayISO, formatDate } from '../../lib/dateUtils';

export default function DashboardPanel() {
  const {
    filteredChildren,
    loading,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    addOrUpdateChild,
    removeChild,
  } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editChild, setEditChild] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSave = async (form, photoFile) => {
    await addOrUpdateChild(form, photoFile);
  };

  const handleEdit = (child) => {
    setEditChild(child);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await removeChild(deleteTarget.id);
      setDeleteTarget(null);
      setEditChild(null);
      setShowForm(false);
    }
  };

  if (loading) {
    return (
      <Center py={24}>
        <VStack spacing={4}>
          <Spinner size="xl" color="playful.500" thickness="5px" speed="0.8s" />
          <Text fontWeight="700" color="playful.600" fontSize="lg">
            Yüklənir...
          </Text>
        </VStack>
      </Center>
    );
  }

  const dateLabel =
    selectedDate === 'week'
      ? 'Həftəlik nəticələr'
      : selectedDate === 'month'
      ? 'Aylıq nəticələr'
      : formatDate(selectedDate);

  return (
    <Box>
      <PageHeader
        icon={FiHome}
        title="Operasional Panel"
        subtitle={dateLabel}
        action={
          <Button
            colorScheme="bubblegum"
            size="lg"
            leftIcon={<FiPlus />}
            onClick={() => {
              setEditChild(null);
              setShowForm(true);
            }}
          >
            Uşaq əlavə et
          </Button>
        }
      />

      <Flex gap={4} mb={6} flexWrap="wrap" align="center">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Uşaq axtar..." />
        <Input
          type="date"
          variant="fun"
          value={selectedDate === 'week' || selectedDate === 'month' ? todayISO() : selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          w="auto"
          size="lg"
          bg="white"
        />
        <PeriodTabs selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </Flex>

      {filteredChildren.length === 0 ? (
        <Center py={20}>
          <VStack spacing={5}>
            <Flex
              w="80px"
              h="80px"
              align="center"
              justify="center"
              bg="playful.100"
              borderRadius="full"
              boxShadow="pop"
            >
              <Icon as={FiUsers} boxSize={10} color="playful.500" />
            </Flex>
            <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="navy.700">
              Hələ uşaq yoxdur!
            </Text>
            <Text color="navy.700" fontWeight="600">
              İlk uşağı əlavə edərək başlayaq
            </Text>
            <Button colorScheme="playful" size="lg" leftIcon={<FiPlus />} onClick={() => setShowForm(true)}>
              İlk uşağı əlavə et
            </Button>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={5}>
          {filteredChildren.map((child, i) => (
            <ChildColumn key={child.id} child={child} onEdit={handleEdit} colorIndex={i} />
          ))}
        </SimpleGrid>
      )}

      <ChildForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditChild(null);
        }}
        onSave={handleSave}
        child={editChild}
      />

      {editChild && (
        <Box mt={6}>
          <Button
            colorScheme="bubblegum"
            variant="outline"
            size="md"
            leftIcon={<FiTrash2 />}
            onClick={() => setDeleteTarget(editChild)}
          >
            Uşağı arxivə köçür
          </Button>
        </Box>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Uşağı silmək"
        message={`"${deleteTarget?.first_name}" adlı uşağı arxivə köçürmək istəyirsiniz? Məlumatlar silinməyəcək.`}
      />
    </Box>
  );
}
