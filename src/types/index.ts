export type Pole = 'Adidogomé' | 'Avédji' | 'Kodjoviakopé';

export interface Cours {
  id_cours: number;
  nom_cours: string;
  code_cours: string;
  description: string;
  heures_total: number | null;
}

export interface Professeur {
  id_prof: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  mot_de_passe: string | null;
}

export interface Salle {
  id_salle: number;
  nom_salle: string;
  capacite: number;
  pole: Pole;
}

export interface Delegue {
  id_delegue: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  id_salle: number;
  niveau: string | null;
  mot_de_passe: string | null;
}

export interface EmploiTemps {
  id_emploi: number;
  titre: string;
  date_debut: string;
  date_fin: string;
  statut: 'brouillon' | 'publié';
}

export type TypeSeance = 'cours' | 'examen';
export type RoleProfesseur = 'enseignant' | 'surveillant';

export interface SeanceProfesseur {
  id_prof: number;
  role: RoleProfesseur;
}

export interface Seance {
  id_seance: number;
  id_emploi: number;
  id_cours: number;
  id_salle: number;
  type_seance: TypeSeance;
  date: string;
  heure_debut: string;
  heure_fin: string;
  semaine: 1 | 2 | 3 | 4;
  professeurs: SeanceProfesseur[];
}

export interface ConfigPlanning {
  id?: number;
  date_semaine: string;
  nb_colonnes: number;
  nb_lignes: number;
}

export interface Disponibilite {
  id?: number;
  id_prof: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  disponible: boolean;
}

export type UserRole = 'admin' | 'professeur' | 'delegue';
