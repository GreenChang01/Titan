#!/usr/bin/env node

/**
 * ElevenLabs API Proof of Concept Script
 * 
 * This script demonstrates:
 * 1. Voice cloning and synthesis using ElevenLabs API
 * 2. ASMR-specific voice settings and parameters
 * 3. Error handling and audio file generation
 * 
 * Usage: node elevenlabs-poc.js
 * 
 * Required environment variables:
 * - ELEVENLABS_API_KEY: Your ElevenLabs API key
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  apiKey: process.env.ELEVENLABS_API_KEY || 'YOUR_API_KEY_HERE',
  baseUrl: 'api.elevenlabs.io',
  outputDir: path.join(__dirname, 'output'),
  
  // ASMR-optimized voice settings
  voiceSettings: {
    stability: 0.8,        // Higher stability for consistent ASMR quality
    similarity_boost: 0.9, // High similarity for consistent voice
    style: 0.2,           // Lower style for more natural, less dramatic delivery
    use_speaker_boost: true
  },
  
  // Test voice ID (replace with your preferred voice)
  defaultVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
  
  // ASMR test content
  testContent: {
    shortText: "Close your eyes and take a deep breath. Let the gentle rain wash away your worries.",
    longText: `Welcome to this peaceful ASMR experience. 
    
    Tonight, we'll journey together through a serene forest where the gentle patter of rain creates a symphony of tranquility. 
    
    Feel yourself relaxing as each word flows softly, creating waves of calm that wash over your mind and body. 
    
    The soft whispers of nature surround you, bringing deep peace and restful sleep.`
  }
};

/**
 * Make HTTPS request to ElevenLabs API
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = Buffer.alloc(0);

      res.on('data', (chunk) => {
        responseData = Buffer.concat([responseData, chunk]);
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // For audio responses, return the buffer
          if (res.headers['content-type']?.includes('audio')) {
            resolve(responseData);
          } else {
            // For JSON responses, parse the data
            try {
              const jsonData = JSON.parse(responseData.toString());
              resolve(jsonData);
            } catch (error) {
              resolve(responseData);
            }
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData.toString()}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

/**
 * Get available voices from ElevenLabs
 */
