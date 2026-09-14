import { spring, interpolate } from 'remotion';

export function getEntranceTransform(
  type: string = 'slide-up',
  frame: number,
  fps: number = 30,
  delay: number = 0
) {
  const delayedFrame = Math.max(0, frame - delay);

  const spr = spring({
    frame: delayedFrame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8
    }
  });

  switch (type) {
    case 'slide-up':
      return {
        opacity: interpolate(spr, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(spr, [0, 1], [40, 0])}px)`
      };
    case 'pop':
    case 'scale-in':
      return {
        opacity: interpolate(spr, [0, 1], [0, 1]),
        transform: `scale(${interpolate(spr, [0, 1], [0.8, 1])})`
      };
    case 'bounce':
      return {
        opacity: interpolate(spr, [0, 1], [0, 1]),
        transform: `scale(${interpolate(spr, [0, 0.7, 1], [0.5, 1.08, 1])})`
      };
    case 'fade':
    default:
      return {
        opacity: interpolate(spr, [0, 1], [0, 1]),
        transform: 'none'
      };
  }
}
