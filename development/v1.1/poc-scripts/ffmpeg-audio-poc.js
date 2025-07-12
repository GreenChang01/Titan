#!/usr/bin/env node

/**
 * FFmpeg Audio Mixing POC Script for ASMR Content
 * 
 * This script demonstrates:
 * 1. Audio mixing and layering for ASMR content
 * 2. Binaural audio processing and spatial effects
 * 3. Voice + soundscape combination
 * 4. Audio optimization for relaxation content
 * 
 * Usage: node ffmpeg-audio-poc.js
 * 
 * Requirements:
 * - FFmpeg installed and available in PATH
 * - Input audio files for testing
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, 'output'),
  inputDir: path.join(__dirname, 'input'),
  tempDir: path.join(__dirname, 'temp'),
  
  // ASMR-optimized audio settings
  audioSettings: {
    sampleRate: 44100,     // CD quality for ASMR
    bitRate: '256k',       // High quality MP3
    channels: 2,           // Stereo for binaural potential
    format: 'mp3',         // Final output format
    volume: {
      voice: 0.7,          // Voice at 70% for clarity
      soundscape: 0.3,     // Background at 30%
      fadeIn: 2,           // 2-second fade in
      fadeOut: 3           // 3-second fade out
    }
  },
  
  // Binaural and spatial audio settings
  binauralSettings: {
    enabled: true,
    leftDelay: '0ms',      // No delay for left channel
    rightDelay: '10ms',    // Slight delay for right channel spatial effect
    stereoWidth: 1.2,      // Slightly wider stereo image
    reverbAmount: 0.15     // Subtle reverb for depth
  },
  
  // Test scenarios for ASMR content
  testScenarios: {
    basic: {
      name: 'Basic Voice + Rain',
      voice: 'voice-sample.mp3',
      soundscape: 'rain-forest.mp3',
      description: 'Simple mix of voice narration with rain background'
    },
    
    binaural: {
      name: 'Binaural ASMR Experience',
      voice: 'voice-sample.mp3',
      soundscape: 'ocean-waves.mp3',
      description: 'Enhanced with binaural effects and spatial processing'
    },
    
    layered: {
      name: 'Multi-layered Soundscape',
      voice: 'voice-sample.mp3',
      soundscape: 'fireplace.mp3',
      additional: 'wind-chimes.mp3',
      description: 'Voice with multiple background layers'
    }
  }
};

/**
 * Check if FFmpeg is available
 */
async function checkFFmpegAvailability() {
  console.log('🔍 Checking FFmpeg availability...');
  
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    const version = stdout.split('\n')[0];
    console.log(`✅ FFmpeg found: ${version}`);
    return true;
  } catch (error) {
    console.error('❌ FFmpeg not found. Please install FFmpeg:');
    console.log('📥 Download from: https://ffmpeg.org/download.html');
    console.log('🐧 Linux: sudo apt install ffmpeg');
    console.log('🍎 macOS: brew install ffmpeg');
    console.log('🪟 Windows: Download and add to PATH');
    return false;
  }
}

/**
 * Create mock input files for testing
 */
