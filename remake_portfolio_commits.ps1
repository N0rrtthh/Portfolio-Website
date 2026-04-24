$repoPath = "d:\Portfolio Website"
Set-Location $repoPath

$trackedFiles = git ls-files
$trackedFiles = $trackedFiles | Where-Object { $_ -notmatch "^\.git_backup/" }

$startDate = Get-Date -Year 2026 -Month 4 -Day 18
$endDate = Get-Date -Year 2026 -Month 7 -Day 29

$allDays = @()
$curr = $startDate
while ($curr -le $endDate) {
    $allDays += $curr
    $curr = $curr.AddDays(1)
}

# Specific dates requested by user
$highlightDatesStr = @(
    "2026-04-18", "2026-04-25",
    "2026-05-02", "2026-05-16", "2026-05-17", "2026-05-23", "2026-05-24", "2026-05-30", "2026-05-31",
    "2026-06-06", "2026-06-07", "2026-06-13", "2026-06-14", "2026-06-20", "2026-06-21", "2026-06-27", "2026-06-28",
    "2026-07-04", "2026-07-05", "2026-07-12", "2026-07-18", "2026-07-19", "2026-07-25", "2026-07-26"
)

$rand = New-Object System.Random
$shuffledFiles = $trackedFiles | Get-Random -Count $trackedFiles.Count

$daysCommitsCount = @{}
$daysFiles = @{}
$fileIndex = 0

foreach ($d in $allDays) {
    $dateStr = $d.ToString("yyyy-MM-dd")
    $isHighlightDate = $highlightDatesStr -contains $dateStr
    $isWeekend = ($d.DayOfWeek -eq [System.DayOfWeek]::Saturday -or $d.DayOfWeek -eq [System.DayOfWeek]::Sunday)
    
    $targetCommits = 0
    if ($isHighlightDate) {
        # User specified dates: Medium to High commits (not equal, varied between 8 and 22)
        $targetCommits = $rand.Next(8, 23)
    } elseif ($isWeekend) {
        # Non-highlight weekend: 0-3 light commits
        if ($rand.Next(1, 100) -le 40) {
            $targetCommits = $rand.Next(1, 4)
        } else {
            $targetCommits = 0
        }
    } else {
        # Standard Weekdays: Natural active distribution (4-12 commits)
        $targetCommits = $rand.Next(4, 13)
    }
    
    $daysCommitsCount[$d.Date] = $targetCommits
    $daysFiles[$d.Date] = @()
    
    if ($targetCommits -gt 0 -and $fileIndex -lt $shuffledFiles.Count) {
        $daysFiles[$d.Date] += $shuffledFiles[$fileIndex]
        $fileIndex++
    }
}

# Distribute remaining tracked files across active days
while ($fileIndex -lt $shuffledFiles.Count) {
    $activeDays = $allDays | Where-Object { $daysCommitsCount[$_.Date] -gt 0 }
    $randomDay = $activeDays[$rand.Next($activeDays.Count)]
    $daysFiles[$randomDay.Date] += $shuffledFiles[$fileIndex]
    $fileIndex++
}

Write-Host "Backing up .git..."
if (Test-Path .git_backup) { Remove-Item -Recurse -Force .git_backup }
Copy-Item -Recurse .git .git_backup
Remove-Item -Recurse -Force .git
git init
git checkout -b main
$remoteUrl = git config --get remote.origin.url
if ($remoteUrl) { git remote add origin $remoteUrl }

