# Windows launcher: Caddy in its own window, Next.js in PowerShell.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

function Get-WindowsArch {
  if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'ARM64') {
    return 'arm64'
  }
  if ($env:PROCESSOR_ARCHITECTURE -eq 'AMD64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'AMD64') {
    return 'amd64'
  }
  return $null
}

function Test-WindowsExe([string]$Path, [string]$Arch) {
  if (-not (Test-Path -LiteralPath $Path)) { return $false }
  $stream = [System.IO.File]::Open(
    $Path,
    [System.IO.FileMode]::Open,
    [System.IO.FileAccess]::Read,
    [System.IO.FileShare]::ReadWrite
  )
  try {
    if ($stream.Length -lt 10MB) { return $false }
    $dos = New-Object byte[] 64
    if ($stream.Read($dos, 0, 64) -lt 64) { return $false }
    if ($dos[0] -ne 0x4D -or $dos[1] -ne 0x5A) { return $false }
    $peOffset = [BitConverter]::ToInt32($dos, 0x3C)
    if ($peOffset -lt 64 -or $peOffset -gt 1024) { return $false }
    $stream.Position = $peOffset
    $coff = New-Object byte[] 24
    if ($stream.Read($coff, 0, 24) -lt 24) { return $false }
    if ($coff[0] -ne 0x50 -or $coff[1] -ne 0x45 -or $coff[2] -ne 0 -or $coff[3] -ne 0) { return $false }
    $machine = [BitConverter]::ToUInt16($coff, 4)
    $expected = if ($Arch -eq 'arm64') { 0xAA64 } else { 0x8664 }
    if ($machine -ne $expected) { return $false }
    $sections = [BitConverter]::ToUInt16($coff, 6)
    $optionalSize = [BitConverter]::ToUInt16($coff, 20)
    if ($sections -lt 1 -or $optionalSize -lt 24) { return $false }
    $stream.Position = $peOffset + 24
    $magicBytes = New-Object byte[] 2
    if ($stream.Read($magicBytes, 0, 2) -lt 2) { return $false }
    $magic = [BitConverter]::ToUInt16($magicBytes, 0)
    if ($magic -ne 0x20B) { return $false }
    $sectionOffset = $peOffset + 24 + $optionalSize
    $end = 0L
    for ($i = 0; $i -lt $sections; $i++) {
      $stream.Position = $sectionOffset + ($i * 40) + 16
      $raw = New-Object byte[] 8
      if ($stream.Read($raw, 0, 8) -lt 8) { return $false }
      $rawSize = [BitConverter]::ToUInt32($raw, 0)
      $rawPtr = [BitConverter]::ToUInt32($raw, 4)
      $sectionEnd = [int64]$rawPtr + [int64]$rawSize
      if ($sectionEnd -gt $end) { $end = $sectionEnd }
    }
    return ($end -le $stream.Length)
  } catch {
    return $false
  } finally {
    $stream.Close()
  }
}

function Find-Caddy([string]$Arch) {
  $paths = @()
  foreach ($name in @('caddy.exe', 'caddy')) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source) { $paths += $cmd.Source }
  }
  $paths += @(
    (Join-Path $root 'caddy.exe'),
    (Join-Path $root 'tools\caddy.exe'),
    (Join-Path $env:ProgramFiles 'Caddy\caddy.exe'),
    (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\caddy.exe')
  )
  if ($env:ChocolateyInstall) {
    $paths += (Join-Path $env:ChocolateyInstall 'bin\caddy.exe')
  }
  foreach ($path in ($paths | Select-Object -Unique)) {
    if (Test-WindowsExe $path $Arch) { return $path }
  }
  return $null
}

function Save-Caddy([string]$Destination, [string]$Arch) {
  $dir = Split-Path -Parent $Destination
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $temp = "$Destination.download"
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
  $curl = Join-Path $env:SystemRoot 'System32\curl.exe'
  if (-not (Test-Path -LiteralPath $curl)) {
    throw 'Windows curl.exe was not found.'
  }
  $url = "https://caddyserver.com/api/download?os=windows&arch=$Arch"
  & $curl -fL --retry 3 --output $temp $url
  if ($LASTEXITCODE -ne 0) {
    throw "Could not download Windows caddy.exe (curl exit $LASTEXITCODE)."
  }
  if (-not (Test-WindowsExe $temp $Arch)) {
    Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
    throw 'The download is not a usable Windows caddy.exe.'
  }
  if (Test-Path -LiteralPath $Destination) { Remove-Item -LiteralPath $Destination -Force }
  Move-Item -LiteralPath $temp -Destination $Destination
  Unblock-File -LiteralPath $Destination
}

