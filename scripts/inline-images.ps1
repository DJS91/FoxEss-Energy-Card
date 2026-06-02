# inline-images.ps1
# Replicates the image-inlining step of build.mjs without requiring Node.js.
# Output: dist/energy-flow-card.js  (unminified but fully self-contained)

$root      = Split-Path $PSScriptRoot -Parent
$entryFile = Join-Path $root 'energy-flow-card.js'
$outFile   = Join-Path $root 'dist\energy-flow-card.js'

$imageFiles = [ordered]@{
    day_no_ev    = 'images\energy-house-day-no-ev.png'
    day_with_ev  = 'images\energy-house-day-with-ev.png'
    night_no_ev  = 'images\energy-house-night-no-ev.png'
    night_with_ev = 'images\energy-house-night-with-ev.png'
}

# Build the replacement block
$lines = @('// __BUILD_INLINE_BACKGROUNDS_START__', 'const BUNDLED_BG_IMAGES = {')
foreach ($key in $imageFiles.Keys) {
    $imgPath = Join-Path $root $imageFiles[$key]
    if (-not (Test-Path $imgPath)) {
        Write-Error "Image not found: $imgPath"
        exit 1
    }
    $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($imgPath))
    $lines += "  ${key}: 'data:image/png;base64,$b64',"
}
$lines += '};'
$lines += '// __BUILD_INLINE_BACKGROUNDS_END__'
$replacement = $lines -join "`n"

# Read source and replace marker block
$source = [IO.File]::ReadAllText($entryFile)
$pattern = '(?s)// __BUILD_INLINE_BACKGROUNDS_START__.*?// __BUILD_INLINE_BACKGROUNDS_END__'
$prepared = [regex]::Replace($source, $pattern, $replacement)

if ($prepared -eq $source) {
    Write-Error 'Could not find background image build markers in energy-flow-card.js'
    exit 1
}

# Write output
$outDir = Split-Path $outFile -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
[IO.File]::WriteAllText($outFile, $prepared)

$srcKiB  = [math]::Round((Get-Item $entryFile).Length / 1KB, 1)
$distKiB = [math]::Round((Get-Item $outFile).Length  / 1KB, 1)
Write-Host "Built $outFile"
Write-Host "source: ${srcKiB} KiB -> dist: ${distKiB} KiB"
