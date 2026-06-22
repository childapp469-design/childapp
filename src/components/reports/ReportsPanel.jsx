import { useMemo } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useTheme,
  Icon,
  Flex,
} from '@chakra-ui/react';
import {
  FiBarChart2,
  FiAward,
  FiTrendingUp,
  FiCheckCircle,
  FiZap,
  FiUsers,
  FiActivity,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useData } from '../../contexts/DataContext';
import { getReportStats } from '../../lib/scores';
import { getWeekRange, getMonthRange } from '../../lib/dateUtils';
import PeriodTabs from '../common/PeriodTabs';
import { PageHeader, FunCard, SectionTitle } from '../ui/FunCard';

function StatBubble({ icon, label, value, sub, gradient }) {
  const StatIcon = icon;
  return (
    <Box
      bg={gradient || 'white'}
      p={5}
      borderRadius="blob"
      boxShadow="card"
      border="3px solid"
      borderColor="white"
      textAlign="center"
      minH="120px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Flex justify="center" mb={1}>
        <Icon as={StatIcon} boxSize={7} color={gradient ? 'white' : 'playful.500'} />
      </Flex>
      <Text fontSize="sm" fontWeight="700" color={gradient ? 'whiteAlpha.900' : 'navy.700'} mb={1}>
        {label}
      </Text>
      <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color={gradient ? 'white' : 'navy.800'}>
        {value}
      </Text>
      {sub && (
        <Text fontSize="sm" fontWeight="600" color={gradient ? 'whiteAlpha.800' : 'navy.700'} mt={1}>
          {sub}
        </Text>
      )}
    </Box>
  );
}

export default function ReportsPanel() {
  const { activeChildren, completions, adjustments, selectedDate, setSelectedDate } = useData();
  const theme = useTheme();
  const brandColor = theme.colors.playful[500];

  const dateRange = useMemo(() => {
    if (selectedDate === 'week') return getWeekRange();
    if (selectedDate === 'month') return getMonthRange();
    return { start: selectedDate, end: selectedDate };
  }, [selectedDate]);

  const stats = useMemo(
    () => getReportStats(activeChildren, completions, adjustments, dateRange),
    [activeChildren, completions, adjustments, dateRange]
  );

  const chartData = stats.childScores.map((c) => ({
    name: c.first_name,
    bal: c.points,
  }));

  const dailyTrend = useMemo(() => {
    const map = {};
    completions.forEach((c) => {
      if (!map[c.completed_date]) map[c.completed_date] = 0;
      map[c.completed_date] += c.points_earned || 0;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, bal]) => ({ date: date.slice(5), bal }));
  }, [completions]);

  return (
    <Box>
      <PageHeader icon={FiBarChart2} title="Hesabatlar" subtitle="Statistika və qrafiklər" />

      <Box mb={6}>
        <PeriodTabs selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </Box>

      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
        <StatBubble icon={FiAward} label="Ümumi bal" value={stats.totalPoints} />
        <StatBubble icon={FiTrendingUp} label="Ortalama" value={stats.avgPoints} />
        <StatBubble icon={FiCheckCircle} label="Tapşırıq" value={stats.totalTasks} />
        <StatBubble
          icon={FiAward}
          label="Ən çox bal"
          value={stats.topScorer?.first_name || '—'}
          sub={`${stats.topScorer?.points || 0} bal`}
          gradient="linear-gradient(135deg, #0099FF, #845EF7)"
        />
        <StatBubble
          icon={FiZap}
          label="Ən aktiv"
          value={stats.mostActive?.first_name || '—'}
          sub={`${stats.mostActive?.taskCount || 0} tapşırıq`}
          gradient="linear-gradient(135deg, #FFD93D, #FF6B6B)"
        />
      </SimpleGrid>

      {chartData.length > 0 && (
        <FunCard mb={6}>
          <SectionTitle icon={FiBarChart2}>Uşaq üzrə bal</SectionTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F7FF" />
              <XAxis dataKey="name" tick={{ fontWeight: 600 }} />
              <YAxis tick={{ fontWeight: 600 }} />
              <Tooltip />
              <Bar dataKey="bal" fill={brandColor} name="Bal" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </FunCard>
      )}

      {dailyTrend.length > 0 && (
        <FunCard mb={6}>
          <SectionTitle icon={FiActivity}>Günlük trend (son 14 gün)</SectionTitle>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F7FF" />
              <XAxis dataKey="date" tick={{ fontWeight: 600 }} />
              <YAxis tick={{ fontWeight: 600 }} />
              <Tooltip />
              <Line type="monotone" dataKey="bal" stroke="#20C997" strokeWidth={3} dot={{ r: 5 }} name="Bal" />
            </LineChart>
          </ResponsiveContainer>
        </FunCard>
      )}

      <FunCard>
        <SectionTitle icon={FiUsers}>Uşaq üzrə detallar</SectionTitle>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr bg="sunshine.50">
                <Th color="navy.800">Uşaq</Th>
                <Th color="navy.800" isNumeric>
                  Bal
                </Th>
                <Th color="navy.800" isNumeric>
                  Ulduz
                </Th>
                <Th color="navy.800" isNumeric>
                  Tapşırıq
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.childScores
                .sort((a, b) => b.points - a.points)
                .map((c, i) => (
                  <Tr key={c.id} bg={i % 2 === 0 ? 'white' : 'cream.50'}>
                    <Td fontWeight="700">
                      {c.first_name} {c.last_name || ''}
                    </Td>
                    <Td isNumeric fontWeight="700" color="playful.600">
                      {c.points}
                    </Td>
                    <Td isNumeric fontWeight="600">
                      {c.stars}
                    </Td>
                    <Td isNumeric fontWeight="600">
                      {c.taskCount}
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>
      </FunCard>
    </Box>
  );
}
