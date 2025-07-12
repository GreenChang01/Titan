# ASMR Audio Generation POC Scripts

This directory contains proof-of-concept scripts for implementing high-quality ASMR audio generation using AI services and FFmpeg processing.

## 📁 Directory Structure

```
poc-scripts/
├── elevenlabs-poc.js      # ElevenLabs API voice synthesis POC
├── soundverse-poc.js      # Soundverse AI soundscape generation POC
├── ffmpeg-audio-poc.js    # FFmpeg audio mixing and processing POC
├── README.md             # This file
├── input/                # Mock input files (auto-generated)
├── output/               # Generated output files
└── temp/                 # Temporary processing files
```

## 🎯 Purpose

These POC scripts validate the technical approach for the Titan V1.1 ASMR audio generation pipeline:

1. **Voice Synthesis**: High-quality ASMR voice generation using ElevenLabs
2. **Soundscape Creation**: AI-generated background sounds using Soundverse AI
3. **Audio Mixing**: Professional audio mixing and binaural processing using FFmpeg

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v14 or higher)
2. **FFmpeg** installed and in PATH
3. **API Keys** (see Environment Variables section)

### Installation

```bash
# Navigate to POC directory
cd development/v1.1/poc-scripts

# Install Node.js if needed (example for Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FFmpeg if needed
sudo apt install ffmpeg  # Ubuntu/Debian
brew install ffmpeg      # macOS
```

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# ElevenLabs API (required for voice synthesis)
export ELEVENLABS_API_KEY="your_elevenlabs_api_key_here"

# Soundverse AI API (required for soundscape generation)
export SOUNDVERSE_API_KEY="your_soundverse_api_key_here"
```

**Getting API Keys:**

- ElevenLabs: https://elevenlabs.io/speech-synthesis
- Soundverse AI: Contact their sales team or check documentation

## 🧪 Running the POCs

### 1. ElevenLabs Voice Synthesis POC

```bash
node elevenlabs-poc.js
```

**What it tests:**

- ✅ API connection and authentication
- ✅ Voice listing and ASMR-suitable voice identification
- ✅ High-quality voice synthesis with ASMR-optimized settings
- ✅ Audio file generation and quality analysis
- ✅ Cost estimation for production use

**Expected Output:**

- MP3 files in `output/` directory
- Voice quality analysis
- ASMR optimization recommendations

### 2. Soundverse AI Soundscape POC

```bash
node soundverse-poc.js
```

**What it tests:**

- ✅ API availability and model selection
- ✅ ASMR soundscape generation (rain, ocean, fireplace, etc.)
- ✅ Batch generation capabilities
- ✅ Cost analysis for production scaling
- ✅ Audio characteristics suitable for ASMR

**Expected Output:**

- Simulated soundscape files (text descriptions)
- Generation analysis and recommendations
- Cost projections

### 3. FFmpeg Audio Mixing POC

```bash
node ffmpeg-audio-poc.js
```

**What it tests:**

- ✅ FFmpeg installation and availability
- ✅ Basic voice + soundscape mixing
- ✅ Binaural audio processing and spatial effects
- ✅ Multi-layered soundscape composition
- ✅ Audio quality analysis and optimization

**Expected Output:**

- Mixed audio files (MP3 format)
- Audio quality analysis
- ASMR optimization recommendations

## 📊 POC Results Analysis

### Voice Synthesis Quality Metrics

```javascript
// ElevenLabs ASMR-optimized settings
voiceSettings: {
  stability: 0.8,        // High for consistent ASMR delivery
  similarity_boost: 0.9, // High for voice consistency
  style: 0.2,           // Low for natural, less dramatic delivery
  use_speaker_boost: true
}
```

### Soundscape Generation Parameters

```javascript
// Soundverse ASMR optimization
generationSettings: {
  duration: 60,          // 60 seconds for testing
  quality: 'high',       // High quality for ASMR
  format: 'wav',         // WAV for best quality
  sample_rate: 44100,    // CD quality
  channels: 2,           // Stereo for binaural potential
}
```

### Audio Mixing Configuration

```javascript
// FFmpeg ASMR mixing ratios
volume: {
  voice: 0.7,          // Voice at 70% for clarity
  soundscape: 0.3,     // Background at 30%
  fadeIn: 2,           // 2-second fade in
  fadeOut: 3           // 3-second fade out
}
```

## 🎯 ASMR Quality Standards

### Audio Technical Requirements

- **Sample Rate**: 44.1kHz minimum (CD quality)
- **Bit Rate**: 256kbps+ for final output
- **Channels**: Stereo (binaural processing ready)
- **Format**: WAV for processing, MP3 for delivery
- **Dynamic Range**: Gentle compression for consistent levels

### Voice Characteristics

- **Stability**: High consistency for relaxation
- **Tone**: Natural, warm, not overly dramatic
- **Pace**: Slower delivery for ASMR effectiveness
- **Volume**: Consistent levels, no sudden changes
- **Clarity**: Clear pronunciation without harshness

### Soundscape Characteristics

- **Frequency Range**: Optimized for relaxation (not too bright)
- **Looping**: Seamless for extended play
- **Layering**: Multiple elements without muddiness
- **Spatial**: Subtle stereo imaging for immersion
- **Triggers**: Specific ASMR trigger sounds (rain, crackling, etc.)

## 🔄 Integration Path

### Phase 1: API Integration

1. **ElevenLabs Service**

   ```typescript
   interface IAudioProvider {
     generateVoice(text: string, voiceId: string): Promise<Buffer>;
     getVoices(): Promise<Voice[]>;
     cloneVoice(audioSample: Buffer): Promise<string>;
   }
   ```

2. **Soundverse Service**
   ```typescript
   interface ISoundscapeProvider {
     generateSoundscape(prompt: string, duration: number): Promise<Buffer>;
     getBatchCost(requests: number): Promise<number>;
   }
   ```

### Phase 2: Audio Processing Service

```typescript
interface IAudioMixer {
  mixVoiceAndSoundscape(voice: Buffer, soundscape: Buffer, options: MixingOptions): Promise<Buffer>;

