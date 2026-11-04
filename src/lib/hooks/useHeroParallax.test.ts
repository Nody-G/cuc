import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHeroParallax } from './useHeroParallax';

describe('useHeroParallax', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initialise avec un déplacement de 0', () => {
    const { result } = renderHook(() => useHeroParallax());
    expect(result.current).toBe(0);
  });

  it('calcule le déplacement proportionnel au scrollY dans la limite de maxOffset', () => {
    const { result } = renderHook(() => useHeroParallax(0.2, 100));

    // Simule scroll
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    // 200 * 0.2 = 40 <= 100
    expect(result.current).toBe(40);

    // Défilement important dépassant la limite maxOffset
    Object.defineProperty(window, 'scrollY', { value: 800, writable: true });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(100);
  });

  it('neutralise le déplacement si prefers-reduced-motion est activé', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    const { result } = renderHook(() => useHeroParallax(0.2, 100));
    Object.defineProperty(window, 'scrollY', { value: 300, writable: true });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(0);
  });
});
