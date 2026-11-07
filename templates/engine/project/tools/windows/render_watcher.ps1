# Leo render watcher: starts .bat files inside C:\YouTube when Claude drops a request in C:\YouTube\queue
# Request file: C:\YouTube\queue\<name>.run containing one line: the full path of a .bat inside C:\YouTube
$Root = 'C:\YouTube'
$Q = Join-Path $Root 'queue'
New-Item -ItemType Directory -Force $Q | Out-Null
$log = Join-Path $Q 'watcher.log'
"$(Get-Date -Format s) watcher started" | Add-Content $log
while ($true) {
  Get-ChildItem $Q -Filter *.run -ErrorAction SilentlyContinue | ForEach-Object {
    $req = $_
    try {
      $bat = (Get-Content $req.FullName -Raw).Trim()
      $full = [IO.Path]::GetFullPath($bat)
      $ok = $full.StartsWith($Root + '\', [StringComparison]::OrdinalIgnoreCase) -and
            $full.EndsWith('.bat', [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $full)
      if ($ok) {
        Move-Item $req.FullName (Join-Path $Q ($req.BaseName + '.started')) -Force
        "$(Get-Date -Format s) START $full" | Add-Content $log
        Start-Process cmd.exe -ArgumentList '/c', "`"$full`"" -WorkingDirectory (Split-Path $full)
      } else {
        Move-Item $req.FullName (Join-Path $Q ($req.BaseName + '.rejected')) -Force
        "$(Get-Date -Format s) REJECTED $bat (must be an existing .bat inside $Root)" | Add-Content $log
      }
    } catch { "$(Get-Date -Format s) ERROR $($_.Exception.Message)" | Add-Content $log }
  }
  Start-Sleep -Seconds 30
}
