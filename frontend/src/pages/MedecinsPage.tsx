import React, { useState, useEffect } from 'react';

interface Medecin {
  id: number;
  prenom: string;
  nom: string;
  specialite: string;
  telephone: string;
  email: string;
  adresse: string;
}

const MedecinsPage: React.FC = () => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [form, setForm] = useState<Omit<Medecin, 'id'>>({ prenom: '', nom: '', specialite: '', telephone: '', email: '', adresse: '' });
  const [editId, setEditId] = useState<number|null>(null);

  // Charger les médecins depuis localStorage au démarrage
  useEffect(() => {
    const savedMedecins = localStorage.getItem('neurodesktop_medecins');
    if (savedMedecins) {
      setMedecins(JSON.parse(savedMedecins));
    } else {
      // Aucun médecin - l'utilisateur devra les ajouter manuellement
      setMedecins([]);
      localStorage.setItem('neurodesktop_medecins', JSON.stringify([]));
    }
  }, []);

  // Sauvegarder les médecins quand ils changent
  useEffect(() => {
    localStorage.setItem('neurodesktop_medecins', JSON.stringify(medecins));
  }, [medecins]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom || !form.nom) return;
    if (editId !== null) {
      setMedecins(medecins.map(m => m.id === editId ? { ...m, ...form } : m));
      setEditId(null);
    } else {
      setMedecins([{ id: Date.now(), ...form }, ...medecins]);
    }
    setForm({ prenom: '', nom: '', specialite: '', telephone: '', email: '', adresse: '' });
  };

  const handleEdit = (id: number) => {
    const m = medecins.find(m => m.id === id);
    if (m) {
      setForm({ prenom: m.prenom, nom: m.nom, specialite: m.specialite, telephone: m.telephone, email: m.email, adresse: m.adresse });
      setEditId(id);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Supprimer ce médecin ?')) setMedecins(medecins.filter(m => m.id !== id));
  };

  return (
    <div style={{padding: 32}}>
      <h2>Médecins</h2>
      <form onSubmit={handleAdd} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" className="form-control" required />
        <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" className="form-control" required />
        <input name="specialite" value={form.specialite} onChange={handleChange} placeholder="Spécialité" className="form-control" />
        <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone" className="form-control" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="form-control" />
        <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Adresse" className="form-control" />
        <button type="submit" className="btn btn-success">{editId !== null ? 'Modifier' : 'Ajouter'}</button>
        {editId !== null && <button type="button" className="btn btn-secondary" onClick={()=>{setEditId(null);setForm({ prenom: '', nom: '', specialite: '', telephone: '', email: '', adresse: '' });}}>Annuler</button>}
      </form>
      <table className="table" style={{width:'100%',background:'#fff',borderRadius:8,overflow:'hidden'}}>
        <thead><tr><th>Prénom</th><th>Nom</th><th>Spécialité</th><th>Téléphone</th><th>Email</th><th>Adresse</th><th>Actions</th></tr></thead>
        <tbody>
          {medecins.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',color:'#888'}}>Aucun médecin enregistré</td></tr>}
          {medecins.map(m => (
            <tr key={m.id}>
              <td>{m.prenom}</td>
              <td>{m.nom}</td>
              <td>{m.specialite}</td>
              <td>{m.telephone}</td>
              <td>{m.email}</td>
              <td>{m.adresse}</td>
              <td>
                <button className="btn btn-info btn-xs" onClick={()=>handleEdit(m.id)}>Modifier</button>
                <button className="btn btn-danger btn-xs" onClick={()=>handleDelete(m.id)} style={{marginLeft:4}}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default MedecinsPage; 