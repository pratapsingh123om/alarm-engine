class SoundPlayer {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: any = null;
  private isPlaying = false;
  private audioNode: HTMLAudioElement | null = null;

  playAlarm(soundUrl?: string) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (soundUrl) {
      try {
        this.audioNode = new Audio(soundUrl);
        this.audioNode.loop = true;
        this.audioNode.volume = 0.8;
        this.audioNode.play().catch(e => {
          console.error('Audio play failed, falling back to synthesizer:', e);
          this.playSynthesizedAlarm();
        });
        return;
      } catch (e) {
        console.error('Failed to create Audio element, falling back to synthesizer:', e);
      }
    }

    this.playSynthesizedAlarm();
  }

  private playSynthesizedAlarm() {
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      let beepState = false;
      
      this.intervalId = setInterval(() => {
        if (!this.audioCtx) return;
        
        if (beepState) {
          this.stopOscillator();
        } else {
          this.startOscillator();
        }
        beepState = !beepState;
      }, 500); // Pulse every 500ms
    } catch (e) {
      console.error('Failed to init Web Audio API synth:', e);
    }
  }

  private startOscillator() {
    if (!this.audioCtx) return;
    
    try {
      this.stopOscillator();
      
      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();
      
      // Dual tone frequency for annoying alarm sound
      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5 note
      
      this.gainNode.gain.setValueAtTime(0.0, this.audioCtx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.05);
      
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      
      this.oscillator.start();
    } catch (e) {
      console.error('Error starting oscillator:', e);
    }
  }

  private stopOscillator() {
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch (e) {
      console.error('Error stopping oscillator:', e);
    }
  }

  stopAlarm() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.audioNode) {
      try {
        this.audioNode.pause();
        this.audioNode.currentTime = 0;
        this.audioNode = null;
      } catch (e) {
        console.error('Error stopping audio element:', e);
      }
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.stopOscillator();

    if (this.audioCtx) {
      this.audioCtx.close().then(() => {
        this.audioCtx = null;
      }).catch(e => {
        console.error('Error closing AudioContext:', e);
        this.audioCtx = null;
      });
    }
  }
}

export const soundPlayer = new SoundPlayer();
