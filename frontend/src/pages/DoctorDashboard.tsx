import React, { useState, useEffect } from 'react';
import LayoutMedecin from '../components/LayoutMedecin';
import { FaUserInjured, FaUserMd, FaCalendarAlt, FaHospital, FaDollarSign, FaChartPie, FaPlus, FaStethoscope, FaFileMedical, FaPrescriptionBottleAlt, FaTrash, FaDownload } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { localDataService } from '../services/localData';
import './DoctorDashboard.css';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  derniereMesure: string;
  statut: 'normal' | 'anormal' | 'suspect';
  sessions: number;
}

interface NewPatient {
  nom: string;
  prenom: string;
  email: string;
  dateNaissance: string;
  telephone: string;
  adresse: string;
}

interface RendezVous {
  id: number;
  patient: string;
  medecin: string;
  date: string;
  heure: string;
  motif: string;
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportPatient, setReportPatient] = useState<Patient | null>(null);
  const [rapportFields, setRapportFields] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: '',
    adresse: '',
    telephone: '',
    communaute: '',
    employeur: '',
    profession: '',
    dateBlessure: '',
    nomMedecin: '',
    adresseMedecin: '',
    telephoneMedecin: '',
    dateExamen: '',
    heureExamen: '',
    changementDiagnostic: '',
    plaintes: '',
    conclusions: '',
    traitement: '',
    recommanderSpecialiste: '',
    chargeSpecialiste: '',
    typeSpecialiste: '',
    dateSuivi: '',
    conseillerCSTT: '',
    facteursComplicants: '',
    signature: '',
    dateSignature: '',
  });
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState<NewPatient>({
    nom: '',
    prenom: '',
    email: '',
    dateNaissance: '',
    telephone: '',
    adresse: ''
  });
  const [showOrdonnance, setShowOrdonnance] = useState(false);
  const [ordonnanceText, setOrdonnanceText] = useState('');
  const [ordonnancePatient, setOrdonnancePatient] = useState<Patient | null>(null);
  const [showOrdonnanceForm, setShowOrdonnanceForm] = useState(false);
  const [ordonnanceFields, setOrdonnanceFields] = useState({
    patientNom: '',
    patientPrenom: '',
    patientAge: '',
    medecinNom: 'Bendounan',
    medecinPrenom: 'Djliali',
    specialite: 'Cardiologue',
    clinique: 'Clinique El Chifa',
    date: new Date().toISOString().slice(0, 10),
    telephone: '0555 12 34 56',
    numeroOrdre: '0012/2017',
    cachet: 'Clinique El Chifa - Alger',
  });
  const [medicaments, setMedicaments] = useState([
    { nom: 'AMOXICILLINE 500mg', details: '2 gélules matin et soir pendant 7 jours', qte: 1 },
    { nom: 'DOLIPRANE 1G', details: '1 cp le soir si douleur', qte: 1 }
  ]);
  const [showMesure, setShowMesure] = useState(false);
  const [mesurePatient, setMesurePatient] = useState<Patient | null>(null);
  const [mesureFields, setMesureFields] = useState({ temperature: '', pression: '', emg: '' });
  const [mesures, setMesures] = useState<{ [patientId: string]: { temperature: number; pression: number; emg: number[]; date: string }[] }>({});
  const [paiements, setPaiements] = useState<{ montant: number; description: string; date: string; patient: string }[]>([]);
  const [paiementMontant, setPaiementMontant] = useState('');
  const [paiementDesc, setPaiementDesc] = useState('');
  const [paiementPatient, setPaiementPatient] = useState('');
  const [searchPaiement, setSearchPaiement] = useState('');
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [ordonnanceModeles, setOrdonnanceModeles] = useState<any[]>([]);
  const [selectedModele, setSelectedModele] = useState<string>('');

  const patientNames = patients.map(p => `${p.prenom} ${p.nom}`);
  const paiementsFiltres = paiements.filter(p =>
    (p.patient.toLowerCase().includes(searchPaiement.toLowerCase()) ||
     p.description.toLowerCase().includes(searchPaiement.toLowerCase()))
  );
  const totalPaiements = paiementsFiltres.reduce((acc, p) => acc + p.montant, 0);
  function supprimerPaiement(idx: number) {
    if(window.confirm('Supprimer ce paiement ?')) {
      setPaiements(paiements => paiements.filter((_, i) => i !== idx));
    }
  }
  function exportPaiementsCSV() {
    const header = 'Date,Patient,Description,Montant\n';
    const rows = paiements.map(p => `${p.date},${p.patient},${p.description},${p.montant}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paiements.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    fetchPatients();
    const data = localStorage.getItem('neurodesktop_rendezvous');
    if (data) setRdvs(JSON.parse(data));
  }, []);

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const savedPatients = localStorage.getItem('neurodesktop_dashboard_patients');
    const savedPaiements = localStorage.getItem('neurodesktop_paiements');
    const savedMesures = localStorage.getItem('neurodesktop_mesures');
    
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients));
    }
    if (savedPaiements) {
      setPaiements(JSON.parse(savedPaiements));
    } else {
      // Aucun paiement - l'utilisateur devra les ajouter manuellement
      setPaiements([]);
      localStorage.setItem('neurodesktop_paiements', JSON.stringify([]));
    }
    if (savedMesures) {
      setMesures(JSON.parse(savedMesures));
    } else {
      // Aucune mesure - l'utilisateur devra les ajouter manuellement
      setMesures({});
      localStorage.setItem('neurodesktop_mesures', JSON.stringify({}));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('neurodesktop_dashboard_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('neurodesktop_paiements', JSON.stringify(paiements));
  }, [paiements]);

  useEffect(() => {
    localStorage.setItem('neurodesktop_mesures', JSON.stringify(mesures));
  }, [mesures]);

  useEffect(() => {
    const data = localStorage.getItem('neurodesktop_ordonnances_modeles');
    if (data) setOrdonnanceModeles(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem('neurodesktop_ordonnances_modeles', JSON.stringify(ordonnanceModeles));
  }, [ordonnanceModeles]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Charger uniquement les patients ajoutés manuellement par l'utilisateur
      const savedPatients = localStorage.getItem('neurodesktop_dashboard_patients');
      
      if (savedPatients) {
        const parsedPatients = JSON.parse(savedPatients);
        setPatients(parsedPatients);
      } else {
        // Aucun patient - l'utilisateur devra les ajouter manuellement
        setPatients([]);
        localStorage.setItem('neurodesktop_dashboard_patients', JSON.stringify([]));
        localStorage.setItem('neurodesktop_patients', JSON.stringify([]));
      }
    } catch (err) {
      setError('Erreur lors du chargement des patients');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNouvelleMesure = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setMesurePatient(patient || null);
    setMesureFields({ temperature: '', pression: '', emg: '' });
    setShowMesure(true);
  };

  const handleMesureFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMesureFields({ ...mesureFields, [e.target.name]: e.target.value });
  };

  const handleValiderMesure = () => {
    if (!mesurePatient) return;
    const temp = parseFloat(mesureFields.temperature);
    const press = parseFloat(mesureFields.pression);
    const emgArr = mesureFields.emg.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (isNaN(temp) || isNaN(press) || emgArr.length === 0) {
      alert('Veuillez saisir des valeurs valides pour toutes les mesures.');
      return;
    }
    const newMesure = { temperature: temp, pression: press, emg: emgArr, date: new Date().toLocaleString() };
    setMesures(prev => ({
      ...prev,
      [mesurePatient.id]: [...(prev[mesurePatient.id] || []), newMesure]
    }));
    setMesureFields({ temperature: '', pression: '', emg: '' });
  };

  // Préparer les données pour le graphique
  const getMesureChartData = (patientId: string) => {
    const data = mesures[patientId] || [];
    return {
      labels: data.map((m, i) => m.date.split(',')[0] + ' #' + (i + 1)),
      datasets: [
        {
          label: 'Température (°C)',
          data: data.map(m => m.temperature),
          borderColor: '#4f8cff',
          backgroundColor: 'rgba(79,140,255,0.1)',
          yAxisID: 'y',
        },
        {
          label: 'Pression (hPa)',
          data: data.map(m => m.pression),
          borderColor: '#ff6384',
          backgroundColor: 'rgba(255,99,132,0.1)',
          yAxisID: 'y1',
        },
        {
          label: 'EMG (moyenne)',
          data: data.map(m => m.emg.reduce((a, b) => a + b, 0) / m.emg.length),
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46,204,113,0.1)',
          yAxisID: 'y2',
        },
      ],
    };
  };
  const mesureChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: {
      y: { type: 'linear' as const, position: 'left' as const, beginAtZero: true, title: { display: true, text: 'Température (°C)' } },
      y1: { type: 'linear' as const, position: 'right' as const, beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'Pression (hPa)' } },
      y2: { type: 'linear' as const, position: 'right' as const, beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'EMG (moy)' }, offset: true },
    },
  };

  const handleGenererRapport = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setReportPatient(patient || null);
    setRapportFields(fields => ({
      ...fields,
      nom: patient?.nom || '',
      prenom: patient?.prenom || '',
      dateNaissance: '',
      sexe: '',
      adresse: '',
      telephone: '',
      communaute: '',
      employeur: '',
      profession: '',
      dateBlessure: '',
      nomMedecin: '',
      adresseMedecin: '',
      telephoneMedecin: '',
      dateExamen: '',
      heureExamen: '',
      changementDiagnostic: '',
      plaintes: '',
      conclusions: '',
      traitement: '',
      recommanderSpecialiste: '',
      chargeSpecialiste: '',
      typeSpecialiste: '',
      dateSuivi: '',
      conseillerCSTT: '',
      facteursComplicants: '',
      signature: '',
      dateSignature: '',
    }));
    setShowReport(true);
  };

  const handleDownloadReportPDF = () => {
    if (!reportPatient) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Rapport médical d\'évolution', 70, 15);
    doc.setFontSize(11);
    let y = 25;
    doc.text('Renseignements sur le travailleur', 10, y); y+=7;
    doc.text(`Nom: ${rapportFields.nom}`, 10, y); y+=6;
    doc.text(`Prénom: ${rapportFields.prenom}`, 80, y-6);
    doc.text(`Date de naissance: ${rapportFields.dateNaissance}`, 10, y); y+=6;
    doc.text(`Sexe: ${rapportFields.sexe}`, 80, y-6);
    doc.text(`Adresse: ${rapportFields.adresse}`, 10, y); y+=6;
    doc.text(`Téléphone: ${rapportFields.telephone}`, 80, y-6);
    doc.text(`Communauté: ${rapportFields.communaute}`, 10, y); y+=6;
    doc.text(`Employeur: ${rapportFields.employeur}`, 10, y); y+=6;
    doc.text(`Profession: ${rapportFields.profession}`, 80, y-6);
    doc.text(`Date de la blessure: ${rapportFields.dateBlessure}`, 10, y); y+=8;
    doc.text('Renseignements sur le professionnel de santé', 10, y); y+=7;
    doc.text(`Nom du médecin: ${rapportFields.nomMedecin}`, 10, y); y+=6;
    doc.text(`Adresse: ${rapportFields.adresseMedecin}`, 10, y); y+=6;
    doc.text(`Téléphone: ${rapportFields.telephoneMedecin}`, 10, y); y+=6;
    doc.text(`Date de l'examen: ${rapportFields.dateExamen}`, 10, y); y+=6;
    doc.text(`Heure: ${rapportFields.heureExamen}`, 80, y-6); y+=8;
    doc.text('Constatations subjectives/objectives', 10, y); y+=7;
    doc.text(`Changements diagnostic: ${rapportFields.changementDiagnostic}`, 10, y); y+=6;
    doc.text('Plaintes subjectives:', 10, y); y+=6;
    doc.text(doc.splitTextToSize(rapportFields.plaintes, 180), 10, y); y+=Math.max(8, doc.splitTextToSize(rapportFields.plaintes, 180).length*6);
    doc.text('Conclusions objectives et résultats:', 10, y); y+=6;
    doc.text(doc.splitTextToSize(rapportFields.conclusions, 180), 10, y); y+=Math.max(8, doc.splitTextToSize(rapportFields.conclusions, 180).length*6);
    doc.text('Programme de traitement et médicaments:', 10, y); y+=6;
    doc.text(doc.splitTextToSize(rapportFields.traitement, 180), 10, y); y+=Math.max(8, doc.splitTextToSize(rapportFields.traitement, 180).length*6);
    doc.text('Enquête', 10, y); y+=7;
    doc.text(`Recommander un spécialiste: ${rapportFields.recommanderSpecialiste}`, 10, y); y+=6;
    doc.text(`Vous chargez-vous du suivi: ${rapportFields.chargeSpecialiste}`, 10, y); y+=6;
    doc.text(`Type de spécialiste: ${rapportFields.typeSpecialiste}`, 10, y); y+=6;
    doc.text(`Date de la visite de suivi: ${rapportFields.dateSuivi}`, 10, y); y+=6;
    doc.text(`Consulter un conseiller médical CSTT: ${rapportFields.conseillerCSTT}`, 10, y); y+=6;
    doc.text('Facteurs compliquant le rétablissement:', 10, y); y+=6;
    doc.text(doc.splitTextToSize(rapportFields.facteursComplicants, 180), 10, y); y+=Math.max(8, doc.splitTextToSize(rapportFields.facteursComplicants, 180).length*6);
    doc.text(`Signature du médecin: ${rapportFields.signature}`, 10, y); y+=6;
    doc.text(`Date: ${rapportFields.dateSignature}`, 80, y-6);
    doc.save(`rapport_${rapportFields.prenom}_${rapportFields.nom}.pdf`);
  };

  const handleAddPatient = async () => {
    try {
      // Validation des champs
      if (!newPatient.nom || !newPatient.prenom || !newPatient.email) {
        alert('⚠️ Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Créer le nouveau patient avec toutes les informations
      const newPatientData: Patient = {
        id: (patients.length + 1).toString(),
        nom: newPatient.nom,
        prenom: newPatient.prenom,
        email: newPatient.email,
        derniereMesure: new Date().toISOString(),
        statut: 'normal',
        sessions: 0
      };

      // Ajouter aux patients du dashboard
      const updatedPatients = [...patients, newPatientData];
      setPatients(updatedPatients);
      
      // Sauvegarder dans localStorage pour le dashboard
      localStorage.setItem('neurodesktop_dashboard_patients', JSON.stringify(updatedPatients));
      
      // Créer aussi l'entrée pour la page Patients avec toutes les informations
      const patientForPatientsPage = {
        id: newPatientData.id,
        prenom: newPatient.prenom,
        nom: newPatient.nom,
        dateNaissance: newPatient.dateNaissance,
        sexe: '',
        telephone: newPatient.telephone,
        adresse: newPatient.adresse
      };
      
      // Récupérer les patients existants de la page Patients
      const existingPatientsPage = localStorage.getItem('neurodesktop_patients');
      let patientsPageData = [];
      if (existingPatientsPage) {
        patientsPageData = JSON.parse(existingPatientsPage);
      }
      
      // Ajouter le nouveau patient
      patientsPageData.push(patientForPatientsPage);
      localStorage.setItem('neurodesktop_patients', JSON.stringify(patientsPageData));
      
      // Fermer le modal et réinitialiser le formulaire
      setShowAddPatient(false);
      setNewPatient({
        nom: '',
        prenom: '',
        email: '',
        dateNaissance: '',
        telephone: '',
        adresse: ''
      });

      alert(`✅ Patient ${newPatient.prenom} ${newPatient.nom} ajouté avec succès !\n\nLes informations ont été sauvegardées et seront affichées dans tous les tableaux.`);
    } catch (err) {
      setError('Erreur lors de l\'ajout du patient');
      console.error('Erreur:', err);
    }
  };

  const handleOpenOrdonnanceForm = (patient: Patient) => {
    setOrdonnancePatient(patient);
    setOrdonnanceFields({
      ...ordonnanceFields,
      patientNom: patient.nom,
      patientPrenom: patient.prenom,
      patientAge: '43', // à adapter si tu as l'âge
      medecinNom: user?.nom || '',
      medecinPrenom: user?.prenom || '',
    });
    setMedicaments([{ nom: '', details: '', qte: 1 }]);
    setShowOrdonnanceForm(true);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOrdonnanceFields({ ...ordonnanceFields, [e.target.name]: e.target.value });
  };

  const handleMedicamentChange = (idx: number, field: string, value: string | number) => {
    const newMeds = [...medicaments];
    newMeds[idx] = { ...newMeds[idx], [field]: value };
    setMedicaments(newMeds);
  };

  const handleAddMedicament = () => {
    setMedicaments([...medicaments, { nom: '', details: '', qte: 1 }]);
  };

  const handleRemoveMedicament = (idx: number) => {
    setMedicaments(medicaments.filter((_, i) => i !== idx));
  };

  const handleDownloadOrdonnancePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Dr ${ordonnanceFields.medecinPrenom} ${ordonnanceFields.medecinNom}`, 15, 20);
    doc.text(`${ordonnanceFields.specialite}`, 15, 28);
    doc.text(`${ordonnanceFields.clinique}`, 15, 36);
    doc.text(`Tel : ${ordonnanceFields.telephone}`, 15, 44);
    doc.text(`N° Ordre : ${ordonnanceFields.numeroOrdre}`, 15, 52);
    doc.setFontSize(18);
    doc.text('Ordonnance', 80, 65);
    doc.setFontSize(12);
    doc.text(`Fait le : ${ordonnanceFields.date}`, 15, 75);
    doc.text(`Patient(e) : ${ordonnanceFields.patientPrenom} ${ordonnanceFields.patientNom}`, 120, 75);
    doc.text(`Age : ${ordonnanceFields.patientAge} ans`, 120, 82);
    let y = 95;
    medicaments.forEach((med, i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${med.nom}`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${med.details}`, 15, y + 7);
      doc.text(`Qte : ${med.qte}`, 160, y);
      y += 15;
    });
    doc.setFontSize(10);
    doc.text('Signature/Caché :', 15, y + 10);
    doc.text(ordonnanceFields.cachet, 50, y + 10);
    doc.save(`ordonnance_${ordonnanceFields.patientPrenom}_${ordonnanceFields.patientNom}.pdf`);
  };

  const dataGraph = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Revenus (DA)',
        data: [3500, 4200, 3900, 5000, 4800, 6000, 7000],
        backgroundColor: '#4f8cff',
      },
      {
        label: 'Dépenses (DA)',
        data: [1200, 1500, 1100, 1800, 1600, 2000, 2200],
        backgroundColor: '#ff6384',
      },
    ],
  };
  const optionsGraph = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `${value} DA`,
        },
      },
    },
  };

  const today = new Date().toLocaleDateString();
  const historiqueActions = [
    { type: 'ajout-patient', label: '✅ Patient ajouté : Yacine Benkhaled', date: today },
    { type: 'mesure', label: '🩺 Nouvelle mesure enregistrée pour Yacine Benkhaled', date: today },
    { type: 'rapport', label: '📄 Rapport généré pour Yacine Benkhaled', date: today },
    { type: 'ordonnance', label: '📝 Ordonnance créée pour Yacine Benkhaled', date: today },
    { type: 'ajout-patient', label: '✅ Patient ajouté : Nesrine Boudjemaa', date: today },
  ];
  const nbMesures = historiqueActions.filter(a => a.type === 'mesure' && a.date === today).length;
  const nbOrdonnances = historiqueActions.filter(a => a.type === 'ordonnance' && a.date === today).length;
  const nbRapports = historiqueActions.filter(a => a.type === 'rapport' && a.date === today).length;

  // Simuler des patients avec traitements et date
  const traitementsPossibles = [
    { nom: 'Prégabaline', pathologie: 'Neuropathie diabétique' },
    { nom: 'Duloxétine', pathologie: 'Neuropathie diabétique' },
    { nom: 'Amitriptyline', pathologie: 'Neuropathie diabétique' },
    { nom: 'Gabapentine', pathologie: 'Neuropathie diabétique' },
    { nom: 'Riluzole', pathologie: 'SLA' },
    { nom: 'Edaravone', pathologie: 'SLA' },
    { nom: 'Baclofène', pathologie: 'SLA' },
    { nom: 'Kinésithérapie', pathologie: 'SLA' },
  ];
  const patientsTraites = [
    { nom: 'Yacine Benkhaled', traitement: 'Prégabaline', date: today },
    { nom: 'Nesrine Boudjemaa', traitement: 'Duloxétine', date: today },
    { nom: 'Walid Ait Ahmed', traitement: 'Riluzole', date: today },
    { nom: 'Samir Merabet', traitement: 'Gabapentine', date: today },
    { nom: 'Lynda Bouzid', traitement: 'Edaravone', date: today },
    { nom: 'Mourad Bensalem', traitement: 'Prégabaline', date: today },
    { nom: 'Sarah Amrani', traitement: 'Kinésithérapie', date: today },
    { nom: 'Ali Kaci', traitement: 'Baclofène', date: today },
    { nom: 'Nadia Boudiaf', traitement: 'Amitriptyline', date: today },
  ];
  // Compter le nombre de patients par traitement aujourd'hui
  const traitementsDuJour = traitementsPossibles.map(t => ({
    nom: t.nom,
    pathologie: t.pathologie,
    count: patientsTraites.filter(p => p.traitement === t.nom && p.date === today).length
  })).filter(t => t.count > 0);

  // Ajoute une fonction pour obtenir les initiales d'un traitement
  function getInitialesTraitement(nom: string): string {
    return nom.split(/\s|-/).map((w: string) => w[0]).join('').toUpperCase();
  }

  // Fonction pour enregistrer le modèle actuel
  const handleSaveModele = () => {
    const nom = prompt('Nom du modèle :');
    if (!nom) return;
    // On enregistre tout sauf patientNom, patientPrenom, patientAge, date
    const modele = {
      nom,
      fields: {
        ...ordonnanceFields,
        patientNom: '',
        patientPrenom: '',
        patientAge: '',
        date: '',
      },
      medicaments: [...medicaments],
    };
    setOrdonnanceModeles([...ordonnanceModeles, modele]);
    alert('Modèle enregistré !');
  };
  // Charger un modèle
  const handleLoadModele = (idx: number) => {
    const m = ordonnanceModeles[idx];
    if (!m) return;
    setOrdonnanceFields(f => ({ ...f, ...m.fields }));
    setMedicaments([...m.medicaments]);
    setSelectedModele(m.nom);
  };
  // Supprimer un modèle
  const handleDeleteModele = (idx: number) => {
    if (window.confirm('Supprimer ce modèle ?')) {
      setOrdonnanceModeles(ordonnanceModeles.filter((_, i) => i !== idx));
      setSelectedModele('');
    }
  };

  // Fonction pour nettoyer toutes les données et repartir de zéro
  const clearAllData = () => {
    if (window.confirm('⚠️ ATTENTION : Cette action va supprimer TOUTES les données (patients, médecins, rendez-vous, messages, etc.). Êtes-vous sûr de vouloir continuer ?')) {
      // Nettoyer tous les localStorage
      localStorage.removeItem('neurodesktop_dashboard_patients');
      localStorage.removeItem('neurodesktop_patients');
      localStorage.removeItem('neurodesktop_medecins');
      localStorage.removeItem('neurodesktop_rendezvous');
      localStorage.removeItem('neurodesktop_paiements');
      localStorage.removeItem('neurodesktop_mesures');
      localStorage.removeItem('neurodesktop_messages');
      localStorage.removeItem('neurodesktop_shared_files');
      localStorage.removeItem('neurodesktop_comments');
      localStorage.removeItem('neurodesktop_ordonnances_modeles');
      
      // Réinitialiser tous les états
      setPatients([]);
      setPaiements([]);
      setMesures({});
      setOrdonnanceModeles([]);
      
      alert('✅ Toutes les données ont été supprimées. Vous pouvez maintenant ajouter vos propres données.');
      
      // Recharger la page pour s'assurer que tout est bien réinitialisé
      window.location.reload();
    }
  };

  // Fonction de test pour vérifier la synchronisation
  const testSynchronisation = () => {
    const dashboardPatients = localStorage.getItem('neurodesktop_dashboard_patients');
    const patientsPage = localStorage.getItem('neurodesktop_patients');
    
    console.log('=== TEST SYNCHRONISATION ===');
    console.log('Dashboard patients:', dashboardPatients ? JSON.parse(dashboardPatients) : 'Aucun');
    console.log('Patients page:', patientsPage ? JSON.parse(patientsPage) : 'Aucun');
    
    if (dashboardPatients && patientsPage) {
      const dashboard = JSON.parse(dashboardPatients);
      const patients = JSON.parse(patientsPage);
      console.log(`✅ Synchronisation OK: ${dashboard.length} patients dans le dashboard, ${patients.length} dans la page patients`);
    } else {
      console.log('❌ Problème de synchronisation détecté');
    }
  };

  // Appeler le test après chaque ajout de patient
  useEffect(() => {
    if (patients.length > 0) {
      testSynchronisation();
    }
  }, [patients]);

  if (loading) {
    return (
      <div className="doctor-dashboard">
        <div className="container">
          <div className="loading">Chargement des données patients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard dashboard-grid">
      {/* Statistiques principales + bouton ajouter patient */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-blue"><FaUserInjured /></div>
          <div>
            <div className="stat-title">Total Patients</div>
            <div className="stat-value">{patients.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pink"><FaCalendarAlt /></div>
          <div>
            <div className="stat-title">Consultations</div>
            <div className="stat-value">448</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-green"><FaUserMd /></div>
          <div>
            <div className="stat-title">Staff</div>
            <div className="stat-value">12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-yellow"><FaHospital /></div>
          <div>
            <div className="stat-title">Salles</div>
            <div className="stat-value">8</div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card">
        <div className="card-title">Actions rapides</div>
        <div className="card-content actions-rapides-grid">
          <button className="action-btn-rapide btn-green" onClick={() => setShowAddPatient(true)}>
            <FaPlus size={18} /><span>Ajouter un patient</span>
          </button>
          <button className="action-btn-rapide btn-blue" onClick={() => patients[0] && handleNouvelleMesure(patients[0].id)}>
            <FaStethoscope size={18} /> <span>Nouvelle mesure</span>
          </button>
          <button className="action-btn-rapide btn-grey" onClick={() => patients[0] && handleGenererRapport(patients[0].id)}>
            <FaFileMedical size={18} /> <span>Générer rapport</span>
          </button>
          <button className="action-btn-rapide btn-yellow" onClick={() => patients[0] && handleOpenOrdonnanceForm(patients[0])}>
            <FaPrescriptionBottleAlt size={18} /> <span>Ordonnance</span>
          </button>
          <button className="action-btn-rapide btn-red" onClick={clearAllData} style={{gridColumn: 'span 2'}}>
            <FaTrash size={18} /> <span>Nettoyer toutes les données</span>
          </button>
        </div>
      </div>

      <div className="main-row">
        <div className="main-col">
          {/* Liste des patients avec actions */}
          <div className="card">
            <div className="card-title">Mes Patients</div>
            <div className="card-content">
              <ul className="patients-list">
                {patients.map((patient) => (
                  <li key={patient.id} className="patient-card-modern">
                    <div className="patient-card-content">
                      <span className="avatar-patient-modern"><FaUserInjured style={{marginRight:6, color:'#4f8cff'}} />{patient.prenom[0]}{patient.nom[0]}</span>
                      <div className="patient-info-modern">
                        <div className="patient-name">{patient.prenom} {patient.nom}</div>
                        <div className="patient-meta">{patient.email} · {patient.sessions} sessions · {new Date(patient.derniereMesure).toLocaleDateString()}</div>
                        <div className="patient-actions-modern">
                          <button className="action-btn-rapide btn-blue" onClick={() => handleNouvelleMesure(patient.id)}>
                            <FaStethoscope size={16} /> Mesure
                          </button>
                          <button className="action-btn-rapide btn-grey" onClick={() => handleGenererRapport(patient.id)}>
                            <FaFileMedical size={16} /> Rapport
                          </button>
                          <button className="action-btn-rapide btn-yellow" onClick={() => handleOpenOrdonnanceForm(patient)}>
                            <FaPrescriptionBottleAlt size={16} /> Ordonnance
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Graphique (simulé) */}
          <div className="card">
            <div className="card-title">Statistiques des consultations</div>
            <div className="card-content">
              <div className="real-chart">
                <Bar data={dataGraph} options={optionsGraph} />
              </div>
              <div className="chart-legend">
                <span className="income">35 000 DA</span>
                <span className="expense">12 000 DA</span>
              </div>
            </div>
          </div>
          {/* Historique paiements (simulé) */}
          <div className="card">
            <div className="card-title">Historique des paiements</div>
            <div className="card-content">
              <ul className="payments-list">
                <li><b>Dr. John Doe</b> - Kidney function test <span>2 500 DA</span></li>
                <li><b>Dr. Michael Doe</b> - Emergency appointment <span>9 900 DA</span></li>
                <li><b>Dr. Bertie Maxwell</b> - Complementation test <span>4 000 DA</span></li>
              </ul>
            </div>
          </div>
          {/* Section Paiement manuel */}
          <div className="card" style={{marginTop: 18}}>
            <div className="card-title">Ajouter un paiement</div>
            <div className="card-content">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!paiementMontant || !paiementPatient) return;
                  setPaiements([
                    { montant: parseFloat(paiementMontant), description: paiementDesc, date: new Date().toLocaleString(), patient: paiementPatient },
                    ...paiements
                  ]);
                  setPaiementMontant('');
                  setPaiementDesc('');
                  setPaiementPatient('');
                }}
                className="paiement-form"
                style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:8}}
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Montant (DA)"
                  value={paiementMontant}
                  onChange={e => setPaiementMontant(e.target.value)}
                  className="form-control"
                  style={{maxWidth:100}}
                />
                <input
                  type="text"
                  placeholder="Patient"
                  list="patients-autocomplete"
                  value={paiementPatient}
                  onChange={e => setPaiementPatient(e.target.value)}
                  className="form-control"
                  style={{maxWidth:140}}
                  autoComplete="off"
                />
                <datalist id="patients-autocomplete">
                  {patientNames.map((n, i) => <option key={i} value={n} />)}
                </datalist>
                <input
                  type="text"
                  placeholder="Description (optionnel)"
                  value={paiementDesc}
                  onChange={e => setPaiementDesc(e.target.value)}
                  className="form-control"
                  style={{maxWidth:140}}
                />
                <button type="submit" className="btn btn-success">Ajouter</button>
                <button type="button" className="btn btn-info" title="Exporter CSV" onClick={exportPaiementsCSV} style={{marginLeft:4}}><FaDownload /></button>
              </form>
              <div style={{display:'flex', justifyContent:'center', marginBottom:8}}>
                <input
                  type="text"
                  placeholder="Rechercher paiement..."
                  value={searchPaiement}
                  onChange={e => setSearchPaiement(e.target.value)}
                  className="form-control"
                  style={{maxWidth:220}}
                />
              </div>
              <div style={{fontWeight:500, color:'#4f8cff', marginBottom:6}}>
                Total : {totalPaiements} DA
              </div>
              <ul className="payments-list" style={{marginTop:4}}>
                {paiementsFiltres.length === 0 && <li style={{color:'#888'}}>Aucun paiement enregistré</li>}
                {paiementsFiltres.map((p, idx) => (
                  <li key={idx} style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{minWidth:80}}>{p.date}</span>
                    <span style={{minWidth:90}}>{p.patient}</span>
                    <span style={{minWidth:90}}>{p.description}</span>
                    <span className="income">+{p.montant} DA</span>
                    <button className="btn btn-xs btn-danger" style={{marginLeft:4}} onClick={() => supprimerPaiement(idx)} title="Supprimer"><FaTrash /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="side-col">
          {/* Rendez-vous à venir */}
          <div className="card">
            <div className="card-title">Rendez-vous à venir</div>
            <div className="card-content">
              <ul className="appointments-list">
                {rdvs.length === 0 && <li style={{color:'#888'}}>Aucun rendez-vous</li>}
                {rdvs
                  .slice()
                  .sort((a, b) => (a.date + 'T' + a.heure).localeCompare(b.date + 'T' + b.heure))
                  .slice(0, 3)
                  .map(rdv => (
                    <li key={rdv.id}>
                      <span className="avatar-sm"></span>
                      <div>
                        <b>{rdv.patient}</b><br />{rdv.motif || 'Consultation'}
                      </div>
                      <span>{rdv.heure}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          {/* Diagramme circulaire (simulé) */}
          <div className="card">
            <div className="card-title">Aperçu des rendez-vous</div>
            <div className="card-content">
              <div className="fake-pie-chart">
                <FaChartPie size={80} color="#4f8cff" />
              </div>
              <div className="pie-legend">
                <span className="legend-dot" style={{background:'#4f8cff'}}></span> Homme
                <span className="legend-dot" style={{background:'#ff6384'}}></span> Femme
                <span className="legend-dot" style={{background:'#ffce56'}}></span> Enfant
              </div>
            </div>
          </div>
          {/* Historique des actions */}
          <div className="card" style={{marginTop: 18}}>
            <div className="card-title">Historique des actions</div>
            <div className="card-content">
              <div className="historique-summary" style={{marginBottom:10, color:'#4f8cff', fontWeight:500, fontSize:'1.05rem'}}>
                Mesures aujourd'hui : {nbMesures} &nbsp;|&nbsp; Ordonnances : {nbOrdonnances} &nbsp;|&nbsp; Rapports : {nbRapports}
              </div>
              <ul className="historique-list">
                {historiqueActions.map((a, idx) => <li key={idx}>{a.label}</li>)}
              </ul>
            </div>
          </div>
          <div className="card" style={{marginTop: 18}}>
            <div className="card-title">Traitements aujourd'hui</div>
            <div className="card-content">
              <div style={{height: 220}}>
                <Bar
                  data={{
                    labels: traitementsDuJour.map(t => getInitialesTraitement(t.nom)),
                    datasets: [
                      {
                        label: 'Nombre de patients',
                        data: traitementsDuJour.map(t => t.count),
                        backgroundColor: traitementsDuJour.map(t => t.pathologie === 'Neuropathie diabétique' ? '#4f8cff' : '#ffce56'),
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  }}
                />
              </div>
              <div style={{fontSize:'0.98rem', color:'#888', marginTop:8}}>
                Nombre de patients ayant reçu un traitement aujourd'hui (réel, simulé)
              </div>
              <div style={{fontSize:'0.95rem', color:'#666', marginTop:6, display:'flex', flexWrap:'wrap', gap:10}}>
                {traitementsDuJour.map(t => (
                  <span key={t.nom}><b>{getInitialesTraitement(t.nom)}</b> = {t.nom} ({t.pathologie})</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter un patient */}
      {showAddPatient && (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            maxWidth: '600px',
            width: '90%',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: 'none',
            overflow: 'hidden'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '24px 28px 20px',
              borderBottom: 'none',
              position: 'relative'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
                  </svg>
                </div>
                <h2 style={{margin: 0, fontSize: '1.4em', fontWeight: '600'}}>Ajouter un nouveau patient</h2>
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowAddPatient(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{
              padding: '28px',
              background: '#fafbfc',
              maxHeight: '70vh',
              overflowY: 'auto'
            }}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #e8eaed'
              }}>
                <div style={{marginBottom: '20px'}}>
                  <h4 style={{
                    color: '#2c3e50',
                    fontSize: '1.1em',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      background: '#e3f2fd',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#2196f3"/>
                      </svg>
                    </span>
                    Informations personnelles
                  </h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group" style={{margin: 0}}>
                      <label style={{
                        fontSize: '0.9em',
                        fontWeight: '600',
                        color: '#34495e',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Prénom *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newPatient.prenom}
                        onChange={(e) => setNewPatient({...newPatient, prenom: e.target.value})}
                        placeholder="Prénom du patient"
                        style={{
                          borderRadius: '8px',
                          border: '1.5px solid #e1e8ed',
                          padding: '10px 12px',
                          fontSize: '0.95em',
                          transition: 'all 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                    <div className="form-group" style={{margin: 0}}>
                      <label style={{
                        fontSize: '0.9em',
                        fontWeight: '600',
                        color: '#34495e',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Nom *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newPatient.nom}
                        onChange={(e) => setNewPatient({...newPatient, nom: e.target.value})}
                        placeholder="Nom du patient"
                        style={{
                          borderRadius: '8px',
                          border: '1.5px solid #e1e8ed',
                          padding: '10px 12px',
                          fontSize: '0.95em',
                          transition: 'all 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                  </div>
                </div>

                <div style={{marginBottom: '20px'}}>
                  <h4 style={{
                    color: '#2c3e50',
                    fontSize: '1.1em',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      background: '#e8f5e8',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#4caf50"/>
                      </svg>
                    </span>
                    Contact
                  </h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group" style={{margin: 0}}>
                      <label style={{
                        fontSize: '0.9em',
                        fontWeight: '600',
                        color: '#34495e',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                        placeholder="email@exemple.com"
                        style={{
                          borderRadius: '8px',
                          border: '1.5px solid #e1e8ed',
                          padding: '10px 12px',
                          fontSize: '0.95em',
                          transition: 'all 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                    <div className="form-group" style={{margin: 0}}>
                      <label style={{
                        fontSize: '0.9em',
                        fontWeight: '600',
                        color: '#34495e',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newPatient.telephone}
                        onChange={(e) => setNewPatient({...newPatient, telephone: e.target.value})}
                        placeholder="06 12 34 56 78"
                        style={{
                          borderRadius: '8px',
                          border: '1.5px solid #e1e8ed',
                          padding: '10px 12px',
                          fontSize: '0.95em',
                          transition: 'all 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                  </div>
                </div>

                <div style={{marginBottom: '20px'}}>
                  <h4 style={{
                    color: '#2c3e50',
                    fontSize: '1.1em',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      background: '#fff3e0',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#ff9800"/>
                      </svg>
                    </span>
                    Informations complémentaires
                  </h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group" style={{margin: 0}}>
                      <label style={{
                        fontSize: '0.9em',
                        fontWeight: '600',
                        color: '#34495e',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={newPatient.dateNaissance}
                        onChange={(e) => setNewPatient({...newPatient, dateNaissance: e.target.value})}
                        style={{
                          borderRadius: '8px',
                          border: '1.5px solid #e1e8ed',
                          padding: '10px 12px',
                          fontSize: '0.95em',
                          transition: 'all 0.2s ease',
                          background: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                    <div className="form-group" style={{margin: 0}}>
                      <label style={{
                        fontSize: '0.9em',
                        fontWeight: '600',
                        color: '#34495e',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        Adresse
                      </label>
                      <textarea
                        className="form-control"
                        value={newPatient.adresse}
                        onChange={(e) => setNewPatient({...newPatient, adresse: e.target.value})}
                        placeholder="Adresse complète"
                        rows={3}
                        style={{
                          borderRadius: '8px',
                          border: '1.5px solid #e1e8ed',
                          padding: '10px 12px',
                          fontSize: '0.95em',
                          transition: 'all 0.2s ease',
                          background: '#fff',
                          resize: 'vertical'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{
              padding: '20px 28px',
              background: '#f8f9fa',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddPatient(false)}
                style={{
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.95em',
                  fontWeight: '500',
                  border: '1.5px solid #6c757d',
                  background: 'transparent',
                  color: '#6c757d',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#6c757d';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6c757d';
                }}
              >
                Annuler
              </button>
              <button 
                className="btn btn-success"
                onClick={handleAddPatient}
                style={{
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '0.95em',
                  fontWeight: '600',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
                </svg>
                Ajouter le patient
              </button>
            </div>
          </div>
        </div>
      )}

      {showReport && reportPatient && (
        <div className="report-modal">
          <div className="report-content">
            <div className="report-header">
              <h2>📝 Rapport médical d'évolution</h2>
              <button className="close-btn" onClick={() => setShowReport(false)}>✕</button>
            </div>
            <div className="report-body" style={{overflowY:'auto', maxHeight: '70vh'}}>
              <h4>Renseignements sur le travailleur</h4>
              <div className="form-group"><label>Nom</label><input className="form-control" value={rapportFields.nom} onChange={e=>setRapportFields(f=>({...f,nom:e.target.value}))} /></div>
              <div className="form-group"><label>Prénom</label><input className="form-control" value={rapportFields.prenom} onChange={e=>setRapportFields(f=>({...f,prenom:e.target.value}))} /></div>
              <div className="form-group"><label>Date de naissance</label><input className="form-control" value={rapportFields.dateNaissance} onChange={e=>setRapportFields(f=>({...f,dateNaissance:e.target.value}))} type="date" /></div>
              <div className="form-group"><label>Sexe</label><select className="form-control" value={rapportFields.sexe} onChange={e=>setRapportFields(f=>({...f,sexe:e.target.value}))}><option value="">--</option><option value="M">M</option><option value="F">F</option></select></div>
              <div className="form-group"><label>Adresse</label><input className="form-control" value={rapportFields.adresse} onChange={e=>setRapportFields(f=>({...f,adresse:e.target.value}))} /></div>
              <div className="form-group"><label>Téléphone</label><input className="form-control" value={rapportFields.telephone} onChange={e=>setRapportFields(f=>({...f,telephone:e.target.value}))} /></div>
              <div className="form-group"><label>Communauté</label><input className="form-control" value={rapportFields.communaute} onChange={e=>setRapportFields(f=>({...f,communaute:e.target.value}))} /></div>
              <div className="form-group"><label>Employeur</label><input className="form-control" value={rapportFields.employeur} onChange={e=>setRapportFields(f=>({...f,employeur:e.target.value}))} /></div>
              <div className="form-group"><label>Profession</label><input className="form-control" value={rapportFields.profession} onChange={e=>setRapportFields(f=>({...f,profession:e.target.value}))} /></div>
              <div className="form-group"><label>Date de la blessure</label><input className="form-control" value={rapportFields.dateBlessure} onChange={e=>setRapportFields(f=>({...f,dateBlessure:e.target.value}))} type="date" /></div>
              <h4>Renseignements sur le professionnel de santé</h4>
              <div className="form-group"><label>Nom du médecin</label><input className="form-control" value={rapportFields.nomMedecin} onChange={e=>setRapportFields(f=>({...f,nomMedecin:e.target.value}))} /></div>
              <div className="form-group"><label>Adresse</label><input className="form-control" value={rapportFields.adresseMedecin} onChange={e=>setRapportFields(f=>({...f,adresseMedecin:e.target.value}))} /></div>
              <div className="form-group"><label>Téléphone</label><input className="form-control" value={rapportFields.telephoneMedecin} onChange={e=>setRapportFields(f=>({...f,telephoneMedecin:e.target.value}))} /></div>
              <div className="form-group"><label>Date de l'examen</label><input className="form-control" value={rapportFields.dateExamen} onChange={e=>setRapportFields(f=>({...f,dateExamen:e.target.value}))} type="date" /></div>
              <div className="form-group"><label>Heure</label><input className="form-control" value={rapportFields.heureExamen} onChange={e=>setRapportFields(f=>({...f,heureExamen:e.target.value}))} type="time" /></div>
              <h4>Constatations subjectives/objectives</h4>
              <div className="form-group"><label>Changements dans le diagnostic</label><select className="form-control" value={rapportFields.changementDiagnostic} onChange={e=>setRapportFields(f=>({...f,changementDiagnostic:e.target.value}))}><option value="">--</option><option value="Oui">Oui</option><option value="Non">Non</option></select></div>
              <div className="form-group"><label>Plaintes subjectives</label><textarea className="form-control" value={rapportFields.plaintes} onChange={e=>setRapportFields(f=>({...f,plaintes:e.target.value}))} /></div>
              <div className="form-group"><label>Conclusions objectives et résultats</label><textarea className="form-control" value={rapportFields.conclusions} onChange={e=>setRapportFields(f=>({...f,conclusions:e.target.value}))} /></div>
              <div className="form-group"><label>Programme de traitement et médicaments</label><textarea className="form-control" value={rapportFields.traitement} onChange={e=>setRapportFields(f=>({...f,traitement:e.target.value}))} /></div>
              <h4>Enquête</h4>
              <div className="form-group"><label>Recommander un spécialiste ?</label><select className="form-control" value={rapportFields.recommanderSpecialiste} onChange={e=>setRapportFields(f=>({...f,recommanderSpecialiste:e.target.value}))}><option value="">--</option><option value="Oui">Oui</option><option value="Non">Non</option></select></div>
              <div className="form-group"><label>Si oui, vous chargez-vous du suivi ?</label><select className="form-control" value={rapportFields.chargeSpecialiste} onChange={e=>setRapportFields(f=>({...f,chargeSpecialiste:e.target.value}))}><option value="">--</option><option value="Oui">Oui</option><option value="Non">Non</option></select></div>
              <div className="form-group"><label>Type de spécialiste</label><input className="form-control" value={rapportFields.typeSpecialiste} onChange={e=>setRapportFields(f=>({...f,typeSpecialiste:e.target.value}))} /></div>
              <div className="form-group"><label>Date de la visite de suivi</label><input className="form-control" value={rapportFields.dateSuivi} onChange={e=>setRapportFields(f=>({...f,dateSuivi:e.target.value}))} type="date" /></div>
              <div className="form-group"><label>Consulter un conseiller médical de la CSTT ?</label><select className="form-control" value={rapportFields.conseillerCSTT} onChange={e=>setRapportFields(f=>({...f,conseillerCSTT:e.target.value}))}><option value="">--</option><option value="Oui">Oui</option><option value="Non">Non</option></select></div>
              <div className="form-group"><label>Facteurs compliquant le rétablissement</label><textarea className="form-control" value={rapportFields.facteursComplicants} onChange={e=>setRapportFields(f=>({...f,facteursComplicants:e.target.value}))} /></div>
              <div className="form-group"><label>Signature du médecin</label><input className="form-control" value={rapportFields.signature} onChange={e=>setRapportFields(f=>({...f,signature:e.target.value}))} /></div>
              <div className="form-group"><label>Date</label><input className="form-control" value={rapportFields.dateSignature} onChange={e=>setRapportFields(f=>({...f,dateSignature:e.target.value}))} type="date" /></div>
            </div>
            <div className="report-footer">
              <button className="btn btn-success" onClick={handleDownloadReportPDF} disabled={!rapportFields.nom || !rapportFields.prenom}>Télécharger PDF</button>
              <button className="btn btn-secondary" onClick={() => setShowReport(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showOrdonnanceForm && (
        <div className="modal-overlay">
          <div className="modal-content ordonnance-modal-content">
            <div className="modal-header">
              <h2>📝 Générer une ordonnance</h2>
              <button className="close-btn" onClick={() => setShowOrdonnanceForm(false)}>✕</button>
            </div>
            <div className="modal-body ordonnance-modal-body">
              {/* Espace modèles d'ordonnance - design amélioré */}
              <div style={{
                marginBottom: 22,
                background: '#fff',
                borderRadius: 14,
                boxShadow: '0 2px 12px rgba(79,140,255,0.08)',
                borderLeft: '5px solid #4f8cff',
                padding: '18px 18px 14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
                  <span style={{background:'#e3f0ff',borderRadius:'50%',padding:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8c0 4.41-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#4f8cff"/></svg>
                  </span>
                  <b style={{color:'#4f8cff',fontSize:'1.08em'}}>Mes modèles d'ordonnance</b>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
                  <select value={selectedModele} onChange={e => {
                    const idx = ordonnanceModeles.findIndex(m => m.nom === e.target.value);
                    if (idx !== -1) handleLoadModele(idx);
                  }} className="form-control" style={{maxWidth:200, fontWeight:500, border:'1.5px solid #4f8cff', borderRadius:8, background:'#f7f9fb', color:'#222', boxShadow:'0 1px 4px #e3f0ff'}}>
                    <option value="">-- Choisir un modèle --</option>
                    {ordonnanceModeles.map((m, i) => <option key={i} value={m.nom}>{m.nom}</option>)}
                  </select>
                  <button className="btn btn-info btn-sm" style={{borderRadius:8, fontWeight:600, background:'#4f8cff', border:'none', transition:'background 0.2s', padding:'4px 12px', fontSize:'0.85em'}} onMouseOver={e=>e.currentTarget.style.background='#357ae8'} onMouseOut={e=>e.currentTarget.style.background='#4f8cff'} onClick={handleSaveModele}>Enregistrer comme modèle</button>
                  {selectedModele && (
                    <button className="btn btn-danger btn-sm" style={{borderRadius:8, fontWeight:600, background:'#ff3b3b', border:'none', transition:'background 0.2s', padding:'4px 12px', fontSize:'0.85em'}} onMouseOver={e=>e.currentTarget.style.background='#c62828'} onMouseOut={e=>e.currentTarget.style.background='#ff3b3b'} onClick={() => handleDeleteModele(ordonnanceModeles.findIndex(m => m.nom === selectedModele))}>Supprimer ce modèle</button>
                  )}
                </div>
                <div style={{fontSize:'0.97em',color:'#888',marginLeft:54}}>Un modèle enregistre tous les champs sauf le nom/prénom/âge/date du patient.</div>
              </div>
              <div className="ordonnance-form-fields">
                <div>
                  <label>Nom du patient</label>
                  <input name="patientNom" value={ordonnanceFields.patientNom} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Prénom du patient</label>
                  <input name="patientPrenom" value={ordonnanceFields.patientPrenom} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Âge</label>
                  <input name="patientAge" value={ordonnanceFields.patientAge} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Nom du médecin</label>
                  <input name="medecinNom" value={ordonnanceFields.medecinNom} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Prénom du médecin</label>
                  <input name="medecinPrenom" value={ordonnanceFields.medecinPrenom} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Spécialité</label>
                  <input name="specialite" value={ordonnanceFields.specialite} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Clinique</label>
                  <input name="clinique" value={ordonnanceFields.clinique} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Date</label>
                  <input name="date" type="date" value={ordonnanceFields.date} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Téléphone</label>
                  <input name="telephone" value={ordonnanceFields.telephone} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>N° Ordre</label>
                  <input name="numeroOrdre" value={ordonnanceFields.numeroOrdre} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Signature/Caché</label>
                  <input name="cachet" value={ordonnanceFields.cachet} onChange={handleFieldChange} className="form-control" />
                </div>
                <div>
                  <label>Médicaments</label>
                  {medicaments.map((med, idx) => (
                    <div key={idx} className="medicament-row">
                      <input placeholder="Nom" value={med.nom} onChange={e => handleMedicamentChange(idx, 'nom', e.target.value)} className="form-control" />
                      <input placeholder="Détails" value={med.details} onChange={e => handleMedicamentChange(idx, 'details', e.target.value)} className="form-control" />
                      <input type="number" min="1" placeholder="Qte" value={med.qte} onChange={e => handleMedicamentChange(idx, 'qte', Number(e.target.value))} className="form-control" style={{width:60}} />
                      <button className="btn btn-danger btn-xs" onClick={() => handleRemoveMedicament(idx)} disabled={medicaments.length === 1}>Supprimer</button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-xs" onClick={handleAddMedicament}>Ajouter un médicament</button>
                </div>
              </div>
            </div>
            <div className="modal-footer ordonnance-modal-footer">
              <button className="btn btn-success" onClick={handleDownloadOrdonnancePDF}>Télécharger PDF</button>
              <button className="btn btn-secondary" onClick={() => setShowOrdonnanceForm(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showMesure && mesurePatient && (
        <div className="modal-overlay">
          <div className="modal-content ordonnance-modal-content">
            <div className="modal-header">
              <h2>🩺 Nouvelle mesure pour {mesurePatient.prenom} {mesurePatient.nom}</h2>
              <button className="close-btn" onClick={() => setShowMesure(false)}>✕</button>
            </div>
            <div className="modal-body ordonnance-modal-body">
              <div className="ordonnance-form-fields">
                <div>
                  <label>Température (°C)</label>
                  <input name="temperature" value={mesureFields.temperature} onChange={handleMesureFieldChange} className="form-control" type="number" step="0.1" />
                </div>
                <div>
                  <label>Pression (hPa)</label>
                  <input name="pression" value={mesureFields.pression} onChange={handleMesureFieldChange} className="form-control" type="number" step="0.1" />
                </div>
                <div>
                  <label>EMG (séparé par virgules)</label>
                  <input name="emg" value={mesureFields.emg} onChange={handleMesureFieldChange} className="form-control" placeholder="ex: 12, 15, 18, 20" />
                </div>
                <button className="btn btn-success" onClick={handleValiderMesure}>Ajouter la mesure</button>
              </div>
              <div style={{marginTop: '24px'}}>
                <h4>Graphique des mesures</h4>
                <Line data={getMesureChartData(mesurePatient.id)} options={mesureChartOptions} />
              </div>
            </div>
            <div className="modal-footer ordonnance-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowMesure(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard; 