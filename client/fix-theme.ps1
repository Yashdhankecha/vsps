$srcDir = "c:\Users\HARSH\OneDrive\Desktop\Projects\vsps\client\src"
$files = Get-ChildItem -Path $srcDir -Recurse -Filter "*.jsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Replace all purple with electric equivalents
    $content = $content -replace 'border-purple-500', 'border-electric-500'
    $content = $content -replace 'border-purple-600', 'border-electric-600'
    $content = $content -replace 'border-purple-700', 'border-electric-700'
    
    $content = $content -replace 'text-purple-600', 'text-electric-600'
    $content = $content -replace 'text-purple-700', 'text-electric-700'
    $content = $content -replace 'text-purple-500', 'text-electric-600'
    $content = $content -replace 'text-purple-400', 'text-electric-600'
    $content = $content -replace 'text-purple-300', 'text-electric-500'
    
    $content = $content -replace 'bg-purple-600', 'bg-electric-600'
    $content = $content -replace 'bg-purple-700', 'bg-electric-700'
    $content = $content -replace 'bg-purple-500', 'bg-electric-500'
    $content = $content -replace 'bg-purple-500/20', 'bg-electric-50'
    $content = $content -replace 'bg-purple-50', 'bg-electric-50'
    $content = $content -replace 'bg-purple-100', 'bg-electric-100'
    
    $content = $content -replace 'hover:bg-purple-700', 'hover:bg-electric-700'
    $content = $content -replace 'hover:bg-purple-600', 'hover:bg-electric-600'
    $content = $content -replace 'hover:bg-purple-100', 'hover:bg-electric-100'
    $content = $content -replace 'hover:text-purple-700', 'hover:text-electric-700'
    $content = $content -replace 'hover:text-purple-600', 'hover:text-electric-600'
    
    $content = $content -replace 'focus:ring-purple-500', 'focus:ring-electric-500'
    $content = $content -replace 'focus:ring-purple-600', 'focus:ring-electric-600'
    
    $content = $content -replace 'file:bg-purple-50', 'file:bg-electric-50'
    $content = $content -replace 'file:text-purple-700', 'file:text-electric-700'
    $content = $content -replace 'hover:file:bg-purple-100', 'hover:file:bg-electric-100'
    
    # Replace violet with sky/electric (used in Booking calendar)
    $content = $content -replace 'bg-violet-200', 'bg-sky-100'
    $content = $content -replace 'bg-violet-300', 'bg-sky-200'
    $content = $content -replace 'hover:bg-violet-300', 'hover:bg-sky-200'
    $content = $content -replace 'text-violet-700', 'text-electric-700'
    $content = $content -replace 'text-violet-900', 'text-gray-900'
    $content = $content -replace 'ring-violet-600', 'ring-electric-600'
    $content = $content -replace 'ring-violet-400', 'ring-electric-400'
    $content = $content -replace 'violet-500/20', 'electric-500/15'
    $content = $content -replace 'text-violet-300', 'text-electric-600'
    $content = $content -replace 'border-violet-500/30', 'border-electric-200'
    $content = $content -replace 'bg-violet-500/20', 'bg-electric-50'
    $content = $content -replace 'from-violet-50 to-purple-50', 'from-sky-50 to-electric-50'
    $content = $content -replace 'via-purple-500', 'via-electric-500'
    
    # Fix remaining text-white on labels and non-gradient-bg elements  
    # Only replace specific label/heading pattern combos
    $content = $content -replace 'text-white mb-4"', 'text-gray-900 mb-4"'
    $content = $content -replace 'text-white mb-2"', 'text-gray-900 mb-2"'
    $content = $content -replace 'text-white mb-6"', 'text-gray-900 mb-6"'

    if ($content -ne $original) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Done!"