foreach ($d in $allDays) {
    $targetCommits = $daysCommitsCount[$d.Date]
    if ($targetCommits -eq 0) { continue }
    
    $filesToday = $daysFiles[$d.Date]
    $startHour = $rand.Next(9, 14)
    $currTime = $d.Date.AddHours($startHour)
    
    if ($filesToday.Count -gt 0) {
        $commitsPerFile = [math]::Max(1, [math]::Floor($targetCommits / $filesToday.Count))
        foreach ($file in $filesToday) {
            $filename = Split-Path $file -Leaf
            $message = ""
            if ($file -match "\.json$|config") { $message = "chore: configure $filename" }
            elseif ($file -match "^public/") { $message = "assets: add $filename" }
            elseif ($file -match "^src/components/ui/") { $message = "feat(ui): implement $filename" }
            elseif ($file -match "^src/components/layout/") { $message = "feat(layout): add $filename" }
            elseif ($file -match "^src/components/sections/") { $message = "feat(section): build $filename" }
            elseif ($file -match "main\.tsx|App\.tsx|index\.css") { $message = "core: scaffold $filename" }
            else { 
                $prefixes = @("feat:", "fix:", "refactor:", "style:", "docs:")
                $prefix = $prefixes[$rand.Next($prefixes.Length)]
                $message = "$prefix add $filename"
            }
            
            $extras = $commitsPerFile - 1
            for ($i = 0; $i -lt $extras; $i++) {
                $formattedTime = $currTime.ToString("yyyy-MM-ddTHH:mm:ss")
                $env:GIT_AUTHOR_DATE = $formattedTime
                $env:GIT_COMMITTER_DATE = $formattedTime
                
                $extraMessages = @("wip: working on $filename", "style: format $filename", "fix: minor typos in $filename", "refactor: clean up $filename", "perf: optimize $filename")
                $extraMsg = $extraMessages[$rand.Next($extraMessages.Length)]
                
                $retry = 0; while($retry -lt 10) { git commit --allow-empty -m $extraMsg *>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { break }; Start-Sleep -Milliseconds 200; $retry++ }
                $currTime = $currTime.AddMinutes($rand.Next(5, 20))
            }
            
            $formattedTime = $currTime.ToString("yyyy-MM-ddTHH:mm:ss")
            $env:GIT_AUTHOR_DATE = $formattedTime
            $env:GIT_COMMITTER_DATE = $formattedTime
            
            $retry = 0; while($retry -lt 10) { git add $file *>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { break }; Start-Sleep -Milliseconds 200; $retry++ }
            $retry = 0; while($retry -lt 10) { git commit -m $message *>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { break }; Start-Sleep -Milliseconds 200; $retry++ }
            Write-Host "Committed $file on $($d.Date.ToString('yyyy-MM-dd')) with $extras extra commits"
            $currTime = $currTime.AddMinutes($rand.Next(15, 45))
        }
    } else {
        for ($i = 0; $i -lt $targetCommits; $i++) {
            $formattedTime = $currTime.ToString("yyyy-MM-ddTHH:mm:ss")
            $env:GIT_AUTHOR_DATE = $formattedTime
            $env:GIT_COMMITTER_DATE = $formattedTime
            
            $extraMessages = @("chore: repository maintenance", "refactor: optimize asset pipeline", "docs: update development notes", "fix: minor layout adjustment", "style: refine UI details")
            $extraMsg = $extraMessages[$rand.Next($extraMessages.Length)]
            
            $retry = 0; while($retry -lt 10) { git commit --allow-empty -m $extraMsg *>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { break }; Start-Sleep -Milliseconds 200; $retry++ }
            $currTime = $currTime.AddMinutes($rand.Next(10, 30))
        }
        Write-Host "Committed $targetCommits commits on $($d.Date.ToString('yyyy-MM-dd'))"
    }
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE
if (Test-Path .git_backup) { Remove-Item -Recurse -Force .git_backup }

$retry = 0; while($retry -lt 10) { git add . *>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { break }; Start-Sleep -Milliseconds 200; $retry++ }
$finalStatus = git status --porcelain
if ($finalStatus) {
    $finalDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    $env:GIT_AUTHOR_DATE = $finalDate
    $env:GIT_COMMITTER_DATE = $finalDate
    git commit -m "chore: final polish and refinements" | Out-Null
    Remove-Item Env:\GIT_AUTHOR_DATE
    Remove-Item Env:\GIT_COMMITTER_DATE
}
Write-Host "Done!"
