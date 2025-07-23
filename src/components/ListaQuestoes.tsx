import React from 'react';
import { useQuestoes, QuestaoCompleta } from '@/hooks/useQuestoes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { VisualizarQuestao } from './VisualizarQuestao';

export const ListaQuestoes: React.FC = () => {
  const { questoes, loading, error, deleteQuestao } = useQuestoes();
  const [questaoSelecionada, setQuestaoSelecionada] = React.useState<QuestaoCompleta | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta questão?')) {
      try {
        await deleteQuestao(id);
        toast.success('Questão excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir questão.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando questões...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (questoes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Você ainda não criou nenhuma questão.</p>
        <Button asChild>
          <a href="/criar-questao">Criar minha primeira questão</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questaoSelecionada && (
        <VisualizarQuestao
          questao={questaoSelecionada}
          onClose={() => setQuestaoSelecionada(null)}
        />
      )}
      
      {questoes.map((questao) => (
        <Card key={questao.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium">{questao.titulo}</CardTitle>
              <div className="flex gap-1">
                <Badge variant={questao.nivel === 'Fácil' ? 'outline' : questao.nivel === 'Médio' ? 'secondary' : 'destructive'}>
                  {questao.nivel}
                </Badge>
                {questao.disciplina && (
                  <Badge variant="outline" className="bg-primary/10">
                    {questao.disciplina}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              {questao.enunciado.length > 150
                ? `${questao.enunciado.substring(0, 150)}...`
                : questao.enunciado}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {questao.assunto && (
                <Badge variant="outline" className="text-xs">
                  {questao.assunto}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {questao.tipo === 'multipla_escolha'
                  ? 'Múltipla Escolha'
                  : questao.tipo === 'verdadeiro_falso'
                  ? 'Verdadeiro/Falso'
                  : 'Dissertativa'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {new Date(questao.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(questao.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuestaoSelecionada(questao)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Visualizar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

