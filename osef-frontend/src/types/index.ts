export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
};

export type Event = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdBy: number;
  creatorName?: string;
  creatorEmail?: string;
  affectedUsers?: User[];
  createdAt: string;
};

export type AuthResponse = {
  token: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  name: string;
  email: string;
  password: string;
};

