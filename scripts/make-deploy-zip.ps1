# Genera el zip para subir por File Manager de cPanel (Setup Node.js App).
# Requiere que `docker compose up -d` este corriendo (usa los contenedores
# para compilar el frontend y hacer el checkpoint de SQLite).
#
# Uso: powershell -ExecutionPolicy Bypass -File scripts\make-deploy-zip.ps1

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$repoRoot = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $repoRoot "backend"
$stage = Join-Path $env:TEMP "inventario-app-cpanel-stage"
$zipPath = Join-Path $repoRoot "inventario-app-cpanel.zip"

Write-Output "Compilando frontend..."
docker compose -f (Join-Path $repoRoot "docker-compose.yml") exec frontend npm run build
if ($LASTEXITCODE -ne 0) { throw "Fallo el build del frontend" }

Write-Output "Copiando dist a backend/public..."
if (Test-Path (Join-Path $backend "public")) { Remove-Item (Join-Path $backend "public") -Recurse -Force }
docker cp inventario_impresoras-frontend-1:/app/dist (Join-Path $backend "public")

Write-Output "Haciendo checkpoint de SQLite (WAL -> inventory.db)..."
docker compose -f (Join-Path $repoRoot "docker-compose.yml") exec backend node -e "const db=require('better-sqlite3')('/app/data/inventory.db'); db.pragma('wal_checkpoint(TRUNCATE)'); db.close();"

Write-Output "Armando carpeta de staging..."
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $stage "data") | Out-Null
Copy-Item (Join-Path $backend "package.json") $stage
Copy-Item (Join-Path $backend "src") $stage -Recurse
Copy-Item (Join-Path $backend "public") $stage -Recurse
Copy-Item (Join-Path $backend "data\inventory.db") (Join-Path $stage "data")

Write-Output "Comprimiendo (con separadores '/' para que Linux lo extraiga bien)..."
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
$fs = New-Object System.IO.FileStream($zipPath, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
$backslash = [char]92
$slash = [char]47
Get-ChildItem -Path $stage -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($stage.Length + 1).Replace($backslash, $slash)
    $entry = $zip.CreateEntry($relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $entryStream.Write($bytes, 0, $bytes.Length)
    $entryStream.Close()
}
$zip.Dispose()
$fs.Dispose()

Write-Output "Listo: $zipPath"
