// Shared data-only rules for owner layout controls and public rendering.
export const LAYOUT_PREFIX="layout.order.";
export const baseGroups=Object.freeze({
 packages:["snorkeling","island"],
 regions:["west","east","snorkeling"],
 "thumb:west":["west-kelingking","west-broken-beach","west-angels-billabong","west-crystal-bay"],
 "thumb:east":["east-diamond-beach","east-atuh-beach","east-tree-house","east-atuh-beach-second"],
 "thumb:snorkeling":["snorkeling-manta-bay","snorkeling-manta-point","snorkeling-gamat-bay","snorkeling-crystal-bay"],
 "detail:static:west":["west-kelingking","west-broken-beach","west-angels-billabong","west-crystal-bay"],
 "detail:static:east":["east-diamond-beach","east-atuh-beach","east-tree-house"],
 "detail:static:snorkeling":["snorkeling-manta-bay","snorkeling-manta-point","snorkeling-crystal-bay","snorkeling-gamat-bay"],
 "detail:static:island":["island-west","island-east"]
});
export const activityKey=id=>"activity:"+id;
const uuid=/^activity:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export const validGroup=g=>Object.hasOwn(baseGroups,g)||/^detail:activity:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g)&&g.length<=110;
export function validateOrder(group,value){
 if(!validGroup(group))throw Error("Bagian susunan tidak valid");
 const x=typeof value==="string"?JSON.parse(value):value;
 if(!x||!Array.isArray(x.order)||!Array.isArray(x.hidden)||x.order.length>150||x.hidden.length>150)throw Error("Susunan tidak valid");
 const allowed=k=>typeof k==="string"&&((baseGroups[group]||[]).includes(k)||uuid.test(k));
 for(const arr of [x.order,x.hidden])if(arr.some(k=>!allowed(k))||new Set(arr).size!==arr.length)throw Error("Item susunan tidak valid atau duplikat");
 return {order:x.order,hidden:x.hidden};
}
export function readOrder(copy,group){try{return validateOrder(group,copy?.[LAYOUT_PREFIX+group]);}catch{return {order:[],hidden:[]};}}
export function orderedKeys(keys,config){const set=new Set(keys);return [...new Set([...config.order.filter(k=>set.has(k)),...keys])];}
export function moveTo(items,from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=items.length||to>=items.length)return items.slice();const out=items.slice();out.splice(to,0,out.splice(from,1)[0]);return out;}
export function optionalGroup(group){return group==="regions"||group.startsWith("thumb:");}
export function groupItems(group,activities){
 const initial=(baseGroups[group]||[]).map(k=>({key:k,label:k,optional:false}));
 const parent=group.startsWith("thumb:")?"static:"+group.slice(6):group.startsWith("detail:")?group.slice(7):"";
 for(const a of activities){
  if(!a?.id||!a.media_id||String(a.id).length!==36||(a.parent_activity||"")!==parent)continue;
  initial.push({key:activityKey(a.id),label:a.title_id||a.title_en||a.slug,optional:optionalGroup(group)});
 }
 return initial;
}