async function createMockInputFiles() {
  console.log('📁 Creating mock input files for testing...');
  
  // Ensure directories exist
  [CONFIG.inputDir, CONFIG.outputDir, CONFIG.tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Create mock audio files using FFmpeg's audio generators
  const mockFiles = [
    {
      name: 'voice-sample.mp3',
      command: `ffmpeg -f lavfi -i "sine=frequency=200:duration=30" -ac 2 -ar ${CONFIG.audioSettings.sampleRate} "${path.join(CONFIG.inputDir, 'voice-sample.mp3')}" -y`,
      description: 'Mock voice audio (sine wave at 200Hz)'
    },
    {
      name: 'rain-forest.mp3',
      command: `ffmpeg -f lavfi -i "anoisesrc=duration=60:color=brown:amplitude=0.1" -ac 2 -ar ${CONFIG.audioSettings.sampleRate} "${path.join(CONFIG.inputDir, 'rain-forest.mp3')}" -y`,
      description: 'Mock rain sound (brown noise)'
    },
    {
      name: 'ocean-waves.mp3',
      command: `ffmpeg -f lavfi -i "anoisesrc=duration=60:color=white:amplitude=0.05" -ac 2 -ar ${CONFIG.audioSettings.sampleRate} "${path.join(CONFIG.inputDir, 'ocean-waves.mp3')}" -y`,
      description: 'Mock ocean waves (white noise)'
    },
    {
      name: 'fireplace.mp3',
      command: `ffmpeg -f lavfi -i "anoisesrc=duration=60:color=pink:amplitude=0.08" -ac 2 -ar ${CONFIG.audioSettings.sampleRate} "${path.join(CONFIG.inputDir, 'fireplace.mp3')}" -y`,
      description: 'Mock fireplace (pink noise)'
    },
    {
      name: 'wind-chimes.mp3',
      command: `ffmpeg -f lavfi -i "sine=frequency=440:duration=60" -ac 2 -ar ${CONFIG.audioSettings.sampleRate} "${path.join(CONFIG.inputDir, 'wind-chimes.mp3')}" -y`,
      description: 'Mock wind chimes (sine wave at 440Hz)'
    }
  ];
  
  for (const mockFile of mockFiles) {
    const filePath = path.join(CONFIG.inputDir, mockFile.name);
    
    if (!fs.existsSync(filePath)) {
      console.log(`🎵 Creating ${mockFile.name}: ${mockFile.description}`);
      try {
        await execAsync(mockFile.command);
        console.log(`✅ Created: ${mockFile.name}`);
      } catch (error) {
        console.error(`❌ Failed to create ${mockFile.name}:`, error.message);
      }
    } else {
      console.log(`✅ Already exists: ${mockFile.name}`);
    }
  }
}

/**
 * Execute FFmpeg command with progress monitoring
 */
function executeFFmpegCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${description}...`);
    console.log(`📝 Command: ${command}`);
    
    const process = spawn('ffmpeg', command.split(' ').slice(1), {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stderr = '';
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
      // Extract progress information from FFmpeg output
      const timeMatch = stderr.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (timeMatch) {
        process.stdout.write(`\r⏱️  Processing: ${timeMatch[1]}`);
      }
    });
    
    process.on('close', (code) => {
      console.log(''); // New line after progress
      if (code === 0) {
        console.log(`✅ ${description} completed`);
        resolve();
      } else {
        console.error(`❌ ${description} failed with code ${code}`);
        console.error('Error output:', stderr);
        reject(new Error(`FFmpeg process failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      console.error(`❌ Failed to start FFmpeg:`, error.message);
      reject(error);
    });
  });
}

/**
 * Mix voice with background soundscape (basic)
 */
async function mixBasicASMR(scenario) {
  const { voice, soundscape } = scenario;
  const voicePath = path.join(CONFIG.inputDir, voice);
  const soundscapePath = path.join(CONFIG.inputDir, soundscape);
  const outputPath = path.join(CONFIG.outputDir, 'basic-asmr-mix.mp3');
  
  // Basic mixing command
  const command = `ffmpeg -i "${voicePath}" -i "${soundscapePath}" ` +
    `-filter_complex "[0]volume=${CONFIG.audioSettings.volume.voice}[voice];` +
    `[1]volume=${CONFIG.audioSettings.volume.soundscape}[bg];` +
    `[voice][bg]amix=inputs=2:duration=shortest:dropout_transition=3[mixed];` +
    `[mixed]afade=t=in:ss=0:d=${CONFIG.audioSettings.volume.fadeIn}:curve=exp,` +
    `afade=t=out:st=25:d=${CONFIG.audioSettings.volume.fadeOut}:curve=exp[final]" ` +
    `-map "[final]" -c:a mp3 -b:a ${CONFIG.audioSettings.bitRate} -ar ${CONFIG.audioSettings.sampleRate} ` +
    `"${outputPath}" -y`;
  
  await executeFFmpegCommand(command, 'Basic ASMR mixing');
  return outputPath;
}

/**
 * Create binaural ASMR experience with spatial effects
 */
