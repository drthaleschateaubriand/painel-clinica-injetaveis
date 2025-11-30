import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Dashboard.css';

function Dashboard({ session }) {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', procedure: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('patients')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([formData]);
        if (error) throw error;
      }
      setFormData({ name: '', email: '', phone: '', procedure: '' });
      fetchPatients();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchPatients();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const editPatient = (patient) => {
    setFormData(patient);
    setEditingId(patient.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Painel - Clínica D'Luca</h1>
        <button onClick={logout} className="logout-btn">Sair</button>
      </div>
      
      <div className="form-section">
        <h2>{editingId ? 'Editar Paciente' : 'Novo Paciente'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Procedimento"
            value={formData.procedure}
            onChange={(e) => setFormData({...formData, procedure: e.target.value})}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Adicionar')}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', procedure: '' }); }}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="patients-section">
        <h2>Pacientes</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Procedimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.phone}</td>
                <td>{patient.procedure}</td>
                <td>
                  <button onClick={() => editPatient(patient)}>Editar</button>
                  <button onClick={() => deletePatient(patient.id)}>Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
