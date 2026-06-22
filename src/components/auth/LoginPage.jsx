import { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  ButtonGroup,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FiLock, FiMail, FiLogIn, FiStar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login, loginWithPin } = useAuth();
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'password') {
        await login(email, password);
      } else {
        await loginWithPin(pin);
      }
    } catch (err) {
      setError(err.message || 'Giriş uğursuz oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="cream.50"
      backgroundImage="radial-gradient(circle at 20% 30%, rgba(255,107,148,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,153,255,0.15) 0%, transparent 50%)"
      p={4}
    >
      <Box
        bg="white"
        p={{ base: 6, md: 10 }}
        borderRadius="blob"
        shadow="fun"
        w="full"
        maxW="440px"
        border="4px solid"
        borderColor="playful.200"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="8px"
          bg="linear-gradient(90deg, #FFD93D, #FF6B6B, #0099FF, #845EF7)"
        />

        <VStack spacing={2} mb={8} pt={4}>
          <Flex
            w="72px"
            h="72px"
            align="center"
            justify="center"
            bg="sunshine.100"
            borderRadius="full"
            boxShadow="pop"
          >
            <Icon as={FiStar} boxSize={9} color="sunshine.500" />
          </Flex>
          <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="navy.800" textAlign="center">
            Uşaqların Fəaliyyətləri
          </Text>
          <Text color="navy.700" fontSize="md" fontWeight="600">
            Admin girişi — gəlin başlayaq!
          </Text>
        </VStack>

        <ButtonGroup isAttached w="full" mb={6} size="lg">
          <Button
            flex={1}
            leftIcon={<FiMail />}
            variant={mode === 'password' ? 'solid' : 'outline'}
            colorScheme="playful"
            onClick={() => setMode('password')}
          >
            Email
          </Button>
          <Button
            flex={1}
            leftIcon={<FiLock />}
            variant={mode === 'pin' ? 'solid' : 'outline'}
            colorScheme="grape"
            onClick={() => setMode('pin')}
          >
            PIN
          </Button>
        </ButtonGroup>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            {mode === 'password' ? (
              <>
                <FormControl isRequired>
                  <FormLabel fontWeight="700" color="navy.700">
                    Email
                  </FormLabel>
                  <Input
                    variant="fun"
                    size="lg"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="700" color="navy.700">
                    Şifrə
                  </FormLabel>
                  <Input
                    variant="fun"
                    size="lg"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </FormControl>
              </>
            ) : (
              <FormControl isRequired>
                <FormLabel fontWeight="700" color="navy.700">
                  PIN kod
                </FormLabel>
                <Input
                  variant="fun"
                  size="lg"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  placeholder="• • • •"
                  textAlign="center"
                  letterSpacing="0.6em"
                  fontSize="2xl"
                  fontWeight="700"
                />
              </FormControl>
            )}

            {error && (
              <Alert status="error" borderRadius="fun" fontWeight="600">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Button type="submit" variant="fun" w="full" size="lg" isLoading={loading} mt={2} leftIcon={<FiLogIn />}>
              Daxil ol
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}
