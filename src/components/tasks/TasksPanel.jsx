import { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Flex,
  Center,
  Icon,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiClipboard, FiFileText, FiStar, FiSave } from 'react-icons/fi';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { PageHeader, FunCard, IconBadge } from '../ui/FunCard';
import { useData } from '../../contexts/DataContext';

const CARD_ACCENTS = ['playful', 'sunshine', 'mint', 'grape', 'bubblegum'];

export default function TasksPanel() {
  const { taskList, addOrUpdateTask, removeTask } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', points: 0, stars: 0 });

  const openCreate = () => {
    setEditTask(null);
    setForm({ name: '', description: '', points: 0, stars: 0 });
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      name: task.name,
      description: task.description || '',
      points: task.points || 0,
      stars: task.stars || 0,
      id: task.id,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await addOrUpdateTask({ ...form, is_active: true });
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await removeTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <PageHeader
        icon={FiClipboard}
        title="Tapşırıqlar"
        subtitle="Uşaqlar üçün gündəlik tapşırıqlar yaradın"
        action={
          <Button colorScheme="sunshine" size="lg" leftIcon={<FiPlus />} onClick={openCreate}>
            Yeni tapşırıq
          </Button>
        }
      />

      {taskList.length === 0 ? (
        <Center py={20}>
          <VStack spacing={4}>
            <IconBadge icon={FiFileText} size={16} color="sunshine.600" />
            <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="navy.700">
              Hələ tapşırıq yoxdur
            </Text>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
          {taskList.map((task, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <FunCard key={task.id} variant="colorful" borderColor={`${accent}.200`}>
                <Box
                  w="full"
                  h="6px"
                  bg={`${accent}.400`}
                  borderRadius="full"
                  mb={4}
                  mt={-1}
                />
                <Text fontFamily="heading" fontWeight="700" fontSize="lg" color="navy.800" mb={2}>
                  {task.name}
                </Text>
                {task.description && (
                  <Text fontSize="sm" color="navy.700" mb={3} fontWeight="600">
                    {task.description}
                  </Text>
                )}
                <HStack spacing={2} mb={4}>
                  <Badge colorScheme="playful" display="flex" alignItems="center" gap={1}>
                    <Icon as={FiStar} boxSize={3} />
                    {task.points} bal
                  </Badge>
                  {task.stars > 0 && (
                    <Badge colorScheme="sunshine" display="flex" alignItems="center" gap={1}>
                      <Icon as={FiStar} boxSize={3} fill="#FAB005" />
                      {task.stars} ulduz
                    </Badge>
                  )}
                </HStack>
                <Flex gap={2}>
                  <Button size="sm" variant="outline" colorScheme={accent} leftIcon={<FiEdit2 />} onClick={() => openEdit(task)}>
                    Redaktə
                  </Button>
                  <Button size="sm" variant="outline" colorScheme="bubblegum" leftIcon={<FiTrash2 />} onClick={() => setDeleteTarget(task)}>
                    Sil
                  </Button>
                </Flex>
              </FunCard>
            );
          })}
        </SimpleGrid>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editTask ? 'Tapşırığı redaktə et' : 'Yeni tapşırıq'}>
        <form onSubmit={handleSave}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="700">Tapşırıq adı</FormLabel>
              <Input variant="fun" size="lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Məs: Dərs oxumaq" />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="700">Təsvir</FormLabel>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="700">Bal</FormLabel>
                <Input variant="fun" type="number" min="0" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })} />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="700">Ulduz</FormLabel>
                <Input variant="fun" type="number" min="0" max="5" value={form.stars} onChange={(e) => setForm({ ...form, stars: parseInt(e.target.value) || 0 })} />
              </FormControl>
            </HStack>
            <HStack justify="flex-end" pt={2} spacing={3}>
              <Button variant="outline" colorScheme="gray" onClick={() => setShowForm(false)}>
                Ləğv et
              </Button>
              <Button type="submit" colorScheme="playful" leftIcon={<FiSave />}>
                Saxla
              </Button>
            </HStack>
          </VStack>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Tapşırığı silmək"
        message={`"${deleteTarget?.name}" tapşırığını silmək istəyirsiniz?`}
      />
    </Box>
  );
}
