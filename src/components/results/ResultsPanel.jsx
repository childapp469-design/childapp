import { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiCheckCircle, FiStar, FiTool } from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import { calculateScores } from '../../lib/scores';
import { todayISO, getWeekRange, getMonthRange, formatDate } from '../../lib/dateUtils';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import PeriodTabs from '../common/PeriodTabs';
import { PageHeader, FunCard, SectionTitle } from '../ui/FunCard';

export default function ResultsPanel() {
  const {
    activeChildren,
    completions,
    adjustments,
    addAdjustment,
    removeAdjustment,
    selectedDate,
    setSelectedDate,
  } = useData();

  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    child_id: '',
    points_delta: 0,
    stars_delta: 0,
    reason: '',
    adjustment_date: todayISO(),
  });

  const getDateRange = () => {
    if (selectedDate === 'week') return getWeekRange();
    if (selectedDate === 'month') return getMonthRange();
    return { start: selectedDate, end: selectedDate };
  };

  const dateRange = getDateRange();

  const filteredCompletions = completions.filter(
    (c) => c.completed_date >= dateRange.start && c.completed_date <= dateRange.end
  );

  const filteredAdjustments = adjustments.filter(
    (a) => a.adjustment_date >= dateRange.start && a.adjustment_date <= dateRange.end
  );

  const handleAddAdjustment = async (e) => {
    e.preventDefault();
    await addAdjustment(form);
    setShowAdjustForm(false);
    setForm({
      child_id: '',
      points_delta: 0,
      stars_delta: 0,
      reason: '',
      adjustment_date: todayISO(),
    });
  };

  const handleDeleteAdjustment = async () => {
    if (deleteTarget) {
      await removeAdjustment(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <PageHeader icon={FiCheckCircle} title="Nəticələr" subtitle="Bal və tapşırıq nəticələrinə baxın" />

      <Flex gap={4} mb={6} flexWrap="wrap" align="center">
        <Input
          type="date"
          variant="fun"
          size="lg"
          value={selectedDate === 'week' || selectedDate === 'month' ? todayISO() : selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          w="auto"
          bg="white"
        />
        <PeriodTabs selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        <Button colorScheme="grape" size="lg" leftIcon={<FiPlus />} onClick={() => setShowAdjustForm(true)}>
          Bal düzəlişi
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mb={8}>
        {activeChildren.map((child, i) => {
          const scores = calculateScores(child.id, completions, adjustments, dateRange);
          const childCompletions = filteredCompletions.filter((c) => c.child_id === child.id);
          const colors = ['playful', 'mint', 'bubblegum', 'sunshine', 'grape'];
          const c = colors[i % colors.length];
          return (
            <FunCard key={child.id} borderColor={`${c}.200`}>
              <Text fontFamily="heading" fontWeight="700" fontSize="lg" mb={3}>
                {child.first_name} {child.last_name || ''}
              </Text>
              <HStack spacing={2} mb={3}>
                <Badge colorScheme={c} fontSize="sm" display="flex" alignItems="center" gap={1}>
                  <Icon as={FiStar} boxSize={3} />
                  {scores.points} bal
                </Badge>
                {scores.stars > 0 && (
                  <Badge colorScheme="sunshine" display="flex" alignItems="center" gap={1}>
                    <Icon as={FiStar} boxSize={3} fill="#FAB005" />
                    {scores.stars}
                  </Badge>
                )}
              </HStack>
              <VStack align="stretch" spacing={1}>
                {childCompletions.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" fontWeight="600">
                    Bu dövrdə tapşırıq yoxdur
                  </Text>
                ) : (
                  childCompletions.map((comp) => (
                    <Text key={comp.id} fontSize="sm" fontWeight="600" color="navy.700">
                      ✓ {formatDate(comp.completed_date)} — +{comp.points_earned} bal
                    </Text>
                  ))
                )}
              </VStack>
            </FunCard>
          );
        })}
      </SimpleGrid>

      {filteredAdjustments.length > 0 && (
        <FunCard>
          <SectionTitle icon={FiTool}>Bal düzəlişləri</SectionTitle>
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr bg="playful.50">
                  <Th color="navy.800">Tarix</Th>
                  <Th color="navy.800">Uşaq</Th>
                  <Th color="navy.800">Bal</Th>
                  <Th color="navy.800">Ulduz</Th>
                  <Th color="navy.800">Səbəb</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAdjustments.map((adj) => {
                  const child = activeChildren.find((ch) => ch.id === adj.child_id);
                  return (
                    <Tr key={adj.id} _hover={{ bg: 'cream.100' }}>
                      <Td fontWeight="600">{formatDate(adj.adjustment_date)}</Td>
                      <Td fontWeight="600">{child?.first_name}</Td>
                      <Td fontWeight="700" color={adj.points_delta >= 0 ? 'mint.600' : 'bubblegum.600'}>
                        {adj.points_delta > 0 ? '+' : ''}
                        {adj.points_delta}
                      </Td>
                      <Td>{adj.stars_delta}</Td>
                      <Td>{adj.reason}</Td>
                      <Td>
                        <Button size="xs" colorScheme="bubblegum" variant="ghost" leftIcon={<FiTrash2 />} onClick={() => setDeleteTarget(adj)}>
                          Sil
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </FunCard>
      )}

      <Modal isOpen={showAdjustForm} onClose={() => setShowAdjustForm(false)} title="Bal düzəlişi">
        <form onSubmit={handleAddAdjustment}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="700">Uşaq</FormLabel>
              <Select
                value={form.child_id}
                onChange={(e) => setForm({ ...form, child_id: e.target.value })}
                placeholder="Seçin..."
                size="lg"
              >
                {activeChildren.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.first_name} {ch.last_name || ''}
                  </option>
                ))}
              </Select>
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="700">Bal dəyişikliyi</FormLabel>
                <Input variant="fun" type="number" value={form.points_delta} onChange={(e) => setForm({ ...form, points_delta: parseInt(e.target.value) || 0 })} />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="700">Ulduz</FormLabel>
                <Input variant="fun" type="number" value={form.stars_delta} onChange={(e) => setForm({ ...form, stars_delta: parseInt(e.target.value) || 0 })} />
              </FormControl>
            </HStack>
            <FormControl>
              <FormLabel fontWeight="700">Tarix</FormLabel>
              <Input variant="fun" type="date" value={form.adjustment_date} onChange={(e) => setForm({ ...form, adjustment_date: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="700">Səbəb</FormLabel>
              <Input variant="fun" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Düzəliş səbəbi" />
            </FormControl>
            <HStack justify="flex-end" pt={2} spacing={3}>
              <Button variant="outline" colorScheme="gray" onClick={() => setShowAdjustForm(false)}>
                Ləğv et
              </Button>
              <Button type="submit" colorScheme="grape">
                Saxla
              </Button>
            </HStack>
          </VStack>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAdjustment}
        title="Düzəlişi silmək"
        message="Bu bal düzəlişini silmək istəyirsiniz?"
      />
    </Box>
  );
}
