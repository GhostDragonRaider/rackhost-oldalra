"use strict";(self.webpackChunknovadrive_katalogus=self.webpackChunknovadrive_katalogus||[]).push([[688],{688(e,r,t){t.r(r),t.d(r,{default:()=>ne});var i=t(445),n=t(540),a=t(437),o=t(976),l=t(767),s=t(150),d=t(430),m=t(867),c=t(712);const p=[{key:"frontLeft",label:"Bal első gumi"},{key:"frontRight",label:"Jobb első gumi"},{key:"rearLeft",label:"Bal hátsó gumi"},{key:"rearRight",label:"Jobb hátsó gumi"}],g=[{key:"suspension",label:"Futómű"},{key:"brakes",label:"Fékek"},{key:"oilChange",label:"Olajcsere"},{key:"timingService",label:"Vezérlés"},{key:"brakeFluid",label:"Fékolaj"}],f=e=>e.toLocaleString("hu-HU"),b=e=>{if(!e)return"Nincs megadva";const r=new Date(e);return Number.isNaN(r.getTime())?e:new Intl.DateTimeFormat("hu-HU",{year:"numeric",month:"2-digit",day:"2-digit"}).format(r)},h=e=>e.split("#")[0].split("?")[0],u=({title:e,entry:r,extra:t})=>{const n="Kiváló"===(o=r.status)?{bg:"#ecfdf5",fg:"#047857",border:"#a7f3d0"}:"Jó"===o?{bg:"#eff6ff",fg:"#1d4ed8",border:"#bfdbfe"}:"Megfelelő"===o?{bg:"#fffbeb",fg:"#92400e",border:"#fde68a"}:"Cserére szorul"===o?{bg:"#fef2f2",fg:"#b91c1c",border:"#fecaca"}:{bg:"#f3f4f6",fg:"#4b5563",border:"#e5e7eb"};var o;return(0,i.FD)("article",{css:te,children:[(0,i.FD)("div",{css:a.AH`
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: flex-start;
        flex-wrap: wrap;
      `,children:[(0,i.Y)("h3",{css:a.AH`margin:0;font-size:1rem;color:#111827`,children:e}),(0,i.Y)("span",{css:a.AH`
            flex-shrink: 0;
            padding: 0.25rem 0.55rem;
            border-radius: 999px;
            background: ${n.bg};
            color: ${n.fg};
            border: 1px solid ${n.border};
            font-size: 0.78rem;
            font-weight: 800;
          `,children:r.status})]}),t&&(0,i.Y)("p",{css:ie,children:t}),(0,i.FD)("p",{css:ie,children:["Utolsó csere / ellenőrzés: ",b(r.lastChanged)]}),r.note&&(0,i.Y)("p",{css:a.AH`margin:0;color:#4b5563;font-size:0.9rem;line-height:1.5`,children:r.note})]})},k=({title:e,items:r,compact:t=!1})=>{const n=r.filter(([,e])=>{const r=String(e??"").trim();return""!==r&&"0"!==r&&"0 cm³"!==r&&"0 kg"!==r&&"0 liter"!==r});return 0===n.length?null:(0,i.FD)("section",{css:[R,t&&_],children:[(0,i.Y)("h2",{css:[W,t&&I],children:e}),(0,i.Y)("dl",{css:[X,t&&G],children:n.map(([e,r])=>(0,i.FD)("div",{css:O,children:[(0,i.Y)("dt",{css:q,children:e}),(0,i.Y)("dd",{css:J,children:r})]},e))})]})},x=({title:e,items:r})=>(0,i.FD)("article",{css:ee,children:[(0,i.Y)("h3",{css:a.AH`margin:0 0 0.75rem;color:#111827;font-size:1rem`,children:e}),(0,i.Y)("ul",{css:a.AH`list-style:none;margin:0;padding:0;display:grid;gap:0.5rem`,children:r.map(e=>(0,i.FD)("li",{css:a.AH`display:flex;gap:0.5rem;color:#4b5563;font-size:0.92rem;line-height:1.45`,children:[(0,i.Y)("span",{css:a.AH`color:#9a7b33;font-weight:900`,"aria-hidden":!0,children:"✓"}),e]},e))})]}),y=a.AH`
  background: linear-gradient(180deg, #f7f3ea 0%, #ffffff 45%);
  min-height: 70vh;
  padding: clamp(1rem, 4vw, 2rem) clamp(0.6rem, 3.5vw, 1rem) clamp(2.25rem, 8vw, 4rem);
  overflow-x: clip;
`,w=a.AH`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-width: 0;
`,v=a.AH`
  display: inline-flex;
  margin-bottom: 1rem;
  color: #6b4f16;
  font-weight: 800;
  text-decoration: none;
`,z=a.AH`
  display: inline-flex;
  padding: 0.72rem 1rem;
  border-radius: 12px;
  background: #111827;
  color: #fff;
  font-weight: 800;
`,A=a.AH`
  display: grid;
  gap: clamp(1rem, 3vw, 1.5rem);
  align-items: stretch;
  grid-template-columns: 1fr;
  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  }
`,H=a.AH`
  display: grid;
  gap: 0.7rem;
  align-content: start;
`,Y=a.AH`
  display: grid;
  gap: 0.85rem;
  align-content: start;
`,$=a.AH`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 320px;
  object-fit: cover;
`,F=a.i7`
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
`,D=a.i7`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`,j=a.i7`
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
`,C=a.i7`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`,K=a.AH`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background: #fff;
  border-radius: 22px;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid rgba(212, 175, 55, 0.28);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
`,E=a.AH`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(88px, 120px);
  gap: 0.6rem;
  overflow-x: auto;
  padding: 0.35rem 0.15rem 0.2rem;
  scrollbar-width: thin;
`,S=a.AH`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0;
  background: #fff;
  cursor: pointer;
  overflow: hidden;
`,N=a.AH`
  width: 100%;
  height: 70px;
  object-fit: cover;
  object-position: center center;
  display: block;
`,U=e=>a.AH`
  position: absolute;
  top: 50%;
  ${e}: 0.55rem;
  transform: translateY(-50%);
  z-index: 3;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.55);
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  &:hover {
    background: rgba(17, 24, 39, 0.72);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`,P=a.AH`
  position: fixed;
  inset: 0;
  z-index: 10050;
  background: rgba(6, 8, 14, 0.82);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.65rem, 3vw, 1.25rem);
`,Z=a.AH`
  position: relative;
  width: min(1100px, 100%);
  max-height: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
`,B=a.AH`
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  z-index: 2;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(15, 23, 42, 0.75);
  color: #fff;
  font-size: 1.45rem;
  line-height: 1;
  cursor: pointer;
`,L=a.AH`
  display: block;
  width: 100%;
  max-height: min(90vh, 860px);
  object-fit: contain;
  background: #0b1220;
`,M=a.AH`
  margin: 0;
  color: #9a7b33;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.78rem;
`,T=a.AH`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 0;
`,V=a.AH`
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid #eef2f7;
  background: #f8fafc;
`,X=a.AH`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin: 0;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  @media (min-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
`,O=a.AH`
  display: grid;
  grid-template-columns: minmax(140px, 0.42fr) minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  &:nth-of-type(odd) {
    background: #f8fafc;
  }
  overflow-wrap: anywhere;
  word-break: break-word;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
  @media (min-width: 760px) {
    &:nth-last-of-type(-n + 2) {
      border-bottom: none;
    }
  }
`,q=a.AH`
  margin: 0;
  color: #6b7280;
  font-size: 0.86rem;
`,J=a.AH`
  margin: 0;
  color: #111827;
  font-weight: 800;
  font-size: 0.92rem;
`,R=a.AH`
  margin-top: 1.5rem;
  display: grid;
  gap: 1.25rem;
  background: #fff;
  border-radius: 22px;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid rgba(212, 175, 55, 0.24);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
`,_=a.AH`
  margin-top: 0;
  padding: clamp(1rem, 2.4vw, 1.35rem);
  gap: 0.85rem;
`,W=a.AH`
  margin: -0.6rem 0 0;
  color: #111827;
  font-size: clamp(1.45rem, 3vw, 2.2rem);
`,I=a.AH`
  margin: 0;
  font-size: clamp(1.15rem, 2.4vw, 1.55rem);
`,G=a.AH`
  @media (min-width: 760px) {
    grid-template-columns: 1fr;
  }
`,Q=a.AH`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1080px) {
    grid-template-columns: repeat(3, 1fr);
  }
`,ee=a.AH`
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
`,re=a.AH`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1080px) {
    grid-template-columns: repeat(4, 1fr);
  }
`,te=a.AH`
  display: grid;
  gap: 0.65rem;
  align-content: start;
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
`,ie=a.AH`
  margin: 0;
  color: #6b7280;
  font-size: 0.86rem;
`,ne=()=>{const{id:e}=(0,l.g)(),{cars:r}=(0,d.rU)(),t=r.find(r=>r.id===e),[b,X]=(0,n.useState)(0),O=t?.imageUrls?.map(e=>e.trim()).filter(Boolean).length?t.imageUrls?.map(e=>e.trim()).filter(Boolean):[t?.kepUrl||s.ZA],q=O.length>1&&O.every(e=>h(e)===h(O[0])),J=O.map((e,r)=>({url:e,filter:q?["none","saturate(1.08) contrast(1.06)","brightness(0.95) contrast(1.1)"][r%3]:"none",objectPosition:q?["center center","center 38%","center 62%"][r%3]:"center center"})),[_,I]=(0,n.useState)(J[0]?.url||s.ZA),G=J[b]??J[0],[ee,te]=(0,n.useState)(null),[ie,ne]=(0,n.useState)(!1);(0,n.useEffect)(()=>{X(0),I(J[0]?.url||s.ZA),te(null)},[t?.id,t?.kepUrl,t?.imageUrls]),(0,n.useEffect)(()=>{if(!ie)return;const e=e=>{"Escape"===e.key&&ne(!1)};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[ie]);const ae=e=>{if(J.length<=1||ee)return;const r=(b+e+J.length)%J.length;te({from:b,to:r,dir:e})};if(!t)return(0,i.Y)("article",{css:y,children:(0,i.FD)("div",{css:a.AH`
            box-sizing: border-box;
            width: 100%;
            max-width: min(900px, 100%);
            margin: 0 auto;
            text-align: center;
            background: #fff;
            border-radius: 18px;
            padding: clamp(2rem, 8vw, 3rem) clamp(1rem, 4vw, 1.5rem);
            border: 1px solid #e5e7eb;
          `,children:[(0,i.Y)("p",{css:a.AH`margin:0 0 1rem;color:#6b7280`,children:"Az autó nem található."}),(0,i.Y)(o.N_,{to:"/kinalat",css:z,children:"Vissza az autókhoz"})]})});const oe=(0,m.yP)(t.conditionSheet,t),le=(0,c.CV)(t.detailedData,t),se=[["Évjárat",String(t.evjarat)],["Megtett km",`${t.futottKm.toLocaleString("hu-HU")} km`],["Üzemanyag",t.uzemanyag],["Váltó",t.valto]],de=[["Gyártmány",t.marka],["Modell",t.modell],["Típus",le.variant||le.title],["Kivitel",le.bodyType],["Állapot",le.condition],["Származás",le.origin],["Szín",le.color],["Alvázszám",le.chassisNumber??""],["Ajtók száma",le.doors],["Szállítható személyek",le.seats],["Klíma",le.climate],["Kárpit",le.upholstery]],me=[["Hengerűrtartalom",`${f(le.engineDisplacementCcm)} cm³`],["Teljesítmény",`${le.powerKw} kW / ${le.powerHp} LE`],["Nyomaték",`${le.torqueNm} Nm`],["Hajtás",le.drivetrain],["Hengerek száma",le.cylinders],["Környezetvédelmi osztály",le.environmentalClass],["Vegyes fogyasztás",le.combinedConsumption],["Városi fogyasztás",le.cityConsumption],["Országúti fogyasztás",le.highwayConsumption],["Saját tömeg",`${f(le.ownWeightKg)} kg`],["Össztömeg",`${f(le.totalWeightKg)} kg`],["Csomagtartó",`${f(le.trunkCapacityLiter)} liter`]],ce=[["Első forgalomba helyezés",le.firstRegistration],["Műszaki érvényes",le.inspectionValidUntil],["Okmányok",le.documents],["Szervizkönyv / előélet",le.serviceBook],["Kulcsok",le.numberOfKeys]];return(0,i.FD)("article",{css:y,children:[(0,i.FD)("div",{css:w,children:[(0,i.Y)(o.N_,{to:"/kinalat",css:v,children:"Vissza a kínálatunkhoz"}),t.elkelt&&(0,i.FD)("div",{role:"status",css:a.AH`
              margin: 0 0 1.25rem;
              padding: 0.95rem 1.25rem;
              border-radius: 14px;
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 2px solid #d97706;
              color: #78350f;
              font-weight: 800;
              font-size: 0.96rem;
            `,children:["Ez a gépjármű ",(0,i.Y)("strong",{children:"már elkelt"}),"; az adatlapon közzétett információk referenciaként maradnak elérhetők."]}),(0,i.FD)("section",{css:A,children:[(0,i.FD)("div",{css:H,children:[(0,i.FD)("div",{css:a.AH`position:relative;min-height:320px;border-radius:22px;overflow:hidden;background:#111827;box-shadow:0 24px 60px rgba(15,23,42,0.18)`,children:[t.elkelt?(0,i.Y)("span",{css:a.AH`
                    position: absolute;
                    top: 0.95rem;
                    left: 0.95rem;
                    z-index: 2;
                    padding: 0.42rem 0.95rem;
                    border-radius: 999px;
                    background: rgba(217, 119, 6, 0.95);
                    color: #fff;
                    font-size: 0.75rem;
                    font-weight: 900;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
                    pointer-events: none;
                  `,children:"Elkelt"}):null,ee?(0,i.FD)(i.FK,{children:[(0,i.Y)("img",{src:J[ee.from]?.url||s.ZA,alt:`${t.marka} ${t.modell}`,css:a.AH`
                      ${$};
                      object-position: ${J[ee.from]?.objectPosition??"center center"};
                      filter: ${J[ee.from]?.filter??"none"};
                      cursor: zoom-in;
                      animation: ${1===ee.dir?F:j} 360ms ease forwards;
                    `,onClick:()=>ne(!0)}),(0,i.Y)("img",{src:J[ee.to]?.url||s.ZA,alt:`${t.marka} ${t.modell}`,css:a.AH`
                      ${$};
                      object-position: ${J[ee.to]?.objectPosition??"center center"};
                      filter: ${J[ee.to]?.filter??"none"};
                      cursor: zoom-in;
                      animation: ${1===ee.dir?D:C} 360ms ease forwards;
                    `,onClick:()=>ne(!0),onAnimationEnd:()=>{const e=ee.to;X(e),I(J[e]?.url||s.ZA),te(null)},onError:()=>I(s.ZA)})]}):(0,i.Y)("img",{src:_,alt:`${t.marka} ${t.modell}`,css:a.AH`
                    ${$};
                    object-position: ${G?.objectPosition??"center center"};
                    filter: ${G?.filter??"none"};
                    cursor: zoom-in;
                  `,onClick:()=>ne(!0),onError:()=>I(s.ZA)}),J.length>1?(0,i.FD)(i.FK,{children:[(0,i.Y)("button",{type:"button",onClick:e=>{e.stopPropagation(),ae(-1)},css:U("left"),"aria-label":"Előző kép",disabled:Boolean(ee),children:"‹"}),(0,i.Y)("button",{type:"button",onClick:e=>{e.stopPropagation(),ae(1)},css:U("right"),"aria-label":"Következő kép",disabled:Boolean(ee),children:"›"})]}):null]}),J.length>1?(0,i.Y)("div",{css:E,children:J.map((e,r)=>(0,i.Y)("button",{type:"button",onClick:()=>{te(null),X(r),I(e.url)},css:a.AH`
                      ${S};
                      ${b===r?"border-color:#1a4d6d;box-shadow:0 0 0 2px rgba(191,30,46,0.25);":""}
                    `,"aria-label":`${t.marka} ${t.modell} - kép ${r+1}`,children:(0,i.Y)("img",{src:e.url,alt:"",css:a.AH`${N};filter:${e.filter};object-position:${e.objectPosition};`})},`${e.url}-${r}`))}):null,(0,i.FD)("div",{css:Y,children:[(0,i.Y)(k,{title:"Járműadatok",items:de,compact:!0}),(0,i.Y)(k,{title:"Műszaki adatok",items:me,compact:!0})]})]}),(0,i.FD)("div",{css:K,children:[(0,i.Y)("p",{css:M,children:t.marka}),(0,i.Y)("h1",{css:a.AH`margin:0;font-size:clamp(2rem,4vw,3.5rem);line-height:1.05;color:#111827`,children:le.title}),(0,i.Y)("p",{css:a.AH`margin:0;color:#b91c1c;font-size:1.6rem;font-weight:900`,children:(pe=t.ar,new Intl.NumberFormat("hu-HU",{style:"currency",currency:"HUF",maximumFractionDigits:0}).format(pe))}),(0,i.Y)("dl",{css:T,children:se.map(([e,r])=>(0,i.FD)("div",{css:V,children:[(0,i.Y)("dt",{css:a.AH`font-size:0.74rem;color:#6b7280;margin:0`,children:e}),(0,i.Y)("dd",{css:a.AH`font-size:0.98rem;color:#111827;font-weight:800;margin:0`,children:r})]},e))}),(0,i.Y)("p",{css:a.AH`margin:0;color:#4b5563;line-height:1.7`,children:t.leiras})]})]}),(0,i.Y)(k,{title:"Okmányok és előélet",items:ce}),(0,i.FD)("section",{css:R,children:[(0,i.Y)("p",{css:M,children:"Felszereltség"}),(0,i.Y)("h2",{css:W,children:"Kényelmi, biztonsági és multimédia extrák"}),(0,i.FD)("div",{css:Q,children:[(0,i.Y)(x,{title:"Kényelem",items:le.equipment.comfort}),(0,i.Y)(x,{title:"Biztonság",items:le.equipment.safety}),(0,i.Y)(x,{title:"Multimédia",items:le.equipment.multimedia}),(0,i.Y)(x,{title:"Külső felszereltség",items:le.equipment.exterior}),(0,i.Y)(x,{title:"Egyéb",items:le.equipment.other})]})]}),(0,i.FD)("section",{css:R,children:[(0,i.Y)("p",{css:M,children:"Állapotlap"}),(0,i.Y)("h2",{css:W,children:"Részletes műszaki és szerviz állapot"}),(0,i.Y)("div",{css:re,children:p.map(e=>{const r=oe.tires[e.key],t=r.treadDepthMm?`Profimélység: ${r.treadDepthMm} mm`:"Profimélység: nincs megadva",n=r.dotNumber?`DOT: ${r.dotNumber}`:"DOT: nincs megadva";return(0,i.Y)(u,{title:e.label,entry:r,extra:`${t} · ${n}`},e.key)})}),(0,i.Y)("div",{css:re,children:g.map(e=>(0,i.Y)(u,{title:e.label,entry:oe[e.key]},e.key))})]})]}),ie?(0,i.Y)("div",{css:P,role:"presentation",onClick:()=>ne(!1),children:(0,i.FD)("div",{css:Z,role:"dialog","aria-modal":"true","aria-label":`${t.marka} ${t.modell} nagyított kép`,onClick:e=>e.stopPropagation(),children:[(0,i.Y)("button",{type:"button",onClick:()=>ne(!1),css:B,"aria-label":"Nagyított kép bezárása",children:"×"}),(0,i.Y)("img",{src:_,alt:`${t.marka} ${t.modell}`,css:L,onError:e=>{e.currentTarget.src=s.ZA}})]})}):null]});var pe}}}]);