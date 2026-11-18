const clamp=value=>Math.max(0,Math.min(1,value));
export function homeDepthPose(progress,compact=false){
  const remaining=1-clamp(progress);
  return {scale:1-remaining*(compact ? .025 : .085),tilt:compact?0:remaining*5,blur:compact?0:remaining*4,mask:remaining*90};
}
export function homeHeroPose(top,height,compact=false){
  const progress=clamp(-top/Math.max(1,height*.85));
  const exit=progress*progress*(3-2*progress);
  return {opacity:1-exit*.85,scale:1-exit*(compact ? .025 : .07),y:exit*(compact?18:55),artY:exit*(compact?16:65)};
}
