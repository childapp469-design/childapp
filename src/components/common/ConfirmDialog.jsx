import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Box,
} from '@chakra-ui/react';
import { useRef } from 'react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  const cancelRef = useRef();

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay bg="blackAlpha.400" backdropFilter="blur(4px)">
        <AlertDialogContent mx={4} borderRadius="blob" border="4px solid" borderColor="bubblegum.200">
          <Box bg="bubblegum.400" h="6px" />
          <AlertDialogHeader fontFamily="heading" fontSize="xl" color="navy.800">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody color="navy.700" fontWeight="600" fontSize="md">
            {message}
          </AlertDialogBody>
          <AlertDialogFooter pb={6}>
            <Button ref={cancelRef} onClick={onClose} variant="outline" colorScheme="gray" mr={3}>
              Ləğv et
            </Button>
            <Button colorScheme="bubblegum" onClick={onConfirm}>
              Təsdiq et
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
