import { Cours, Professeur, Salle, Delegue, EmploiTemps, Seance } from '@/types';

export const cours: Cours[] = [
  { id_cours: 1, nom_cours: 'Algorithmique Avancée', code_cours: 'INFO301', description: 'Structures de données et algorithmes' },
  { id_cours: 2, nom_cours: 'Bases de Données', code_cours: 'INFO302', description: 'SQL, NoSQL et modélisation' },
  { id_cours: 3, nom_cours: 'Réseaux Informatiques', code_cours: 'INFO303', description: 'Protocoles et architecture réseau' },
  { id_cours: 4, nom_cours: 'Développement Web', code_cours: 'INFO304', description: 'Frontend et Backend' },
  { id_cours: 5, nom_cours: 'Gestion de Projet', code_cours: 'MGT201', description: 'Méthodologies agiles' },
  { id_cours: 6, nom_cours: 'Mathématiques Discrètes', code_cours: 'MAT301', description: 'Logique et théorie des graphes' },
  { id_cours: 7, nom_cours: 'Systèmes d\'Exploitation', code_cours: 'INFO305', description: 'Linux et administration système' },
  { id_cours: 8, nom_cours: 'Intelligence Artificielle', code_cours: 'INFO401', description: 'Machine Learning et Deep Learning' },
];

export const professeurs: Professeur[] = [
  { id_prof: 1, nom: 'Koffi', prenom: 'Ama', email: 'ama.koffi@esgis.tg', telephone: '+228 90 12 34 56', specialite: 'Informatique' },
  { id_prof: 2, nom: 'Mensah', prenom: 'Kofi', email: 'kofi.mensah@esgis.tg', telephone: '+228 91 23 45 67', specialite: 'Réseaux' },
  { id_prof: 3, nom: 'Agbeko', prenom: 'Yao', email: 'yao.agbeko@esgis.tg', telephone: '+228 92 34 56 78', specialite: 'Mathématiques' },
  { id_prof: 4, nom: 'Dosseh', prenom: 'Akouvi', email: 'akouvi.dosseh@esgis.tg', telephone: '+228 93 45 67 89', specialite: 'Gestion' },
  { id_prof: 5, nom: 'Amegah', prenom: 'Edem', email: 'edem.amegah@esgis.tg', telephone: '+228 94 56 78 90', specialite: 'IA & Data' },
  { id_prof: 6, nom: 'Tetteh', prenom: 'Sena', email: 'sena.tetteh@esgis.tg', telephone: '+228 95 67 89 01', specialite: 'Développement' },
];

export const salles: Salle[] = [
  { id_salle: 1, nom_salle: 'Salle A1', capacite: 40, pole: 'Adidogomé' },
  { id_salle: 2, nom_salle: 'Salle A2', capacite: 35, pole: 'Adidogomé' },
  { id_salle: 3, nom_salle: 'Salle A3', capacite: 50, pole: 'Adidogomé' },
  { id_salle: 4, nom_salle: 'Amphi B1', capacite: 100, pole: 'Avédji' },
  { id_salle: 5, nom_salle: 'Salle B2', capacite: 30, pole: 'Avédji' },
  { id_salle: 6, nom_salle: 'Salle B3', capacite: 45, pole: 'Avédji' },
  { id_salle: 7, nom_salle: 'Salle K1', capacite: 40, pole: 'Kodjoviakopé' },
  { id_salle: 8, nom_salle: 'Salle K2', capacite: 35, pole: 'Kodjoviakopé' },
  { id_salle: 9, nom_salle: 'Amphi K3', capacite: 80, pole: 'Kodjoviakopé' },
  { id_salle: 10, nom_salle: 'Labo Info K4', capacite: 25, pole: 'Kodjoviakopé' },
];

export const delegues: Delegue[] = [
  { id_delegue: 1, nom: 'Assou', prenom: 'Kafui', email: 'kafui.assou@esgis.tg', id_salle: 1 },
  { id_delegue: 2, nom: 'Blewu', prenom: 'Afi', email: 'afi.blewu@esgis.tg', id_salle: 2 },
  { id_delegue: 3, nom: 'Creppy', prenom: 'Kodjo', email: 'kodjo.creppy@esgis.tg', id_salle: 3 },
  { id_delegue: 4, nom: 'Degbe', prenom: 'Mawu', email: 'mawu.degbe@esgis.tg', id_salle: 4 },
  { id_delegue: 5, nom: 'Eklu', prenom: 'Essi', email: 'essi.eklu@esgis.tg', id_salle: 5 },
  { id_delegue: 6, nom: 'Fiawoo', prenom: 'Komi', email: 'komi.fiawoo@esgis.tg', id_salle: 6 },
  { id_delegue: 7, nom: 'Gakpe', prenom: 'Dela', email: 'dela.gakpe@esgis.tg', id_salle: 7 },
  { id_delegue: 8, nom: 'Hotse', prenom: 'Ablavi', email: 'ablavi.hotse@esgis.tg', id_salle: 8 },
  { id_delegue: 9, nom: 'Iku', prenom: 'Mensah', email: 'mensah.iku@esgis.tg', id_salle: 9 },
  { id_delegue: 10, nom: 'Jato', prenom: 'Enyonam', email: 'enyonam.jato@esgis.tg', id_salle: 10 },
];

export const emploiTemps: EmploiTemps[] = [
  { id_emploi: 1, titre: 'Planning Semestre 1 - 2025/2026', date_debut: '2025-10-06', date_fin: '2025-11-02', statut: 'publié' },
  { id_emploi: 2, titre: 'Planning Examens Novembre', date_debut: '2025-11-03', date_fin: '2025-11-30', statut: 'brouillon' },
];

