import React, { useState, useEffect } from 'react';
import './CommunicationPage.css';

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'internal' | 'patient' | 'whatsapp';
  status: 'sent' | 'delivered' | 'read';
  isOutgoing: boolean;
}

interface SharedFile {
  id: string;
  patientName: string;
  sharedBy: string;
  sharedWith: string[];
  sharedAt: string;
  consentGiven: boolean;
  fileType: 'rapport' | 'ordonnance' | 'analyse';
}

interface Comment {
  id: string;
  reportId: string;
  author: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

const CommunicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'files' | 'comments'>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: '',
    type: 'internal' as 'internal' | 'whatsapp'
  });
  const [currentUser] = useState('Dr. Ahmed Benali');
  const [messageFilter, setMessageFilter] = useState<'all' | 'inbox' | 'sent' | 'whatsapp'>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [newSharedFile, setNewSharedFile] = useState({
    patientName: '',
    fileType: 'rapport' as SharedFile['fileType'],
    sharedWith: [] as string[],
    consentGiven: false
  });
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [showFileModal, setShowFileModal] = useState(false);

  // Charger les données depuis localStorage ou initialiser vides
  useEffect(() => {
    const savedMessages = localStorage.getItem('neurodesktop_messages');
    const savedSharedFiles = localStorage.getItem('neurodesktop_shared_files');
    const savedComments = localStorage.getItem('neurodesktop_comments');

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Aucun message - l'utilisateur devra les ajouter manuellement
      setMessages([]);
      localStorage.setItem('neurodesktop_messages', JSON.stringify([]));
    }

    if (savedSharedFiles) {
      setSharedFiles(JSON.parse(savedSharedFiles));
    } else {
      // Aucun dossier partagé - l'utilisateur devra les ajouter manuellement
      setSharedFiles([]);
      localStorage.setItem('neurodesktop_shared_files', JSON.stringify([]));
    }

    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      // Aucun commentaire - l'utilisateur devra les ajouter manuellement
      setComments([]);
      localStorage.setItem('neurodesktop_comments', JSON.stringify([]));
    }
  }, [currentUser]);

  // Sauvegarder les messages quand ils changent
  useEffect(() => {
    localStorage.setItem('neurodesktop_messages', JSON.stringify(messages));
  }, [messages]);

  // Sauvegarder les dossiers partagés quand ils changent
  useEffect(() => {
    localStorage.setItem('neurodesktop_shared_files', JSON.stringify(sharedFiles));
  }, [sharedFiles]);

  // Sauvegarder les commentaires quand ils changent
  useEffect(() => {
    localStorage.setItem('neurodesktop_comments', JSON.stringify(comments));
  }, [comments]);

  const sendMessage = () => {
    if (!newMessage.to || !newMessage.content) return;
    
    const message: Message = {
      id: Date.now().toString(),
      from: currentUser,
      to: newMessage.to,
      subject: newMessage.subject || 'Message',
      content: newMessage.content,
      timestamp: new Date().toLocaleString('fr-FR'),
      isRead: false,
      type: newMessage.type,
      status: 'sent',
      isOutgoing: true
    };

    setMessages([message, ...messages]);
    
    // Si c'est un message WhatsApp, ouvrir WhatsApp
    if (newMessage.type === 'whatsapp') {
      const phoneNumber = newMessage.to.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(newMessage.content)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    setNewMessage({ to: '', subject: '', content: '', type: 'internal' });
  };

  const openWhatsApp = (phoneNumber: string, message: string = '') => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true, status: 'read' } : msg
    ));
  };

  const deleteMessage = (messageId: string) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const getFilteredMessages = () => {
    switch (messageFilter) {
      case 'inbox':
        return messages.filter(m => !m.isOutgoing);
      case 'sent':
        return messages.filter(m => m.isOutgoing);
      case 'whatsapp':
        return messages.filter(m => m.type === 'whatsapp');
      default:
        return messages;
    }
  };

  const getStatusIcon = (status: string, type: string) => {
    if (type === 'whatsapp') {
      switch (status) {
        case 'sent': return '✓';
        case 'delivered': return '✓✓';
        case 'read': return '✓✓';
        default: return '⏳';
      }
    }
    return '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return '#666';
      case 'delivered': return '#4f8cff';
      case 'read': return '#28a745';
      default: return '#999';
    }
  };

  const shareFile = (patientName: string, fileType: SharedFile['fileType']) => {
    const sharedFile: SharedFile = {
      id: Date.now().toString(),
      patientName,
      sharedBy: 'Dr. Ahmed Benali',
      sharedWith: ['Dr. Fatima Zohra'],
      sharedAt: new Date().toLocaleString('fr-FR'),
      consentGiven: true,
      fileType
    };

    setSharedFiles([sharedFile, ...sharedFiles]);
  };

  const handleCreateSharedFile = () => {
    if (!newSharedFile.patientName || newSharedFile.sharedWith.length === 0) return;
    
    const sharedFile: SharedFile = {
      id: Date.now().toString(),
      patientName: newSharedFile.patientName,
      sharedBy: 'Dr. Ahmed Benali',
      sharedWith: newSharedFile.sharedWith,
      sharedAt: new Date().toLocaleString('fr-FR'),
      consentGiven: newSharedFile.consentGiven,
      fileType: newSharedFile.fileType
    };

    setSharedFiles([sharedFile, ...sharedFiles]);
    setNewSharedFile({
      patientName: '',
      fileType: 'rapport',
      sharedWith: [],
      consentGiven: false
    });
    setShowShareModal(false);
  };

  const handleViewFile = (file: SharedFile) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  const handleSendWhatsApp = (file: SharedFile) => {
    const message = `📋 Dossier patient partagé

👤 Patient: ${file.patientName}
📄 Type: ${file.fileType === 'rapport' ? 'Rapport médical' : file.fileType === 'ordonnance' ? 'Ordonnance' : 'Analyse'}
👨‍⚕️ Partagé par: ${file.sharedBy}
📅 Date: ${file.sharedAt}
✅ Consentement: ${file.consentGiven ? 'Donné' : 'En attente'}

🔗 Accéder au dossier: [Lien vers le dossier]`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadFile = (file: SharedFile) => {
    // Simulation de téléchargement
    const content = `DOSSIER PATIENT

Nom: ${file.patientName}
Type: ${file.fileType}
Partagé par: ${file.sharedBy}
Date: ${file.sharedAt}
Consentement: ${file.consentGiven ? 'Donné' : 'En attente'}
Destinataires: ${file.sharedWith.join(', ')}

[Contenu du dossier...]`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier_${file.patientName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="communication-page">
      <div className="communication-header">
        <h1>Communication & Collaboration</h1>
        <p>Messagerie interne, WhatsApp et partage de dossiers</p>
      </div>

      <div className="communication-tabs">
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <i className="fas fa-envelope"></i>
          Messagerie ({messages.filter(m => !m.isRead && !m.isOutgoing).length})
        </button>
        <button 
          className={`tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <i className="fas fa-share-alt"></i>
          Dossiers partagés ({sharedFiles.length})
        </button>
        <button 
          className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <i className="fas fa-comments"></i>
          Commentaires ({comments.filter(c => c.status === 'pending').length})
        </button>
      </div>

      <div className="communication-content">
        {activeTab === 'messages' && (
          <div className="messages-section">
            <div className="messages-sidebar">
              <div className="messages-filters">
                <button 
                  className={`filter-btn ${messageFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('all')}
                >
                  Tous ({messages.length})
                </button>
                <button 
                  className={`filter-btn ${messageFilter === 'inbox' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('inbox')}
                >
                  Boîte de réception ({messages.filter(m => !m.isOutgoing).length})
                </button>
                <button 
                  className={`filter-btn ${messageFilter === 'sent' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('sent')}
                >
                  Messages envoyés ({messages.filter(m => m.isOutgoing).length})
                </button>
                <button 
                  className={`filter-btn ${messageFilter === 'whatsapp' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('whatsapp')}
                >
                  WhatsApp ({messages.filter(m => m.type === 'whatsapp').length})
                </button>
              </div>

              <div className="messages-list">
                {getFilteredMessages().map(message => (
                  <div 
                    key={message.id} 
                    className={`message-item ${!message.isRead && !message.isOutgoing ? 'unread' : ''} ${message.isOutgoing ? 'outgoing' : ''}`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead && !message.isOutgoing) {
                        markAsRead(message.id);
                      }
                    }}
                  >
                    <div className="message-header">
                      <div className="message-info">
                        <span className="message-from">{message.isOutgoing ? message.to : message.from}</span>
                        <span className="message-time">{message.timestamp}</span>
                      </div>
                      <div className="message-actions">
                        {message.type === 'whatsapp' && (
                          <button 
                            className="whatsapp-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openWhatsApp(message.isOutgoing ? message.to : message.from, message.content);
                            }}
                            title="Ouvrir dans WhatsApp"
                          >
                            <i className="fab fa-whatsapp"></i>
                          </button>
                        )}
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message.id);
                          }}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="message-subject">{message.subject}</div>
                    <div className="message-preview">{message.content.substring(0, 80)}...</div>
                    <div className="message-footer">
                      <span className={`message-type ${message.type}`}>
                        {message.type === 'whatsapp' ? 'WhatsApp' : 
                         message.type === 'patient' ? 'Patient' : 'Interne'}
                      </span>
                      {message.isOutgoing && (
                        <span 
                          className="message-status"
                          style={{ color: getStatusColor(message.status) }}
                        >
                          {getStatusIcon(message.status, message.type)}
                        </span>
                      )}
                    </div>
                    {!message.isRead && !message.isOutgoing && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="message-compose">
              <h3>Nouveau message</h3>
              <div className="compose-form">
                <div className="message-type-selector">
                  <label>
                    <input
                      type="radio"
                      name="messageType"
                      value="internal"
                      checked={newMessage.type === 'internal'}
                      onChange={(e) => setNewMessage({...newMessage, type: e.target.value as 'internal' | 'whatsapp'})}
                    />
                    Message interne
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="messageType"
                      value="whatsapp"
                      checked={newMessage.type === 'whatsapp'}
                      onChange={(e) => setNewMessage({...newMessage, type: e.target.value as 'internal' | 'whatsapp'})}
                    />
                    WhatsApp
                  </label>
                </div>
                
                {newMessage.type === 'internal' ? (
                  <input
                    type="text"
                    placeholder="Destinataire (nom du médecin)"
                    value={newMessage.to}
                    onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Numéro de téléphone (ex: +213 123 456 789)"
                    value={newMessage.to}
                    onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
                  />
                )}
                
                {newMessage.type === 'internal' && (
                  <input
                    type="text"
                    placeholder="Sujet"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  />
                )}
                
                <textarea
                  placeholder={newMessage.type === 'whatsapp' ? "Message WhatsApp..." : "Contenu du message..."}
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  rows={6}
                />
                
                <div className="compose-actions">
                  <button onClick={sendMessage} className="send-btn">
                    {newMessage.type === 'whatsapp' ? (
                      <>
                        <i className="fab fa-whatsapp"></i>
                        Envoyer via WhatsApp
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Envoyer
                      </>
                    )}
                  </button>
                  
                  {newMessage.type === 'whatsapp' && (
                    <button 
                      onClick={() => openWhatsApp(newMessage.to, newMessage.content)}
                      className="whatsapp-preview-btn"
                      disabled={!newMessage.to}
                    >
                      <i className="fab fa-whatsapp"></i>
                      Prévisualiser WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>

            {selectedMessage && (
              <div className="message-detail">
                <div className="detail-header">
                  <h3>Détails du message</h3>
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="close-btn"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="message-detail-content">
                  <div className="detail-row">
                    <strong>De :</strong> {selectedMessage.from}
                  </div>
                  <div className="detail-row">
                    <strong>À :</strong> {selectedMessage.to}
                  </div>
                  <div className="detail-row">
                    <strong>Sujet :</strong> {selectedMessage.subject}
                  </div>
                  <div className="detail-row">
                    <strong>Date :</strong> {selectedMessage.timestamp}
                  </div>
                  <div className="detail-row">
                    <strong>Type :</strong> 
                    <span className={`message-type-badge ${selectedMessage.type}`}>
                      {selectedMessage.type === 'whatsapp' ? 'WhatsApp' : 
                       selectedMessage.type === 'patient' ? 'Patient' : 'Interne'}
                    </span>
                  </div>
                  <div className="detail-body">
                    {selectedMessage.content}
                  </div>
                  
                  {selectedMessage.type === 'whatsapp' && (
                    <div className="whatsapp-actions">
                      <button 
                        onClick={() => openWhatsApp(selectedMessage.isOutgoing ? selectedMessage.to : selectedMessage.from, selectedMessage.content)}
                        className="whatsapp-reply-btn"
                      >
                        <i className="fab fa-whatsapp"></i>
                        Répondre via WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="files-section">
            <div className="files-header">
              <h3>Dossiers partagés</h3>
              <button className="share-btn" onClick={() => setShowShareModal(true)}>
                <i className="fas fa-plus"></i>
                Partager un dossier
              </button>
            </div>

            <div className="files-list">
              {sharedFiles.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <i className={`fas fa-${file.fileType === 'rapport' ? 'file-medical' : file.fileType === 'ordonnance' ? 'prescription-bottle' : 'microscope'}`}></i>
                    </div>
                    <div className="file-details">
                      <div className="file-patient">{file.patientName}</div>
                      <div className="file-meta">
                        Partagé par {file.sharedBy} • {file.sharedAt}
                      </div>
                      <div className="file-recipients">
                        Avec : {file.sharedWith.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="file-actions">
                    <span className={`consent-status ${file.consentGiven ? 'given' : 'pending'}`}>
                      {file.consentGiven ? 'Consentement donné' : 'En attente de consentement'}
                    </span>
                    <button className="view-btn" onClick={() => handleViewFile(file)}>
                      <i className="fas fa-eye"></i>
                      Voir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modale pour partager un dossier */}
            {showShareModal && (
              <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                <div className="share-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Partager un dossier patient</h3>
                    <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Nom du patient *</label>
                      <input
                        type="text"
                        value={newSharedFile.patientName}
                        onChange={e => setNewSharedFile({...newSharedFile, patientName: e.target.value})}
                        placeholder="Nom et prénom du patient"
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Type de fichier</label>
                      <select
                        value={newSharedFile.fileType}
                        onChange={e => setNewSharedFile({...newSharedFile, fileType: e.target.value as SharedFile['fileType']})}
                        className="form-control"
                      >
                        <option value="rapport">Rapport médical</option>
                        <option value="ordonnance">Ordonnance</option>
                        <option value="analyse">Analyse</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Partager avec *</label>
                      <div className="recipients-list">
                        {['Dr. Fatima Zohra', 'Dr. Karim Mansouri', 'Dr. Amina Belkacemi', 'Dr. Omar Benali'].map(doctor => (
                          <label key={doctor} className="recipient-item">
                            <input
                              type="checkbox"
                              checked={newSharedFile.sharedWith.includes(doctor)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setNewSharedFile({
                                    ...newSharedFile,
                                    sharedWith: [...newSharedFile.sharedWith, doctor]
                                  });
                                } else {
                                  setNewSharedFile({
                                    ...newSharedFile,
                                    sharedWith: newSharedFile.sharedWith.filter(d => d !== doctor)
                                  });
                                }
                              }}
                            />
                            <span>{doctor}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="consent-checkbox">
                        <input
                          type="checkbox"
                          checked={newSharedFile.consentGiven}
                          onChange={e => setNewSharedFile({...newSharedFile, consentGiven: e.target.checked})}
                        />
                        <span>Le patient a donné son consentement pour le partage</span>
                      </label>
                    </div>

                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
                        Annuler
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={handleCreateSharedFile}
                        disabled={!newSharedFile.patientName || newSharedFile.sharedWith.length === 0}
                      >
                        <i className="fas fa-share"></i>
                        Partager le dossier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modale pour afficher les détails du dossier */}
            {showFileModal && selectedFile && (
              <div className="modal-overlay" onClick={() => setShowFileModal(false)}>
                <div className="file-detail-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Détails du dossier patient</h3>
                    <button className="close-btn" onClick={() => setShowFileModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="file-detail-content">
                      <div className="file-detail-header">
                        <div className="file-detail-icon">
                          <i className={`fas fa-${selectedFile.fileType === 'rapport' ? 'file-medical' : selectedFile.fileType === 'ordonnance' ? 'prescription-bottle' : 'microscope'}`}></i>
                        </div>
                        <div className="file-detail-info">
                          <h4>{selectedFile.patientName}</h4>
                          <span className={`file-type-badge ${selectedFile.fileType}`}>
                            {selectedFile.fileType === 'rapport' ? 'Rapport médical' : selectedFile.fileType === 'ordonnance' ? 'Ordonnance' : 'Analyse'}
                          </span>
                        </div>
                      </div>

                      <div className="file-detail-sections">
                        <div className="detail-section">
                          <h5>Informations générales</h5>
                          <div className="detail-row">
                            <strong>Partagé par :</strong>
                            <span>{selectedFile.sharedBy}</span>
                          </div>
                          <div className="detail-row">
                            <strong>Date de partage :</strong>
                            <span>{selectedFile.sharedAt}</span>
                          </div>
                          <div className="detail-row">
                            <strong>Consentement :</strong>
                            <span className={`consent-badge ${selectedFile.consentGiven ? 'given' : 'pending'}`}>
                              {selectedFile.consentGiven ? 'Donné' : 'En attente'}
                            </span>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h5>Destinataires</h5>
                          <div className="recipients-detail">
                            {selectedFile.sharedWith.map((recipient, index) => (
                              <div key={index} className="recipient-detail-item">
                                <i className="fas fa-user-md"></i>
                                <span>{recipient}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="detail-section">
                          <h5>Actions disponibles</h5>
                          <div className="file-actions-detail">
                            <button 
                              className="action-btn whatsapp-btn"
                              onClick={() => handleSendWhatsApp(selectedFile)}
                            >
                              <i className="fab fa-whatsapp"></i>
                              Envoyer par WhatsApp
                            </button>
                            <button 
                              className="action-btn download-btn"
                              onClick={() => handleDownloadFile(selectedFile)}
                            >
                              <i className="fas fa-download"></i>
                              Télécharger
                            </button>
                            <button 
                              className="action-btn print-btn"
                              onClick={() => window.print()}
                            >
                              <i className="fas fa-print"></i>
                              Imprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="comments-section">
            <div className="comments-header">
              <h3>Commentaires sur rapports</h3>
            </div>

            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-time">{comment.timestamp}</span>
                    <span className={`comment-status ${comment.status}`}>
                      {comment.status === 'approved' ? 'Approuvé' : 
                       comment.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </span>
                  </div>
                  <div className="comment-report">Rapport : {comment.reportId}</div>
                  <div className="comment-content">{comment.content}</div>
                  {comment.status === 'pending' && (
                    <div className="comment-actions">
                      <button className="approve-btn">
                        <i className="fas fa-check"></i>
                        Approuver
                      </button>
                      <button className="reject-btn">
                        <i className="fas fa-times"></i>
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="comment-add">
              <h4>Ajouter un commentaire</h4>
              <div className="comment-form">
                <input
                  type="text"
                  placeholder="ID du rapport"
                  id="reportId"
                />
                <textarea
                  placeholder="Votre commentaire..."
                  id="commentContent"
                  rows={4}
                />
                <button onClick={() => {
                  const reportId = (document.getElementById('reportId') as HTMLInputElement).value;
                  const content = (document.getElementById('commentContent') as HTMLTextAreaElement).value;
                  if (reportId && content) {
                    const comment: Comment = {
                      id: Date.now().toString(),
                      reportId,
                      author: currentUser,
                      content,
                      timestamp: new Date().toLocaleString('fr-FR'),
                      status: 'pending'
                    };
                    setComments([comment, ...comments]);
                    (document.getElementById('reportId') as HTMLInputElement).value = '';
                    (document.getElementById('commentContent') as HTMLTextAreaElement).value = '';
                  }
                }} className="add-comment-btn">
                  <i className="fas fa-plus"></i>
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationPage; 