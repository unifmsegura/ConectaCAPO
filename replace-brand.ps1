$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.ts
foreach ($f in $files) {
    $c = Get-Content -Raw $f.FullName
    $new = $c -replace [regex]::Escape('bg-[#124E66]'), 'bg-brand' `
              -replace [regex]::Escape('text-[#124E66]'), 'text-brand' `
              -replace [regex]::Escape('border-[#124E66]'), 'border-brand' `
              -replace [regex]::Escape('bg-[#0D3748]'), 'bg-brand-dark'
    if ($new -ne $c) { Set-Content -Path $f.FullName -Value $new -NoNewline; Write-Output "updated $($f.Name)" }
}
