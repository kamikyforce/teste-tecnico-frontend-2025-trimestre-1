import { useState, useEffect, useCallback } from 'react';
import { Address } from '../types/Address';

const STORAGE_KEY = 'address_book';
const getInitialState = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as Address[] : [];
  } catch (error) {
    console.error('Error reading addresses:', error);
    return [];
  }
};

export const useAddressBook = () => {
  const [addresses, setAddresses] = useState<Address[]>(getInitialState);

  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  }, [addresses]);

  const saveAddress = useCallback((address: Address) => {
    setAddresses(prev => {
      const exists = prev.some(a => a.id === address.id);
      return exists ? prev : [...prev, address];
    });
  }, []);

  const updateAddress = useCallback((id: string, update: Partial<Address>) => {
    setAddresses(prev => prev.map(addr => 
      addr.id === id ? { ...addr, ...update } : addr
    ));
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  }, []);

  return { 
    addresses,
    saveAddress,
    updateAddress,
    deleteAddress
  };
};