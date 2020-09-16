
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YeuAiVoiceService {
  _context: any;
  constructor(
  ) {
    this._context = null;
  }

  /**
   * Create audio context when user clickes button `Call`
   * Ref: https://goo.gl/7K7WLu
   * Return instance of AudioContext
   */
  get context() {
    if (!this._context) {
      this._context = this.newAudioContext;
    }

    return this._context;
  }

  /**
   * Get audio context
   */
  get newAudioContext() {
    AudioContext = AudioContext; // || webkitAudioContext || mozAudioContext;
    return new AudioContext();
  }

  async speakTemplate(template, vm) {
    const runTemplate = this.compile(template);
    const strVoice = runTemplate(vm);
    return await this.speak(strVoice);
  }

  /**
   * Convert text to audio
   */
  async speak(text: string, options?) {
    const res = await fetch('https://voice.yeu.ai/api/voice/tts?text=' + text);
    const buffer = await res.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(buffer);
    return await this.play(audioBuffer);
  }

  /**
   * Play audio buffer
   */
  play(buffer) {
    return new Promise((resolve) => {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context.destination);
      source.start();
      source.addEventListener('ended', resolve);
      // return source;
    });
  }

  compile(template) {
    return new Function('vm', 'return `' + template + '`');
  }
}
