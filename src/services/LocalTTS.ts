import { pipeline, env } from '@huggingface/transformers';

// Ensure the browser caches the model so it works offline later
env.allowLocalModels = false;
env.useBrowserCache = true;

class LocalTTSEngine {
  private synthesizer: any = null;
  public isReady = false;
  public isDownloading = false;

  // CMU ARCTIC Voice Clones (Extracted xvectors)
  // slt = female, bdl = male, awb = male, ksp = male, jmk = male
  public readonly SPEAKER_URL = 'https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/cmu_us_slt_arctic-wav-arctic_a0001.bin';

  async init(onProgress?: (info: any) => void) {
    if (this.synthesizer) return;
    this.isDownloading = true;

    try {
      // Download or load the ~140MB quantized ONNX model for SpeechT5
      this.synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', {
        dtype: 'q8',
        progress_callback: onProgress
      } as any);
      this.isReady = true;
    } catch (e) {
      console.error('Failed to initialize local TTS:', e);
      throw e;
    } finally {
      this.isDownloading = false;
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.synthesizer) {
      console.warn('LocalTTS not initialized. Initializing silently...');
      await this.init();
    }

    try {
      // Generate the audio waveform
      const out = await this.synthesizer(text, { speaker_embeddings: this.SPEAKER_URL });
      
      // out.audio is a Float32Array, out.sampling_rate is the sample rate (usually 16000)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = audioCtx.createBuffer(1, out.audio.length, out.sampling_rate);
      audioBuffer.getChannelData(0).set(out.audio);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      return new Promise((resolve) => {
        source.onended = () => resolve();
        source.start(0);
      });
    } catch (e) {
      console.error('Local TTS Speech error:', e);
    }
  }
}

export const localTTS = new LocalTTSEngine();