  applyBinauralEffects(audio: Buffer): Promise<Buffer>;
  optimizeForASMR(audio: Buffer): Promise<Buffer>;
}
```

### Phase 3: Production Pipeline

```typescript
class ASMRContentGenerator {
  async generateContent(request: ASMRGenerationRequest): Promise<string> {
    // 1. Generate voice with ElevenLabs
    const voice = await this.audioProvider.generateVoice(request.text, request.voiceId);

    // 2. Generate soundscape with Soundverse
    const soundscape = await this.soundscapeProvider.generateSoundscape(request.soundscapePrompt, request.duration);

    // 3. Mix and optimize with FFmpeg
    const mixed = await this.audioMixer.mixVoiceAndSoundscape(voice, soundscape, request.mixingOptions);

    // 4. Apply ASMR optimization
    const optimized = await this.audioMixer.optimizeForASMR(mixed);

    return this.saveToFile(optimized);
  }
}
```

## 💰 Cost Estimation

### ElevenLabs Pricing (Estimated)

- **Voice Synthesis**: ~$0.20 per 1000 characters
- **Voice Cloning**: ~$5-10 per voice setup
- **Monthly Quota**: Varies by plan ($5-$330/month)

### Soundverse AI Pricing (Estimated)

- **Soundscape Generation**: ~$0.10 per minute of audio
- **Batch Discounts**: Available for high volume
- **Quality Tiers**: Higher quality = higher cost

### FFmpeg Processing

- **Computational Cost**: Minimal (local processing)
- **Storage Cost**: Based on output file sizes
- **Processing Time**: ~1-5 seconds per minute of audio

### Production Cost Example (50 ASMR videos/day)

- Voice synthesis: ~$30-50/month
- Soundscape generation: ~$50-100/month
- Processing & storage: ~$10-20/month
- **Total**: ~$90-170/month for 50 videos/day

## 🔧 Troubleshooting

### Common Issues

1. **FFmpeg not found**

   ```bash
   # Check if FFmpeg is installed
   ffmpeg -version

   # Install if missing
   sudo apt install ffmpeg  # Ubuntu
   brew install ffmpeg      # macOS
   ```

2. **API Authentication Failed**
   - Verify API keys are correctly set
   - Check API key permissions and quotas
   - Ensure environment variables are loaded

3. **Audio Quality Issues**
   - Check sample rate settings (44.1kHz minimum)
   - Verify bit rate configuration (256kbps+)
   - Ensure stereo channel configuration

4. **File Permission Errors**
   ```bash
   # Ensure directories are writable
   chmod 755 poc-scripts/
   chmod 755 poc-scripts/output/
   ```

### Performance Optimization

1. **Memory Usage**
   - Process audio in chunks for long content
   - Use temporary files for complex operations
   - Clear buffers after processing

2. **Processing Speed**
   - Use GPU acceleration when available
   - Implement parallel processing for batch operations
   - Cache frequently used soundscapes

## 📚 References

- [ElevenLabs API Documentation](https://docs.elevenlabs.io/)
- [FFmpeg Audio Filters](https://ffmpeg.org/ffmpeg-filters.html#Audio-Filters)
- [ASMR Audio Production Guide](https://www.asmr-research.org/)
- [Binaural Audio Processing](https://en.wikipedia.org/wiki/Binaural_recording)

## 🚀 Next Steps

1. **Obtain Production API Keys**
   - ElevenLabs professional account
   - Soundverse AI business access

2. **Implement Full Integration**
   - Create NestJS service classes
   - Add error handling and retry logic
   - Implement cost monitoring

3. **Quality Validation**
   - A/B testing with ASMR content creators
   - User feedback collection
   - Quality metrics tracking

4. **Scale Preparation**
   - Batch processing optimization
   - Caching strategies
   - Cost optimization algorithms

---

**Status**: Ready for production integration  
**Last Updated**: 2025-01-12  
**Validation**: ✅ Technical approach confirmed by zen analysis
