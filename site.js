const fallback=[];
const cfg=window.WILLIS_STORE||{};
const fulfillmentOrigin=(cfg.fulfillmentOrigin||"").replace(/\/$/,"");
let checkoutReady=false;

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}

async function checkFulfillment(){
  if(!fulfillmentOrigin) return false;
  try{
    const r=await fetch(fulfillmentOrigin+"/healthz",{cache:"no-store",mode:"cors"});
    const d=await r.json().catch(()=>({}));
    return r.ok&&d.ok===true;
  }catch{return false}
}

function render(items){
  const grid=document.querySelector("#product-grid");
  grid.innerHTML=items.map(p=>{
    const platforms=Object.entries(p.platforms||{}).map(([n,on])=>`<span class="${on?"":"off"}">${esc(n)}</span>`).join("");
    const details=p.url?`<a class="details" href="${esc(p.url)}">Details</a>`:"";
    let action="";
    if(p.buy_url){
      action=checkoutReady
        ? `<a class="buy" href="${esc(p.buy_url)}" rel="noopener">Buy now — ${esc(p.price)}</a><small class="delivery-note">Secure Stripe checkout · automatic private delivery after payment.</small>`
        : `<button class="buy disabled" disabled>Checkout temporarily unavailable</button><small class="delivery-note">We will not take payment unless secure delivery is online.</small>`;
    }else{
      action=`<span class="coming">Not on sale yet</span>`;
    }
    return `<article class="card"><span class="status">${esc(p.status)}</span><h3>${esc(p.name)}</h3><div class="price">${esc(p.price)}</div><p class="desc">${esc(p.desc)}</p><div class="platforms">${platforms}</div><div class="card-actions">${details}${action}</div></article>`;
  }).join("");
}

(async()=>{
  let items=fallback;
  try{
    const r=await fetch("products.json",{cache:"no-store"});
    if(r.ok) items=await r.json();
  }catch{}
  checkoutReady=await checkFulfillment();
  render(items);
})();

document.querySelector("#year").textContent=new Date().getFullYear();
