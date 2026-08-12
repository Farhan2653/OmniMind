export interface Profile {
  id: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
  tier: 'free' | 'premium' | 'enterprise';
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender: 'user' | 'ai';
  content: string;
  created_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  role_title: string;
  feedback: string | null;
  score: number | null;
  transcript: any;
  status: 'pending' | 'completed' | 'in_progress';
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  analysis: any;
  score: number | null;
  created_at: string;
}

export interface ResearchQuery {
  id: string;
  user_id: string;
  query: string;
  results: any;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'paused';
  configuration: any;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'updated_at'>;
        Update: Partial<Profile>;
      };
      chats: {
        Row: Chat;
        Insert: Omit<Chat, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Chat>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Message>;
      };
      interviews: {
        Row: Interview;
        Insert: Omit<Interview, 'id' | 'created_at'>;
        Update: Partial<Interview>;
      };
      resumes: {
        Row: Resume;
        Insert: Omit<Resume, 'id' | 'created_at'>;
        Update: Partial<Resume>;
      };
      research_queries: {
        Row: ResearchQuery;
        Insert: Omit<ResearchQuery, 'id' | 'created_at'>;
        Update: Partial<ResearchQuery>;
      };
      agents: {
        Row: Agent;
        Insert: Omit<Agent, 'id' | 'created_at'>;
        Update: Partial<Agent>;
      };
    };
  };
}
