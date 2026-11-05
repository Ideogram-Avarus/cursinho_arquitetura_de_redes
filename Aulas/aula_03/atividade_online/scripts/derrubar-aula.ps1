<#
.SYNOPSIS
  Tira o site da atividade do ar: apaga o app inteiro no Fly.io.

.DESCRIPTION
  Remove o app, a máquina e o banco (as respostas dos alunos somem). Antes de apagar,
  pergunta se você exportou os dados. Para a próxima aula, rode .\scripts\subir-aula.ps1.

.EXAMPLE
  .\scripts\derrubar-aula.ps1
  .\scripts\derrubar-aula.ps1 -App minha-atividade -Forcar
#>
param(
  # Nome do app no Fly.io. Padrão: o "app" do fly.toml.
  [string]$App,
  # Não pede confirmação.
  [switch]$Forcar
)

$ErrorActionPreference = "Stop"
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
  $ErrorActionPreference = "Continue"
  & $script:Fly @args *> $null
  return ($LASTEXITCODE -eq 0)
}

if (-not $App) {
  $linha = Select-String -Path "fly.toml" -Pattern '^app\s*=\s*"(.+)"' | Select-Object -First 1
  $App = $linha.Matches[0].Groups[1].Value
}
$Url = "https://$App.fly.dev"

if (-not (Test-Fly status --app $App)) {
  Write-Host "O app '$App' não existe (ou já foi apagado). Nada a fazer." -ForegroundColor Yellow
  exit 0
}

if (-not $Forcar) {
  # Mostra há quanto tempo foi o último export, se o site estiver respondendo.
  try {
    $estado = Invoke-RestMethod "$Url/api/estado" -TimeoutSec 5
    if ($estado.ultimoExport) {
      $minutos = [int]((Get-Date).ToUniversalTime() - ([datetime]$estado.ultimoExport).ToUniversalTime()).TotalMinutes
      Write-Host "Último export: há $minutos min." -ForegroundColor Cyan
    } else {
      Write-Host "ATENÇÃO: os dados NUNCA foram exportados." -ForegroundColor Red
    }
  } catch {
    Write-Host "(Não consegui consultar o último export.)" -ForegroundColor Yellow
  }

  $exportou = Read-Host "Você exportou o JSON/CSV em $Url/professor/dados? (s/N)"
  if ($exportou -notmatch "^[sS]") {
    Write-Host "Cancelado. Exporte primeiro em $Url/professor/dados e rode de novo."
    exit 0
  }
  $resposta = Read-Host "Apagar o app '$App' e todos os dados da aula? (s/N)"
  if ($resposta -notmatch "^[sS]") {
    Write-Host "Cancelado."
    exit 0
  }
}

& $script:Fly apps destroy $App --yes
if ($LASTEXITCODE -ne 0) { throw "Não consegui apagar o app '$App' (código $LASTEXITCODE)." }

Write-Host "App '$App' apagado. Nada mais rodando no Fly.io." -ForegroundColor Green