$arch = Get-WindowsArch
if (-not $arch) {
  Write-Host 'Caddy needs 64-bit Windows. This PC is 32-bit, so caddy.exe cannot start.'
  exit 1
}

foreach ($stale in @(
  (Join-Path $root 'tools\caddy.exe'),
  (Join-Path $root 'caddy.exe')
)) {
  if ((Test-Path -LiteralPath $stale) -and -not (Test-WindowsExe $stale $arch)) {
    Write-Host "Removing unusable $stale"
    try {
      Remove-Item -LiteralPath $stale -Force
    } catch {
      Write-Host 'Close the Caddy window, then run start-site.bat again.'
      Write-Host $_.Exception.Message
      exit 1
    }
  }
}

function Test-CaddyRuns([string]$Path) {
  try {
    & $Path version | Out-Host
    return ($LASTEXITCODE -eq 0)
  } catch {
    Write-Host $_.Exception.Message
    return $false
  }
}

$caddy = Find-Caddy $arch
if ($caddy) {
  $caddy = (Resolve-Path -LiteralPath $caddy).Path
}
if ($caddy -and -not (Test-CaddyRuns $caddy)) {
  $localCopy = $caddy.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)
  if ($localCopy) {
    Write-Host 'The downloaded caddy.exe cannot start. Replacing it...'
    try {
      Remove-Item -LiteralPath $caddy -Force
    } catch {
      Write-Host 'Close the Caddy window, then run start-site.bat again.'
      Write-Host $_.Exception.Message
      exit 1
    }
  }
  $caddy = $null
}

if (-not $caddy) {
  $caddy = Join-Path $root 'tools\caddy.exe'
  Write-Host 'Downloading the Windows caddy.exe...'
  try {
    Save-Caddy $caddy $arch
  } catch {
    Write-Host $_.Exception.Message
    Write-Host 'Install Caddy from PowerShell, close that window, open a new Command Prompt, and run start-site.bat:'
    Write-Host '  winget install -e --id CaddyServer.Caddy'
    exit 1
  }
  if (-not (Test-CaddyRuns $caddy)) {
    Write-Host 'Windows refused to start the new caddy.exe.'
    Write-Host 'Install it, then open a new Command Prompt and run start-site.bat:'
    Write-Host '  winget install -e --id CaddyServer.Caddy'
    exit 1
  }
}

function Get-ProxyNames {
  $names = New-Object System.Collections.Generic.List[string]
  foreach ($name in @('localhost', '127.0.0.1')) { [void]$names.Add($name) }
  try {
    Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop | ForEach-Object {
      $ip = $_.IPAddress
      if ($ip -and $ip -notlike '127.*' -and $ip -notlike '169.254.*' -and $ip -ne '0.0.0.0') {
        [void]$names.Add($ip)
      }
    }
  } catch {
    Write-Host 'Could not list LAN addresses. HTTPS will be available on localhost.'
  }
  return @($names | Select-Object -Unique)
}

function Get-DefaultLanIPv4 {
  try {
    $configs = @(Get-NetIPConfiguration -ErrorAction Stop | Where-Object {
      $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up'
    })
    foreach ($cfg in $configs) {
      $addr = @($cfg.IPv4Address) | Where-Object {
        $_.IPAddress -and $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*'
      } | Select-Object -First 1
      if ($addr) { return $addr.IPAddress }
    }
  } catch {
  }
  return $null
}

function Get-PublicIPv4 {
  $curl = Join-Path $env:SystemRoot 'System32\curl.exe'
  if (-not (Test-Path -LiteralPath $curl)) { return $null }
  try {
    $ip = (& $curl -4 -fsS --max-time 8 'https://api.ipify.org').Trim()
  } catch {
    return $null
  }
  if ($ip -match '^\d{1,3}(\.\d{1,3}){3}$') { return $ip }
  return $null
}

