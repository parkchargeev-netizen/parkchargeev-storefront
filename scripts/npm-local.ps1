param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$nodeDir = Resolve-Path "$PSScriptRoot\..\.tools\node-v22.22.2-win-x64"
$env:PATH = "$nodeDir;$env:PATH"

& "$nodeDir\npm.cmd" @Args
exit $LASTEXITCODE
