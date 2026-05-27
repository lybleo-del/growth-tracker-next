'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type NoiseType = 'white' | 'pink' | 'rain' | 'cafe' | 'forest';

interface WhiteNoiseHook {
  isPlaying: boolean;
  currentNoise: NoiseType | null;
  volume: number;
  play: (type: NoiseType) => void;
  stop: () => void;
  setVolume: (volume: number) => void;
}

export function useWhiteNoise(): WhiteNoiseHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoise, setCurrentNoise] = useState<NoiseType | null>(null);
  const [volume, setVolumeState] = useState(0.7);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      nodesRef.current.forEach(node => {
        try {
          node.disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }
      });
      nodesRef.current = [];
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    }
  }, []);

  const createWhiteNoise = useCallback((ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    
    return whiteNoise;
  }, []);

  const createPinkNoise = useCallback((ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }
    
    const pinkNoise = ctx.createBufferSource();
    pinkNoise.buffer = buffer;
    pinkNoise.loop = true;
    
    return pinkNoise;
  }, []);

  const play = useCallback(async (type: NoiseType) => {
    cleanup();
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNodeRef.current = gainNode;
    gainNode.connect(ctx.destination);
    
    let noiseSource: AudioBufferSourceNode;
    let lastNode: AudioNode;
    
    switch (type) {
      case 'white':
        noiseSource = createWhiteNoise(ctx);
        lastNode = noiseSource;
        break;
      case 'pink':
        noiseSource = createPinkNoise(ctx);
        lastNode = noiseSource;
        break;
      case 'rain':
        noiseSource = createWhiteNoise(ctx);
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.value = 1000;
        noiseSource.connect(rainFilter);
        lastNode = rainFilter;
        nodesRef.current.push(rainFilter);
        break;
      case 'cafe':
        noiseSource = createPinkNoise(ctx);
        const cafeFilter = ctx.createBiquadFilter();
        cafeFilter.type = 'bandpass';
        cafeFilter.frequency.value = 800;
        cafeFilter.Q.value = 0.5;
        noiseSource.connect(cafeFilter);
        lastNode = cafeFilter;
        nodesRef.current.push(cafeFilter);
        break;
      case 'forest':
        noiseSource = createPinkNoise(ctx);
        const forestFilter = ctx.createBiquadFilter();
        forestFilter.type = 'highpass';
        forestFilter.frequency.value = 2000;
        noiseSource.connect(forestFilter);
        lastNode = forestFilter;
        nodesRef.current.push(forestFilter);
        break;
      default:
        noiseSource = createWhiteNoise(ctx);
        lastNode = noiseSource;
    }
    
    lastNode.connect(gainNode);
    nodesRef.current.push(noiseSource);
    
    noiseSource.start();
    
    setCurrentNoise(type);
    setIsPlaying(true);
  }, [volume, createWhiteNoise, createPinkNoise, cleanup]);

  const stop = useCallback(() => {
    cleanup();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
    setCurrentNoise(null);
  }, [cleanup]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    currentNoise,
    volume,
    play,
    stop,
    setVolume,
  };
}
