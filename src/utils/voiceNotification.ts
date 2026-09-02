// Engine de Notificação com Voz da Academia - Estilo Mercado Livre
// Reproduz o Jingle Melódico de marca seguido pela locução sintetizada do nome da academia.
// Funciona 100% no navegador (Web Audio API + Web Speech API) sem custo de servidor.

import { RegisteredAcademy, AcademyVoiceStyle, ChimeType } from '../types';

class AcademyVoiceNotificationEngine {
  private audioCtx: AudioContext | null = null;
  private isSpeakingState = false;
  private stateListeners: ((speaking: boolean) => void)[] = [];
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public onStateChange(listener: (speaking: boolean) => void) {
    this.stateListeners.push(listener);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== listener);
    };
  }

  private setSpeaking(val: boolean) {
    this.isSpeakingState = val;
    this.stateListeners.forEach(l => l(val));
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  // Jingle 1: Chime Brilhante e Alegre inspirado no estilo Mercado Livre
  // Três notas ascendentes rápidas com harmônicos cristalinos (C5 -> E5 -> G5 -> C6)
  public playMercadoLivreJingle(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        const now = ctx.currentTime;

        const notes = [
          { freq: 523.25, time: 0.00, dur: 0.14 }, // C5
          { freq: 659.25, time: 0.10, dur: 0.14 }, // E5
          { freq: 783.99, time: 0.20, dur: 0.18 }, // G5
          { freq: 1046.50, time: 0.32, dur: 0.45 }, // C6 (brilho final)
        ];

        notes.forEach(note => {
          const osc = ctx.createOscillator();
          const oscHarmonic = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, now + note.time);

          // Harmônico para timbre moderno e corporativo
          oscHarmonic.type = 'triangle';
          oscHarmonic.frequency.setValueAtTime(note.freq * 2, now + note.time);

          gain.gain.setValueAtTime(0.001, now + note.time);
          gain.gain.linearRampToValueAtTime(0.35, now + note.time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

          osc.connect(gain);
          oscHarmonic.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + note.time);
          oscHarmonic.start(now + note.time);
          osc.stop(now + note.time + note.dur);
          oscHarmonic.stop(now + note.time + note.dur);
        });

        setTimeout(() => resolve(), 600);
      } catch (err) {
        console.warn('Erro ao tocar jingle', err);
        resolve();
      }
    });
  }

  // Jingle 2: Sino de Tatame tradicional (duplo tom marcial)
  public playTatameBell(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscLow = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

        oscLow.type = 'sine';
        oscLow.frequency.setValueAtTime(330, now);
        oscLow.frequency.exponentialRampToValueAtTime(165, now + 0.5);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        oscLow.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        oscLow.start(now);
        osc.stop(now + 0.6);
        oscLow.stop(now + 0.6);

        setTimeout(() => resolve(), 500);
      } catch (err) {
        resolve();
      }
    });
  }

  // Jingle 3: Chime Cristal Pop
  public playBrightChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1174.66, now); // D6
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25); // A6

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);

        setTimeout(() => resolve(), 400);
      } catch (err) {
        resolve();
      }
    });
  }

  // Dispara o jingle configurado
  public async playChime(type: ChimeType = 'mercado_livre'): Promise<void> {
    if (type === 'tatame_bell') {
      await this.playTatameBell();
    } else if (type === 'chime_bright') {
      await this.playBrightChime();
    } else {
      await this.playMercadoLivreJingle();
    }
  }

  // Seleciona a melhor voz em Português do Brasil disponível no dispositivo
  private getPreferredVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    // Procura por vozes pt-BR nativas
    const ptBrVoices = this.voices.filter(v => 
      v.lang.toLowerCase().includes('pt-br') || v.lang.toLowerCase().includes('pt_br')
    );
    if (ptBrVoices.length > 0) {
      // Dá preferência a vozes conhecidas com boa dicção
      const topVoice = ptBrVoices.find(v => 
        v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Daniel') || v.name.includes('Felipe')
      );
      return topVoice || ptBrVoices[0];
    }
    // Qualquer voz em português
    const ptVoice = this.voices.find(v => v.lang.toLowerCase().startsWith('pt'));
    return ptVoice || null;
  }

  // Para qualquer fala em andamento
  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setSpeaking(false);
    }
  }

  // Notificação Completa: Jingle Mercado Livre + Voz Falando o Nome da Academia
  public async announceAcademyMessage(
    academy: RegisteredAcademy,
    title: string,
    body?: string
  ): Promise<void> {
    if (!academy.voiceEnabled) return;

    // 1. Toca o jingle primeiro
    await this.playChime(academy.chimeType);

    // 2. Monta o texto falado
    let textToSpeak = '';
    const academyName = academy.shortName || academy.name;

    switch (academy.notificationFormat) {
      case 'name_only':
        // Estilo icônico direto: "BJJ Academy!"
        textToSpeak = `${academyName}!`;
        break;
      case 'full_message':
        // Anúncio detalhado: "BJJ Academy Jardins: Nova mensagem. Lucas, seu treino começa em 15 minutos!"
        textToSpeak = `${academy.name}: ${title}. ${body || ''}`;
        break;
      case 'name_and_title':
      default:
        // Padrão equilibrado estilo Mercado Livre: "BJJ Academy! Check-in Confirmado!"
        textToSpeak = `${academyName}! ${title}`;
        break;
    }

    // 3. Sintetiza a voz via Web Speech API
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.info('[VoiceNotification] SpeechSynthesis indisponível');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Evita sobreposição

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';

      const voice = this.getPreferredVoice();
      if (voice) {
        utterance.voice = voice;
      }

      // Configuração de tom baseado no estilo
      let pitch = academy.speechPitch || 1.1;
      let rate = academy.speechRate || 1.05;

      if (academy.voiceStyle === 'mercado_livre') {
        pitch = 1.15; // Mais brilhante, simpática e nítida
        rate = 1.08;
      } else if (academy.voiceStyle === 'tatame_master') {
        pitch = 0.85; // Mais grave e firme
        rate = 0.95;
      } else if (academy.voiceStyle === 'energetic') {
        pitch = 1.25;
        rate = 1.18;
      } else if (academy.voiceStyle === 'gentle') {
        pitch = 1.0;
        rate = 0.95;
      }

      utterance.pitch = pitch;
      utterance.rate = rate;

      utterance.onstart = () => {
        this.setSpeaking(true);
      };

      utterance.onend = () => {
        this.setSpeaking(false);
      };

      utterance.onerror = () => {
        this.setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[VoiceNotification] Erro ao sintetizar voz:', err);
      this.setSpeaking(false);
    }
  }
}

export const academyVoiceEngine = new AcademyVoiceNotificationEngine();
