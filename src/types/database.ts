export type Database = {
  public: {
    Tables: {
      questoes: {
        Row: {
          id: string;
          user_id: string;
          titulo: string;
          enunciado: string;
          disciplina: string | null;
          assunto: string | null;
          nivel: 'Fácil' | 'Médio' | 'Difícil' | null;
          tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          titulo: string;
          enunciado: string;
          disciplina?: string | null;
          assunto?: string | null;
          nivel?: 'Fácil' | 'Médio' | 'Difícil' | null;
          tipo?: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          titulo?: string;
          enunciado?: string;
          disciplina?: string | null;
          assunto?: string | null;
          nivel?: 'Fácil' | 'Médio' | 'Difícil' | null;
          tipo?: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa';
          created_at?: string;
          updated_at?: string;
        };
      };
      alternativas: {
        Row: {
          id: string;
          questao_id: string;
          letra: 'A' | 'B' | 'C' | 'D' | 'E';
          texto: string;
          correta: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          questao_id: string;
          letra: 'A' | 'B' | 'C' | 'D' | 'E';
          texto: string;
          correta?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          questao_id?: string;
          letra?: 'A' | 'B' | 'C' | 'D' | 'E';
          texto?: string;
          correta?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type Questao = Database['public']['Tables']['questoes']['Row'];
export type QuestaoInsert = Database['public']['Tables']['questoes']['Insert'];
export type QuestaoUpdate = Database['public']['Tables']['questoes']['Update'];

export type Alternativa = Database['public']['Tables']['alternativas']['Row'];
export type AlternativaInsert = Database['public']['Tables']['alternativas']['Insert'];
export type AlternativaUpdate = Database['public']['Tables']['alternativas']['Update'];

