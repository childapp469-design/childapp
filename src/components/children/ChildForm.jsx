import { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { FiCamera, FiSave } from 'react-icons/fi';
import Modal from '../common/Modal';

export default function ChildForm({ isOpen, onClose, onSave, child = null }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    notes: '',
    photo_url: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (child) {
      setForm({
        first_name: child.first_name || '',
        last_name: child.last_name || '',
        notes: child.notes || '',
        photo_url: child.photo_url || '',
        id: child.id,
      });
      setPreview(child.photo_url || null);
    } else {
      setForm({ first_name: '', last_name: '', notes: '', photo_url: '' });
      setPreview(null);
    }
    setPhotoFile(null);
  }, [child, isOpen]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form, photoFile);
      onClose();
    } catch (err) {
      toast({
        title: 'Uşaq saxlanılmadı',
        description: err?.message || 'Naməlum xəta baş verdi',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={child ? 'Uşağı redaktə et' : 'Yeni uşaq əlavə et'}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5} align="stretch">
          <FormControl>
            <FormLabel fontWeight="700" color="navy.700">
              Şəkil
            </FormLabel>
            <VStack spacing={3} py={2}>
              <Avatar size="2xl" name={form.first_name} src={preview} border="4px solid" borderColor="playful.200" />
              <Button as="label" leftIcon={<FiCamera />} colorScheme="playful" variant="outline" cursor="pointer" size="md">
                Şəkil seç
                <Input type="file" accept="image/*" onChange={handlePhotoChange} display="none" />
              </Button>
            </VStack>
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="700" color="navy.700">
              Ad
            </FormLabel>
            <Input
              variant="fun"
              size="lg"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="Uşağın adı"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="700" color="navy.700">
              Soyad
            </FormLabel>
            <Input
              variant="fun"
              size="lg"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="Soyad (opsional)"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="700" color="navy.700">
              Qeyd
            </FormLabel>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Xüsusi qeydlər..."
            />
          </FormControl>

          <HStack justify="flex-end" pt={2} spacing={3}>
            <Button variant="outline" colorScheme="gray" onClick={onClose} size="lg">
              Ləğv et
            </Button>
            <Button type="submit" colorScheme="playful" size="lg" isLoading={saving} leftIcon={<FiSave />}>
              Saxla
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  );
}
