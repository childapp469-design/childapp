import { useEffect, useState } from 'react';
import { Box, Button, Flex, Text, IconButton, Icon } from '@chakra-ui/react';
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa_install_dismissed') === 'true'
  );
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (isInstalled || dismissed || !deferredPrompt) return null;

  return (
    <Box
      position="fixed"
      bottom={{ base: '80px', lg: 6 }}
      left={{ base: 4, lg: 'auto' }}
      right={{ base: 4, lg: 6 }}
      zIndex={200}
      bg="white"
      borderRadius="fun"
      boxShadow="fun"
      border="3px solid"
      borderColor="playful.200"
      p={4}
      maxW="400px"
      ml={{ lg: 'auto' }}
    >
      <Flex align="start" gap={3}>
        <Icon as={FiSmartphone} boxSize={8} color="playful.500" flexShrink={0} />
        <Box flex={1}>
          <Text fontFamily="heading" fontWeight="700" color="navy.800" mb={1}>
            Tətbiqi yüklə
          </Text>
          <Text fontSize="sm" color="navy.700" fontWeight="600" mb={3}>
            Uşaqlar App-i telefonunuza və ya kompüterinizə quraşdırın.
          </Text>
          <Button size="sm" colorScheme="playful" leftIcon={<FiDownload />} onClick={handleInstall}>
            Yüklə
          </Button>
        </Box>
        <IconButton
          aria-label="Bağla"
          icon={<FiX />}
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
        />
      </Flex>
    </Box>
  );
}
