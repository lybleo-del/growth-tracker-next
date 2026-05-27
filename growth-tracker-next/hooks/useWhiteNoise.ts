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
  const [volume, setVolumeState] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 清理音频节点
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

  // 生成白噪音
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

  // 生成粉红噪音
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

  // 播放指定类型的噪音
  const play = useCallback((type: NoiseType) => {
    // 清理旧的音频
    cleanup();
    
    // 创建新的 AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;
    
    // 创建增益节点（控制音量）
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNodeRef.current = gainNode;
    gainNode.connect(ctx.destination);
    
    let noiseSource: AudioBufferSourceNode;
    
    // 根据类型创建不同的噪音
    switch (type) {
      case 'white':
        noiseSource = createWhiteNoise(ctx);
        break;
      case 'pink':
        noiseSource = createPinkNoise(ctx);
        break;
      case 'rain':
        // 雨声使用白噪音 + 低频调制
        noiseSource = createWhiteNoise(ctx);
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.value = 1000;
        noiseSource.connect(rainFilter);
        rainFilter.connect(gainNode);
        nodesRef.current.push(rainFilter);
        noiseSource.start();
        setCurrentNoise(type);
        setIsPlaying(true);
        return;
      case 'cafe':
        // 咖啡馆使用粉红噪音 + 中频
        noiseSource = createPinkNoise(ctx);
        const cafeFilter = ctx.createBiquadFilter();
        cafeFilter.type = 'bandpass';
        cafeFilter.frequency.value = 800;
        cafeFilter.Q.value = 0.5;
        noiseSource.connect(cafeFilter);
        cafeFilter.connect(gainNode);
        nodesRef.current.push(cafeFilter);
        noiseSource.start();
        setCurrentNoise(type);
        setIsPlaying(true);
        return;
      case 'forest':
        // 森林使用粉红噪音 + 高频调制
        noiseSource = createPinkNoise(ctx);
        const forestFilter = ctx.createBiquadFilter();
        forestFilter.type = 'highpass';
        forestFilter.frequency.value = 2000;
        noiseSource.connect(forestFilter);
        forestFilter.connect(gainNode);
        nodesRef.current.push(forestFilter);
        noiseSource.start();
        setCurrentNoise(type);
        setIsPlaying(true);
        return;
      default:
        noiseSource = createWhiteNoise(ctx);
    }
    
    noiseSource.connect(gainNode);
    noiseSource.start();
    nodesRef.current.push(noiseSource);
    
    setCurrentNoise(type);
    setIsPlaying(true);
  }, [volume, createWhiteNoise, createPinkNoise, cleanup]);

  // 停止播放
  const stop = useCallback(() => {
    cleanup();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
    setCurrentNoise(null);
  }, [cleanup]);

  // 设置音量
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  }, []);

  // 组件卸载时清理
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
