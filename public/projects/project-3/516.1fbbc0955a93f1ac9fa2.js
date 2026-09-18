"use strict";(self.webpackChunknovadrive_katalogus=self.webpackChunknovadrive_katalogus||[]).push([[516],{516(e,t,a){a.r(t),a.d(t,{default:()=>Ze});var r=a(445),l=a(540),n=a(767),i=a(437);const s="admin",o="admin",d="novadrive-admin-session",c="novadrive-admin-activity",m="novadrive-app-admin-password",u="novadrive-app-admin-email",p="novadrive-app-smtp-pass",g="novadrive-admin-reset-token",h="info@novadrive.hu",b="info@novadrive.hu",v=6e5;function f(){try{return localStorage.getItem(m)||o}catch{return o}}function k(e){try{localStorage.setItem(m,e)}catch{}}function y(){try{return localStorage.getItem(u)||h}catch{return h}}function z(){return""!==function(){try{return localStorage.getItem(p)||""}catch{return""}}()}function D(){try{sessionStorage.removeItem(d),sessionStorage.removeItem(c)}catch{}}function x(){try{if("1"!==sessionStorage.getItem(d))return!1;const e=sessionStorage.getItem(c),t=e?Number(e):0;return!(!Number.isFinite(t)||t<=0||Date.now()-t>v&&(D(),1))}catch{return!1}}function w(){try{if("1"!==sessionStorage.getItem(d))return 0;const e=sessionStorage.getItem(c),t=e?Number(e):0;return!Number.isFinite(t)||t<=0?0:Math.max(0,v-(Date.now()-t))}catch{return 0}}function Y(e){const t=Math.max(0,Math.floor(e/1e3)),a=Math.floor(t/60),r=t%60;return`${String(a).padStart(2,"0")}:${String(r).padStart(2,"0")}`}function F(){const e=Math.floor(1e5+9e5*Math.random());return String(e)}const A=i.AH`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: radial-gradient(circle at 50% -20%, rgba(26, 77, 109, 0.22), transparent 55%),
    rgba(8, 8, 12, 0.72);
  backdrop-filter: blur(10px);
`,C=i.AH`
  position: relative;
  width: min(440px, 100%);
  padding: clamp(2rem, 5vw, 2.65rem);
  border-radius: 16px;
  background: linear-gradient(165deg, #141416 0%, #0f0f12 58%, #121016 100%);
  border: 1px solid rgba(201, 162, 39, 0.35);
  box-shadow:
    0 48px 100px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
`,H=i.AH`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  width: 88px;
  height: 3px;
  border-radius: 0 0 5px 5px;
  background: linear-gradient(90deg, #b8860b, #1a4d6d, #b8860b);
`,j=i.AH`
  margin: 0.35rem 0 0;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #c9a227;
`,S=i.AH`
  margin: 0.35rem 0 0;
  font-size: clamp(1.85rem, 4vw, 2.35rem);
  font-weight: 300;
  font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  letter-spacing: 0.04em;
  color: #faf7f0;
`,M=i.AH`
  margin: 0.75rem 0 1.5rem;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #a8a29a;

  strong {
    color: #e7e5e1;
    font-weight: 800;
  }
`,U=i.AH`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,L=i.AH`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
`,E=i.AH`
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f9fafb;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;

  &::placeholder {
    color: #6b7280;
    font-weight: 400;
  }
  &:focus {
    outline: none;
    border-color: rgba(201, 162, 39, 0.55);
    box-shadow: 0 0 0 3px rgba(26, 77, 109, 0.2);
  }
`,I=i.AH`
  margin: 0;
  color: #fecaca;
  font-size: 0.87rem;
  font-weight: 600;
`,N=i.AH`
  margin: 0;
  color: #bbf7d0;
  font-size: 0.87rem;
  font-weight: 600;
  line-height: 1.45;
`,K=i.AH`
  margin: 0.75rem 0 0;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.35);
  color: #e8d59a;
  font-size: 0.86rem;
  line-height: 1.45;
`,T=i.AH`
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: rgba(26, 77, 109, 0.28);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #f8fafc;
  font-size: 0.95rem;
  text-align: center;
  letter-spacing: 0.04em;

  strong {
    display: inline-block;
    margin-left: 0.35rem;
    font-size: 1.35rem;
    letter-spacing: 0.2em;
    color: #f0d78c;
  }
`,q=i.AH`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.35rem;
`,$=i.AH`
  flex: 1;
  min-width: 120px;
  padding: 0.88rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #1a4d6d 0%, #0c1220 100%);
  &:hover {
    filter: brightness(1.05);
  }
`,R=i.AH`
  padding: 0.88rem 1.15rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: #d1d5db;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`,O=i.AH`
  margin-top: 0.25rem;
  padding: 0;
  border: none;
  background: none;
  color: #d4af37;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-align: left;
  &:hover {
    color: #f0d78c;
  }
`,B=({onLogin:e,onClose:t,redirectToLogin:a=!1,sessionExpiredMessage:n})=>{const[i,d]=(0,l.useState)("login"),[c,m]=(0,l.useState)(""),[u,p]=(0,l.useState)(""),[h,b]=(0,l.useState)(""),[v,D]=(0,l.useState)(""),[x,w]=(0,l.useState)(""),[Y,B]=(0,l.useState)(""),[V,P]=(0,l.useState)(null),[J,W]=(0,l.useState)(""),[G,_]=(0,l.useState)("");return(0,r.Y)("div",{css:A,role:"presentation",onClick:e=>e.target===e.currentTarget&&t(),children:(0,r.FD)("div",{css:C,role:"dialog","aria-modal":"true","aria-labelledby":"login-title",onClick:e=>e.stopPropagation(),children:[(0,r.Y)("div",{css:H,"aria-hidden":!0}),(0,r.FD)("p",{css:j,children:["login"===i&&"Administrátori belépés","forgot"===i&&"Elfelejtett jelszó","reset"===i&&"Új jelszó beállítása"]}),(0,r.Y)("h2",{id:"login-title",css:S,children:"NovaDrive Motors"}),n?(0,r.Y)("p",{css:K,children:n}):null,"login"===i?(0,r.FD)(r.FK,{children:[(0,r.FD)("p",{css:M,children:["Felhasználónév: ",(0,r.Y)("strong",{children:s}),f()===o?(0,r.FD)(r.FK,{children:[" ","· alap jelszó: ",(0,r.Y)("strong",{children:o})]}):(0,r.Y)(r.FK,{children:" · a jelszót az admin beállításokban módosította"})]}),(0,r.FD)("form",{onSubmit:t=>{t.preventDefault(),W(""),_("");const a=f(),r=u===a;c.trim().toLowerCase()===s&&r?e(!0):W("Hibás felhasználónév vagy jelszó.")},css:U,children:[(0,r.FD)("label",{css:L,children:["Felhasználónév",(0,r.Y)("input",{autoComplete:"username",value:c,onChange:e=>m(e.target.value),placeholder:"admin",css:E,required:!0})]}),(0,r.FD)("label",{css:L,children:["Jelszó",(0,r.Y)("input",{autoComplete:"current-password",type:"password",value:u,onChange:e=>p(e.target.value),placeholder:"••••••••",css:E,required:!0})]}),J&&(0,r.Y)("p",{css:I,children:J}),G&&(0,r.Y)("p",{css:N,children:G}),(0,r.FD)("div",{css:q,children:[(0,r.Y)("button",{type:"submit",css:$,children:"Belépés"}),(0,r.Y)("button",{type:"button",onClick:t,css:R,children:a?"Vissza a főoldalra":"Mégse"})]}),(0,r.Y)("button",{type:"button",css:O,onClick:()=>{d("forgot"),W(""),_(""),P(null)},children:"Elfelejtettem a jelszót"})]})]}):null,"forgot"===i?(0,r.FD)("form",{onSubmit:e=>{e.preventDefault(),W(""),_("");const t=function(e){const t=e.trim().toLowerCase();if(!t)return{ok:!1,error:"Adja meg az e-mail címét."};if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))return{ok:!1,error:"Érvénytelen e-mail cím."};if(t!==y().toLowerCase())return{ok:!1,error:"Ha a megadott e-mail szerepel a rendszerben, elküldtük a kódot. (Demó: a Beállításokban mentett admin e-mailnek kell egyeznie.)"};if(!z())return{ok:!1,error:"Az e-mail küldése sikertelen. Ha adminisztrátor, ellenőrizze az SMTP jelszót a Beállítások oldalon."};const a={code:F(),expiresAt:Date.now()+9e5};try{localStorage.setItem(g,JSON.stringify(a))}catch{return{ok:!1,error:"Nem sikerült a visszaállító kód létrehozása."}}return{ok:!0,code:a.code,email:t}}(h);t.ok?(P(t.code),_("Ha a megadott e-mail szerepel a rendszerben, elküldtük a visszaállító kódot. Demóban a kód alább látszik (15 percig érvényes)."),d("reset")):W(t.error)},css:U,children:[(0,r.Y)("p",{css:M,children:"Adja meg az admin fiókhoz tartozó e-mail címet. Ha egyezik a Beállításokban mentettel, visszaállító kódot küldünk (demóban a képernyőn jelenik meg). SMTP jelszó is szükséges."}),(0,r.FD)("label",{css:L,children:["E-mail cím",(0,r.Y)("input",{type:"email",autoComplete:"email",value:h,onChange:e=>b(e.target.value),placeholder:"pelda@gmail.com",css:E,required:!0})]}),J&&(0,r.Y)("p",{css:I,children:J}),(0,r.FD)("div",{css:q,children:[(0,r.Y)("button",{type:"submit",css:$,children:"Visszaállító kód küldése"}),(0,r.Y)("button",{type:"button",onClick:()=>{d("login"),W("")},css:R,children:"Vissza"})]})]}):null,"reset"===i?(0,r.FD)("form",{onSubmit:e=>{if(e.preventDefault(),W(""),_(""),x!==Y)return void W("A két jelszó nem egyezik.");const t=function(e,t){if(t.length<8)return{ok:!1,error:"A jelszó legalább 8 karakter legyen."};let a=null;try{const e=localStorage.getItem(g);a=e?JSON.parse(e):null}catch{a=null}if(!a?.code||!a.expiresAt)return{ok:!1,error:"Nincs érvényes visszaállító kérés. Kérjen új kódot."};if(Date.now()>a.expiresAt){try{localStorage.removeItem(g)}catch{}return{ok:!1,error:"A visszaállító kód lejárt. Kérjen újat."}}if(String(e).trim()!==a.code)return{ok:!1,error:"Érvénytelen visszaállító kód."};k(t);try{localStorage.removeItem(g)}catch{}return{ok:!0}}(v,x);t.ok?(p(""),D(""),w(""),B(""),P(null),d("login"),_("Jelszó sikeresen visszaállítva. Most beléphet az új jelszóval.")):W(t.error)},css:U,children:[V?(0,r.FD)("p",{css:T,role:"status",children:["Demó visszaállító kód: ",(0,r.Y)("strong",{children:V})]}):null,G&&(0,r.Y)("p",{css:N,children:G}),(0,r.FD)("label",{css:L,children:["Visszaállító kód",(0,r.Y)("input",{value:v,onChange:e=>D(e.target.value),placeholder:"6 számjegy",css:E,required:!0,inputMode:"numeric",autoComplete:"one-time-code"})]}),(0,r.FD)("label",{css:L,children:["Új jelszó",(0,r.Y)("input",{type:"password",value:x,onChange:e=>w(e.target.value),css:E,required:!0,minLength:8,autoComplete:"new-password"})]}),(0,r.FD)("label",{css:L,children:["Új jelszó megerősítése",(0,r.Y)("input",{type:"password",value:Y,onChange:e=>B(e.target.value),css:E,required:!0,minLength:8,autoComplete:"new-password"})]}),J&&(0,r.Y)("p",{css:I,children:J}),(0,r.FD)("div",{css:q,children:[(0,r.Y)("button",{type:"submit",css:$,children:"Jelszó mentése"}),(0,r.Y)("button",{type:"button",onClick:()=>{d("login"),W(""),P(null)},css:R,children:"Vissza a belépéshez"})]})]}):null]})})};var V=a(976);const P=e=>i.AH`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.92rem;
  text-decoration: none;
  border: 1px solid ${e?"var(--nd-accent)":"var(--nd-border)"};
  background: ${e?"var(--nd-accent-soft)":"var(--nd-surface)"};
  color: ${e?"var(--nd-accent-text)":"var(--nd-text)"};
  transition: background 0.2s, border-color 0.2s;
  &:hover {
    border-color: var(--nd-accent);
    color: var(--nd-accent-text);
  }
`,J=({to:e,children:t})=>{const{pathname:a}=(0,n.zy)(),l=a===e||a.endsWith(e)||a.endsWith(`${e}/`);return(0,r.Y)(V.N_,{to:e,css:P(l),children:t})},W=({onLogout:e,sessionCountdown:t})=>(0,r.FD)("div",{css:i.AH`
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(1rem, 4vw, 2rem) clamp(0.6rem, 3.5vw, 1rem);
      width: 100%;
      box-sizing: border-box;
      color: var(--nd-text);
    `,children:[(0,r.FD)("header",{css:i.AH`
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
      `,children:[(0,r.FD)("div",{children:[(0,r.Y)("p",{css:i.AH`
            margin: 0 0 0.35rem;
            font-size: 0.7rem;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            font-weight: 800;
            color: var(--nd-accent);
          `,children:"NovaDrive Motors · demó admin"}),(0,r.Y)("h1",{css:i.AH`
            margin: 0 0 0.35rem;
            font-family: 'Instrument Serif', Georgia, serif;
            font-size: clamp(1.65rem, 4vw, 2.1rem);
            font-weight: 400;
            color: var(--nd-text);
          `,children:"Admin felület"}),(0,r.Y)("p",{css:i.AH`margin:0;color:var(--nd-text-muted);font-size:0.92rem`,children:"Autók és általános beállítások — adatok a böngésző localStorage-jában mentődnek."})]}),(0,r.FD)("div",{css:i.AH`
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.65rem;
        `,children:[t?(0,r.FD)("p",{css:i.AH`
              margin: 0;
              font-variant-numeric: tabular-nums;
              font-size: 0.82rem;
              font-weight: 800;
              letter-spacing: 0.06em;
              color: var(--nd-accent);
              padding: 0.45rem 0.75rem;
              border-radius: 8px;
              border: 1px solid var(--nd-border);
              background: var(--nd-accent-soft);
            `,title:"Hátralévő idő inaktivitás miatti kijelentkezésig",children:["Session ",t]}):null,(0,r.Y)("button",{type:"button",onClick:e,css:i.AH`
            min-height: 44px;
            padding: 0.5rem 1rem;
            background: transparent;
            color: var(--nd-accent-text);
            border: 1px solid var(--nd-border);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            &:hover {
              background: var(--nd-accent-soft);
              border-color: var(--nd-accent);
            }
          `,children:"Kijelentkezés"})]})]}),(0,r.FD)("nav",{css:i.AH`
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-bottom: 1.75rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--nd-border);
      `,"aria-label":"Admin szekciók",children:[(0,r.Y)(J,{to:"/admin/autok",children:"Autók"}),(0,r.Y)(J,{to:"/admin/altalanos",children:"Beállítások"})]}),(0,r.Y)("div",{css:i.AH`
        background: var(--nd-surface);
        padding: clamp(1rem, 4vw, 1.5rem);
        border-radius: 12px;
        border: 1px solid var(--nd-border);
        min-height: 12rem;
        width: 100%;
        overflow-x: auto;
        box-sizing: border-box;
        box-shadow: var(--nd-shadow);
      `,children:(0,r.Y)(n.sv,{})})]});var G=a(430);function _(e){return new Promise((t,a)=>{const r=new FileReader;r.onload=()=>{"string"==typeof r.result?t(r.result):a(new Error("Nem sikerült a fájl olvasása."))},r.onerror=()=>a(r.error??new Error("Olvasási hiba.")),r.readAsDataURL(e)})}var Z=a(150),Q=a(867),X=a(712);const ee=["EURO 1","EURO 2","EURO 3","EURO 4","EURO 5","EURO 5a","EURO 5b","EURO 6","EURO 6a","EURO 6b","EURO 6c","EURO 6d","EURO 6d-TEMP","EURO 6e","EURO 6e-bis","EURO 7"];var te=a(784);let ae=null,re=null;const le=new Map;async function ne(e){const t=(0,te.V)(e),a=await fetch(t);if(!a.ok)throw new Error(`Katalógus betöltési hiba: ${e} (${a.status})`);return await a.json()}async function ie(){return ae||(ae=await ne("/vehicle-catalog/brands.json")),Object.entries(ae).filter(([e])=>"0"!==e).map(([e,t])=>({value:e,label:t.label})).sort((e,t)=>e.label.localeCompare(t.label,"hu"))}async function se(e){return e&&"0"!==e?"5000"===e?[]:(re||(re=await ne("/vehicle-catalog/models.json")),re[e]??[]):[]}async function oe(e,t){if(!e||!t||"0"===e||"5000"===e||"0"===t)return[];let a=le.get(e);if(!a){const t=e.replace(/[^a-zA-Z0-9_-]/g,"")||"0";try{a=await ne(`/vehicle-catalog/types/${t}.json`)}catch{a={}}le.set(e,a)}return a[t]??[]}function de(e,t){const a=t.trim().toLowerCase();if(!a)return"";const r=e.find(e=>e.label.toLowerCase()===a);if(r)return r.value;const l=e.find(e=>e.label.toLowerCase().includes(a)||a.includes(e.label.toLowerCase()));return l?.value??""}const ce=["Benzin","Dízel","Elektromos","Hibrid","LPG"],me=["Manuális","Automatikus"],ue=[{key:"frontLeft",label:"Bal első gumi"},{key:"frontRight",label:"Jobb első gumi"},{key:"rearLeft",label:"Bal hátsó gumi"},{key:"rearRight",label:"Jobb hátsó gumi"}],pe=[{key:"suspension",label:"Futómű"},{key:"brakes",label:"Fékek"},{key:"oilChange",label:"Olajcsere"},{key:"timingService",label:"Vezérlés"},{key:"brakeFluid",label:"Fékolaj"}],ge=[{key:"comfort",label:"Kényelmi felszereltség"},{key:"safety",label:"Biztonsági felszereltség"},{key:"multimedia",label:"Multimédia"},{key:"exterior",label:"Külső felszereltség"},{key:"other",label:"Egyéb extrák"}],he=()=>({marka:"",modell:"",evjarat:(new Date).getFullYear(),ar:0,futottKm:0,uzemanyag:"Benzin",valto:"Manuális",leiras:"",kepUrl:"",imageUrls:[],elkelt:!1,detailedData:(0,X.ax)(),conditionSheet:(0,Q.G)()}),be=i.AH`
  border-bottom: 1px solid rgba(12, 18, 32, 0.08);
  transition:
    background 0.28s ease,
    box-shadow 0.28s ease,
    transform 0.28s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: linear-gradient(
        90deg,
        rgba(212, 175, 55, 0.14) 0%,
        rgba(26, 77, 109, 0.1) 48%,
        rgba(212, 175, 55, 0.06) 100%
      );
      box-shadow:
        inset 3px 0 0 #d4af37,
        0 8px 24px rgba(12, 18, 32, 0.08);
    }
  }
