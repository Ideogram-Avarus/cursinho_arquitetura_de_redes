import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { api, ErroApi, gravarToken, lerToken, mensagemDeErro } from "../lib/api";
import { Abas, Aviso, Botao, CampoTexto, Cartao } from "../componentes/ui";

type Aba = "entrar" | "criar";

export function Entrar() {
  const navegar = useNavigate();
  const [aba, setAba] = useState<Aba>("criar");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");

  const enviar = useMutation({
    mutationFn: () =>
      aba === "criar"
        ? api<{ token: string }>("POST", "/auth/cadastro", { usuario, senha, nome })
        : api<{ token: string }>("POST", "/auth/login", { usuario, senha }),
    onSuccess: ({ token }) => {
      gravarToken(token);
      navegar("/atividade", { replace: true });
    },
  });

  if (lerToken()) return <Navigate to="/atividade" replace />;

  const aoEnviar = (e: FormEvent) => {
    e.preventDefault();
    enviar.mutate();
  };

  const erro = enviar.error;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">Arquitetura de Redes · Aula 03</p>
        <h1 className="text-3xl font-normal">O que ficou das aulas 01 e 02?</h1>
        <p className="text-on-surface-variant">Não é prova e não vale nota.</p>
      </div>

      <Cartao className="flex flex-col gap-5 p-0! pb-5!">
        <Abas<Aba>
          abas={[
            { id: "criar", rotulo: "Criar conta" },
            { id: "entrar", rotulo: "Entrar" },
          ]}
          ativa={aba}
          aoMudar={(a) => {
            setAba(a);
            enviar.reset();
          }}
        />
        <form onSubmit={aoEnviar} className="flex flex-col gap-4 px-5">
          {aba === "criar" && (
            <CampoTexto
              curto
              rotulo="Nome ou apelido (o professor vê este)"
              valor={nome}
              aoMudar={setNome}
              autoComplete="nickname"
            />
          )}
          <CampoTexto
            curto
            rotulo="Usuário (sem espaço)"
            valor={usuario}
            aoMudar={(v) => setUsuario(v.toLowerCase().replace(/\s/g, ""))}
            autoComplete="username"
          />
          <CampoTexto
            curto
            tipo="password"
            rotulo={aba === "criar" ? "Senha (pelo menos 4 caracteres)" : "Senha"}
            valor={senha}
            aoMudar={setSenha}
            autoComplete={aba === "criar" ? "new-password" : "current-password"}
          />

          {erro && (
            <Aviso tipo="erro">
              <p>{mensagemDeErro(erro)}</p>
              {erro instanceof ErroApi && erro.dica && <p className="mt-1 opacity-80">{erro.dica}</p>}
              {erro instanceof ErroApi && <p className="mt-1 font-mono text-xs opacity-70">HTTP {erro.status}</p>}
            </Aviso>
          )}

          <Botao type="submit" disabled={enviar.isPending} className="mt-1">
            {enviar.isPending ? "Enviando…" : aba === "criar" ? "Criar conta e começar" : "Entrar"}
          </Botao>
          {aba === "criar" ? (
            <p className="text-center text-sm text-on-surface-variant">
              Guarde seu usuário e sua senha: não tem como recuperar a senha.
            </p>
          ) : (
            <p className="text-center text-sm text-on-surface-variant">
              Esqueceu a senha? Crie uma conta nova com outro usuário.
            </p>
          )}
        </form>
      </Cartao>
    </main>
  );
}
