<#
.SYNOPSIS
  Sobe o site da atividade da aula 03 no Fly.io.

.DESCRIPTION
  Cria o app (se ainda não existir), cria o segredo do token (só na primeira vez) e faz o deploy
  com UMA máquina. O banco nasce vazio. Depois da aula, rode .\scripts\derrubar-aula.ps1.

  Rodar de novo no meio da aula (para atualizar o código) recria a máquina e APAGA o banco:
  exporte o JSON antes e importe de novo depois, em /professor/dados.

.EXAMPLE
  .\scripts\subir-aula.ps1
  .\scripts\subir-aula.ps1 -App minha-atividade
#>
param(
  # Nome do app no Fly.io (vira https://<App>.fly.dev). Padrão: o "app" do fly.toml.
  [string]$App,
  # Organização do Fly.io (só precisa se você tiver mais de uma).
  [string]$Org
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

function Test-Fly {
  # Roda o fly em silêncio e diz se deu certo. ErrorActionPreference local = Continue porque,
  # no Windows PowerShell 5.1, redirecionar o stderr de um programa com "Stop" vira exceção.
  $ErrorActionPreference = "Continue"
  & $script:Fly @args *> $null
  return ($LASTEXITCODE -eq 0)
}

function Invoke-Fly {
  & $script:Fly @args
  if ($LASTEXITCODE -ne 0) { throw "O comando 'fly $($args -join ' ')' falhou (código $LASTEXITCODE)." }
}

$script:Fly = Get-Fly

if (-not $App) {
  $linha = Select-String -Path "fly.toml" -Pattern '^app\s*=\s*"(.+)"' | Select-Object -First 1
  $App = $linha.Matches[0].Groups[1].Value
}
$Url = "https://$App.fly.dev"

Write-Host "==> Conferindo o login no Fly.io..." -ForegroundColor Cyan
if (-not (Test-Fly auth whoami)) { Invoke-Fly auth login }

Write-Host "==> Preparando o app '$App'..." -ForegroundColor Cyan
if (-not (Test-Fly status --app $App)) {
  $argumentos = @("apps", "create", $App)
  if ($Org) { $argumentos += @("--org", $Org) }
  Invoke-Fly @argumentos
} else {
  Write-Host "    O app já existe: só vou atualizar."
}

# O segredo do token só é criado uma vez: trocar no meio da aula deslogaria todos os alunos.
$ErrorActionPreference = "Continue"
$segredos = & $script:Fly secrets list --app $App 2>$null | Out-String
$ErrorActionPreference = "Stop"
if ($segredos -notmatch "JWT_SECRET") {
  Write-Host "==> Criando o segredo do token (JWT_SECRET)..." -ForegroundColor Cyan
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $jwtSecret = -join ($bytes | ForEach-Object { $_.ToString("x2") })
  Invoke-Fly secrets set "JWT_SECRET=$jwtSecret" --app $App --stage
} else {
  Write-Host "    O JWT_SECRET já existe: mantido (os alunos continuam logados)."
}

Write-Host "==> Fazendo o deploy (uma máquina só)..." -ForegroundColor Cyan
Invoke-Fly deploy --app $App --ha=false --remote-only

Write-Host "==> Esperando o site responder..." -ForegroundColor Cyan
$noAr = $false
for ($tentativa = 1; $tentativa -le 30; $tentativa++) {
  try {
    $status = Invoke-RestMethod "$Url/api/status" -TimeoutSec 5
    if ($status.status -eq "ok") { $noAr = $true; break }
  } catch {
    Start-Sleep -Seconds 2
  }
}
if (-not $noAr) { throw "O site não respondeu em $Url/api/status. Veja os logs com: fly logs --app $App" }

Write-Host ""
Write-Host "Atividade no ar!" -ForegroundColor Green
Write-Host "  Alunos:     $Url"
Write-Host "  Professor:  $Url/professor"
Write-Host "  Gráfico:    $Url/professor/grafico   (para o datashow)"
Write-Host "  Dados:      $Url/professor/dados   (exportar / importar)"
Write-Host "  Logs:       fly logs --app $App"
Write-Host ""
Write-Host "Lembre de EXPORTAR o JSON de tempos em tempos. Depois da aula: .\scripts\derrubar-aula.ps1" -ForegroundColor Yellow
