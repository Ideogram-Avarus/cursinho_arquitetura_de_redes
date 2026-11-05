<#
.SYNOPSIS
  Sobe a Bolsa de Batatas no Fly.io para a aula.

.DESCRIPTION
  Cria o app (se ainda não existir), define os segredos e faz o deploy com UMA máquina.
  O banco nasce do zero, com os dados de demonstração. Depois da aula, rode .\scripts\derrubar-aula.ps1.

.EXAMPLE
  .\scripts\subir-aula.ps1
  .\scripts\subir-aula.ps1 -App minha-bolsa -SenhaProfessor "outra-senha"
#>
param(
  # Nome do app no Fly.io (vira https://<App>.fly.dev). Padrão: o "app" do fly.toml.
  [string]$App,
  # Organização do Fly.io (só precisa se você tiver mais de uma).
  [string]$Org,
  # Senha do usuário "professor" (papel ADMIN).
  [string]$SenhaProfessor = "professor-demo"
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

Write-Host "==> Definindo os segredos..." -ForegroundColor Cyan
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$jwtSecret = -join ($bytes | ForEach-Object { $_.ToString("x2") })
Invoke-Fly secrets set "JWT_SECRET=$jwtSecret" "ADMIN_PASSWORD=$SenhaProfessor" --app $App --stage

Write-Host "==> Fazendo o deploy (uma máquina só)..." -ForegroundColor Cyan
Invoke-Fly deploy --app $App --ha=false --remote-only

Write-Host "==> Esperando a API responder..." -ForegroundColor Cyan
$noAr = $false
for ($tentativa = 1; $tentativa -le 30; $tentativa++) {
  try {
    $status = Invoke-RestMethod "$Url/api/status" -TimeoutSec 5
    if ($status.status -eq "ok") { $noAr = $true; break }
  } catch {
    Start-Sleep -Seconds 2
  }
}
if (-not $noAr) { throw "A API não respondeu em $Url/api/status. Veja os logs com: fly logs --app $App" }

Write-Host ""
Write-Host "Bolsa de Batatas no ar!" -ForegroundColor Green
Write-Host "  API:        $Url"
Write-Host "  Swagger:    $Url/docs"
Write-Host "  Alunos:     aluno / senha-demo"
Write-Host "  Professor:  professor / $SenhaProfessor"
Write-Host "  Logs:       fly logs --app $App"
Write-Host ""
Write-Host "Depois da aula: .\scripts\derrubar-aula.ps1" -ForegroundColor Yellow