`,ve=i.AH`
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(212, 175, 55, 0.22);
  background: linear-gradient(165deg, #ffffff 0%, #f7f8fb 100%);
  box-shadow: 0 10px 28px rgba(12, 18, 32, 0.06);
  transition:
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    transform 0.28s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: rgba(212, 175, 55, 0.55);
      box-shadow:
        0 14px 32px rgba(12, 18, 32, 0.1),
        inset 0 0 0 1px rgba(212, 175, 55, 0.2);
      transform: translateY(-2px);
    }
  }
`,fe=i.AH`
  padding: 0.65rem 0.75rem;
  font-weight: 600;
`,ke=i.AH`
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
`,ye=i.AH`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #374151;
`,ze=i.AH`
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 0.55rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font: inherit;
`,De=i.AH`
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`,xe=i.AH`
  display: grid;
  gap: 1.25rem;
  padding: 1rem;
  border: 1px solid #dbe1ea;
  border-radius: 12px;
  background: #fff;
`,we=i.AH`
  margin: 0;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9a7b33;
`,Ye=i.AH`
  display: grid;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.9rem;
  background: #f8fafc;
`,Fe=i.AH`
  padding: 0 0.35rem;
  font-weight: 700;
  color: #1a1a2e;
`,Ae=i.AH`
  padding: 0.55rem 1.1rem;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    opacity: 0.95;
  }