export const seances: Seance[] = [
  // Semaine 1
  { id_seance: 1, id_emploi: 1, id_cours: 1, id_salle: 1, type_seance: 'cours', date: '2025-10-06', heure_debut: '08:00', heure_fin: '10:00', semaine: 1, professeurs: [{ id_prof: 1, role: 'enseignant' }] },
  { id_seance: 2, id_emploi: 1, id_cours: 2, id_salle: 1, type_seance: 'cours', date: '2025-10-06', heure_debut: '10:15', heure_fin: '12:15', semaine: 1, professeurs: [{ id_prof: 2, role: 'enseignant' }] },
  { id_seance: 3, id_emploi: 1, id_cours: 3, id_salle: 4, type_seance: 'cours', date: '2025-10-07', heure_debut: '08:00', heure_fin: '10:00', semaine: 1, professeurs: [{ id_prof: 2, role: 'enseignant' }] },
  { id_seance: 4, id_emploi: 1, id_cours: 4, id_salle: 7, type_seance: 'cours', date: '2025-10-07', heure_debut: '14:00', heure_fin: '16:00', semaine: 1, professeurs: [{ id_prof: 6, role: 'enseignant' }] },
  { id_seance: 5, id_emploi: 1, id_cours: 5, id_salle: 5, type_seance: 'cours', date: '2025-10-08', heure_debut: '08:00', heure_fin: '10:00', semaine: 1, professeurs: [{ id_prof: 4, role: 'enseignant' }] },
  { id_seance: 6, id_emploi: 1, id_cours: 6, id_salle: 9, type_seance: 'cours', date: '2025-10-08', heure_debut: '10:15', heure_fin: '12:15', semaine: 1, professeurs: [{ id_prof: 3, role: 'enseignant' }] },
  { id_seance: 7, id_emploi: 1, id_cours: 8, id_salle: 10, type_seance: 'cours', date: '2025-10-09', heure_debut: '08:00', heure_fin: '10:00', semaine: 1, professeurs: [{ id_prof: 5, role: 'enseignant' }] },
  { id_seance: 8, id_emploi: 1, id_cours: 7, id_salle: 3, type_seance: 'cours', date: '2025-10-10', heure_debut: '14:00', heure_fin: '16:00', semaine: 1, professeurs: [{ id_prof: 1, role: 'enseignant' }] },
  // Semaine 2
  { id_seance: 9, id_emploi: 1, id_cours: 1, id_salle: 1, type_seance: 'cours', date: '2025-10-13', heure_debut: '08:00', heure_fin: '10:00', semaine: 2, professeurs: [{ id_prof: 1, role: 'enseignant' }] },
  { id_seance: 10, id_emploi: 1, id_cours: 4, id_salle: 8, type_seance: 'cours', date: '2025-10-14', heure_debut: '10:15', heure_fin: '12:15', semaine: 2, professeurs: [{ id_prof: 6, role: 'enseignant' }] },
  { id_seance: 11, id_emploi: 1, id_cours: 2, id_salle: 4, type_seance: 'examen', date: '2025-10-15', heure_debut: '08:00', heure_fin: '11:00', semaine: 2, professeurs: [{ id_prof: 2, role: 'enseignant' }, { id_prof: 3, role: 'surveillant' }, { id_prof: 4, role: 'surveillant' }] },
  { id_seance: 12, id_emploi: 1, id_cours: 8, id_salle: 10, type_seance: 'cours', date: '2025-10-16', heure_debut: '14:00', heure_fin: '16:00', semaine: 2, professeurs: [{ id_prof: 5, role: 'enseignant' }] },
  // Semaine 3
  { id_seance: 13, id_emploi: 1, id_cours: 3, id_salle: 6, type_seance: 'cours', date: '2025-10-20', heure_debut: '08:00', heure_fin: '10:00', semaine: 3, professeurs: [{ id_prof: 2, role: 'enseignant' }] },
  { id_seance: 14, id_emploi: 1, id_cours: 5, id_salle: 2, type_seance: 'cours', date: '2025-10-21', heure_debut: '10:15', heure_fin: '12:15', semaine: 3, professeurs: [{ id_prof: 4, role: 'enseignant' }] },
  { id_seance: 15, id_emploi: 1, id_cours: 6, id_salle: 7, type_seance: 'examen', date: '2025-10-22', heure_debut: '08:00', heure_fin: '11:00', semaine: 3, professeurs: [{ id_prof: 3, role: 'enseignant' }, { id_prof: 1, role: 'surveillant' }] },
  // Semaine 4
  { id_seance: 16, id_emploi: 1, id_cours: 1, id_salle: 9, type_seance: 'examen', date: '2025-10-27', heure_debut: '08:00', heure_fin: '11:00', semaine: 4, professeurs: [{ id_prof: 1, role: 'enseignant' }, { id_prof: 5, role: 'surveillant' }, { id_prof: 6, role: 'surveillant' }] },
  { id_seance: 17, id_emploi: 1, id_cours: 7, id_salle: 3, type_seance: 'cours', date: '2025-10-28', heure_debut: '14:00', heure_fin: '16:00', semaine: 4, professeurs: [{ id_prof: 1, role: 'enseignant' }] },
  { id_seance: 18, id_emploi: 1, id_cours: 4, id_salle: 7, type_seance: 'cours', date: '2025-10-29', heure_debut: '08:00', heure_fin: '10:00', semaine: 4, professeurs: [{ id_prof: 6, role: 'enseignant' }] },
];
