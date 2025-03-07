export enum TaskStatus {
  Open,
  InProgress,
  Completed,
  Verified,
  Disputed,
  Cancelled
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  creator: string;
  assignee: string;
  status: TaskStatus;
  deadline: string;
  category: string;
  tags: string[];
  createdAt: string;
  metadataURI?: string;
  submissionURI?: string;
}

export interface TaskMetadata {
  description: string;
  requirements: string[];
  category: string;
  skills: string[];
  imageURI?: string;
}

export interface TaskSubmission {
  text: string;
  files: string[];
  timestamp: number;
} 