function Enable-InboundPort([int]$Port, [string]$Name) {
  $listed = netsh advfirewall firewall show rule name="$Name" 2>$null
  if ($LASTEXITCODE -eq 0 -and $listed -match 'Enabled:\s+Yes') { return $true }
  netsh advfirewall firewall delete rule name="$Name" | Out-Null
  netsh advfirewall firewall add rule name="$Name" dir=in action=allow protocol=TCP localport=$Port profile=any remoteip=any | Out-Null
  return ($LASTEXITCODE -eq 0)
}

function Add-WanForward([int]$Port, [string]$LanIp) {
  $nat = New-Object -ComObject HNetCfg.NATUPnP
  $maps = $nat.StaticPortMappingCollection
  if (-not $maps) { return $false }
  try { [void]$maps.Remove($Port, 'TCP') } catch {}
  [void]$maps.Add($Port, 'TCP', $Port, $LanIp, $true, "4EOS $Port")
  return $true
}

$publicHost = 'testsite.4eos.com'
$proxyNames = @(Get-ProxyNames)
$lanIp = Get-DefaultLanIPv4
if (-not $lanIp) {
  $lanIp = @($proxyNames | Where-Object { $_ -like '*.*.*.*' -and $_ -notlike '127.*' }) | Select-Object -First 1
}
$publicIp = Get-PublicIPv4
if ($publicIp -and $proxyNames -notcontains $publicIp) {
  $proxyNames += $publicIp
}
$internalNames = @($proxyNames | Where-Object { $_ -and $_ -ne $publicHost })
$tools = Join-Path $root 'tools'
New-Item -ItemType Directory -Force -Path $tools | Out-Null
$caddyConfig = Join-Path $tools 'Caddyfile'
$internalSites = ($internalNames -join ', ')
@(
  '{'
  "`temail helpdesk@4eos.com"
  "`tdefault_sni $publicHost"
  '}'
  ''
  "$publicHost {"
  "`treverse_proxy 127.0.0.1:3000"
  '}'
  ''
  "$internalSites {"
  "`ttls internal"
  "`treverse_proxy 127.0.0.1:3000"
  '}'
) | Set-Content -LiteralPath $caddyConfig -Encoding ascii

Write-Host 'Trusting the local HTTPS certificate. Windows may ask for approval.'
& $caddy trust
if ($LASTEXITCODE -ne 0) {
  Write-Host 'The certificate was not added. The site still opens, and the browser will warn until an Administrator window runs: caddy trust'
}

$nextBin = Join-Path $root 'node_modules\next\dist\bin\next'
if (-not (Test-Path -LiteralPath $nextBin)) {
  Write-Host 'Install dependencies first: npm install'
  exit 1
}
$serverCommand = "Set-Location -LiteralPath '$root'; npm run build; if (`$LASTEXITCODE -ne 0) { Write-Host 'Production build failed.'; exit `$LASTEXITCODE }; npm run start"
Start-Process -FilePath $caddy -WorkingDirectory $root -ArgumentList @('run', '--config', $caddyConfig)
Start-Process -FilePath "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -WorkingDirectory $root -ArgumentList @('-NoExit', '-NoProfile', '-Command', $serverCommand)
$httpOpen = Enable-InboundPort 80 '4EOS HTTP'
$httpsOpen = Enable-InboundPort 443 '4EOS HTTPS'
if (-not $httpOpen -or -not $httpsOpen) {
  Write-Host 'Windows Firewall did not allow ports 80 and 443. Close this window, right-click start-site.bat, and choose Run as administrator.'
}

$wanReady = $false
if ($lanIp) {
  try {
    $httpForward = Add-WanForward 80 $lanIp
    $httpsForward = Add-WanForward 443 $lanIp
    $wanReady = $httpForward -and $httpsForward
  } catch {
    $wanReady = $false
  }
}

Write-Host 'Opened Caddy and the 4EOS server.'
Write-Host "Public site: https://$publicHost"
Write-Host 'On this network:'
if ($lanIp) { Write-Host "  https://$lanIp" }
Write-Host '  https://localhost'
if ($lanIp) {
  Write-Host "The router must forward external TCP 80 to ${lanIp}:80 and external TCP 443 to ${lanIp}:443."
  Write-Host 'Do not forward those ports to port 3000. Port 3000 is only the app behind HTTPS.'
}
if ($wanReady) {
  Write-Host "Asked the router to forward internet ports 80 and 443 to $lanIp."
}
