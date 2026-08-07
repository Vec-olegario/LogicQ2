"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/logiq/topbar";
import { PageShell } from "@/components/logiq/page-shell";
import { Brain, CheckCircle, RefreshCcw, XCircle, Play, AlertCircle, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ModoJogo, 
  QuizSession, 
  inicializarSessaoQuiz, 
  obterPerguntaComOrdem, 
  QuestionForDisplay, 
  calcularAnaliseDesempenho 
} from "@/lib/quiz-service";

export default function QuizPage() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const startQuiz = (modo: ModoJogo, topico?: string) => {
    setSession(inicializarSessaoQuiz(modo, topico));
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const currentQuestion = session && session.state === "PLAYING" 
    ? obterPerguntaComOrdem(session.perguntasIds[session.idx], session.opcoesOrders[session.idx]) 
    : null;

  const handleConfirmAnswer = () => {
    if (!session || !currentQuestion || selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correta;
    
    // Update session state
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pontuacao: isCorrect ? prev.pontuacao + 1 : prev.pontuacao,
        respostas: {
          ...prev.respostas,
          [prev.idx]: { correta: isCorrect, topico: currentQuestion.topico }
        }
      };
    });

    setShowExplanation(true);
  };

  const handleNext = () => {
    if (!session) return;
    
    if (session.idx < session.perguntasIds.length - 1) {
      setSession(prev => prev ? { ...prev, idx: prev.idx + 1 } : prev);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setSession(prev => prev ? { ...prev, state: "FINISHED" } : prev);
    }
  };

  const renderMenu = () => (
    <div className="max-w-4xl mx-auto w-full p-6 mt-2">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Pratique seus conhecimentos sobre Centro de Distribuição com questões oficiais da plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-primary/50 transition-colors flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="text-primary" size={20} /> Jogo Rápido
            </CardTitle>
            <CardDescription>Ideal para quando você tem pouco tempo.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">5 perguntas aleatórias cobrindo todos os setores do armazém.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => startQuiz("rapido")}>Iniciar</Button>
          </CardFooter>
        </Card>

        <Card className="hover:border-primary/50 transition-colors flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-primary" size={20} /> Padrão
            </CardTitle>
            <CardDescription>O teste clássico para medir conhecimentos.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">15 perguntas aleatórias. Bom equilíbrio entre tempo e profundidade.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => startQuiz("padrao")}>Iniciar</Button>
          </CardFooter>
        </Card>

        <Card className="hover:border-primary/50 transition-colors flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="text-primary" size={20} /> Completo
            </CardTitle>
            <CardDescription>O desafio definitivo (Mestre WMS).</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">Todas as 32 perguntas do banco de dados em uma única sessão.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-primary hover:opacity-90 text-white border-0 shadow-md" onClick={() => startQuiz("completo")}>Iniciar Desafio</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  const renderPlaying = () => {
    if (!session || !currentQuestion) return null;
    
    const isCorrect = selectedOption === currentQuestion.correta;
    const progress = (session.idx / session.perguntasIds.length) * 100;

    return (
      <div className="max-w-3xl mx-auto w-full p-6 mt-6">
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-3">
            <span className="bg-muted px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {currentQuestion.topico}
            </span>
            <span>Pergunta {session.idx + 1} de {session.perguntasIds.length}</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        <Card className="border-border/50 shadow-sm mb-6">
          <CardHeader className="bg-muted/20 pb-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded border ${
                currentQuestion.dificuldade === 'Fácil' ? 'bg-green-100/50 text-green-700 border-green-200' :
                currentQuestion.dificuldade === 'Médio' ? 'bg-yellow-100/50 text-yellow-700 border-yellow-200' :
                'bg-red-100/50 text-red-700 border-red-200'
              }`}>
                {currentQuestion.dificuldade}
              </span>
            </div>
            <CardTitle className="text-2xl leading-relaxed">
              {currentQuestion.pergunta}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6 pb-6">
            {currentQuestion.opcoes.map((opt, i) => {
              // Lógica de cores baseada no estado de explicação
              let btnClass = "hover:border-primary/50 bg-background";
              let iconClass = "bg-muted text-muted-foreground";
              
              if (showExplanation) {
                if (i === currentQuestion.correta) {
                  // A certa sempre fica verde após responder
                  btnClass = "border-green-500 bg-green-50 text-green-900";
                  iconClass = "bg-green-500 text-white";
                } else if (i === selectedOption) {
                  // A errada que o user escolheu fica vermelha
                  btnClass = "border-red-500 bg-red-50 text-red-900";
                  iconClass = "bg-red-500 text-white";
                } else {
                  // As outras ficam desativadas
                  btnClass = "opacity-50 pointer-events-none";
                }
              } else {
                if (selectedOption === i) {
                  btnClass = "ring-2 ring-primary ring-offset-2 border-transparent bg-background";
                  iconClass = "bg-primary text-primary-foreground";
                }
              }

              return (
                <Button 
                  key={i} 
                  variant="outline" 
                  disabled={showExplanation}
                  className={`w-full justify-start h-auto py-4 px-6 text-left whitespace-normal text-base transition-all ${btnClass}`}
                  onClick={() => setSelectedOption(i)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${iconClass}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    {opt}
                  </div>
                </Button>
              )
            })}
          </CardContent>
          
          <CardFooter className="bg-muted/10 border-t pt-6 pb-6 flex justify-end">
            {!showExplanation ? (
              <Button 
                size="lg"
                disabled={selectedOption === null}
                onClick={handleConfirmAnswer}
                className="px-8 shadow-sm"
              >
                Confirmar Resposta
              </Button>
            ) : (
              <Button 
                size="lg"
                onClick={handleNext}
                className="px-8 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md border-0"
              >
                {session.idx === session.perguntasIds.length - 1 ? "Ver Resultado" : "Próxima Pergunta"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {showExplanation && (
          <div className={`p-5 rounded-xl border flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 ${
            isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}>
            <div className="mt-1">
              {isCorrect ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
            </div>
            <div>
              <h4 className={`font-bold mb-1 ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                {isCorrect ? "Você Acertou!" : "Você Errou!"}
              </h4>
              <p className={isCorrect ? "text-green-900/80" : "text-red-900/80"}>
                {currentQuestion.explicacao}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFinished = () => {
    if (!session) return null;
    const analise = calcularAnaliseDesempenho(session.perguntasIds, session.respostas);
    const taxaAcerto = Math.round((session.pontuacao / session.perguntasIds.length) * 100);

    return (
      <div className="max-w-4xl mx-auto w-full p-6 mt-6">
        <div className="text-center mb-10">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 ${
            taxaAcerto >= 70 ? 'bg-green-100 text-green-600 border-green-200' : 
            taxaAcerto >= 50 ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : 
            'bg-red-100 text-red-600 border-red-200'
          }`}>
            {taxaAcerto >= 70 ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Quiz Concluído!</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto mb-2">
            Você acertou <span className="font-bold text-foreground">{session.pontuacao}</span> de <span className="font-bold text-foreground">{session.perguntasIds.length}</span> perguntas.
          </p>
          <div className="inline-block bg-muted px-4 py-1 rounded-full font-bold text-lg">
            Nota: {taxaAcerto}%
          </div>
        </div>

        <h3 className="text-xl font-bold mb-6 text-center">Desempenho por Setor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {Object.entries(analise).map(([topico, dados]) => {
            const perc = Math.round((dados.acertos / dados.total) * 100);
            return (
              <Card key={topico} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{topico}</span>
                      <span className="text-sm font-medium">{dados.acertos} / {dados.total}</span>
                    </div>
                    <Progress value={perc} className={`h-2 ${perc < 50 ? '[&>div]:bg-red-500' : perc < 80 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center">
          <Button size="lg" onClick={() => setSession(null)} className="gap-2 px-8 shadow-sm">
            <RefreshCcw size={18} />
            Voltar ao Menu
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PageShell title="Quiz Logístico" subtitle="Teste seus conhecimentos práticos e teóricos de WMS.">
      <Topbar />
      
      {(!session || session.state === "MENU") && renderMenu()}
      {session?.state === "PLAYING" && renderPlaying()}
      {session?.state === "FINISHED" && renderFinished()}
      
    </PageShell>
  );
}
