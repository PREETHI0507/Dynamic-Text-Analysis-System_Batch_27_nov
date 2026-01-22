
export interface AnalysisResult {
  summary: string;
  themes: Theme[];
  sentiment: {
    score: number; // -1 to 1
    label: string;
    explanation: string;
  };
  entities: Entity[];
  actionableInsights: string[];
}

export interface Theme {
  name: string;
  relevance: number; // 0 to 1
  description: string;
  connections: string[]; // names of other themes
}

export interface Entity {
  name: string;
  type: string;
  significance: string;
}

export enum AppState {
  LANDING = 'LANDING',
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD'
}
