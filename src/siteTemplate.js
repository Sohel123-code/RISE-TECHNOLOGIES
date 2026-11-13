import template from './template.json';

const hasClass=(node,name)=>node?.props?.className?.split(' ').includes(name);
let header;
const footers=[];
// Keep the complete ending together: the green artwork/project CTA, followed
// by the navigation footer, including each original responsive variant.
const footerParts=['framer-1gggnc9-container','framer-77fns9-container'];
function collect(nodes){
  for(const node of nodes){
    if(typeof node==='string')continue;
    if(hasClass(node,'framer-kcso7r-container'))header=node;
    if(node.children.some(child=>typeof child==='object'&&footerParts.some(name=>hasClass(child,name))))footers.push(node);
    else collect(node.children);
  }
}
collect(template);
const excluded=new Set([header.key,...footers.map(node=>node.key)]);
function contentOnly(nodes){return nodes.filter(node=>typeof node==='string'||!excluded.has(node.key)).map(node=>typeof node==='string'?node:{...node,children:contentOnly(node.children)});}
function footerLinks(node,teamLabel=false){
  if(typeof node==='string')return teamLabel&&node.trim()==='About us'?'Team':node;
  const props={...node.props};
  const isTeam=props.href==='https://tidy-airport-868077.framer.app/about-us';
  if(props.href?.startsWith('#'))props.href=props.href==='#'?'/':`/${props.href}`;
  if(isTeam)props.href='/team';
  if(node.props.href==='#services')props.href='/what-we-do';
  return {...node,props,children:node.children.map(child=>footerLinks(child,teamLabel||isTeam))};
}
export const homeTemplate=contentOnly(template);
export const headerTemplate=header;
export const footerTemplates=footers.map(node=>footerLinks(node));
