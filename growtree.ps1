<# 
growtree.ps1 - A PowerShell script to print a directory tree similar to Windows' tree command, using standard ASCII.

USAGE:
  .\growtree.ps1                # Prints the tree starting from the current directory (recursive)
  .\growtree.ps1 2              # Goes 2 levels up from the current directory and prints the full tree
  .\growtree.ps1 -R             # Prints the full recursive tree starting from the current directory
  .\growtree.ps1 -d 3           # Prints the tree from the current directory up to 3 levels deep
  .\growtree.ps1 -d 3 2         # Goes 2 levels up and prints the tree with a max depth of 3

Parameters:
  -d N   : Limit the directory depth to N levels.
  -R     : Print the entire directory tree (no depth limit).
  UP_LEVELS (optional): A numeric value representing how many parent directories to traverse upward.
  
Note:
  This script manually parses parameters via the $args array rather than using formal param blocks.
#>

# Function: usage
# Outputs usage instructions and exits.
function usage {
    Write-Host "Usage:"
    Write-Host "  .\growtree.ps1 [-R | -d N] [UP_LEVELS]"
    Write-Host "Examples:"
    Write-Host "  .\growtree.ps1 -R          # Print full recursive tree from current directory"
    Write-Host "  .\growtree.ps1 -d 3        # Print tree from current directory up to 3 levels deep"
    Write-Host "  .\growtree.ps1 2           # Go up 2 directories and print full tree"
    Write-Host "  .\growtree.ps1 -d 3 2      # Go up 2 directories and print tree up to 3 levels deep"
    exit 1
}

# Initialize default values.
# Using [int]::MaxValue to simulate an "unlimited" depth.
$maxDepth = [int]::MaxValue  
$upLevels = 0

# Manual parameter parsing using $args for flexible ordering.
switch ($args.Count) {
    0 {
        # No arguments provided; defaults apply.
    }
    1 {
        # One argument: it might be a flag or a numeric upLevels.
        if ($args[0] -like "-*") {
            if ($args[0] -eq "-R") {
                $maxDepth = [int]::MaxValue
            } elseif ($args[0] -eq "-d") {
                Write-Host "Error: -d flag requires a numeric argument for depth."
                usage
            } else {
                Write-Host "Error: Unknown flag $($args[0])"
                usage
            }
        } else {
            if ($args[0] -match "^\d+$") {
                $upLevels = [int]$args[0]
            } else {
                Write-Host "Error: UP_LEVELS must be a positive integer."
                usage
            }
        }
    }
    2 {
        # Two arguments: one must be a flag (-R or -d) and the other is interpreted accordingly.
        if ($args[0] -like "-*") {
            $flag = $args[0]
            $other = $args[1]
        } elseif ($args[1] -like "-*") {
            $flag = $args[1]
            $other = $args[0]
        } else {
            Write-Host "Error: One of the parameters must be a flag (-R or -d)."
            usage
        }
        if ($flag -eq "-R") {
            if ($other -match "^\d+$") {
                $upLevels = [int]$other
            } else {
                Write-Host "Error: UP_LEVELS must be a positive integer."
                usage
            }
            $maxDepth = [int]::MaxValue
        } elseif ($flag -eq "-d") {
            if ($other -match "^\d+$") {
                $maxDepth = [int]$other
            } else {
                Write-Host "Error: For -d, a positive integer depth is required."
                usage
            }
        } else {
            Write-Host "Error: Unknown flag $flag"
            usage
        }
    }
    3 {
        # Three arguments expected in the form: -d N UP_LEVELS or UP_LEVELS -d N.
        if ($args[0] -eq "-d") {
            if (($args[1] -match "^\d+$") -and ($args[2] -match "^\d+$")) {
                $maxDepth = [int]$args[1]
                $upLevels = [int]$args[2]
            } else {
                Write-Host "Error: For -d, numeric arguments required for depth and upLevels."
                usage
            }
        } elseif ($args[1] -eq "-d") {
            if (($args[0] -match "^\d+$") -and ($args[2] -match "^\d+$")) {
                $upLevels = [int]$args[0]
                $maxDepth = [int]$args[2]
            } else {
                Write-Host "Error: For -d, numeric arguments required for upLevels and depth."
                usage
            }
        } else {
            Write-Host "Error: When three parameters are provided, the -d flag must be used."
            usage
        }
    }
    default {
        Write-Host "Error: Too many parameters."
        usage
    }
}

# Determine the starting directory by moving up the specified number of levels.
$startDir = (Get-Location).Path
for ($i = 0; $i -lt $upLevels; $i++) {
    $startDir = Split-Path $startDir -Parent
}

# Function: Print-Tree
# Parameters:
#   - dir: The directory path to list.
#   - prefix: The string used for branch formatting (initially empty).
#   - depth: Current recursion depth (integer).
function Print-Tree {
    param(
        [string]$dir,
        [string]$prefix = "",
        [int]$depth = 1
    )
    
    # Enforce maximum depth if applicable.
    if ($depth -gt $maxDepth) {
        return
    }
    
    # Retrieve all entries in the directory, including hidden ones (excluding '.' and '..').
    $entries = Get-ChildItem -LiteralPath $dir -Force | Where-Object { $_.Name -notin @(".", "..") }
    $count = $entries.Count
    for ($i = 0; $i -lt $count; $i++) {
        $entry = $entries[$i]
        if ($i -eq ($count - 1)) {
            # For the last entry use "+-- " connector and adjust prefix with spaces.
            $connector = "+-- "
            $newPrefix = $prefix + "    "
        } else {
            # For intermediate entries use "|-- " connector and adjust prefix with a pipe.
            $connector = "|-- "
            $newPrefix = $prefix + "|   "
        }
        Write-Host "$prefix$connector$($entry.Name)"
        # If the entry is a directory, recursively list its contents.
        if ($entry.PSIsContainer) {
            Print-Tree -dir $entry.FullName -prefix $newPrefix -depth ($depth + 1)
        }
    }
}

# Output the starting directory and then print its tree structure.
Write-Host $startDir
Print-Tree -dir $startDir -prefix "" -depth 1
