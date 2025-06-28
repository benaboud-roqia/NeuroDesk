import React, { useState, useEffect } from 'react';

interface RendezVous {
  id: number;
  patient: string;
  medecin: string;
  date: string;
  heure: string;
  motif: string;
}

const STORAGE_KEY = 'neurodesktop_rendezvous';

const RendezVousPage: React.FC = () => {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [form, setForm] = useState<Omit<RendezVous, 'id'>>({ patient: '', medecin: '', date: '', heure: '', motif: '' });
  const [editId, setEditId] = useState<number|null>(null);

  // Charger depuis localStorage au montage
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      setRdvs(JSON.parse(data));
    } else {
      // Aucun rendez-vous - l'utilisateur devra les ajouter manuellement
      setRdvs([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, []);
  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rdvs));
  }, [rdvs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient || !form.medecin || !form.date || !form.heure) return;
    if (editId !== null) {
      setRdvs(rdvs.map(r => r.id === editId ? { ...r, ...form } : r));
      setEditId(null);
    } else {
      setRdvs([{ id: Date.now(), ...form }, ...rdvs]);
    }
    setForm({ patient: '', medecin: '', date: '', heure: '', motif: '' });
  };

  const handleEdit = (id: number) => {
    const r = rdvs.find(r => r.id === id);
    if (r) {
      setForm({ patient: r.patient, medecin: r.medecin, date: r.date, heure: r.heure, motif: r.motif });
      setEditId(id);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Supprimer ce rendez-vous ?')) setRdvs(rdvs.filter(r => r.id !== id));
  };

  return (
    <div style={{padding: 32}}>
      <h2>Rendez-vous</h2>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        <input name="patient" value={form.patient} onChange={handleChange} placeholder="Patient" className="form-control" required />
        <input name="medecin" value={form.medecin} onChange={handleChange} placeholder="Médecin" className="form-control" required />
        <input name="date" value={form.date} onChange={handleChange} type="date" className="form-control" required />
        <input name="heure" value={form.heure} onChange={handleChange} type="time" className="form-control" required />
        <input name="motif" value={form.motif} onChange={handleChange} placeholder="Motif" className="form-control" />
        <button type="submit" className="btn btn-success">{editId !== null ? 'Modifier' : 'Ajouter'}</button>
        {editId !== null && <button type="button" className="btn btn-secondary" onClick={()=>{setEditId(null);setForm({ patient: '', medecin: '', date: '', heure: '', motif: '' });}}>Annuler</button>}
      </form>
      <table className="table" style={{width:'100%',background:'#fff',borderRadius:8,overflow:'hidden'}}>
        <thead><tr><th>Patient</th><th>Médecin</th><th>Date</th><th>Heure</th><th>Motif</th><th>Actions</th></tr></thead>
        <tbody>
          {rdvs.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',color:'#888'}}>Aucun rendez-vous enregistré</td></tr>}
          {rdvs.map(r => (
            <tr key={r.id}>
              <td>{r.patient}</td>
              <td>{r.medecin}</td>
              <td>{r.date}</td>
              <td>{r.heure}</td>
              <td>{r.motif}</td>
              <td>
                <button className="btn btn-info btn-xs" onClick={()=>handleEdit(r.id)}>Modifier</button>
                <button className="btn btn-danger btn-xs" onClick={()=>handleDelete(r.id)} style={{marginLeft:4}}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default RendezVousPage; 