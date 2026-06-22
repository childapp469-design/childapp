import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ value, onChange, placeholder = 'Axtar...' }) {
  return (
    <InputGroup maxW={{ base: 'full', md: '280px' }}>
      <InputLeftElement pointerEvents="none" h="full">
        <FiSearch color="#0099FF" size={18} />
      </InputLeftElement>
      <Input
        variant="fun"
        pl={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        bg="white"
        size="lg"
      />
    </InputGroup>
  );
}
