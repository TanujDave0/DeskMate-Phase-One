$PORT = 8000

$listening = netstat -ano | Select-String "127.0.0.1:$PORT" | Select-String "LISTENING"
if ($listening) {
    $stale = ($listening.ToString().Trim() -split '\s+')[-1]
    Write-Host "Killing process $stale on port $PORT..."
    taskkill /F /PID $stale | Out-Null
    Start-Sleep 1
}

Write-Host "Starting DESKMATE backend on port $PORT..."
.\.venv\Scripts\uvicorn app:app --reload --port $PORT
