export const TEAM_MEMBERS = [
  {name:'Mohamed Khaja Eshaq',role:'AI Engineer',slug:'md-khaja-eshaq',position:'50% 32%'},
  {name:'Mamidi Tejeshwar',role:'ML Engineer',slug:'m-tejeshwar',position:'50% 34%'},
  {name:'Maddineni Deepak',role:'QA Engineer',slug:'m-deepak',position:'50% 30%'},
  {name:'Miriyala Sai Kiran',role:'Full Stack Developer',slug:'m-sai-kiran',position:'50% 36%'},
  {name:'Mabbu Trilok',role:'ML Engineer',slug:'m-trilok',position:'50% 30%'},
  {name:'Kottala Jithendra Sesha Sai Ram',nameSuffix:'Sesha Sai Ram',role:'Research and Data Analyst',slug:'k-jithendra',position:'50% 35%'},
];

export const TEAM_SCROLL_END=TEAM_MEMBERS.length+.25;
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
export function teamScrollPosition(top,height,viewportHeight){
  // Continue the final fade while the stage unpins and the footer enters.
  return Math.max(0,Math.min(TEAM_MEMBERS.length+1,-top/Math.max(1,height-viewportHeight)*TEAM_SCROLL_END));
}
export function teamHeroPose(position){
  const exit=smooth(position/.9);
  return {opacity:1-exit,y:-100*exit,scale:1+.12*exit,blur:12*exit};
}
export function teamPortraitPose(index,position){
  const local=position-(index+1);
  const enter=smooth((local+.65)/.55),exit=smooth((local-.25)/.65);
  return {opacity:enter*(1-exit),y:(1-enter)*100-exit*100,z:(1-enter)*-360+exit*100,
    scale:.76+.24*enter+.05*exit,tilt:(1-enter)*9-exit*4,blur:(1-enter)*9+exit*9};
}
export function activeTeamMember(position){
  return position<.65?-1:Math.max(0,Math.min(TEAM_MEMBERS.length-1,Math.floor(position+.4)-1));
}