async function mixBinauralASMR(scenario) {
  const { voice, soundscape } = scenario;
  const voicePath = path.join(CONFIG.inputDir, voice);
  const soundscapePath = path.join(CONFIG.inputDir, soundscape);
  const outputPath = path.join(CONFIG.outputDir, 'binaural-asmr-mix.mp3');
  
  // Binaural processing command with spatial effects
  const command = `ffmpeg -i "${voicePath}" -i "${soundscapePath}" ` +
    `-filter_complex "[0]volume=${CONFIG.audioSettings.volume.voice},` +
    `afreqshift=shift=0[voice];` +
    `[1]volume=${CONFIG.audioSettings.volume.soundscape},` +
    `stereotools=mlev=0.8:mwid=${CONFIG.binauralSettings.stereoWidth},` +
    `aecho=0.8:0.9:${CONFIG.binauralSettings.rightDelay}|${CONFIG.binauralSettings.leftDelay}:${CONFIG.binauralSettings.reverbAmount}|${CONFIG.binauralSettings.reverbAmount}[bg];` +
    `[voice][bg]amix=inputs=2:duration=shortest:dropout_transition=3[mixed];` +
    `[mixed]afade=t=in:ss=0:d=${CONFIG.audioSettings.volume.fadeIn}:curve=exp,` +
    `afade=t=out:st=25:d=${CONFIG.audioSettings.volume.fadeOut}:curve=exp,` +
    `highpass=f=80,lowpass=f=15000[final]" ` +
    `-map "[final]" -c:a mp3 -b:a ${CONFIG.audioSettings.bitRate} -ar ${CONFIG.audioSettings.sampleRate} ` +
    `"${outputPath}" -y`;
  
  await executeFFmpegCommand(command, 'Binaural ASMR processing');
  return outputPath;
}

/**
 * Create multi-layered ASMR soundscape
 */
async function mixLayeredASMR(scenario) {
  const { voice, soundscape, additional } = scenario;
  const voicePath = path.join(CONFIG.inputDir, voice);
  const soundscapePath = path.join(CONFIG.inputDir, soundscape);
  const additionalPath = path.join(CONFIG.inputDir, additional);
  const outputPath = path.join(CONFIG.outputDir, 'layered-asmr-mix.mp3');
  
  // Multi-layer mixing command
  const command = `ffmpeg -i "${voicePath}" -i "${soundscapePath}" -i "${additionalPath}" ` +
    `-filter_complex "[0]volume=${CONFIG.audioSettings.volume.voice}[voice];` +
    `[1]volume=${CONFIG.audioSettings.volume.soundscape * 0.7}[bg1];` +
    `[2]volume=${CONFIG.audioSettings.volume.soundscape * 0.3}[bg2];` +
    `[bg1][bg2]amix=inputs=2:duration=shortest[backgrounds];` +
    `[voice][backgrounds]amix=inputs=2:duration=shortest:dropout_transition=3[mixed];` +
    `[mixed]afade=t=in:ss=0:d=${CONFIG.audioSettings.volume.fadeIn}:curve=exp,` +
    `afade=t=out:st=25:d=${CONFIG.audioSettings.volume.fadeOut}:curve=exp,` +
    `dynaudnorm=p=0.95:m=10:s=12[final]" ` +
    `-map "[final]" -c:a mp3 -b:a ${CONFIG.audioSettings.bitRate} -ar ${CONFIG.audioSettings.sampleRate} ` +
    `"${outputPath}" -y`;
  
  await executeFFmpegCommand(command, 'Multi-layered ASMR mixing');
  return outputPath;
}

/**
 * Analyze generated audio characteristics
 */
