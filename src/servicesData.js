export const SERVICES=[
  {slug:'full-stack',title:'Full-stack development',short:'Development',eyebrow:'FROM INTERFACE TO INFRASTRUCTURE',description:'Websites and applications built around the way you work. We connect thoughtful interfaces with dependable APIs, databases, and deployment.',deliverables:['Web applications','APIs & databases','Deployment & support'],line:'One idea. Every layer connected.'},
  {slug:'data-analytics',title:'Data analytics',short:'Data',eyebrow:'MAKE YOUR DATA MAKE SENSE',description:'Turn scattered information into a clear picture. We help clean, explore, and visualize data through dashboards and reports that answer useful questions.',deliverables:['Data preparation','Interactive dashboards','Reports & insights'],line:'From raw data to a clearer direction.'},
  {slug:'ai-ml',title:'AI & machine learning',short:'AI & ML',eyebrow:'INTELLIGENCE WITH A PURPOSE',description:'Explore what your data can do. We develop AI and machine learning projects, evaluate model behavior, and bring useful capabilities into applications.',deliverables:['Predictive models','Language & vision','Model evaluation'],line:'Build. Train. Evaluate. Improve.'},
  {slug:'ui-ux',title:'UI/UX design',short:'Design',eyebrow:'CLEAR THINKING. INTUITIVE EXPERIENCES.',description:'Give your idea a shape people understand. We map user journeys, explore interfaces, and create prototypes that make the next development step clearer.',deliverables:['User flows','Interface design','Interactive prototypes'],line:'Considered details. Effortless interactions.'},
  {slug:'quality-assurance',title:'Quality assurance',short:'Quality',eyebrow:'CONFIDENCE IN EVERY RELEASE',description:'Find the issues before they reach your users. We check functionality, usability, and compatibility, with clear feedback to help your project improve.',deliverables:['Functional testing','Regression checks','Bug reports & validation'],line:'Check the details. Strengthen the experience.'},
];

const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function servicePose(index,position){
  const local=position-index-1,enter=smooth((local+.65)/.55),exit=smooth((local-.25)/.65);
  return {opacity:enter*(1-exit),y:(1-enter)*80-exit*65,scale:.84+.16*enter+.04*exit,blur:7*(1-enter+exit),reveal:enter};
}
export const servicePosition=(top,height,viewport)=>Math.max(0,Math.min(SERVICES.length+1,-top/Math.max(1,height-viewport)*(SERVICES.length+.25)));