`,Ce=i.AH`
  padding: 0.55rem 1.1rem;
  background: #e5e7eb;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`,He=i.AH`
  padding: 0.35rem 0.65rem;
  font-size: 0.82rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`,je=i.AH`
  padding: 0.35rem 0.65rem;
  font-size: 0.82rem;
  background: #fee2e2;
  color: #b91c1c;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`,Se=()=>{const{cars:e,setCars:t}=(0,G.rU)(),[a,n]=(0,l.useState)(null),[s,o]=(0,l.useState)(he()),[d,c]=(0,l.useState)(null),[m,u]=(0,l.useState)([]),[p,g]=(0,l.useState)([]),[h,b]=(0,l.useState)([]),[v,f]=(0,l.useState)(!1),[k,y]=(0,l.useState)(!1),z=s.detailedData.brandId??"",D=s.detailedData.modelId??"",x=s.detailedData.typeId??"",w="5000"===z;(0,l.useEffect)(()=>{let e=!1;return ie().then(t=>{e||u(t)}).catch(()=>{e||c("A járműkatalógus (márkák) nem tölthető be.")}),()=>{e=!0}},[]);const Y=(0,l.useCallback)(async(e,t="",a="")=>{if(!e||"0"===e||"5000"===e)return g([]),b([]),t;f(!0);try{const r=await se(e);return g(r),t&&r.some(e=>e.value===t)?t:a?de(r,a):""}finally{f(!1)}},[]),F=(0,l.useCallback)(async(e,t,a="",r="")=>{if(!e||!t||"5000"===e)return b([]),a;y(!0);try{const l=await oe(e,t);return b(l),a&&l.some(e=>e.value===a)?a:r?de(l,r):""}finally{y(!1)}},[]),A=e=>{const t=(0,X.CV)(e.detailedData,e);n(e.id),o({id:e.id,marka:e.marka,modell:e.modell,evjarat:e.evjarat,ar:e.ar,futottKm:e.futottKm,uzemanyag:e.uzemanyag,valto:e.valto,leiras:e.leiras,kepUrl:e.kepUrl,imageUrls:e.imageUrls?.length?e.imageUrls:[e.kepUrl],elkelt:Boolean(e.elkelt),detailedData:t,conditionSheet:(0,Q.yP)(e.conditionSheet,e)}),c(null),(async()=>{const a=m.length?m:await ie();m.length||u(a);const r=t.brandId||function(e,t){const a=t.trim().toLowerCase();if(!a)return"";const r=e.find(e=>e.label.toLowerCase()===a);return r?.value??""}(a,e.marka),l=a.find(e=>e.value===r)?.label||e.marka,n=await Y(r,t.modelId||"",e.modell),i=r&&"5000"!==r?await se(r):[],s="5000"===r?t.otherModel||e.modell:i.find(e=>e.value===n)?.label||e.modell,d=await F(r,n,t.typeId||"",t.variant||""),c=r&&n?await oe(r,n):[],p=c.find(e=>e.value===d)?.label||t.variant||"";o(e=>({...e,marka:l,modell:s,detailedData:{...e.detailedData,brandId:r,modelId:n,typeId:d,variant:p,otherModel:"5000"===r?s:e.detailedData.otherModel||""}}))})()},C=()=>{n(null),o(he()),g([]),b([])},H=(e,t,a)=>{o(r=>({...r,conditionSheet:{...r.conditionSheet,[e]:{...r.conditionSheet[e],[t]:a}}}))},j=(e,t,a)=>{o(r=>({...r,conditionSheet:{...r.conditionSheet,tires:{...r.conditionSheet.tires,[e]:{...r.conditionSheet.tires[e],[t]:a}}}}))},S=(e,t)=>{o(a=>({...a,detailedData:{...a.detailedData,[e]:t}}))},M=e=>{window.confirm("Biztosan törli ezt az autót?")&&(t(t=>t.filter(t=>t.id!==e)),a===e&&C(),c("Autó törölve."))},U=e=>{t(t=>t.map(t=>t.id===e?{...t,elkelt:!t.elkelt}:t)),c("Állapot (eladó / elkelt) frissítve.")};return(0,r.FD)("div",{children:[(0,r.FD)("div",{css:i.AH`display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem`,children:[(0,r.Y)("h2",{css:i.AH`margin:0;font-size:1.35rem;color:#1a1a2e`,children:"Autók kezelése"}),(0,r.Y)("button",{type:"button",onClick:()=>{n("new"),o(he()),g([]),b([]),c(null)},css:Ae,children:"+ Új autó"})]}),d&&(0,r.Y)("p",{role:"status",css:i.AH`margin:0 0 1rem;padding:0.65rem 1rem;background:#ecfdf5;border-radius:8px;color:#065f46;font-size:0.9rem`,children:d}),("new"===a||a&&"new"!==a)&&(0,r.FD)("form",{onSubmit:e=>{if(e.preventDefault(),s.marka.trim()&&s.modell.trim())if(z)if(w||D){if("new"===a){const e="undefined"!=typeof crypto&&crypto.randomUUID?crypto.randomUUID():`car-${Date.now()}`,a=(s.imageUrls??[]).map(e=>e.trim()).filter(Boolean),r=a[0]||s.kepUrl.trim()||Z.ZA,l={id:e,marka:s.marka.trim(),modell:s.modell.trim(),uzemanyag:s.uzemanyag,valto:s.valto},n=(0,Q.yP)(s.conditionSheet,l),i=(0,X.CV)(s.detailedData,l);t(t=>[...t,{id:e,marka:s.marka.trim(),modell:s.modell.trim(),evjarat:Number(s.evjarat),ar:Number(s.ar),futottKm:Number(s.futottKm),uzemanyag:s.uzemanyag,valto:s.valto,leiras:s.leiras.trim(),kepUrl:r,imageUrls:a.length?a:[r],elkelt:Boolean(s.elkelt),detailedData:i,conditionSheet:n}]),c("Autó hozzáadva.")}else if(a){const e=(s.imageUrls??[]).map(e=>e.trim()).filter(Boolean);t(t=>t.map(t=>t.id===a?{...t,marka:s.marka.trim(),modell:s.modell.trim(),evjarat:Number(s.evjarat),ar:Number(s.ar),futottKm:Number(s.futottKm),uzemanyag:s.uzemanyag,valto:s.valto,leiras:s.leiras.trim(),kepUrl:e[0]||s.kepUrl||t.kepUrl,imageUrls:e.length?e:[s.kepUrl||t.kepUrl],elkelt:Boolean(s.elkelt),detailedData:(0,X.CV)(s.detailedData,{id:t.id,marka:s.marka.trim(),modell:s.modell.trim(),uzemanyag:s.uzemanyag,valto:s.valto}),conditionSheet:(0,Q.yP)(s.conditionSheet,{id:t.id,marka:s.marka.trim(),modell:s.modell.trim(),uzemanyag:s.uzemanyag,valto:s.valto})}:t)),c("Autó mentve.")}C()}else c("Válasszon modellt a listából.");else c("Válasszon gyártmányt a listából.");else c("A gyártmány és a modell kötelező.")},css:i.AH`
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: clamp(1rem, 4vw, 1.25rem);
            margin-bottom: 2rem;
            display: grid;
            gap: 1rem;
            min-width: 0;
          `,children:[(0,r.Y)("h3",{css:i.AH`margin:0;font-size:1.1rem`,children:"new"===a?"Új autó":"Autó szerkesztése"}),(0,r.FD)("div",{css:De,children:[(0,r.FD)("label",{css:ye,children:["Gyártmány *",(0,r.FD)("select",{value:z,onChange:e=>{(async e=>{const t=m.find(t=>t.value===e)?.label||"";b([]),await Y(e),o(a=>({...a,marka:t,modell:"",detailedData:{...a.detailedData,brandId:e,modelId:"",typeId:"",variant:"",otherModel:"",otherType:"",title:t?`${t}`:a.detailedData.title}}))})(e.target.value)},required:!0,css:ze,children:[(0,r.Y)("option",{value:"",children:"— Válasszon —"}),m.map(e=>(0,r.Y)("option",{value:e.value,children:e.label},e.value))]})]}),w?(0,r.FD)("label",{css:ye,children:["Egyéb modell *",(0,r.Y)("input",{value:s.detailedData.otherModel||s.modell,onChange:e=>o(t=>({...t,modell:e.target.value,detailedData:{...t.detailedData,otherModel:e.target.value,modelId:"",typeId:"",variant:""}})),required:!0,css:ze,placeholder:"Modell megnevezése"})]}):(0,r.FD)("label",{css:ye,children:["Modell *",v?" (betöltés…)":"",(0,r.FD)("select",{value:D,onChange:e=>{(async e=>{const t=p.find(t=>t.value===e)?.label||"",a=await F(z,e);o(r=>({...r,modell:t,detailedData:{...r.detailedData,modelId:e,typeId:a,variant:"",otherModel:"",title:[r.marka,t].filter(Boolean).join(" ")}}))})(e.target.value)},required:!0,disabled:!z||v,css:ze,children:[(0,r.Y)("option",{value:"",children:"— Válasszon —"}),p.map(e=>(0,r.Y)("option",{value:e.value,children:e.label},e.value))]})]}),w?(0,r.FD)("label",{css:ye,children:["Egyéb típus",(0,r.Y)("input",{value:s.detailedData.otherType||s.detailedData.variant||"",onChange:e=>o(t=>({...t,detailedData:{...t.detailedData,otherType:e.target.value,variant:e.target.value,typeId:"",title:[t.marka,t.modell,e.target.value].filter(Boolean).join(" ")}})),css:ze,placeholder:"Típus / kivitel (opcionális)"})]}):(0,r.FD)("label",{css:i.AH`${ye};grid-column:1/-1`,children:["Típus",k?" (betöltés…)":"",(0,r.FD)("select",{value:x,onChange:e=>(e=>{const t=h.find(t=>t.value===e)?.label||"";o(a=>({...a,detailedData:{...a.detailedData,typeId:e,variant:t,title:t||[a.marka,a.modell].filter(Boolean).join(" ")}}))})(e.target.value),disabled:!D||k,css:ze,children:[(0,r.Y)("option",{value:"",children:"— Válasszon (opcionális) —"}),h.map(e=>(0,r.Y)("option",{value:e.value,children:e.label},e.value))]})]}),(0,r.FD)("label",{css:ye,children:["Évjárat",(0,r.Y)("input",{type:"number",min:1990,max:2035,value:s.evjarat,onChange:e=>o(t=>({...t,evjarat:Number(e.target.value)})),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Ár (Ft)",(0,r.Y)("input",{type:"number",min:0,step:1e3,value:s.ar||"",onChange:e=>o(t=>({...t,ar:Number(e.target.value)})),required:!0,css:ze})]}),(0,r.FD)("label",{css:ye,children:["Futott km",(0,r.Y)("input",{type:"number",min:0,value:s.futottKm||"",onChange:e=>o(t=>({...t,futottKm:Number(e.target.value)})),required:!0,css:ze})]}),(0,r.FD)("label",{css:ye,children:["Üzemanyag",(0,r.Y)("select",{value:s.uzemanyag,onChange:e=>o(t=>({...t,uzemanyag:e.target.value})),css:ze,children:ce.map(e=>(0,r.Y)("option",{value:e,children:e},e))})]}),(0,r.FD)("label",{css:ye,children:["Váltó",(0,r.Y)("select",{value:s.valto,onChange:e=>o(t=>({...t,valto:e.target.value})),css:ze,children:me.map(e=>(0,r.Y)("option",{value:e,children:e},e))})]})]}),(0,r.FD)("label",{css:i.AH`
              ${ye};
              flex-direction: row;
              align-items: center;
              gap: 0.65rem;
            `,children:[(0,r.Y)("input",{type:"checkbox",checked:Boolean(s.elkelt),onChange:e=>o(t=>({...t,elkelt:e.target.checked})),css:i.AH`width:1.1rem;height:1.1rem;accent-color:#b91c1c`}),(0,r.Y)("span",{children:"Elkelt (rejtés a nyilvános kínálatból)"})]}),(0,r.FD)("label",{css:ye,children:["Leírás",(0,r.Y)("textarea",{rows:4,value:s.leiras,onChange:e=>o(t=>({...t,leiras:e.target.value})),css:i.AH`${ze};resize:vertical;min-height:88px`})]}),(0,r.FD)("section",{css:xe,children:[(0,r.FD)("div",{children:[(0,r.Y)("h4",{css:i.AH`margin:0 0 0.35rem;font-size:1rem;color:#1a1a2e`,children:"Részletes járműadatok"}),(0,r.Y)("p",{css:i.AH`margin:0;color:#6b7280;font-size:0.84rem`,children:"Használt autós adatlaphoz szükséges műszaki, okmány és felszereltségi információk."})]}),(0,r.FD)("div",{css:De,children:[(0,r.FD)("label",{css:ye,children:["Részletes megnevezés",(0,r.Y)("input",{value:s.detailedData.title,onChange:e=>S("title",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Kivitel",(0,r.Y)("input",{value:s.detailedData.bodyType,onChange:e=>S("bodyType",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Állapot",(0,r.Y)("input",{value:s.detailedData.condition,onChange:e=>S("condition",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Származás",(0,r.Y)("input",{value:s.detailedData.origin,onChange:e=>S("origin",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Szín",(0,r.Y)("input",{value:s.detailedData.color,onChange:e=>S("color",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Első forgalomba helyezés",(0,r.Y)("input",{value:s.detailedData.firstRegistration,onChange:e=>S("firstRegistration",e.target.value),css:ze,placeholder:"pl. 2021/09"})]}),(0,r.FD)("label",{css:ye,children:["Műszaki érvényes",(0,r.Y)("input",{value:s.detailedData.inspectionValidUntil,onChange:e=>S("inspectionValidUntil",e.target.value),css:ze,placeholder:"pl. 2027/09"})]}),(0,r.FD)("label",{css:ye,children:["Okmányok",(0,r.Y)("input",{value:s.detailedData.documents,onChange:e=>S("documents",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Szervizkönyv / előélet",(0,r.Y)("input",{value:s.detailedData.serviceBook,onChange:e=>S("serviceBook",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Kulcsok",(0,r.Y)("input",{value:s.detailedData.numberOfKeys,onChange:e=>S("numberOfKeys",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Ajtók száma",(0,r.Y)("input",{type:"number",min:2,max:5,value:s.detailedData.doors,onChange:e=>S("doors",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Szállítható személyek",(0,r.Y)("input",{type:"number",min:2,max:9,value:s.detailedData.seats,onChange:e=>S("seats",Number(e.target.value)),css:ze})]})]}),(0,r.FD)("div",{css:De,children:[(0,r.FD)("label",{css:ye,children:["Hengerűrtartalom (cm³)",(0,r.Y)("input",{type:"number",min:0,value:s.detailedData.engineDisplacementCcm,onChange:e=>S("engineDisplacementCcm",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Teljesítmény (kW)",(0,r.Y)("input",{type:"number",min:0,value:s.detailedData.powerKw,onChange:e=>S("powerKw",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Teljesítmény (LE)",(0,r.Y)("input",{type:"number",min:0,value:s.detailedData.powerHp,onChange:e=>S("powerHp",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Nyomaték (Nm)",(0,r.Y)("input",{type:"number",min:0,value:s.detailedData.torqueNm,onChange:e=>S("torqueNm",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Hajtás",(0,r.Y)("input",{value:s.detailedData.drivetrain,onChange:e=>S("drivetrain",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Hengerek száma",(0,r.Y)("input",{type:"number",min:0,value:s.detailedData.cylinders,onChange:e=>S("cylinders",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Emissziós norma",(0,r.Y)("input",{value:s.detailedData.emissionClass,onChange:e=>S("emissionClass",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Környezetvédelmi osztály",(0,r.FD)("select",{value:s.detailedData.environmentalClass,onChange:e=>S("environmentalClass",e.target.value),css:ze,children:[(0,r.Y)("option",{value:"",children:"— Nincs megadva —"}),ee.map(e=>(0,r.Y)("option",{value:e,children:e},e)),s.detailedData.environmentalClass&&!ee.includes(s.detailedData.environmentalClass)?(0,r.Y)("option",{value:s.detailedData.environmentalClass,children:s.detailedData.environmentalClass}):null]})]}),(0,r.FD)("label",{css:ye,children:["Vegyes fogyasztás",(0,r.Y)("input",{value:s.detailedData.combinedConsumption,onChange:e=>S("combinedConsumption",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Városi fogyasztás",(0,r.Y)("input",{value:s.detailedData.cityConsumption,onChange:e=>S("cityConsumption",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Országúti fogyasztás",(0,r.Y)("input",{value:s.detailedData.highwayConsumption,onChange:e=>S("highwayConsumption",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Csomagtartó (liter)",(0,r.Y)("input",{type:"number",min:0,value:s.detailedData.trunkCapacityLiter,onChange:e=>S("trunkCapacityLiter",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Saját tömeg (kg)",(0,r.Y)("input",{type:"number",min:0,value:s.detailedData.ownWeightKg,onChange:e=>S("ownWeightKg",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Össztömeg (kg)",(0,r.Y)("input",{type:"number",min:0,value:s.detailedData.totalWeightKg,onChange:e=>S("totalWeightKg",Number(e.target.value)),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Klíma",(0,r.Y)("input",{value:s.detailedData.climate,onChange:e=>S("climate",e.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Kárpit",(0,r.Y)("input",{value:s.detailedData.upholstery,onChange:e=>S("upholstery",e.target.value),css:ze})]})]}),(0,r.Y)("div",{css:De,children:ge.map(e=>(0,r.FD)("label",{css:ye,children:[e.label," (soronként egy)",(0,r.Y)("textarea",{rows:5,value:s.detailedData.equipment[e.key].join("\n"),onChange:t=>((e,t)=>{const a=t.split("\n").map(e=>e.trim()).filter(Boolean);o(t=>({...t,detailedData:{...t.detailedData,equipment:{...t.detailedData.equipment,[e]:a}}}))})(e.key,t.target.value),css:i.AH`${ze};resize:vertical;min-height:120px`})]},e.key))})]}),(0,r.FD)("section",{css:xe,children:[(0,r.FD)("div",{children:[(0,r.Y)("h4",{css:i.AH`margin:0 0 0.35rem;font-size:1rem;color:#1a1a2e`,children:"Részletes állapotlap"}),(0,r.Y)("p",{css:i.AH`margin:0;color:#6b7280;font-size:0.84rem`,children:"Ezek az adatok az autó publikus adatlapján jelennek meg."})]}),(0,r.FD)("div",{css:i.AH`display:grid;gap:1rem`,children:[(0,r.Y)("h5",{css:we,children:"Gumik"}),(0,r.Y)("div",{css:De,children:ue.map(e=>{const t=s.conditionSheet.tires[e.key];return(0,r.FD)("fieldset",{css:Ye,children:[(0,r.Y)("legend",{css:Fe,children:e.label}),(0,r.FD)("label",{css:ye,children:["Állapot",(0,r.Y)("select",{value:t.status,onChange:t=>j(e.key,"status",t.target.value),css:ze,children:Q.t8.map(e=>(0,r.Y)("option",{value:e,children:e},e))})]}),(0,r.FD)("label",{css:ye,children:["Profimélység (mm)",(0,r.Y)("input",{value:t.treadDepthMm,onChange:t=>j(e.key,"treadDepthMm",t.target.value),css:ze,placeholder:"pl. 6,5"})]}),(0,r.FD)("label",{css:ye,children:["DOT szám",(0,r.Y)("input",{value:t.dotNumber,onChange:t=>j(e.key,"dotNumber",t.target.value),css:ze,placeholder:"pl. DOT1125"})]}),(0,r.FD)("label",{css:ye,children:["Utolsó csere / ellenőrzés",(0,r.Y)("input",{type:"date",value:t.lastChanged,onChange:t=>j(e.key,"lastChanged",t.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Megjegyzés",(0,r.Y)("input",{value:t.note,onChange:t=>j(e.key,"note",t.target.value),css:ze,placeholder:"pl. nyári szett"})]})]},e.key)})})]}),(0,r.FD)("div",{css:i.AH`display:grid;gap:1rem`,children:[(0,r.Y)("h5",{css:we,children:"Szerviz és műszaki állapot"}),(0,r.Y)("div",{css:De,children:pe.map(e=>{const t=s.conditionSheet[e.key];return(0,r.FD)("fieldset",{css:Ye,children:[(0,r.Y)("legend",{css:Fe,children:e.label}),(0,r.FD)("label",{css:ye,children:["Állapot",(0,r.Y)("select",{value:t.status,onChange:t=>H(e.key,"status",t.target.value),css:ze,children:Q.t8.map(e=>(0,r.Y)("option",{value:e,children:e},e))})]}),(0,r.FD)("label",{css:ye,children:["Utolsó csere / ellenőrzés",(0,r.Y)("input",{type:"date",value:t.lastChanged,onChange:t=>H(e.key,"lastChanged",t.target.value),css:ze})]}),(0,r.FD)("label",{css:ye,children:["Megjegyzés",(0,r.Y)("input",{value:t.note,onChange:t=>H(e.key,"note",t.target.value),css:ze,placeholder:"Részletek, ha releváns"})]})]},e.key)})})]})]}),(0,r.FD)("label",{css:ye,children:["Képek (több feltöltése is lehetséges)",(0,r.Y)("input",{type:"file",accept:"image/*",multiple:!0,onChange:async e=>{const t=Array.from(e.target.files??[]).filter(e=>e.type.startsWith("image/"));if(t.length){try{const e=await Promise.all(t.map(e=>_(e)));o(t=>{const a=[...t.imageUrls??[],...e];return{...t,imageUrls:a,kepUrl:a[0]??t.kepUrl}}),c(`${e.length} kép beolvasva.`)}catch{c("A kép feltöltése sikertelen.")}e.target.value=""}},css:i.AH`margin-top:0.35rem`}),(s.imageUrls??[]).length>0&&(0,r.Y)("div",{css:i.AH`display:grid;gap:0.6rem;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));margin-top:0.65rem`,children:(s.imageUrls??[]).map((e,t)=>(0,r.FD)("div",{css:i.AH`display:grid;gap:0.4rem`,children:[(0,r.Y)("img",{src:e,alt:"",css:i.AH`width:100%;height:98px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb`}),(0,r.Y)("button",{type:"button",onClick:()=>(e=>{o(t=>{const a=(t.imageUrls??[]).filter((t,a)=>a!==e);return{...t,imageUrls:a,kepUrl:a[0]??""}})})(t),css:i.AH`padding:0.35rem 0.5rem;border:none;border-radius:6px;background:#fee2e2;color:#b91c1c;font-weight:700;cursor:pointer`,children:"Kép törlése"})]},`${e}-${t}`))})]}),(0,r.FD)("div",{css:i.AH`display:flex;gap:0.75rem;flex-wrap:wrap`,children:[(0,r.Y)("button",{type:"submit",css:Ae,children:"Mentés"}),(0,r.Y)("button",{type:"button",onClick:C,css:Ce,children:"Mégse"})]})]}),(0,r.FD)("div",{css:i.AH`
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 0 -0.15rem;
          padding: 0 0.15rem;
        `,children:[(0,r.FD)("table",{css:i.AH`
            width: 100%;
            min-width: 720px;
            border-collapse: collapse;
            font-size: 0.9rem;
            @media (max-width: 720px) {
              display: none;
            }
          `,children:[(0,r.Y)("thead",{children:(0,r.FD)("tr",{css:i.AH`
                background: linear-gradient(135deg, #0c1220 0%, #1a4d6d 100%);
                color: #fff;
                text-align: left;
              `,children:[(0,r.Y)("th",{css:fe,children:"Kép"}),(0,r.Y)("th",{css:fe,children:"Márka / modell"}),(0,r.Y)("th",{css:fe,children:"Évjárat"}),(0,r.Y)("th",{css:fe,children:"Ár (Ft)"}),(0,r.Y)("th",{css:fe,children:"km"}),(0,r.Y)("th",{css:fe,children:"Állapot"}),(0,r.Y)("th",{css:fe,children:"Művelet"})]})}),(0,r.Y)("tbody",{children:e.map(e=>(0,r.FD)("tr",{css:be,children:[(0,r.Y)("td",{css:ke,children:(0,r.Y)("img",{src:e.kepUrl,alt:"",css:i.AH`
                      width: 64px;
                      height: 48px;
                      object-fit: cover;
                      border-radius: 6px;
                      box-shadow: 0 4px 12px rgba(12, 18, 32, 0.18);
                    `})}),(0,r.FD)("td",{css:ke,children:[e.marka," ",e.modell]}),(0,r.Y)("td",{css:ke,children:e.evjarat}),(0,r.Y)("td",{css:ke,children:e.ar.toLocaleString("hu-HU")}),(0,r.Y)("td",{css:ke,children:e.futottKm.toLocaleString("hu-HU")}),(0,r.Y)("td",{css:ke,children:(0,r.Y)("span",{css:i.AH`font-weight:800;color:${e.elkelt?"#b45309":"#047857"}`,children:e.elkelt?"Elkelt":"Eladó"})}),(0,r.Y)("td",{css:ke,children:(0,r.FD)("div",{css:i.AH`
                      display: flex;
                      flex-wrap: wrap;
                      gap: 0.35rem;
                      max-width: 16rem;
                    `,children:[(0,r.Y)("button",{type:"button",onClick:()=>U(e.id),css:He,children:e.elkelt?"Vissza eladónak":"Elkelt"}),(0,r.Y)("button",{type:"button",onClick:()=>A(e),css:He,children:"Szerkesztés"}),(0,r.Y)("button",{type:"button",onClick:()=>M(e.id),css:je,children:"Törlés"})]})})]},e.id))})]}),(0,r.Y)("div",{css:i.AH`
            display: none;
            @media (max-width: 720px) {
              display: flex;
              flex-direction: column;
              gap: 0.85rem;
            }
          `,children:e.map(e=>(0,r.FD)("article",{css:ve,children:[(0,r.FD)("div",{css:i.AH`
                  display: flex;
                  gap: 0.85rem;
                  align-items: flex-start;
                `,children:[(0,r.Y)("img",{src:e.kepUrl,alt:"",css:i.AH`
                    width: 88px;
                    height: 66px;
                    object-fit: cover;
                    border-radius: 8px;
                    flex-shrink: 0;
                  `}),(0,r.FD)("div",{css:i.AH`min-width:0;flex:1`,children:[(0,r.FD)("h3",{css:i.AH`
                      margin: 0 0 0.25rem;
                      font-size: 1.05rem;
                      color: #0c1220;
                    `,children:[e.marka," ",e.modell]}),(0,r.FD)("p",{css:i.AH`margin:0;font-size:0.88rem;color:#4b5563;line-height:1.5`,children:[e.evjarat," · ",e.futottKm.toLocaleString("hu-HU")," km ·"," ",(0,r.FD)("strong",{children:[e.ar.toLocaleString("hu-HU")," Ft"]})]}),(0,r.Y)("span",{css:i.AH`
                      display: inline-block;
                      margin-top: 0.35rem;
                      font-size: 0.78rem;
                      font-weight: 800;
                      letter-spacing: 0.04em;
                      text-transform: uppercase;
                      color: ${e.elkelt?"#b45309":"#047857"};
                    `,children:e.elkelt?"Elkelt":"Eladó"})]})]}),(0,r.FD)("div",{css:i.AH`
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0.45rem;
                  margin-top: 0.85rem;
                `,children:[(0,r.Y)("button",{type:"button",onClick:()=>U(e.id),css:He,children:e.elkelt?"Vissza eladónak":"Elkelt"}),(0,r.Y)("button",{type:"button",onClick:()=>A(e),css:He,children:"Szerkesztés"}),(0,r.Y)("button",{type:"button",onClick:()=>M(e.id),css:je,children:"Törlés"})]})]},e.id))}),0===e.length&&(0,r.Y)("p",{css:i.AH`color:#666;padding:1rem`,children:"Még nincs autó – adjon hozzá újat."})]})]})},Me=i.AH`
  display: grid;
  gap: 1.25rem;
`,Ue=i.AH`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`,Le=i.AH`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  & > section {
    width: 100%;
    max-width: calc((100% - 1.25rem) / 2);
  }
  @media (max-width: 900px) {
    & > section {
      max-width: none;
    }
  }
`,Ee=i.AH`
  background: var(--nd-surface);
  border: 1px solid var(--nd-border);
  border-radius: 16px;
  padding: clamp(1rem, 3vw, 1.35rem);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
`,Ie=i.AH`
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--nd-text);
`,Ne=i.AH`
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--nd-text);
`,Ke=i.AH`
  margin: 0 0 1rem;
  color: var(--nd-text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
`,Te=i.AH`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem 1rem;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`,qe=i.AH`
  display: grid;
  gap: 0.85rem;
`,$e=i.AH`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--nd-text);
`,Re=i.AH`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--nd-text-muted);
`,Oe=i.AH`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--nd-border);
  border-radius: 10px;
  font: inherit;
  font-weight: 500;
  background: var(--nd-bg, #fff);
  color: var(--nd-text);
  &:focus {
    outline: none;
    border-color: var(--nd-accent);
    box-shadow: 0 0 0 3px var(--nd-accent-soft);
  }
`,Be=i.AH`
  grid-column: 1 / -1;
  margin-top: 0.35rem;
`,Ve=i.AH`
  justify-self: start;
  padding: 0.7rem 1.15rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #1a4d6d 0%, #0c1220 100%);
  &:hover {
    filter: brightness(1.05);
  }
`,Pe=i.AH`
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
  font-size: 0.92rem;
`,Je=i.AH`
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 600;
  font-size: 0.92rem;
`,We=i.AH`
  color: #166534;
  font-weight: 700;
`,Ge=i.AH`
  color: #b91c1c;
  font-weight: 700;
`,_e=()=>{const{site:e,replaceSite:t}=(0,G.rU)(),[a,n]=(0,l.useState)(e),[o,d]=(0,l.useState)(y),[c,m]=(0,l.useState)(""),[g,h]=(0,l.useState)(!1),[v,D]=(0,l.useState)(z),[x,w]=(0,l.useState)(""),[Y,F]=(0,l.useState)(""),[A,C]=(0,l.useState)(""),[H,j]=(0,l.useState)(null),[S,M]=(0,l.useState)(null);l.useEffect(()=>{n(e)},[e]);const U=(e,t=null)=>{j(e),M(t)};return(0,r.FD)("div",{css:Me,children:[(H||S)&&(0,r.Y)("p",{role:"status",css:S?Je:Pe,children:S||H}),(0,r.FD)("section",{css:Ee,children:[(0,r.Y)("h2",{css:Ie,children:"Elérhetőség és nyitvatartás"}),(0,r.Y)("p",{css:Ke,children:"Ezek az adatok a weboldal fejlécében, kapcsolat oldalán és láblécében jelennek meg."}),(0,r.FD)("form",{onSubmit:e=>{e.preventDefault();const r=a.phoneTel.replace(/[^\d+]/g,"").trim(),l=a.phoneDisplay.trim(),n=a.openingHoursShort.trim(),i=a.openingHoursLong.trim(),s=a.contactEmail.trim();if(!r)return void U(null,"A telefon (híváshoz) megadása kötelező.");if(!l)return void U(null,"A megjelenő telefonszám megadása kötelező.");if(!n)return void U(null,"A rövid nyitvatartás megadása kötelező.");if(!i)return void U(null,"A részletes nyitvatartás megadása kötelező.");if(s&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))return void U(null,"Érvénytelen e-mail cím.");const o={...a,phoneTel:r,phoneDisplay:l,openingHoursShort:n,openingHoursLong:i,contactEmail:s,contactMapLatitude:"number"==typeof a.contactMapLatitude&&Number.isFinite(a.contactMapLatitude)?a.contactMapLatitude:null,contactMapLongitude:"number"==typeof a.contactMapLongitude&&Number.isFinite(a.contactMapLongitude)?a.contactMapLongitude:null};t(o),U("Az elérhetőségi adatok sikeresen mentve.")},css:Te,children:[(0,r.FD)("label",{css:$e,children:["Telefon (híváshoz, pl. +36201234567)",(0,r.Y)("input",{value:a.phoneTel,onChange:e=>n(t=>({...t,phoneTel:e.target.value})),css:Oe,required:!0})]}),(0,r.FD)("label",{css:$e,children:["Megjelenő telefonszám (pl. +36 20 123 4567)",(0,r.Y)("input",{value:a.phoneDisplay,onChange:e=>n(t=>({...t,phoneDisplay:e.target.value})),css:Oe,required:!0})]}),(0,r.FD)("label",{css:i.AH`${$e};grid-column:1/-1`,children:["E-mail cím (kapcsolat oldal, pl. ",b,")",(0,r.Y)("input",{type:"email",value:a.contactEmail,onChange:e=>n(t=>({...t,contactEmail:e.target.value})),css:Oe,placeholder:b})]}),(0,r.FD)("label",{css:i.AH`${$e};grid-column:1/-1`,children:["Nyitvatartás – rövid (fejléc sáv)",(0,r.Y)("input",{value:a.openingHoursShort,onChange:e=>n(t=>({...t,openingHoursShort:e.target.value})),css:Oe,required:!0,placeholder:"Hétfő – Péntek 09:00 – 18:00 · Szombat 09:00 – 13:00"})]}),(0,r.FD)("label",{css:i.AH`${$e};grid-column:1/-1`,children:["Nyitvatartás – részletes (kapcsolat + lábléc, soronként egy)",(0,r.Y)("textarea",{rows:4,value:a.openingHoursLong,onChange:e=>n(t=>({...t,openingHoursLong:e.target.value})),css:i.AH`${Oe};resize:vertical;min-height:96px`,required:!0})]}),(0,r.Y)("div",{css:Be,children:(0,r.Y)("button",{type:"submit",css:Ve,children:"Elérhetőség mentése"})})]})]}),(0,r.FD)("div",{css:Ue,children:[(0,r.FD)("section",{css:Ee,children:[(0,r.Y)("h2",{css:Ne,children:"E-mail küldés (SMTP)"}),(0,r.FD)("p",{css:Ke,children:["A jelszó-visszaállító levelekhez a ",(0,r.Y)("strong",{children:b})," postafiók jelszava szükséges (demóban localStorage). Állapot:"," ",v?(0,r.Y)("span",{css:We,children:"beállítva"}):(0,r.Y)("span",{css:Ge,children:"hiányzik"})]}),(0,r.FD)("form",{onSubmit:e=>{if(e.preventDefault(),g)return function(){try{localStorage.removeItem(p)}catch{}}(),D(!1),h(!1),m(""),void U("Az SMTP jelszó törölve.");""!==c.trim()?(function(e){try{localStorage.setItem(p,e)}catch{}}(c),D(!0),m(""),U("Az SMTP jelszó sikeresen mentve.")):U(null,`Adja meg a ${b} postafiók jelszavát, vagy jelölje be a törlést.`)},css:qe,children:[(0,r.FD)("label",{css:$e,children:["Postafiók jelszó (",b,")",(0,r.Y)("input",{type:"password",value:c,onChange:e=>m(e.target.value),css:Oe,autoComplete:"new-password",placeholder:v?"•••••••• (új jelszó felülírja)":"SMTP postafiók jelszava"})]}),(0,r.FD)("label",{css:Re,children:[(0,r.Y)("input",{type:"checkbox",checked:g,onChange:e=>h(e.target.checked)}),"Mentett SMTP jelszó törlése"]}),(0,r.Y)("button",{type:"submit",css:Ve,children:"SMTP jelszó mentése"})]})]}),(0,r.FD)("section",{css:Ee,children:[(0,r.Y)("h2",{css:Ne,children:"Admin e-mail (jelszó-visszaállítás)"}),(0,r.Y)("p",{css:Ke,children:"Erre a címre „küldjük” a visszaállító kódot (demóban a képernyőn jelenik meg), ha az elfelejtett jelszó oldalon megadja."}),(0,r.FD)("form",{onSubmit:e=>{e.preventDefault();const t=function(e){const t=e.trim().toLowerCase();if(!t||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))return{ok:!1,error:"Érvénytelen e-mail cím."};try{localStorage.setItem(u,t)}catch{return{ok:!1,error:"Nem sikerült az e-mail mentése."}}return{ok:!0}}(o);t.ok?(d(y()),U("Az admin e-mail cím sikeresen mentve.")):U(null,t.error)},css:qe,children:[(0,r.FD)("label",{css:$e,children:["Admin e-mail cím",(0,r.Y)("input",{type:"email",value:o,onChange:e=>d(e.target.value),css:Oe,required:!0,placeholder:"pelda@gmail.com"})]}),(0,r.Y)("button",{type:"submit",css:Ve,children:"Admin e-mail mentése"})]})]}),(0,r.Y)("div",{css:Le,children:(0,r.FD)("section",{css:Ee,children:[(0,r.Y)("h2",{css:Ne,children:"Jelszó módosítása"}),(0,r.FD)("p",{css:Ke,children:["Bejelentkezve mint: ",(0,r.Y)("strong",{children:s})]}),(0,r.FD)("form",{onSubmit:e=>{if(e.preventDefault(),Y!==A)return void U(null,"Az új jelszavak nem egyeznek.");const t=(r=Y,""===(a=x)||""===r?{ok:!1,error:"Minden jelszó mező kitöltése kötelező."}:r.length<8?{ok:!1,error:"Az új jelszó legalább 8 karakter legyen."}:a!==f()?{ok:!1,error:"A jelenlegi jelszó helytelen."}:(k(r),{ok:!0}));var a,r;t.ok?(w(""),F(""),C(""),U("A jelszó sikeresen megváltoztatva.")):U(null,t.error)},css:qe,children:[(0,r.FD)("label",{css:$e,children:["Jelenlegi jelszó",(0,r.Y)("input",{type:"password",value:x,onChange:e=>w(e.target.value),css:Oe,autoComplete:"current-password",required:!0})]}),(0,r.FD)("label",{css:$e,children:["Új jelszó",(0,r.Y)("input",{type:"password",value:Y,onChange:e=>F(e.target.value),css:Oe,autoComplete:"new-password",required:!0,minLength:8})]}),(0,r.FD)("label",{css:$e,children:["Új jelszó még egyszer",(0,r.Y)("input",{type:"password",value:A,onChange:e=>C(e.target.value),css:Oe,autoComplete:"new-password",required:!0,minLength:8})]}),(0,r.Y)("button",{type:"submit",css:Ve,children:"Jelszó mentése"})]})]})})]}),(0,r.FD)("section",{css:Ee,children:[(0,r.Y)("h2",{css:Ne,children:"Megjelenés (főoldal & térkép)"}),(0,r.Y)("p",{css:Ke,children:"Demó: a hero kép, Facebook, cím és térkép beállításai a böngészőben mentődnek."}),(0,r.FD)("form",{onSubmit:e=>{e.preventDefault(),t({...a,contactMapLatitude:"number"==typeof a.contactMapLatitude&&Number.isFinite(a.contactMapLatitude)?a.contactMapLatitude:null,contactMapLongitude:"number"==typeof a.contactMapLongitude&&Number.isFinite(a.contactMapLongitude)?a.contactMapLongitude:null}),U("A megjelenési beállítások elmentve.")},css:qe,children:[(0,r.FD)("label",{css:$e,children:["Főoldal – autós diakép (hero)",(0,r.Y)("div",{css:i.AH`margin-top:0.35rem`,children:(0,r.Y)("img",{src:a.heroAutoImage,alt:"",css:i.AH`
                  max-width: 100%;
                  max-height: 120px;
                  object-fit: cover;
                  border-radius: 8px;
                  border: 1px solid var(--nd-border);
                `})}),(0,r.Y)("input",{type:"file",accept:"image/*",onChange:async e=>{const t=e.target.files?.[0];if(t&&t.type.startsWith("image/")){try{const e=await _(t);n(t=>({...t,heroAutoImage:e})),U("Autós szekció képe beolvasva – mentse el a megjelenési beállításokat.")}catch{U(null,"Kép feltöltése sikertelen.")}e.target.value=""}},css:i.AH`margin-top:0.5rem`}),(0,r.Y)("input",{value:a.heroAutoImage,onChange:e=>n(t=>({...t,heroAutoImage:e.target.value})),css:i.AH`${Oe};margin-top:0.35rem`})]}),(0,r.FD)("label",{css:$e,children:["Facebook profil / oldal URL",(0,r.Y)("input",{type:"url",value:a.facebookUrl,onChange:e=>n(t=>({...t,facebookUrl:e.target.value})),css:Oe})]}),(0,r.FD)("label",{css:$e,children:["Cím / megközelítés szöveg",(0,r.Y)("input",{value:a.contactAddressDisplay,onChange:e=>n(t=>({...t,contactAddressDisplay:e.target.value})),css:Oe})]}),(0,r.FD)("label",{css:$e,children:["Térkép – keresőkifejezés",(0,r.Y)("input",{value:a.contactMapSearchQuery,onChange:e=>n(t=>({...t,contactMapSearchQuery:e.target.value})),css:Oe})]}),(0,r.FD)("div",{css:i.AH`
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.85rem;
              @media (max-width: 560px) {
                grid-template-columns: 1fr;
              }
            `,children:[(0,r.FD)("label",{css:$e,children:["Szélesség (lat)",(0,r.Y)("input",{type:"number",step:"any",value:null==a.contactMapLatitude?"":a.contactMapLatitude,onChange:e=>n(t=>({...t,contactMapLatitude:""===e.target.value?null:Number(e.target.value)})),css:Oe})]}),(0,r.FD)("label",{css:$e,children:["Hosszúság (lng)",(0,r.Y)("input",{type:"number",step:"any",value:null==a.contactMapLongitude?"":a.contactMapLongitude,onChange:e=>n(t=>({...t,contactMapLongitude:""===e.target.value?null:Number(e.target.value)})),css:Oe})]})]}),(0,r.Y)("button",{type:"submit",css:Ve,children:"Megjelenés mentése"})]})]})]})},Ze=()=>{const[e,t]=(0,l.useState)(x),[a,i]=(0,l.useState)(()=>Y(w())),[s,o]=(0,l.useState)(""),m=(0,n.Zp)();(0,l.useEffect)(()=>{t(x())},[]),(0,l.useEffect)(()=>{if(!e)return;const a=()=>{!function(){try{if("1"!==sessionStorage.getItem(d))return;sessionStorage.setItem(c,String(Date.now()))}catch{}}(),i(Y(w()))},r=["mousedown","keydown","touchstart","scroll","mousemove"];r.forEach(e=>document.addEventListener(e,a,{passive:!0}));const l=window.setInterval(()=>{if(!x())return D(),t(!1),o("A munkamenet lejárt 10 perc inaktivitás miatt. Jelentkezzen be újra."),void m("/admin",{replace:!0});i(Y(w()))},1e3);return()=>{r.forEach(e=>document.removeEventListener(e,a)),window.clearInterval(l)}},[e,m]);return e?(0,r.Y)(n.BV,{children:(0,r.FD)(n.qh,{element:(0,r.Y)(W,{onLogout:()=>{D(),t(!1),o(""),m("/admin",{replace:!0})},sessionCountdown:a}),children:[(0,r.Y)(n.qh,{index:!0,element:(0,r.Y)(n.C5,{to:"autok",replace:!0})}),(0,r.Y)(n.qh,{path:"autok",element:(0,r.Y)(Se,{})}),(0,r.Y)(n.qh,{path:"altalanos",element:(0,r.Y)(_e,{})}),(0,r.Y)(n.qh,{path:"*",element:(0,r.Y)(n.C5,{to:"autok",replace:!0})})]})}):(0,r.Y)(B,{onLogin:e=>{e&&(function(){try{sessionStorage.setItem(d,"1"),sessionStorage.setItem(c,String(Date.now()))}catch{}}(),o(""),i(Y(w())),t(!0),m("/admin/autok",{replace:!0}))},onClose:()=>m("/"),redirectToLogin:!0,sessionExpiredMessage:s||void 0})}}}]);