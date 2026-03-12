Set-Location "C:\Users\Startklar\Desktop\MHS3"

# .env nur erstellen wenn sie noch nicht existiert (verhindert Überschreiben eigener Werte)
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ".env aus .env.example erstellt." -ForegroundColor Yellow
}

# Docker Container starten: --build nutzt Build-Cache, --pull always holt neue Base-Images
Write-Host "Starte Docker Container..." -ForegroundColor Cyan
docker compose up -d --build --pull always
if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler: docker compose up fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

# Warte auf Health-Check (/api/health gibt {"status":"ok"} zurück)
Write-Host "Warte auf App Health-Check..." -ForegroundColor Cyan
$maxRetries = 40
$retries = 0

while ($retries -lt $maxRetries) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($health.status -eq "ok") {
            Write-Host "App ist ready!" -ForegroundColor Green
            Start-Process "chrome.exe" "http://localhost:3000"
            Write-Host "Chrome geoeffnet auf http://localhost:3000" -ForegroundColor Green
            Write-Host "pgAdmin: http://localhost:5050" -ForegroundColor DarkGray
            exit 0
        }
    } catch {
        # Health-Endpoint noch nicht ready
    }
    Start-Sleep -Milliseconds 500
    $retries++
}

Write-Host "Fehler: App nicht gestartet nach $($maxRetries / 2)s" -ForegroundColor Red
Write-Host "Pruefe Logs mit: docker compose logs app" -ForegroundColor Yellow
exit 1
