import { useState } from 'react';
import { Questao, Alternativa } from '@/types/database';

type AlternativaForm = Omit<Alternativa, 'id' | 'questao_id' | 'created_at'>;

interface QuestaoForm {
  titulo: string;
  enunciado: string;
  disciplina: string;
  assunto: string;
  nivel: 'Fácil' | 'Médio' | 'Difícil';
  tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa';
}

const LETRAS = ['A', 'B', 'C', 'D', 'E'] as const;

export const useQuestaoForm = () => {
  const [questao, setQuestao] = useState<QuestaoForm>({
    titulo: '',
    enunciado: '',
    disciplina: '',
    assunto: '',
    nivel: 'Médio',
    tipo: 'multipla_escolha'
  });

  const [alternativas, setAlternativas] = useState<AlternativaForm[]>([
    { letra: 'A', texto: '', correta: false },
    { letra: 'B', texto: '', correta: false },
    { letra: 'C', texto: '', correta: false },
    { letra: 'D', texto: '', correta: false }
  ]);

  const [errors, setErrors] = useState<{
    questao?: Partial<Record<keyof QuestaoForm, string>>;
    alternativas?: string;
    geral?: string;
  }>({});

  const handleQuestaoChange = (field: keyof QuestaoForm, value: string) => {
    setQuestao(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (errors.questao?.[field]) {
      setErrors(prev => ({
        ...prev,
        questao: {
          ...prev.questao,
          [field]: undefined
        }
      }));
    }
  };

  const handleAlternativaChange = (index: number, texto: string) => {
    const novasAlternativas = [...alternativas];
    novasAlternativas[index] = {
      ...novasAlternativas[index],
      texto
    };
    setAlternativas(novasAlternativas);

    // Limpar erro de alternativas
    if (errors.alternativas) {
      setErrors(prev => ({
        ...prev,
        alternativas: undefined
      }));
    }
  };

  const handleAlternativaCorretaChange = (index: number) => {
    const novasAlternativas = alternativas.map((alt, i) => ({
      ...alt,
      correta: i === index
    }));
    setAlternativas(novasAlternativas);
  };

  const adicionarAlternativa = () => {
    if (alternativas.length < 5) {
      const letra = LETRAS[alternativas.length];
      setAlternativas([
        ...alternativas,
        { letra, texto: '', correta: false }
      ]);
    }
  };

  const removerAlternativa = (index: number) => {
    if (alternativas.length > 2) {
      const novasAlternativas = alternativas
        .filter((_, i) => i !== index)
        .map((alt, i) => ({
          ...alt,
          letra: LETRAS[i]
        }));
      
      // Se a alternativa removida era a correta, definir a primeira como correta
      if (alternativas[index].correta && novasAlternativas.length > 0) {
        novasAlternativas[0].correta = true;
      }
      
      setAlternativas(novasAlternativas);
    }
  };

  const validarFormulario = (): boolean => {
    const questaoErrors: Partial<Record<keyof QuestaoForm, string>> = {};
    let alternativasError: string | undefined;
    let geralError: string | undefined;

    // Validar campos da questão
    if (!questao.titulo.trim()) {
      questaoErrors.titulo = 'O título é obrigatório';
    }

    if (!questao.enunciado.trim()) {
      questaoErrors.enunciado = 'O enunciado é obrigatório';
    }

    if (!questao.disciplina.trim()) {
      questaoErrors.disciplina = 'A disciplina é obrigatória';
    }

    // Validar alternativas
    if (questao.tipo === 'multipla_escolha') {
      // Verificar se todas as alternativas têm texto
      const alternativasSemTexto = alternativas.some(alt => !alt.texto.trim());
      if (alternativasSemTexto) {
        alternativasError = 'Todas as alternativas devem ter um texto';
      }

      // Verificar se há pelo menos uma alternativa correta
      const temAlternativaCorreta = alternativas.some(alt => alt.correta);
      if (!temAlternativaCorreta) {
        alternativasError = 'Selecione pelo menos uma alternativa correta';
      }
    }

    // Definir erros
    const temErros = 
      Object.keys(questaoErrors).length > 0 || 
      alternativasError !== undefined;

    setErrors({
      questao: Object.keys(questaoErrors).length > 0 ? questaoErrors : undefined,
      alternativas: alternativasError,
      geral: temErros ? 'Corrija os erros antes de salvar' : undefined
    });

    return !temErros;
  };

  const prepararDadosParaSalvar = () => {
    const questaoParaSalvar: Omit<Questao, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      titulo: questao.titulo,
      enunciado: questao.enunciado,
      disciplina: questao.disciplina || null,
      assunto: questao.assunto || null,
      nivel: questao.nivel,
      tipo: questao.tipo
    };

    return {
      questao: questaoParaSalvar,
      alternativas: questao.tipo === 'multipla_escolha' ? alternativas : []
    };
  };

  const resetarFormulario = () => {
    setQuestao({
      titulo: '',
      enunciado: '',
      disciplina: '',
      assunto: '',
      nivel: 'Médio',
      tipo: 'multipla_escolha'
    });

    setAlternativas([
      { letra: 'A', texto: '', correta: false },
      { letra: 'B', texto: '', correta: false },
      { letra: 'C', texto: '', correta: false },
      { letra: 'D', texto: '', correta: false }
    ]);

    setErrors({});
  };

  return {
    questao,
    alternativas,
    errors,
    handleQuestaoChange,
    handleAlternativaChange,
    handleAlternativaCorretaChange,
    adicionarAlternativa,
    removerAlternativa,
    validarFormulario,
    prepararDadosParaSalvar,
    resetarFormulario
  };
};

