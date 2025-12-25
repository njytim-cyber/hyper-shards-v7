$ErrorActionPreference = "Stop"

function New-WavFile {
    param(
        [string]$Path,
        [int]$Frequency = 440,
        [int]$DurationMs = 500,
        [string]$Type = "Sine" # Sine, Noise
    )

    $SampleRate = 44100
    $Channels = 1
    $BitsPerSample = 16
    $NumSamples = [int]($SampleRate * $DurationMs / 1000)
    $DataSize = $NumSamples * $Channels * ($BitsPerSample / 8)
    $FileSize = 36 + $DataSize

    $Stream = [System.IO.File]::OpenWrite($Path)
    $Writer = New-Object System.IO.BinaryWriter($Stream)

    # RIFF header
    $Writer.Write([System.Text.Encoding]::ASCII.GetBytes("RIFF"))
    $Writer.Write([int]$FileSize)
    $Writer.Write([System.Text.Encoding]::ASCII.GetBytes("WAVE"))

    # fmt chunk
    $Writer.Write([System.Text.Encoding]::ASCII.GetBytes("fmt "))
    $Writer.Write([int]16) # Chunk size
    $Writer.Write([short]1) # PCM
    $Writer.Write([short]$Channels)
    $Writer.Write([int]$SampleRate)
    $Writer.Write([int]($SampleRate * $Channels * $BitsPerSample / 8)) # Byte rate
    $Writer.Write([short]($Channels * $BitsPerSample / 8)) # Block align
    $Writer.Write([short]$BitsPerSample)

    # data chunk
    $Writer.Write([System.Text.Encoding]::ASCII.GetBytes("data"))
    $Writer.Write([int]$DataSize)

    # Generate Audio Data
    $Rand = New-Object Random
    for ($i = 0; $i -lt $NumSamples; $i++) {
        $Sample = 0
        if ($Type -eq "Noise") {
            $Sample = [short]$Rand.Next(-10000, 10000)
        } else {
            # Sine wave with decay
            $T = $i / $SampleRate
            $Vol = 1.0 - ($i / $NumSamples) # Linear decay
            $Val = [Math]::Sin(2 * [Math]::PI * $Frequency * $T)
            $Sample = [short]($Val * 15000 * $Vol)
        }
        $Writer.Write([short]$Sample)
    }

    $Writer.Close()
    $Stream.Close()
    Write-Host "Created $Path"
}

# Ensure directory
New-Item -ItemType Directory -Force -Path "$PSScriptRoot/../public/sfx" | Out-Null

# Generate placeholders
New-WavFile -Path "$PSScriptRoot/../public/sfx/shoot_blaster.wav" -Frequency 880 -DurationMs 200
New-WavFile -Path "$PSScriptRoot/../public/sfx/shoot_spread.wav" -Frequency 440 -DurationMs 300 -Type "Noise"
New-WavFile -Path "$PSScriptRoot/../public/sfx/shoot_rapid.wav" -Frequency 1200 -DurationMs 100
New-WavFile -Path "$PSScriptRoot/../public/sfx/shoot_heavy.wav" -Frequency 220 -DurationMs 400
New-WavFile -Path "$PSScriptRoot/../public/sfx/explosion_small.wav" -Frequency 100 -DurationMs 500 -Type "Noise"
New-WavFile -Path "$PSScriptRoot/../public/sfx/explosion_large.wav" -Frequency 50 -DurationMs 1000 -Type "Noise"
New-WavFile -Path "$PSScriptRoot/../public/sfx/explosion_boss.wav" -Frequency 30 -DurationMs 2000 -Type "Noise"
New-WavFile -Path "$PSScriptRoot/../public/sfx/powerup_pickup.wav" -Frequency 660 -DurationMs 400
New-WavFile -Path "$PSScriptRoot/../public/sfx/hit_player.wav" -Frequency 200 -DurationMs 300 -Type "Noise"
New-WavFile -Path "$PSScriptRoot/../public/sfx/ui_click.wav" -Frequency 2000 -DurationMs 50
New-WavFile -Path "$PSScriptRoot/../public/sfx/ui_hover.wav" -Frequency 1500 -DurationMs 50
New-WavFile -Path "$PSScriptRoot/../public/sfx/victory.wav" -Frequency 550 -DurationMs 2000
New-WavFile -Path "$PSScriptRoot/../public/sfx/defeat.wav" -Frequency 110 -DurationMs 2000
