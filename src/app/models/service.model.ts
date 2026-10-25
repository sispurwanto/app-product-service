export interface ServiceItem {
  id: string;
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  category: 'repair' | 'care' | 'custom' | string;
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'indigo' | 'cyan' | 'rose';
  shortDesc: string;
  fullDesc: string;
  keyFeatures: string[];
  workflowNote: string;
  iconName: string;
  typicalCases: string[];
  estimatedTurnaround: string;
  active: boolean;
  createdAt?: string;
}

export interface TechStackItem {
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
  tags: string[];
}
