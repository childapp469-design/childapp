import { Box, Flex, Icon } from '@chakra-ui/react';

const variants = {
  default: {
    bg: 'white',
    borderRadius: 'blob',
    p: 5,
    boxShadow: 'card',
    border: '3px solid',
    borderColor: 'playful.100',
  },
  colorful: {
    bg: 'linear-gradient(145deg, white 0%, #E8F7FF 100%)',
    borderRadius: 'blob',
    p: 5,
    boxShadow: 'card',
    border: '3px solid',
    borderColor: 'playful.200',
  },
  child: {
    bg: 'white',
    borderRadius: 'blob',
    overflow: 'hidden',
    boxShadow: 'fun',
    border: '3px solid',
    borderColor: 'sunshine.200',
  },
};

export function FunCard({ variant = 'default', children, ...rest }) {
  return (
    <Box {...variants[variant]} {...rest}>
      {children}
    </Box>
  );
}

export function PageHeader({ title, subtitle, icon, action }) {
  const HeaderIcon = icon;
  return (
    <Box mb={6}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={4}>
        <Box>
          <Flex align="center" gap={3}>
            {HeaderIcon && (
              <Flex
                w="52px"
                h="52px"
                align="center"
                justify="center"
                bg="sunshine.100"
                borderRadius="full"
                boxShadow="pop"
                flexShrink={0}
              >
                <Icon as={HeaderIcon} boxSize={6} color="sunshine.600" />
              </Flex>
            )}
            <Box as="h1" fontFamily="heading" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="700" color="navy.800">
              {title}
            </Box>
          </Flex>
          {subtitle && (
            <Box mt={1} ml={HeaderIcon ? '64px' : 0} color="navy.700" fontSize="md" fontWeight="600">
              {subtitle}
            </Box>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
}

export function SectionTitle({ icon, children, mb = 4 }) {
  const SectionIcon = icon;
  return (
    <Flex align="center" gap={2} mb={mb}>
      {SectionIcon && <Icon as={SectionIcon} boxSize={5} color="playful.600" />}
      <Box as="span" fontFamily="heading" fontWeight="700" fontSize="lg">
        {children}
      </Box>
    </Flex>
  );
}

export function IconBadge({ icon, color = 'playful.600', size = 8 }) {
  const BadgeIcon = icon;
  return (
    <Flex
      w={size}
      h={size}
      align="center"
      justify="center"
      bg="playful.50"
      borderRadius="full"
      mb={2}
    >
      <Icon as={BadgeIcon} boxSize={size / 2} color={color} />
    </Flex>
  );
}
