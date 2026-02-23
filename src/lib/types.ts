export const TYPES_LOADED = true;

export interface Project {
  id: string;
  user_id: string;
  title: string;
  color: string;
  created_at: string;
}

export interface ProjectActivityLog {
  id: string;
  project_id: string;
  user_id: string;
  date: string;
  value: number;
  created_at: string;
}

export interface ProjectWithActivities extends Project {
  activities: ProjectActivityLog[];
}
