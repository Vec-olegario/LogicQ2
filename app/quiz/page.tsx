"use client";

import React from "react";
import { Topbar } from "@/components/logiq/topbar";
import { PageShell } from "@/components/logiq/page-shell";
import { Brain } from "lucide-react";

export default function QuizPage() {
  return (
    <PageShell title="Quiz Logístico" subtitle="Teste seus conhecimentos práticos e teóricos de WMS.">
      <Topbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Brain size={32} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Quiz em Breve</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A página de Quiz está sendo preparada. Logo você terá novos desafios para testar seus conhecimentos!
        </p>
      </div>
    </PageShell>
  );
}
