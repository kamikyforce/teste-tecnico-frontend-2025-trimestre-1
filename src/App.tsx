import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { searchCEP } from './services/viaCep';
import { useAddressBook } from './hooks/useAddressBook';
import { Address } from './types/Address';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    marginBottom: '30px'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  filterContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px'
  },
  select: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px'
  },
  addressCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9'
  },
  addressText: {
    margin: '5px 0',
    fontSize: '14px'
  },
  buttonContainer: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px'
  },
  editButton: {
    padding: '8px 15px',
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deleteButton: {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '90%',
    position: 'relative' as const,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  modalHeader: {
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: 'bold' as const
  },
  modalInput: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  modalConfirmButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  modalCancelButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

function App() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [cep, setCep] = useState('');
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('username');
  
  const { addresses, saveAddress, updateAddress, deleteAddress } = useAddressBook();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cepData = await searchCEP(cep.replace(/\D/g, ''));
      const newAddress: Address = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        displayName,
        cep,
        logradouro: cepData.logradouro,
        bairro: cepData.bairro,
        cidade: cepData.localidade,
        estado: cepData.uf
      };
      
      saveAddress(newAddress);
      toast.success('Endereço adicionado com sucesso!');
      setUsername('');
      setDisplayName('');
      setCep('');
    } catch (error) {
      toast.error('Erro ao buscar o CEP!');
    }
  };

  const filteredAddresses = addresses.filter(addr => {
    if (!filter) return true;
    switch (filterType) {
      case 'username':
        return addr.username.toLowerCase().includes(filter.toLowerCase());
      case 'cidade':
        return addr.cidade.toLowerCase().includes(filter.toLowerCase());
      case 'estado':
        return addr.estado.toLowerCase().includes(filter.toLowerCase());
      case 'displayName':
        return addr.displayName.toLowerCase().includes(filter.toLowerCase());
      default:
        return true;
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');

  const handleEdit = (address: Address) => {
    setSelectedAddress(address);
    setNewDisplayName(address.displayName);
    setIsEditModalOpen(true);
  };

  const handleDelete = (address: Address) => {
    setSelectedAddress(address);
    setIsDeleteModalOpen(true);
  };

  const handleEditConfirm = () => {
    if (selectedAddress && newDisplayName.trim()) {
      updateAddress(selectedAddress.id, { displayName: newDisplayName });
      toast.success('Nome atualizado com sucesso!');
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedAddress) {
      deleteAddress(selectedAddress.id);
      toast.success('Endereço excluído com sucesso!');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Catálogo de Endereços</h1>
      
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          placeholder="Nome do usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          style={styles.input}
          placeholder="Nome de exibição do endereço"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          style={styles.input}
          placeholder="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          required
        />
        <button type="submit" style={styles.button}>
          Adicionar Endereço
        </button>
      </form>

      <div style={styles.filterContainer}>
        <select 
          style={styles.select}
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="username">Usuário</option>
          <option value="cidade">Cidade</option>
          <option value="estado">Estado</option>
          <option value="displayName">Nome de Exibição</option>
        </select>
        <input
          style={styles.input}
          placeholder="Filtrar..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {filteredAddresses.length === 0 ? (
        <p>Nenhum endereço encontrado.</p>
      ) : (
        filteredAddresses.map(addr => (
          <div key={addr.id} style={styles.addressCard}>
            <div style={styles.addressText}>
              <strong>Usuário:</strong> {addr.username}
            </div>
            <div style={styles.addressText}>
              <strong>Nome de Exibição:</strong> {addr.displayName}
            </div>
            <div style={styles.addressText}>
              <strong>Endereço:</strong> {addr.logradouro}, {addr.bairro}
            </div>
            <div style={styles.addressText}>
              <strong>Cidade/Estado:</strong> {addr.cidade}/{addr.estado}
            </div>
            <div style={styles.addressText}>
              <strong>CEP:</strong> {addr.cep}
            </div>
            
            <div style={styles.buttonContainer}>
              <button
                style={styles.editButton}
                onClick={() => handleEdit(addr)}
              >
                Editar Nome
              </button>
              <button
                style={styles.deleteButton}
                onClick={() => handleDelete(addr)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))
      )}
      
      {isEditModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>Editar Nome de Exibição</div>
            <input
              style={styles.modalInput}
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Novo nome de exibição"
            />
            <div style={styles.modalButtons}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                style={styles.modalConfirmButton}
                onClick={handleEditConfirm}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>Confirmar Exclusão</div>
            <p>Tem certeza que deseja excluir este endereço?</p>
            <div style={styles.modalButtons}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                style={styles.modalConfirmButton}
                onClick={handleDeleteConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer />
    </div>
  );
}

export default App;