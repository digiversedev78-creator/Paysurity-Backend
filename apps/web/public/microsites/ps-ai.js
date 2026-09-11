/**
 * PaySurity AI Ordering Assistant — Shared Engine v2
 * PILON Launch Protocol: + Unknown intent logging + WAL-V2 loyalty sync
 */
window.PSAi={
  // ─── CAROUSEL ─────────────────────────────────────────────────
  initCarousel(items,containerId,dotsId){
    let idx=0;const track=document.getElementById(containerId);const dots=document.getElementById(dotsId);
    track.innerHTML=items.map(p=>`<div style="min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative"><div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,.06),rgba(212,160,48,.04))"></div><div style="position:relative;text-align:center;z-index:1"><div style="font-size:72px;filter:drop-shadow(0 4px 20px rgba(0,0,0,.3));animation:psFloat 3s ease-in-out infinite">${p.e||p.emoji}</div><div style="font-family:'Cormorant Garamond',serif;font-size:18px;color:#d4a030;margin-top:8px;font-weight:600">${p.n||p.name}</div><div style="font-size:14px;color:rgba(245,240,232,.5);margin-top:2px">$${((p.p||p.price)/100).toFixed(2)}</div></div></div>`).join('');
    dots.innerHTML=items.map((_,i)=>`<div class="ps-dot${i===0?' on':''}" onclick="PSAi.goSlide(${i})" style="width:${i===0?'24px':'8px'};height:8px;border-radius:${i===0?'4px':'50%'};background:${i===0?'#d4a030':'rgba(255,255,255,.2)'};cursor:pointer;transition:all .3s"></div>`).join('');
    setInterval(()=>this.goSlide((idx+1)%items.length),3500);
    this._track=track;this._dots=dots;this._idx=idx;this._len=items.length;
  },
  goSlide(i){
    this._idx=i;this._track.style.transform=`translateX(-${i*100}%)`;
    this._dots.querySelectorAll('.ps-dot').forEach((d,j)=>{d.style.width=j===i?'24px':'8px';d.style.borderRadius=j===i?'4px':'50%';d.style.background=j===i?'#d4a030':'rgba(255,255,255,.2)'});
  },

  // ─── AI WIDGET ────────────────────────────────────────────────
  aiOpen:false,
  toggleAI(){
    this.aiOpen=!this.aiOpen;
    document.getElementById('aiWidget').classList.toggle('open',this.aiOpen);
    if(this.aiOpen&&!document.getElementById('aiMsgs').children.length){
      this.addMsg('bot',this.aiCfg.welcome);
    }
  },
  addMsg(role,text){
    const msgs=document.getElementById('aiMsgs');
    const div=document.createElement('div');div.className=`ai-msg ${role}`;
    const sn=s=>String(s).replace(/[<>"'&]/g,c=>({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','&':'&amp;'}[c]));
    div.innerHTML=`<div class="av">${role==='bot'?'🤖':'👤'}</div><div class="bubble">${sn(text).replace(/\n/g,'<br>')}</div>`;
    msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
  },
  send(preset){
    const input=document.getElementById('aiInput');
    const msg=preset||input.value.trim();
    if(!msg)return;input.value='';
    this.addMsg('user',msg);
    document.getElementById('aiTyping').classList.add('show');
    setTimeout(()=>{document.getElementById('aiTyping').classList.remove('show');const resp=this.process(msg);this.addMsg('bot',resp)},600+Math.random()*600);
  },
  process(msg){
    const m=msg.toLowerCase();const items=this.aiCfg.items;const name=this.aiCfg.name;const addFn=this.aiCfg.addToCart;const openPay=this.aiCfg.openPay;
    let intent='UNKNOWN',response='';
    // Show menu
    if(m.includes('show')||m.includes('menu')||m.includes('what do you have')||m.includes('browse')||m.includes('collection')||m.includes('products')||m.includes('all')){
      intent='BROWSE';
      response=`Here's what we have at ${name}:\n\n`+items.map(p=>`${p.e} ${p.n} — $${(p.p/100).toFixed(2)}\n   ${p.d||p.desc||p.cat||''}`).join('\n\n')+'\n\nSay "add [name]" to order!';
    }
    // Recommend
    else if(m.includes('recommend')||m.includes('suggest')||m.includes('best')||m.includes('popular')||m.includes('favorite')){
      intent='RECOMMEND';
      response=`Our top picks at ${name}:\n\n`+items.slice(0,3).map(p=>`${p.e} ${p.n} — $${(p.p/100).toFixed(2)}`).join('\n')+'\n\nWant me to add any of these?';
    }
    // Price filter
    else if(m.includes('under')||m.includes('below')||m.includes('budget')||m.includes('cheap')){
      intent='PRICE_FILTER';
      const pm=m.match(/\$?(\d+)/);const lim=pm?parseInt(pm[1])*100:2000;
      const f=items.filter(p=>p.p<=lim);
      response=f.length?`Under $${(lim/100).toFixed(0)}:\n\n`+f.map(p=>`${p.e} ${p.n} — $${(p.p/100).toFixed(2)}`).join('\n')+'\n\nSay "add [name]"!':`Nothing under $${(lim/100).toFixed(0)}. Cheapest: ${items.reduce((a,b)=>a.p<b.p?a:b).n} at $${(items.reduce((a,b)=>a.p<b.p?a:b).p/100).toFixed(2)}`;
    }
    // Add
    else if(m.includes('add')||m.includes('want')||m.includes('get me')||m.includes("i'll take")||m.includes('order the')||m.includes('buy')){
      intent='ADD_TO_CART';
      const found=items.find(p=>m.includes(p.n.toLowerCase())||p.n.toLowerCase().split(' ').some(w=>w.length>3&&m.includes(w)));
      if(found){addFn(items.indexOf(found));response=`✅ Added ${found.e} ${found.n} ($${(found.p/100).toFixed(2)})!\n\nCart: ${this.aiCfg.getCart().length} items · $${(this.aiCfg.getCart().reduce((s,i)=>s+i.p,0)/100).toFixed(2)}\n\nMore items or say "checkout"?`}
      else{response=`Couldn't find that. Our menu:\n\n`+items.map(p=>`• ${p.n}`).join('\n')+'\n\nWhich one?'}
    }
    // Cart
    else if(m.includes('cart')||m.includes('summary')||m.includes('what did i')){
      intent='CART_CHECK';
      const c=this.aiCfg.getCart();
      response=!c.length?'Your cart is empty! Ask me for recommendations. 😊':`🛒 Your cart:\n\n`+c.map((it,i)=>`${i+1}. ${it.e} ${it.n} — $${(it.p/100).toFixed(2)}`).join('\n')+`\n\n💰 Total: $${(c.reduce((s,i)=>s+i.p,0)/100).toFixed(2)}\n\nSay "checkout" to pay!`;
    }
    // Checkout
    else if(m.includes('checkout')||m.includes('pay')||m.includes('done')||m.includes('complete')){
      intent='CHECKOUT';
      if(!this.aiCfg.getCart().length)response='Cart is empty! Add items first. 😊';
      else{openPay();response=`💳 Checkout opened! Total: $${(this.aiCfg.getCart().reduce((s,i)=>s+i.p,0)/100).toFixed(2)}\n\nComplete payment in the modal!`}
    }
    // Remove
    else if(m.includes('remove')||m.includes('delete')){
      intent='REMOVE';
      const c=this.aiCfg.getCart();const found=c.find(p=>m.includes(p.n.toLowerCase())||p.n.toLowerCase().split(' ').some(w=>w.length>3&&m.includes(w)));
      if(found){this.aiCfg.removeFromCart(c.indexOf(found));response=`Removed ${found.e} ${found.n}.`}
      else response='Which item to remove?';
    }
    // Greetings
    else if(m.match(/^(hi|hello|hey|yo|sup)/)){intent='GREETING';response=`Hello! 👋 Welcome to ${name}. I can help you browse, order, and pay. What would you like?`}
    else if(m.includes('thank')){intent='THANKS';response=`You're welcome! 😊 Enjoy your experience at ${name}!`}
    else if(m.includes('help')||m.includes('what can you')){intent='HELP';response=`I can:\n🔍 "Show menu"\n🌟 "Recommend something"\n💰 "Under $20"\n🛒 "Add [item]"\n📋 "My cart"\n💳 "Checkout"\n\nJust type naturally!`}
    // UNKNOWN — log to AI feedback
    else{
      intent='UNKNOWN';
      response=`I'm not sure about that, but I've noted your question for the ${name} team! 📝\n\nIn the meantime, I can help with:\n• "Show menu" — see all items\n• "Recommend" — get suggestions\n• "Add [item]" — add to cart\n\nWhat else can I help with?`;
      // LOG TO AI FEEDBACK API
      this._logUnknownIntent(msg, response);
    }
    return response;
  },

  // ─── AI LEARNING LOOP — Log unknown intents ───────────────────
  _logUnknownIntent(message, response){
    const cfg=this.aiCfg;
    const tenantId=cfg.tenantId||'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    fetch('http://localhost:4000/api/v1/ai/feedback',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        tenantId,
        consumerMessage:message,
        aiResponse:response,
        detectedIntent:'UNKNOWN',
        channel:'WEB_WIDGET',
        languageCode:navigator.language?.substring(0,2)||'en'
      })
    }).catch(()=>{});// fire-and-forget
  },

  // ─── WAL-V2 LOYALTY SYNC ──────────────────────────────────────
  async syncLoyaltyBalance(phone, token){
    try{
      const r=await fetch(`http://localhost:4000/api/v1/wallet/assets?phone=${encodeURIComponent(phone)}`,{
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json','X-Trace-Id':`wal-sync-${Date.now()}`}
      });
      const d=await r.json();
      if(d.data&&d.data.length){
        const loyalty=d.data.find(a=>a.assetType==='LOYALTY_POINTS');
        if(loyalty)return{balance:loyalty.balance,name:loyalty.assetName,unit:loyalty.currencyOrUnit};
      }
      return{balance:0,name:'Royal Rewards',unit:'PTS'};
    }catch{return{balance:0,name:'Royal Rewards',unit:'PTS'}}
  }
};
// Inject float keyframe
if(!document.getElementById('psAiStyles')){const s=document.createElement('style');s.id='psAiStyles';s.textContent='@keyframes psFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}';document.head.appendChild(s)}
