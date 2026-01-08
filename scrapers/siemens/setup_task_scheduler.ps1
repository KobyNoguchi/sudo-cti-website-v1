<#
.SYNOPSIS
    Sets up Windows Task Scheduler to run the Siemens vulnerability scraper automatically.

.DESCRIPTION
    This script creates a scheduled task that runs the Siemens CERT scraper
    at a specified time each day. The task runs with the current user's credentials.

.PARAMETER TaskName
    Name of the scheduled task (default: "Siemens Vulnerability Scraper")

.PARAMETER Time
    Time to run the task in HH:MM format (default: "06:00")

.PARAMETER PythonPath
    Path to Python executable. If not specified, uses 'python' from PATH.

.PARAMETER Remove
    If specified, removes the scheduled task instead of creating it.

.EXAMPLE
    .\setup_task_scheduler.ps1
    Creates a task that runs daily at 6:00 AM

.EXAMPLE
    .\setup_task_scheduler.ps1 -Time "08:30"
    Creates a task that runs daily at 8:30 AM

.EXAMPLE
    .\setup_task_scheduler.ps1 -Remove
    Removes the scheduled task

.NOTES
    Requires Administrator privileges to create scheduled tasks.
    Run PowerShell as Administrator before executing this script.
#>

param(
    [string]$TaskName = "Siemens Vulnerability Scraper",
    [string]$Time = "06:00",
    [string]$PythonPath = "",
    [switch]$Remove
)

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SchedulerScript = Join-Path $ScriptDir "scheduler.py"
$LogDir = Join-Path $ScriptDir "logs"

# Ensure logs directory exists
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Handle removal
if ($Remove) {
    Write-Host "Removing scheduled task: $TaskName" -ForegroundColor Yellow
    
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-Host "Task removed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Task not found or could not be removed: $_" -ForegroundColor Red
    }
    exit
}

# Find Python
if ([string]::IsNullOrEmpty($PythonPath)) {
    $PythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
    if ([string]::IsNullOrEmpty($PythonPath)) {
        $PythonPath = (Get-Command python3 -ErrorAction SilentlyContinue).Source
    }
}

if ([string]::IsNullOrEmpty($PythonPath)) {
    Write-Host "ERROR: Python not found. Please specify -PythonPath parameter." -ForegroundColor Red
    exit 1
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Siemens Scraper Task Scheduler Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Task Name:    $TaskName"
Write-Host "  Schedule:     Daily at $Time"
Write-Host "  Python:       $PythonPath"
Write-Host "  Script:       $SchedulerScript"
Write-Host "  Log Dir:      $LogDir"
Write-Host ""

# Check if script exists
if (-not (Test-Path $SchedulerScript)) {
    Write-Host "ERROR: Scheduler script not found: $SchedulerScript" -ForegroundColor Red
    exit 1
}

# Check for admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator. Task creation may fail." -ForegroundColor Yellow
    Write-Host "Consider running PowerShell as Administrator." -ForegroundColor Yellow
    Write-Host ""
}

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create the scheduled task
Write-Host "Creating scheduled task..." -ForegroundColor Cyan

try {
    # Build the action - run Python with the scheduler script in --once mode
    $Action = New-ScheduledTaskAction `
        -Execute $PythonPath `
        -Argument "`"$SchedulerScript`" --once" `
        -WorkingDirectory $ScriptDir

    # Parse the time
    $TimeParts = $Time -split ":"
    $Hour = [int]$TimeParts[0]
    $Minute = [int]$TimeParts[1]

    # Create daily trigger
    $Trigger = New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($Hour).AddMinutes($Minute))

    # Task settings
    $Settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Hours 1)

    # Create the task
    $Task = Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Description "Automatically scrapes Siemens ProductCERT vulnerability data and updates the website." `
        -ErrorAction Stop

    Write-Host ""
    Write-Host "Task created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Details:" -ForegroundColor Yellow
    Write-Host "  Status:       $($Task.State)"
    Write-Host "  Next Run:     $((Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).NextRunTime)"
    Write-Host ""
    Write-Host "To manage the task:" -ForegroundColor Cyan
    Write-Host "  View:    Get-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Run Now: Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Disable: Disable-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Remove:  .\setup_task_scheduler.ps1 -Remove"
    Write-Host ""
    Write-Host "Logs will be saved to: $LogDir" -ForegroundColor Cyan
}
catch {
    Write-Host ""
    Write-Host "ERROR: Failed to create scheduled task" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}
