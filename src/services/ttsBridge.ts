export const ttsBridge = {
  getVoices(): SpeechSynthesisVoice[] {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  },

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        // Find user selected voice
        const selectedVoiceName = localStorage.getItem('awakure_tts_voice_name');
        
        if (selectedVoiceName === 'offline_melodious') {
          // Route through the local transformer AI model
          import('./LocalTTS').then(({ localTTS }) => {
            localTTS.speak(text).then(() => resolve());
          }).catch(e => {
            console.error('Failed to run LocalTTS:', e);
            resolve();
          });
          return;
        }

        let selectedVoice = voices.find(v => v.name === selectedVoiceName);
        
        // Fallback to nice natural English voice if possible
        if (!selectedVoice) {
          selectedVoice = voices.find(
            voice => voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Natural'))
          ) || voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          resolve();
        };
        
        utterance.onerror = (e) => {
          console.error('TTS error:', e);
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
        
        // Android WebView issue: SpeechSynthesis sometimes hangs.
        // We set a safety timeout to resolve.
        setTimeout(() => {
          resolve();
        }, 15000);
      } else {
        console.warn('Speech synthesis not supported in this browser.');
        resolve();
      }
    });
  },

  cancel() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
