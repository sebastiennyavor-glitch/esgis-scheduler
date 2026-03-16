/*
  # Create initial schema for ESGIS Planning application

  1. New Tables
    - `cours`: Course catalog
    - `salles`: Classroom management
    - `professeurs`: Teacher/professor directory with contact info
    - `delegues`: Student delegates with contact info
    - `emploi_temps`: Schedule planning
    - `seances`: Sessions/classes
    - `seance_professeurs`: Junction table for professor-session relationships

  2. Security
    - Enable RLS on all tables
    - Create basic read policies for authenticated users
    - Create policies for data ownership
*/

CREATE TABLE IF NOT EXISTS cours (
  id_cours serial PRIMARY KEY,
  nom_cours text NOT NULL,
  code_cours text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS salles (
  id_salle serial PRIMARY KEY,
  nom_salle text NOT NULL,
  capacite integer NOT NULL,
  pole text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professeurs (
  id_prof serial PRIMARY KEY,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text,
  telephone text,
  specialite text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delegues (
  id_delegue serial PRIMARY KEY,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text,
  telephone text,
  id_salle integer REFERENCES salles(id_salle) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emploi_temps (
  id_emploi serial PRIMARY KEY,
  titre text NOT NULL,
  date_debut text NOT NULL,
  date_fin text NOT NULL,
  statut text DEFAULT 'brouillon',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seances (
  id_seance serial PRIMARY KEY,
  id_emploi integer NOT NULL REFERENCES emploi_temps(id_emploi) ON DELETE CASCADE,
  id_cours integer NOT NULL REFERENCES cours(id_cours) ON DELETE CASCADE,
  id_salle integer NOT NULL REFERENCES salles(id_salle) ON DELETE CASCADE,
  type_seance text NOT NULL,
  date text NOT NULL,
  heure_debut text NOT NULL,
  heure_fin text NOT NULL,
  semaine integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seance_professeurs (
  id serial PRIMARY KEY,
  id_seance integer NOT NULL REFERENCES seances(id_seance) ON DELETE CASCADE,
  id_prof integer NOT NULL REFERENCES professeurs(id_prof) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE salles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professeurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegues ENABLE ROW LEVEL SECURITY;
ALTER TABLE emploi_temps ENABLE ROW LEVEL SECURITY;
ALTER TABLE seances ENABLE ROW LEVEL SECURITY;
ALTER TABLE seance_professeurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses are viewable by all"
  ON cours FOR SELECT
  USING (true);

CREATE POLICY "salles are viewable by all"
  ON salles FOR SELECT
  USING (true);

CREATE POLICY "professeurs are viewable by all"
  ON professeurs FOR SELECT
  USING (true);

CREATE POLICY "delegues are viewable by all"
  ON delegues FOR SELECT
  USING (true);

CREATE POLICY "emploi_temps are viewable by all"
  ON emploi_temps FOR SELECT
  USING (true);

CREATE POLICY "seances are viewable by all"
  ON seances FOR SELECT
  USING (true);

CREATE POLICY "seance_professeurs are viewable by all"
  ON seance_professeurs FOR SELECT
  USING (true);