async function analyzeAudioCharacteristics(audioPath) {
  console.log(`🔍 Analyzing audio: ${path.basename(audioPath)}`);
  
  try {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${audioPath}"`;
    const { stdout } = await execAsync(command);
    const metadata = JSON.parse(stdout);
    
    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
    const format = metadata.format;
    
    console.log(`📊 Audio Analysis:`);
    console.log(`  - Duration: ${parseFloat(format.duration).toFixed(2)}s`);
    console.log(`  - Sample Rate: ${audioStream.sample_rate}Hz`);
    console.log(`  - Channels: ${audioStream.channels}`);
    console.log(`  - Bit Rate: ${Math.round(format.bit_rate / 1000)}kbps`);
    console.log(`  - File Size: ${Math.round(format.size / 1024)}KB`);
    
    // ASMR quality assessment
    console.log(`🎯 ASMR Quality Assessment:`);
    const sampleRate = parseInt(audioStream.sample_rate);
    const bitRate = parseInt(format.bit_rate);
    const channels = parseInt(audioStream.channels);
    
    console.log(`  ${sampleRate >= 44100 ? '✅' : '❌'} Sample Rate: ${sampleRate >= 44100 ? 'Excellent' : 'Needs improvement'}`);
    console.log(`  ${bitRate >= 256000 ? '✅' : '❌'} Bit Rate: ${bitRate >= 256000 ? 'High quality' : 'Consider higher quality'}`);
    console.log(`  ${channels === 2 ? '✅' : '❌'} Stereo: ${channels === 2 ? 'Binaural ready' : 'Mono not ideal for ASMR'}`);
    
  } catch (error) {
    console.error(`❌ Failed to analyze audio:`, error.message);
  }
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationRecommendations(generatedFiles) {
  console.log('\n🎯 ASMR Audio Optimization Recommendations');
  console.log('=========================================');
  
  console.log('\n🔊 Audio Quality:');
  console.log('  ✅ Use 44.1kHz sample rate minimum');
  console.log('  ✅ Maintain 256kbps+ bit rate for final output');
  console.log('  ✅ Keep stereo channels for binaural potential');
  console.log('  ✅ Apply gentle compression to even out dynamics');
  
  console.log('\n🎵 Mixing Best Practices:');
  console.log('  • Voice: 60-80% volume for clarity');
  console.log('  • Background: 20-40% volume to avoid masking');
  console.log('  • Use fade-ins/outs to prevent jarring starts');
  console.log('  • Apply high-pass filter at 80Hz to remove rumble');
  console.log('  • Apply low-pass filter at 15kHz for warmth');
  
  console.log('\n🧠 Binaural Processing:');
  console.log('  • Subtle stereo width enhancement (1.1-1.3x)');
  console.log('  • Minimal delay between channels (5-15ms)');
  console.log('  • Very light reverb for spatial depth');
  console.log('  • Avoid aggressive processing that reduces clarity');
  
  console.log('\n⚡ Performance Optimization:');
  console.log('  • Process in chunks for long content');
  console.log('  • Use temporary files for complex filter chains');
  console.log('  • Cache processed soundscapes for reuse');
  console.log('  • Consider GPU acceleration for real-time processing');
  
  console.log('\n🔄 Integration with AI Services:');
  console.log('  • Normalize audio levels before mixing');
  console.log('  • Match sample rates between voice and soundscape');
  console.log('  • Apply noise reduction if needed');
  console.log('  • Validate audio integrity after processing');
}

/**
 * Test all ASMR mixing scenarios
 */
async function testAllScenarios() {
  console.log('🎧 Testing all ASMR mixing scenarios...\n');
  
  const results = [];
  
  for (const [key, scenario] of Object.entries(CONFIG.testScenarios)) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎵 Testing: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);
    console.log(`${'='.repeat(50)}\n`);
    
    try {
      let outputPath;
      
      switch (key) {
        case 'basic':
          outputPath = await mixBasicASMR(scenario);
          break;
        case 'binaural':
          outputPath = await mixBinauralASMR(scenario);
          break;
        case 'layered':
          outputPath = await mixLayeredASMR(scenario);
          break;
        default:
          throw new Error(`Unknown scenario: ${key}`);
      }
      
      // Analyze the generated audio
      await analyzeAudioCharacteristics(outputPath);
      
      results.push({
        scenario: key,
        name: scenario.name,
        outputPath,
        status: 'success'
      });
      
    } catch (error) {
      console.error(`❌ Failed to process ${scenario.name}:`, error.message);
      results.push({
        scenario: key,
        name: scenario.name,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎧 FFmpeg ASMR Audio Mixing POC');
  console.log('==============================\n');

  try {
    // 1. Check FFmpeg availability
    const ffmpegAvailable = await checkFFmpegAvailability();
    if (!ffmpegAvailable) {
      throw new Error('FFmpeg is required for this POC');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Create mock input files
    await createMockInputFiles();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Test all mixing scenarios
    const results = await testAllScenarios();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Generate optimization recommendations
    generateOptimizationRecommendations(results);
    
    console.log('\n🎉 POC completed successfully!');
    console.log(`📁 Generated files in: ${CONFIG.outputDir}`);
    console.log(`📁 Input files in: ${CONFIG.inputDir}`);
    
    // Summary
    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`\n📊 Summary: ${successCount}/${results.length} scenarios completed successfully`);
    
    results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`  ${icon} ${result.name}`);
    });
    
    // Next steps
    console.log('\n🚀 Next Steps for Integration:');
    console.log('  1. Integrate with ElevenLabs voice generation');
    console.log('  2. Integrate with Soundverse soundscape generation');
    console.log('  3. Implement IAudioMixer interface');
    console.log('  4. Add real-time progress monitoring');
    console.log('  5. Implement audio quality validation');
    console.log('  6. Add batch processing capabilities');
    console.log('  7. Create preset configurations for different ASMR styles');

  } catch (error) {
    console.error('\n💥 POC failed:', error.message);
    process.exit(1);
  }
}

// Run the POC
if (require.main === module) {
  main();
}

module.exports = {
  mixBasicASMR,
  mixBinauralASMR,
  mixLayeredASMR,
  analyzeAudioCharacteristics,
  CONFIG
};