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
function socialLink(node,label,href){
  if(typeof node==='string')return label;
  const props={...node.props};
  if(node.tag==='a')Object.assign(props,{href,target:'_blank',rel:'noopener noreferrer','aria-label':`${label} (opens in a new tab)`});
  return {...node,key:`${node.key}-${label}`,props,children:node.children.map(child=>socialLink(child,label,href))};
}
function footerLinks(node){
  if(typeof node==='string')return node;
  const props={...node.props};
  if(props.href?.startsWith('#'))props.href=props.href==='#'?'/':`/${props.href}`;
  if(node.props.href==='#services')props.href='/what-we-do';
  const children=node.children.map(footerLinks);
  if(hasClass(node,'framer-1491q3k')){
    const company=children.find(child=>hasClass(child,'framer-fsh42a'));
    const [heading,links]=company.children;
    const social={...company,key:`${company.key}-social`,props:{...company.props,'data-footer-social':''},children:[
      socialLink(heading,'Social media'),
      {...links,key:`${links.key}-social`,children:[
        socialLink(links.children[0],'Instagram','https://www.instagram.com/rise_technologies26/'),
        socialLink(links.children[0],'LinkedIn','https://www.linkedin.com/company/rise-technologies1/')
      ]}
    ]};
    const placeholder=children.findIndex(child=>hasClass(child,'framer-3dm54p'));
    if(placeholder>=0)children.splice(placeholder,1,social);else children.push(social);
  }
  return {...node,props,children};
}
export const homeTemplate=contentOnly(template);
export const headerTemplate=header;
export const footerTemplates=footers.map(node=>footerLinks(node));
