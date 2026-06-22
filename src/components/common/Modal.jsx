import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
} from '@chakra-ui/react';

export default function AppModal({ isOpen, onClose, title, children, size = 'md' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={size}>
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
      <ModalContent mx={4} borderRadius="blob" border="4px solid" borderColor="playful.200" overflow="hidden">
        <Box bg="linear-gradient(90deg, playful.400, grape.400)" h="6px" />
        <ModalHeader fontFamily="heading" fontSize="xl" color="navy.800" pt={6}>
          {title}
        </ModalHeader>
        <ModalCloseButton top={4} borderRadius="full" _hover={{ bg: 'playful.50' }} />
        <ModalBody pb={8}>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
}
