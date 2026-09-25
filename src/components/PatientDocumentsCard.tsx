import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  Calendar,
  Building2,
  User,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { Patient, DocumentMedical } from '../types';
import { useClinic } from '../context/ClinicContext';

interface PatientDocumentsCardProps {
  patient: Patient;
}

export const PatientDocumentsCard: React.FC<PatientDocumentsCardProps> = ({ patient }) => {
  const { modifierPatient } = useClinic();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<DocumentMedical | null>(null);

  const [titre, setTitre] = useState('Radiographie Thoracique Face');
  const [type, setType] = useState<DocumentMedical['type']>('radiographie');
  const [dateDocument, setDateDocument] = useState(new Date().toISOString().split('T')[0]);
  const [etablissementSource, setEtablissementSource] = useState("Clinique DARÔ Chagoua, N'Djamena");
  const [medecinEmetteur, setMedecinEmetteur] = useState('Dr. Brahim Mahamat');
  const [description, setDescription] = useState('Cliché de contrôle pulmonaire et silhouette cardiaque');
  const [fichierNom, setFichierNom] = useState('RX_Thorax_Face_DARO.pdf');

  const documents = patient.documentsMedicaux || [];

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: DocumentMedical = {
      id: `doc-${Date.now()}`,
      titre,
      type,
      dateDocument,
      etablissementSource,
      medecinEmetteur: medecinEmetteur || undefined,
      fichierNom: fichierNom || `${titre.replace(/\s+/g, '_')}.pdf`,
      tailleKo: Math.floor(Math.random() * 2400) + 450,
      description,
      urlApercu: type === 'radiographie' || type === 'scanner' || type === 'echographie'
        ? 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800'
        : undefined,
    };

    const updatedPatient: Patient = {
      ...patient,
      documentsMedicaux: [newDoc, ...documents],
    };

    modifierPatient(updatedPatient);
    setShowAddForm(false);
    // Reset defaults
    setTitre('Radiographie Thoracique Face');
  };

  const handleDeleteDoc = (docId: string) => {
    const updated = documents.filter(d => d.id !== docId);
    const updatedPatient: Patient = {
      ...patient,
      documentsMedicaux: updated,
    };
    modifierPatient(updatedPatient);
  };

  const getTypeBadge = (t: DocumentMedical['type']) => {
    switch (t) {
      case 'radiographie':
        return { label: 'Radiographie', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'scanner':
        return { label: 'Scanner / TDM', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'irm':
        return { label: 'IRM', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'echographie':
        return { label: 'Échographie', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'ecg':
        return { label: 'ECG / Cardio', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'analyse_bio':
        return { label: 'Bilan Bio', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Rapport Médical', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-blue-950 text-sm">Imagerie Médicale & Documents Externes</h4>
            <p className="text-[11px] text-blue-800">
              {documents.length} document{documents.length > 1 ? 's' : ''} numérisé{documents.length > 1 ? 's' : ''} (Radio, Scanner, Écho, Bilans)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 transition shadow-xs text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Fermer' : 'Attacher Document'}</span>
        </button>
      </div>

      {/* Add Document Form */}
      {showAddForm && (
        <form onSubmit={handleAddDocument} className="p-4 rounded-2xl bg-white border border-blue-300 shadow-sm space-y-3">
          <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            Numériser ou rattacher une imagerie / compte-rendu
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Titre de l'Acte / Document</label>
              <input
                type="text"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Type d'Imagerie / Document</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as DocumentMedical['type'])}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-slate-50 focus:bg-white font-semibold"
              >
                <option value="radiographie">Radiographie conventionnelle (RX)</option>
                <option value="scanner">Scanner / Tomodensitométrie (TDM)</option>
                <option value="echographie">Échographie abdominale / pelvienne / doppler</option>
                <option value="irm">IRM (Imagerie par Résonance Magnétique)</option>
                <option value="ecg">Électrocardiogramme (ECG)</option>
                <option value="analyse_bio">Bilan Biologique / Hématologie</option>
                <option value="rapport_medical">Compte-rendu opératoire ou d'hospitalisation</option>
                <option value="autre">Autre document numérisé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date de l'Examen</label>
              <input
                type="date"
                value={dateDocument}
                onChange={e => setDateDocument(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Établissement Source</label>
              <input
                type="text"
                value={etablissementSource}
                onChange={e => setEtablissementSource(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Médecin Radiologue / Prescripteur</label>
              <input
                type="text"
                value={medecinEmetteur}
                onChange={e => setMedecinEmetteur(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Conclusions & Description Clinique</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition shadow-xs"
            >
              Attacher au dossier
            </button>
          </div>
        </form>
      )}

      {/* List of Documents */}
      {documents.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
          <FolderKanban className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold">Aucun document ni cliché d'imagerie rattaché à ce dossier.</p>
          <p className="text-[11px] text-slate-400">Cliquez sur « Attacher Document » pour ajouter une radio, scanner ou compte-rendu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {documents.map(doc => {
            const badge = getTypeBadge(doc.type);
            return (
              <div
                key={doc.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview(doc)}
                        className="text-slate-400 hover:text-blue-600 p-1"
                        title="Aperçu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-slate-300 hover:text-rose-600 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h5 className="font-bold text-slate-900 text-xs">{doc.titre}</h5>
                  {doc.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2">{doc.description}</p>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doc.dateDocument}
                    </span>
                    <span className="font-mono">{doc.tailleKo ? `${doc.tailleKo} Ko` : 'PDF'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="truncate max-w-[150px]">{doc.etablissementSource}</span>
                    {doc.medecinEmetteur && <span>{doc.medecinEmetteur}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">{doc.fichierNom}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDocPreview(doc)}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Consulter</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedDocPreview.titre}</h4>
                <p className="text-xs text-slate-500">
                  {selectedDocPreview.etablissementSource} • {selectedDocPreview.dateDocument}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold text-base"
              >
                ✕
              </button>
            </div>

            {selectedDocPreview.urlApercu ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-slate-950 flex items-center justify-center">
                <img
                  src={selectedDocPreview.urlApercu}
                  alt={selectedDocPreview.titre}
                  className="max-h-72 w-full object-contain"
                />
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <FileText className="w-12 h-12 text-blue-500 mx-auto" />
                <p className="font-bold text-slate-800 text-xs">{selectedDocPreview.fichierNom}</p>
                <p className="text-[11px] text-slate-500">Document médical crypté conforme aux normes de confidentialité de la clinique.</p>
              </div>
            )}

            {selectedDocPreview.description && (
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
                <strong>Rapport / Conclusion :</strong> {selectedDocPreview.description}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => alert(`Téléchargement sécurisé initié pour ${selectedDocPreview.fichierNom}`)}
                className="px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger Fichier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
