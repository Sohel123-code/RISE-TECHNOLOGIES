export const ROTATOR_TIMING = Object.freeze({ enter: 450, exit: 350, stagger: 60, exitStagger: 36, hold: 1600, blur: 8 });
export function rotationPhaseLength(word, phase) {
  const length = Array.from(word).length;
  return phase === 'enter' ? ROTATOR_TIMING.enter + Math.max(0,length-1)*ROTATOR_TIMING.stagger + ROTATOR_TIMING.hold
    : ROTATOR_TIMING.exit + Math.max(0,length-1)*ROTATOR_TIMING.exitStagger;
}
