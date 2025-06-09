export interface AiderConfig {
  model: string;
  editorModel?: string;
  editableFiles: string[];
  readOnlyFiles?: string[];
  prompt: string;
  autoCommits?: boolean;
  useGit?: boolean;
  timeout?: number;
  workingDir?: string;
  environment?: Record<string, string>;
}

export interface AiderResult {
  success: boolean;
  diff: string;
  logs: string[];
  filesChanged?: string[];
  commitHash?: string;
  error?: string;
  exitCode?: number;
}

export interface DockerConfig {
  image: string;
  memoryLimit?: number;
  cpuShares?: number;
  timeout?: number;
  autoRemove?: boolean;
  user?: string;
}

export interface BuildResult {
  success: boolean;
  commitHash?: string;
  filesChanged?: string[];
  error?: string;
  reviewRequired?: boolean;
}

export interface StoryAnalysis {
  writeableFiles: string[];
  readOnlyFiles: string[];
  dependencies: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: number;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  technicalTasks: string[];
  filePaths: {
    readOnly: string[];
    writeable: string[];
  };
  libraries: string[];
  storyPoints: number;
  status: string;
}

export interface AiderLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: 'aider' | 'docker' | 'client';
}

export interface ContainerStats {
  memoryUsage: number;
  cpuUsage: number;
  duration: number;
  exitCode: number;
}
