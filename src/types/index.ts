export type User = {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Repo = {
  id: string;
  name: string;
  owner: string;
  description: string;
  url: string;
};

export type CodeSuggestion = {
  code: string;
  explanation: string;
};

export type RegexTestResult = {
  input: string;
  pattern: string;
  matches: string[];
};

export type AIResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};