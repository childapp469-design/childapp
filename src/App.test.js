jest.mock('./lib/indexedDB', () => ({
  getAllFromStore: jest.fn().mockResolvedValue([]),
  putInStore: jest.fn(),
  putManyInStore: jest.fn(),
  deleteFromStore: jest.fn(),
  addToSyncQueue: jest.fn(),
  getSyncQueue: jest.fn().mockResolvedValue([]),
  removeFromSyncQueue: jest.fn(),
  STORES: {},
}));

jest.mock('./theme', () => ({}));

jest.mock('@chakra-ui/react', () => {
  const React = require('react');
  const Mock = ({ children }) => React.createElement('div', null, children);
  return {
    ChakraProvider: Mock,
    Center: Mock,
    Spinner: () => React.createElement('div', null, 'Loading'),
    Box: Mock,
    Flex: Mock,
    VStack: Mock,
    HStack: Mock,
    Text: ({ children }) => React.createElement('span', null, children),
    Button: ({ children, ...props }) => React.createElement('button', props, children),
    Heading: ({ children }) => React.createElement('h1', null, children),
    Input: (props) => React.createElement('input', props),
    FormControl: Mock,
    FormLabel: ({ children }) => React.createElement('label', null, children),
    Alert: Mock,
    AlertIcon: Mock,
    ButtonGroup: Mock,
    Badge: ({ children }) => React.createElement('span', null, children),
    Icon: Mock,
    Avatar: Mock,
    IconButton: (props) => React.createElement('button', props),
    SimpleGrid: Mock,
    Textarea: (props) => React.createElement('textarea', props),
    Table: Mock,
    Thead: Mock,
    Tbody: Mock,
    Tr: Mock,
    Th: Mock,
    Td: Mock,
    Select: (props) => React.createElement('select', props),
    Stat: Mock,
    StatLabel: Mock,
    StatNumber: Mock,
    StatHelpText: Mock,
    List: Mock,
    ListItem: ({ children }) => React.createElement('li', null, children),
    Modal: Mock,
    ModalOverlay: Mock,
    ModalContent: Mock,
    ModalHeader: ({ children }) => React.createElement('h2', null, children),
    ModalBody: Mock,
    ModalCloseButton: Mock,
    AlertDialog: Mock,
    AlertDialogOverlay: Mock,
    AlertDialogContent: Mock,
    AlertDialogHeader: Mock,
    AlertDialogBody: Mock,
    AlertDialogFooter: Mock,
    InputGroup: Mock,
    InputLeftElement: Mock,
    useTheme: () => ({ colors: { brand: { 600: '#4f46e5' } } }),
  };
});

import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders app shell', async () => {
  render(<App />);
  await waitFor(() => {
    const heading = screen.getByText(/Uşaqlar/i);
    expect(heading).toBeInTheDocument();
  });
});
