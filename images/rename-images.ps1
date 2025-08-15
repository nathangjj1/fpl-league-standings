# PowerShell script to rename FPL profile images
# Rename all images to firstname-lastname format

Write-Host "Renaming FPL profile images..." -ForegroundColor Green

# Rename each image to the new format
Rename-Item "daniel.jpg" "daniel-cane.jpg" -ErrorAction SilentlyContinue
Rename-Item "chloe.jpg" "chloe-wust.jpg" -ErrorAction SilentlyContinue
Rename-Item "adam.jpg" "adam-morgan.jpg" -ErrorAction SilentlyContinue
Rename-Item "carl.jpg" "carl-hadwin.jpg" -ErrorAction SilentlyContinue
Rename-Item "nathan.jpg" "nathan-jobson.jpg" -ErrorAction SilentlyContinue
Rename-Item "david.jpg" "david-wybrow.jpg" -ErrorAction SilentlyContinue
Rename-Item "clive.jpg" "clive-ankomah.jpg" -ErrorAction SilentlyContinue
Rename-Item "danny.jpg" "danny-willis.jpg" -ErrorAction SilentlyContinue
Rename-Item "tomi.jpg" "tomi-ade.jpg" -ErrorAction SilentlyContinue
Rename-Item "sergio.jpg" "sergio-wells.jpg" -ErrorAction SilentlyContinue
Rename-Item "motab.jpg" "motab-mon.jpg" -ErrorAction SilentlyContinue

Write-Host "Image renaming complete!" -ForegroundColor Green
Write-Host "New image names:" -ForegroundColor Yellow
Get-ChildItem *.jpg | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Cyan }
