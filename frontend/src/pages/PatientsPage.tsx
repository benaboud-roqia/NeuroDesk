import React, { useState, useEffect } from 'react';

interface Patient {
  id: number;
  prenom: string;
  nom: string;
  dateNaissance: string;
  sexe: string;
  telephone: string;
  adresse: string;
}

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<Omit<Patient, 'id'>>({ prenom: '', nom: '', dateNaissance: '', sexe: '', telephone: '', adresse: '' });
  const [editId, setEditId] = useState<number|null>(null);

  // Charger les patients depuis localStorage au démarrage
  useEffect(() => {
    const savedPatients = localStorage.getItem('neurodesktop_patients');
    const dashboardPatients = localStorage.getItem('neurodesktop_dashboard_patients');
    
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
    } else if (dashboardPatients) {
      // Convertir les patients du dashboard au format de cette page
      const dashboardData = JSON.parse(dashboardPatients);
      const convertedPatients = dashboardData.map((p: any, index: number) => ({
        id: index + 1,
        prenom: p.prenom || '',
        nom: p.nom || '',
        dateNaissance: '',
        sexe: '',
        telephone: '',
        adresse: ''
      }));
      setPatients(convertedPatients);
      localStorage.setItem('neurodesktop_patients', JSON.stringify(convertedPatients));
    } else {
      // Aucun patient - l'utilisateur devra les ajouter manuellement
      setPatients([]);
      localStorage.setItem('neurodesktop_patients', JSON.stringify([]));
    }
  }, []);

  // Sauvegarder les patients quand ils changent
  useEffect(() => {
    localStorage.setItem('neurodesktop_patients', JSON.stringify(patients));
    
    // Synchroniser aussi avec le dashboard
    const dashboardPatients = patients.map((p, index) => ({
      id: p.id.toString(),
      nom: p.nom,
      prenom: p.prenom,
      email: `${p.prenom?.toLowerCase()}.${p.nom?.toLowerCase()}@email.dz`,
      derniereMesure: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      statut: ['normal', 'anormal', 'suspect'][Math.floor(Math.random() * 3)] as any,
      sessions: Math.floor(Math.random() * 20) + 1
    }));
    localStorage.setItem('neurodesktop_dashboard_patients', JSON.stringify(dashboardPatients));
  }, [patients]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom || !form.nom) return;
    if (editId !== null) {
      setPatients(patients.map(p => p.id === editId ? { ...p, ...form } : p));
      setEditId(null);
    } else {
      setPatients([{ id: Date.now(), ...form }, ...patients]);
    }
    setForm({ prenom: '', nom: '', dateNaissance: '', sexe: '', telephone: '', adresse: '' });
  };

  const handleEdit = (id: number) => {
    const p = patients.find(p => p.id === id);
    if (p) {
      setForm({ prenom: p.prenom, nom: p.nom, dateNaissance: p.dateNaissance, sexe: p.sexe, telephone: p.telephone, adresse: p.adresse });
      setEditId(id);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Supprimer ce patient ?')) setPatients(patients.filter(p => p.id !== id));
  };

  return (
    <div style={{padding: 32}}>
      <h2>Patients du jour</h2>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" className="form-control" required />
        <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" className="form-control" required />
        <input name="dateNaissance" value={form.dateNaissance} onChange={handleChange} type="date" className="form-control" />
        <select name="sexe" value={form.sexe} onChange={handleChange} className="form-control"><option value="">Sexe</option><option value="M">M</option><option value="F">F</option></select>
        <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone" className="form-control" />
        <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Adresse" className="form-control" />
        <button type="submit" className="btn btn-success">{editId !== null ? 'Modifier' : 'Ajouter'}</button>
        {editId !== null && <button type="button" className="btn btn-secondary" onClick={()=>{setEditId(null);setForm({ prenom: '', nom: '', dateNaissance: '', sexe: '', telephone: '', adresse: '' });}}>Annuler</button>}
      </form>
      <table className="table" style={{width:'100%',background:'#fff',borderRadius:8,overflow:'hidden'}}>
        <thead><tr><th>Prénom</th><th>Nom</th><th>Date de naissance</th><th>Sexe</th><th>Téléphone</th><th>Adresse</th><th>Actions</th></tr></thead>
        <tbody>
          {patients.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',color:'#888'}}>Aucun patient enregistré</td></tr>}
          {patients.map(p => (
            <tr key={p.id}>
              <td>{p.prenom}</td>
              <td>{p.nom}</td>
              <td>{p.dateNaissance}</td>
              <td>{p.sexe}</td>
              <td>{p.telephone}</td>
              <td>{p.adresse}</td>
              <td>
                <button className="btn btn-info btn-xs" onClick={()=>handleEdit(p.id)}>Modifier</button>
                <button className="btn btn-danger btn-xs" onClick={()=>handleDelete(p.id)} style={{marginLeft:4}}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default PatientsPage; 