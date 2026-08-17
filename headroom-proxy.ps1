# headroom-proxy.ps1
# Run this before using Cline to enable token compression
# Then set Cline's API Base URL to: http://localhost:8787

$env:ANTHROPIC_TARGET_API_URL = "https://agentrouter.org"

Write-Host ""
Write-Host "Starting Headroom proxy..." -ForegroundColor Cyan
Write-Host "Forwarding: localhost:8787 -> agentrouter.org" -ForegroundColor Green
Write-Host ""
Write-Host "In Cline settings, set API Base URL to:" -ForegroundColor Yellow
Write-Host "  http://127.0.0.1:8787" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the proxy" -ForegroundColor Gray
Write-Host ""

& "C:\Users\NORTH\AppData\Local\Programs\Python\Python314\Scripts\headroom.exe" proxy --port 8787 --anthropic-api-url https://agentrouter.org
