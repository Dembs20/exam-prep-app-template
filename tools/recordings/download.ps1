# Downloads the audio of every lecture listed in lectures.txt, a few at a time.
# Start it by double-clicking download.bat in this folder.
param([int]$AtOnce = 4)

$here = $PSScriptRoot
$py = Join-Path $env:USERPROFILE 'anaconda3\python.exe'
if (-not (Test-Path $py)) {
    $found = Get-Command python -ErrorAction SilentlyContinue
    if ($found) { $py = $found.Source } else { $py = $null }
}
if (-not $py) { Write-Host 'Python was not found.'; exit 1 }
# Make Anaconda's own libraries findable, as an activated Anaconda prompt would
$root = Split-Path $py
$env:PATH = "$root;$root\Library\mingw-w64\bin;$root\Library\usr\bin;$root\Library\bin;$root\Scripts;" + $env:PATH
if (-not (Test-Path (Join-Path $here 'cookies.txt'))) {
    Write-Host 'cookies.txt is missing. Export it from Brave into this folder first (see README.txt).'
    exit 1
}
New-Item -ItemType Directory -Force -Path (Join-Path $here 'audio') | Out-Null

$links = @(Get-Content (Join-Path $here 'lectures.txt') | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') })
if ($links.Count -eq 0) { Write-Host 'lectures.txt has no links yet.'; exit 0 }

$procs = @()
$n = 0
foreach ($link in $links) {
    while (@($procs | Where-Object { -not $_.HasExited }).Count -ge $AtOnce) { Start-Sleep -Seconds 3 }
    $n++
    Write-Host "[$n/$($links.Count)] starting $link"
    $cmd = "`$host.UI.RawUI.WindowTitle = 'Lecture download $n of $($links.Count)'; & '$py' -m yt_dlp --cookies cookies.txt -N 8 -f ba -o 'audio/%(title)s.m4a' '$link'; if (`$LASTEXITCODE) { Read-Host 'This download failed. Copy the error text above for Claude, then press Enter to close' }"
    $enc = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($cmd))
    $procs += Start-Process powershell -ArgumentList '-NoProfile', '-EncodedCommand', $enc -WorkingDirectory $here -PassThru
}
Write-Host 'All downloads started. Waiting for them to finish...'
while (@($procs | Where-Object { -not $_.HasExited }).Count -gt 0) { Start-Sleep -Seconds 3 }
Write-Host ''
Write-Host 'Done. Lectures in the audio folder:'
Get-ChildItem (Join-Path $here 'audio') -Filter *.m4a | ForEach-Object { Write-Host ('  ' + $_.Name) }
