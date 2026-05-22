export const API_URL = import.meta.env.VITE_API_URL;

export const FIELD_LABELS = {
  project_name: 'Project Name',
  problem:      'Problem Statement',
  features:     'Key Features',
  users:        'Target Users',
  goals:        'Goals & Success Metrics',
};

export const INITIAL_FORM = {
  project_name: '',
  problem: '',
  features: '',
  users: '',
  goals: '',
};

export const SECTION_TITLES = [
  'Executive Summary',
  'Problem Statement & Background',
  'Target Users & Personas',
  'Goals & Success Metrics (KPIs)',
  'Key Features & Functional Requirements',
  'Technology Stack',
  'System Architecture Overview',
  'Development Phases & Timeline',
  'Milestones & Deliverables',
  'Non-Functional Requirements',
  'Risk Assessment & Mitigation',
  'Out of Scope',
];

export const initSections = () =>
  SECTION_TITLES.map((title) => ({ title, status: 'pending' }));
