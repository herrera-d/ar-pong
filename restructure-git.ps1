<#
.SYNOPSIS
    Reestructura el historial de git de ar-pong al flujo ideal:
    main (setup) -> develop (features mergeadas desde ramas feat/*)

.DESCRIPTION
    - Crea main como rama huérfana con el setup inicial (a94e163)
    - Crea develop desde main
    - Crea feat/game-loop, feat/physics, feat/retro-canvas
      (cherry-pick de los commits originales) y las mergea a develop
      con merge commits (--no-ff)

.PARAMETER Force
    Omite la confirmación interactiva.

.EXAMPLE
    .\restructure-git.ps1
    .\restructure-git.ps1 -Force
#>

param([switch]$Force)

$ErrorActionPreference = "Stop"

# --- Configuración: commits originales ---
$SETUP_COMMIT        = "a94e163"   # setup + implementation plan
$GAME_LOOP_COMMIT    = "8ec370d"   # movimiento de pelota
$PHYSICS_COMMIT      = "60dfc36"   # player 1 + cpu + física
$RETRO_CANVAS_COMMIT = "4bc6862"   # retro canvas

function Invoke-GitCheck {
    param([string[]]$Arguments)
    Write-Host "`n>>> git $($Arguments -join ' ')" -ForegroundColor DarkGray
    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: git $($Arguments -join ' ') falló (exit code $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
}

# --- Validaciones ---
Write-Host "=== Validando estado del repo ===" -ForegroundColor Cyan

# 1. Working tree limpio (ignora archivos sin trackear, como este script)
$status = git status --porcelain | Where-Object { $_ -notmatch '^\?\?' }
if ($status) {
    Write-Host "ERROR: Hay cambios sin commitear. Commit o stash tus cambios primero." -ForegroundColor Red
    exit 1
}

# 2. Verificar que los commits existen
foreach ($c in @($SETUP_COMMIT, $GAME_LOOP_COMMIT, $PHYSICS_COMMIT, $RETRO_CANVAS_COMMIT)) {
    git cat-file -e "$c^{commit}" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: El commit $c no existe." -ForegroundColor Red
        exit 1
    }
}

# 3. Confirmación
if (-not $Force) {
    Write-Host "`nEste script reescribirá el historial de git (main, develop, feat/retro-canvas)." -ForegroundColor Yellow
    Write-Host "Se creará una rama de respaldo: backup/pre-restructure" -ForegroundColor Yellow
    $answer = Read-Host "¿Continuar? (s/N)"
    if ($answer -notmatch '^[sSyY]') {
        Write-Host "Cancelado." -ForegroundColor Yellow
        exit 0
    }
}

# --- Respaldo del historial actual ---
Write-Host "`n=== Creando respaldo backup/pre-restructure ===" -ForegroundColor Cyan
Invoke-GitCheck @("branch", "-f", "backup/pre-restructure", "HEAD")

# --- Desacoplar HEAD para poder borrar ramas ---
Invoke-GitCheck @("checkout", "--detach", "HEAD")

# --- Paso 0: eliminar ramas que se van a recrear ---
Write-Host "`n=== Eliminando ramas existentes que se recrearán ===" -ForegroundColor Cyan
foreach ($b in @("main", "develop", "feat/retro-canvas")) {
    git branch -D $b 2>$null
}

# --- Paso 1: main como rama huérfana con setup ---
Write-Host "`n=== Paso 1: Creando main (setup) ===" -ForegroundColor Cyan
Invoke-GitCheck @("checkout", "--orphan", "main")
Invoke-GitCheck @("rm", "-rf", ".")
Invoke-GitCheck @("checkout", $SETUP_COMMIT, "--", ".")
Invoke-GitCheck @("commit", "-m", "chore: initial project setup")

# --- Paso 2: develop desde main ---
Write-Host "`n=== Paso 2: Creando develop ===" -ForegroundColor Cyan
Invoke-GitCheck @("checkout", "-b", "develop")

# --- Paso 3: feat/game-loop ---
Write-Host "`n=== Paso 3: feat/game-loop ===" -ForegroundColor Cyan
Invoke-GitCheck @("checkout", "-b", "feat/game-loop", "develop")
Invoke-GitCheck @("cherry-pick", $GAME_LOOP_COMMIT)
Invoke-GitCheck @("checkout", "develop")
Invoke-GitCheck @("merge", "--no-ff", "feat/game-loop", "-m", "merge: feat/game-loop into develop")

# --- Paso 4: feat/physics ---
Write-Host "`n=== Paso 4: feat/physics ===" -ForegroundColor Cyan
Invoke-GitCheck @("checkout", "-b", "feat/physics", "develop")
Invoke-GitCheck @("cherry-pick", $PHYSICS_COMMIT)
Invoke-GitCheck @("checkout", "develop")
Invoke-GitCheck @("merge", "--no-ff", "feat/physics", "-m", "merge: feat/physics into develop")

# --- Paso 5: feat/retro-canvas ---
Write-Host "`n=== Paso 5: feat/retro-canvas ===" -ForegroundColor Cyan
Invoke-GitCheck @("checkout", "-b", "feat/retro-canvas", "develop")
Invoke-GitCheck @("cherry-pick", $RETRO_CANVAS_COMMIT)
Invoke-GitCheck @("checkout", "develop")
Invoke-GitCheck @("merge", "--no-ff", "feat/retro-canvas", "-m", "merge: feat/retro-canvas into develop")

# --- Verificación final ---
Write-Host "`n=== Verificando que el código final es idéntico al original ===" -ForegroundColor Cyan
$diff = git diff --stat 4bc6862 develop
if ($diff) {
    Write-Host "ADVERTENCIA: El código final difiere del original (4bc6862). Revisa el diff." -ForegroundColor Red
    $diff
} else {
    Write-Host "OK: El código final es idéntico al original (4bc6862)." -ForegroundColor Green
}

# --- Resultado ---
Write-Host "`n=== ¡Listo! Historial final ===" -ForegroundColor Green
git log --oneline --graph --decorate --all | Select-Object -First 25

Write-Host "`nNotas:" -ForegroundColor Yellow
Write-Host "  - Estás en la rama develop"
Write-Host "  - Respaldo del historial viejo: backup/pre-restructure"
Write-Host "  - Ramas viejas que quedaron: feat/add-physics, origin/*"
Write-Host "  - Para reflejar en el remoto: git push --force-with-lease origin main develop"
Write-Host "  - Puedes borrar este script cuando termines"