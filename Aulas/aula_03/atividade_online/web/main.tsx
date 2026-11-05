import "@fontsource-variable/roboto-flex";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Atividade } from "./paginas/Atividade";
import { Entrar } from "./paginas/Entrar";
import { Professor } from "./paginas/Professor";
import { ProfessorDados } from "./paginas/ProfessorDados";
import { ProfessorGrafico } from "./paginas/ProfessorGrafico";
import { ProfessorQuestao } from "./paginas/ProfessorQuestao";
import { aplicarTema } from "./tema";

aplicarTema();

const cliente = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, refetchOnWindowFocus: true },
  },
});

createRoot(document.getElementById("raiz")!).render(
  <StrictMode>
    <QueryClientProvider client={cliente}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Entrar />} />
          <Route path="/atividade" element={<Atividade />} />
          <Route path="/professor" element={<Professor />} />
          <Route path="/professor/grafico" element={<ProfessorGrafico />} />
          <Route path="/professor/q/:id" element={<ProfessorQuestao />} />
          <Route path="/professor/dados" element={<ProfessorDados />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
