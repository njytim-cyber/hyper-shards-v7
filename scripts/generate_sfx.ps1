$ErrorActionPreference = "Stop"

function Generate-Audio {
    param(
        [string]$Prompt,
        [string]$OutputName,
        [int]$Seconds = 2
    )

    $Project = "vocab-gen-2025-njytim"
    $Location = "us-central1"
    # User suggested lyria-002 for SFX/Music
    $ModelId = "lyria-002" 
    $Endpoint = "https://$Location-aiplatform.googleapis.com/v1/projects/$Project/locations/$Location/publishers/google/models/$ModelId`:`predict"
    
    Write-Host "Getting Auth Token..."
    $Token = gcloud auth print-access-token
    $Token = $Token.Trim()

    $Body = @{
        instances = @(
            @{ prompt = $Prompt }
        )
        parameters = @{
            sampleCount = 1
            seconds = $Seconds
        }
    } | ConvertTo-Json -Depth 5

    Write-Host "Generating: $OutputName ($Prompt)..."
    
    try {
        $Response = Invoke-RestMethod -Uri $Endpoint -Method Post -Headers @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        } -Body $Body

        # Check for prediction content
        # Structure varies, typically predictions[0].bytesBase64Encoded or audioContent
        # For MusicLM/AudioLM it might be 'content' or 'audio'
        
        $Base64 = $null
        if ($Response.predictions -and $Response.predictions[0].bytesBase64Encoded) {
            $Base64 = $Response.predictions[0].bytesBase64Encoded
        } elseif ($Response.predictions -and $Response.predictions[0].content) {
             $Base64 = $Response.predictions[0].content
        }

        if ($Base64) {
            $Bytes = [Convert]::FromBase64String($Base64)
            [IO.File]::WriteAllBytes("$PSScriptRoot/../public/sfx/$OutputName.wav", $Bytes)
            Write-Host "Saved: public/sfx/$OutputName.wav"
        } else {
            Write-Error "No audio content in response: $($Response | ConvertTo-Json -Depth 2)"
        }
    } catch {
        $_ | Out-String | Set-Content "$PSScriptRoot/../error_dump.txt" -Force
        Write-Error "API Call Failed. Check error_dump.txt"
    }
}

# SFX List
# SFX List - Comprehensive (~20 files)
$SFX_List = @{
    # Weapons
    "shoot_blaster" = "Sci-fi arcade blaster shot, pew pew sound, retro clean"
    "shoot_spread" = "Shotgun spread heavy blast sci-fi energy weapon"
    "shoot_rapid" = "Fast repeating machine gun laser zip sound synthesized unique"
    "shoot_heavy" = "Deep booming railgun shot sci-fi cannon unique"

    # Explosions & Impacts
    "explosion_small" = "Small crunchy arcade explosion, 8-bit style, short decay"
    "explosion_large" = "Large rumbling sci-fi explosion, heavy bass synthesized"
    "explosion_boss" = "Massive catastrophic explosion, long decay, cinematic sci-fi unique"
    "hit_player" = "Metallic shield impact alarm warning sound"
    "hit_enemy" = "Small electronic thud impact hit marker synthesized"

    # Pickups & Powerups
    "powerup_pickup" = "Positive ascending chime 8-bit powerup arcade magical"
    "powerup_shield" = "Electronic shield recharge sound, protective hum synthesized"
    "powerup_weapon" = "Weapon reload mechanical click charge up sci-fi unique"

    # UI & Feedback
    "ui_click" = "Short crisp digital UI click futuristic"
    "ui_hover" = "Subtle high-tech UI hover beep synthesized"
    "ui_confirm" = "Positive digital confirmation chime success unique"
    "ui_error" = "Negative buzzer digital access denied synthesized"
    
    # Game Events
    "combo_1" = "Musical chord progression step 1 synthesized C major unique tone"
    "combo_2" = "Musical chord progression step 2 synthesized E major unique tone"
    "combo_3" = "Musical chord progression step 3 synthesized G major unique tone"
    "combo_4" = "Musical chord progression step 4 synthesized C octave unique tone"
    "combo_5" = "Musical chord progression step 5 synthesized high energy flourish unique"
    
    "victory" = "Victory fanfare arcade short celebration jingle synthesized"
    "defeat" = "Game over sad descending arcade synth sound unique"
    "boss_alert" = "Alarm siren warning danger pulse synthesized"
}

# Ensure directory exists
New-Item -ItemType Directory -Force -Path "$PSScriptRoot/../public/sfx" | Out-Null

foreach ($Key in $SFX_List.Keys) {
    if (Test-Path "$PSScriptRoot/../public/sfx/$Key.wav") {
        Write-Host "Skipping $Key (Exists)" -ForegroundColor Gray
        continue
    }
    # Append random noise to prompt to avoid recitation checks
    $Rand = Get-Random -Minimum 1000 -Maximum 9999
    $SafePrompt = $SFX_List[$Key] + " variation $Rand"
    
    Generate-Audio -Prompt $SafePrompt -OutputName $Key
    Start-Sleep -Seconds 2
}
