<#
.SYNOPSIS
  Tira a Bolsa de Batatas do ar: apaga o app inteiro no Fly.io.

.DESCRIPTION
  Remove o app, a máquina e o banco (tudo o que os alunos criaram some).
  Depois disso não há mais nada rodando nem cobrando. Para a próxima aula, rode .\scripts\subir-aula.ps1.

.EXAMPLE
  .\scripts\derrubar-aula.ps1
  .\scripts\derrubar-aula.ps1 -App minha-bolsa -Forcar
#>
param(
  # Nome do app no Fly.io. Padrão: o "app" do fly.toml.
  [string]$App,
  # Não pede confirmação.
  [switch]$Forcar
)

$ErrorActionPreference = "Stop"
# Roda a partir da pasta do projeto (onde estão o fly.toml e o Dockerfile).
Set-Location (Split-Path $PSScriptRoot -Parent)

function Get-Fly {
  foreach ($nome in "fly", "flyctl") {
    $comando = Get-Command $nome -ErrorAction SilentlyContinue
    if ($comando) { return $comando.Source }
  }
  $padrao = Join-Path $HOME ".fly\bin\flyctl.exe"
  if (Test-Path $padrao) { return $padrao }
  throw "flyctl não encontrado. Instale com: iwr https://fly.io/install.ps1 -useb | iex"
}

$script:Fly = Get-Fly

function Test-Fly {
  # Roda o fly em silêncio e diz se deu certo. ErrorActionPreference local = Continue porque,
  # no Windows PowerShell 5.1, redirecionar o stderr de um programa com "Stop" vira exceção.
  $ErrorActionPreference = "Continue"
  & $script:Fly @args *> $null
  return ($LASTEXITCODE -eq 0)
}

if (-not $App) {
  $linha = Select-String -Path "fly.toml" -Pattern '^app\s*=\s*"(.+)"' | Select-Object -First 1
  $App = $linha.Matches[0].Groups[1].Value
}

if (-not (Test-Fly status --app $App)) {
  Write-Host "O app '$App' não existe (ou já foi apagado). Nada a fazer." -ForegroundColor Yellow
  exit 0
}

if (-not $Forcar) {
  $resposta = Read-Host "Apagar o app '$App' e todos os dados da aula? (s/N)"
  if ($resposta -notmatch "^[sS]") {
    Write-Host "Cancelado."
    exit 0
  }
}

& $script:Fly apps destroy $App --yes
if ($LASTEXITCODE -ne 0) { throw "Não consegui apagar o app '$App' (código $LASTEXITCODE)." }

Write-Host "App '$App' apagado. Nada mais rodando no Fly.io." -ForegroundColor Green