async function getVoices() {
  console.log('🎤 Fetching available voices...');
  
  const options = {
    hostname: CONFIG.baseUrl,
    path: '/v1/voices',
    method: 'GET',
    headers: {
      'xi-api-key': CONFIG.apiKey,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log(`✅ Found ${response.voices?.length || 0} voices`);
    
    // Display ASMR-suitable voices
    if (response.voices) {
      console.log('\n🎯 ASMR-suitable voices:');
      response.voices
        .filter(voice => 
          voice.category === 'premade' && 
          (voice.description?.toLowerCase().includes('calm') || 
           voice.description?.toLowerCase().includes('soft') ||
           voice.description?.toLowerCase().includes('gentle'))
        )
        .slice(0, 5)
        .forEach(voice => {
          console.log(`  - ${voice.name} (${voice.voice_id}): ${voice.description}`);
        });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch voices:', error.message);
    throw error;
  }
}

/**
 * Generate ASMR audio using text-to-speech
 */
async function generateASMRAudio(text, voiceId = CONFIG.defaultVoiceId, filename = 'asmr-test') {
  console.log(`🎵 Generating ASMR audio with voice ${voiceId}...`);
  
  const requestData = JSON.stringify({
    text: text,
    model_id: 'eleven_monolingual_v1', // Good for English ASMR
    voice_settings: CONFIG.voiceSettings
  });

  const options = {
    hostname: CONFIG.baseUrl,
    path: `/v1/text-to-speech/${voiceId}`,
    method: 'POST',
    headers: {
      'xi-api-key': CONFIG.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    }
  };

  try {
    const audioBuffer = await makeRequest(options, requestData);
    
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    
    // Save audio file
    const outputPath = path.join(CONFIG.outputDir, `${filename}.mp3`);
    fs.writeFileSync(outputPath, audioBuffer);
    
    console.log(`✅ ASMR audio generated: ${outputPath}`);
    console.log(`📊 File size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
    
    return outputPath;
  } catch (error) {
    console.error('❌ Failed to generate audio:', error.message);
    throw error;
  }
}

/**
 * Test voice cloning (requires voice sample upload)
 */
async function testVoiceCloning() {
  console.log('🧬 Voice cloning requires manual voice sample upload');
  console.log('📝 Steps to test voice cloning:');
  console.log('  1. Visit ElevenLabs website');
  console.log('  2. Upload a voice sample (1-30 minutes of clear speech)');
  console.log('  3. Get the custom voice ID');
  console.log('  4. Use that voice ID in generateASMRAudio()');
  
  // For demonstration, we'll use a pre-made voice
  return CONFIG.defaultVoiceId;
}

/**
 * Analyze audio characteristics for ASMR optimization
 */
function analyzeASMRCharacteristics(audioPath) {
  console.log(`🔍 ASMR Audio Analysis for: ${audioPath}`);
  
  const stats = fs.statSync(audioPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  
  console.log(`📊 Analysis Results:`);
  console.log(`  - File size: ${fileSizeKB} KB`);
  console.log(`  - Format: MP3`);
  console.log(`  - Estimated duration: ~${(stats.size / 16000).toFixed(1)}s (assuming 128kbps)`);
  
  console.log(`🎯 ASMR Quality Checklist:`);
  console.log(`  ✅ Voice stability: ${CONFIG.voiceSettings.stability}`);
  console.log(`  ✅ Similarity boost: ${CONFIG.voiceSettings.similarity_boost}`);
  console.log(`  ✅ Low style factor: ${CONFIG.voiceSettings.style}`);
  console.log(`  ✅ Speaker boost enabled: ${CONFIG.voiceSettings.use_speaker_boost}`);
  
  console.log(`💡 Recommendations:`);
  console.log(`  - For better ASMR: Use custom voice trained on ASMR samples`);
  console.log(`  - For binaural effect: Process with spatial audio in post`);
  console.log(`  - For triggers: Add pause control and emphasis markers`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎧 ElevenLabs ASMR Audio Generation POC');
  console.log('=====================================\n');

  // Check API key
  if (!CONFIG.apiKey || CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
    console.error('❌ Please set ELEVENLABS_API_KEY environment variable');
    console.log('💡 Get your API key from: https://elevenlabs.io/speech-synthesis');
    process.exit(1);
  }

  try {
    // 1. Get available voices
    await getVoices();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Test voice cloning info
    await testVoiceCloning();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Generate short ASMR audio
    const shortAudioPath = await generateASMRAudio(
      CONFIG.testContent.shortText, 
      CONFIG.defaultVoiceId, 
      'asmr-short-test'
    );
    
    console.log('\n' + '-'.repeat(30) + '\n');
    
    // 4. Generate longer ASMR audio
    const longAudioPath = await generateASMRAudio(
      CONFIG.testContent.longText, 
      CONFIG.defaultVoiceId, 
      'asmr-long-test'
    );
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 5. Analyze generated audio
    analyzeASMRCharacteristics(shortAudioPath);
    console.log('\n' + '-'.repeat(30) + '\n');
    analyzeASMRCharacteristics(longAudioPath);
    
    console.log('\n🎉 POC completed successfully!');
    console.log(`📁 Generated files in: ${CONFIG.outputDir}`);
    
    // Next steps
    console.log('\n🚀 Next Steps for Integration:');
    console.log('  1. Create IAudioProvider interface');
    console.log('  2. Implement ElevenLabsProvider class');
    console.log('  3. Add error handling and retry logic');
    console.log('  4. Implement cost tracking and quota management');
    console.log('  5. Add voice caching and optimization');

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
  generateASMRAudio,
  getVoices,
  CONFIG
};