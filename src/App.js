import { useState } from 'react';
import { ChakraProvider, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import LoginPage from './components/auth/LoginPage';
import MainLayout from './components/layout/MainLayout';
import DashboardPanel from './components/dashboard/DashboardPanel';
import TasksPanel from './components/tasks/TasksPanel';
import ResultsPanel from './components/results/ResultsPanel';
import ReportsPanel from './components/reports/ReportsPanel';
import SyncPanel from './components/sync/SyncPanel';
import SettingsPanel from './components/settings/SettingsPanel';
import ChildForm from './components/children/ChildForm';
import InstallPrompt from './components/common/InstallPrompt';
import theme from './theme';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { addOrUpdateChild } = useData();
  const [activeView, setActiveView] = useState('dashboard');
  const [showChildForm, setShowChildForm] = useState(false);

  const handleViewChange = (view) => {
    if (view === 'add-child') {
      setShowChildForm(true);
      setActiveView('dashboard');
    } else {
      setActiveView(view);
    }
  };

  const renderPanel = () => {
    switch (activeView) {
      case 'tasks':
        return <TasksPanel />;
      case 'results':
        return <ResultsPanel />;
      case 'reports':
        return <ReportsPanel />;
      case 'sync':
        return <SyncPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardPanel />;
    }
  };

  if (loading) {
    return (
      <Center minH="100vh" bg="cream.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="playful.500" thickness="5px" />
          <Text fontWeight="700" color="playful.600" fontSize="lg">
            Yüklənir...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <MainLayout activeView={activeView} onViewChange={handleViewChange}>
        {renderPanel()}
      </MainLayout>
      <ChildForm
        isOpen={showChildForm}
        onClose={() => setShowChildForm(false)}
        onSave={async (form, photo) => {
          await addOrUpdateChild(form, photo);
          setShowChildForm(false);
        }}
      />
      <InstallPrompt />
    </>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
