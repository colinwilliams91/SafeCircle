Write-Host "Normalizing line endings in markdown files..."

Get-ChildItem -Path . -Recurse -Filter *.md -File | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    $content = $content.Replace("`r", "")
    [System.IO.File]::WriteAllText($_.FullName, $content)
}

Write-Host "Done! All markdown files now have LF line endings."