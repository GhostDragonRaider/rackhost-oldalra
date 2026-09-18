"use strict";(self.webpackChunknovadrive_katalogus=self.webpackChunknovadrive_katalogus||[]).push([[685],{219(e,r,a){a.d(r,{A:()=>s,s:()=>m});var n=a(445),t=a(540),i=a(437),o=a(976),d=a(150);const m=300;function l(e){const r=Number(e.detailedData?.powerKw??0),a=Number(e.detailedData?.powerHp??0);return r>0&&a>0?`${r} kW / ${a} LE`:r>0?`${r} kW`:a>0?`${a} LE`:"—"}const s=({car:e})=>{const[r,a]=(0,t.useState)(e.kepUrl||d.ZA),s=`${e.marka} ${e.modell}`.trim();return(0,t.useEffect)(()=>{a(e.kepUrl||d.ZA)},[e.kepUrl]),(0,n.FD)("article",{css:i.AH`
        box-sizing: border-box;
        width: min(100%, ${m}px);
        flex: 1 1 min(100%, ${m}px);
        max-width: ${m}px;
        background: var(--nd-card);
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid var(--nd-border);
        box-shadow: var(--nd-shadow);
        display: flex;
        flex-direction: column;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
          border-color 0.35s ease,
          box-shadow 0.35s ease;

        @media (hover: hover) and (pointer: fine) {
          &:hover {
            transform: translateY(-6px);
            border-color: rgba(212, 175, 55, 0.42);
            box-shadow: 0 28px 60px rgba(0, 0, 0, 0.45);
          }
        }
        @media (max-width: 380px) {
          max-width: 100%;
        }
      `,children:[(0,n.FD)(o.N_,{to:`/autok/${encodeURIComponent(e.id)}`,css:i.AH`
          position: relative;
          display: block;
          width: 100%;
          height: ${190}px;
          flex: 0 0 ${190}px;
          overflow: hidden;
          background: #0a0e16;
          text-decoration: none;

          &::after {
            content: '';
            position: absolute;
            inset: auto 0 0;
            height: 42%;
            background: linear-gradient(180deg, transparent, rgba(8, 12, 20, 0.92));
            pointer-events: none;
          }
        `,children:[(0,n.Y)("img",{src:r,alt:s,css:i.AH`
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            display: block;
            transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
            article:hover & {
              transform: scale(1.06);
            }
          `,loading:"lazy",onError:()=>a(d.ZA)}),(0,n.FD)("span",{css:i.AH`
            position: absolute;
            left: 0.85rem;
            bottom: 0.75rem;
            z-index: 1;
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #e8d59a;
          `,children:[e.evjarat," · ",e.uzemanyag]})]}),(0,n.FD)("div",{css:i.AH`
          padding: 1rem 1.05rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          flex: 1;
        `,children:[(0,n.FD)("div",{children:[(0,n.Y)("h3",{css:i.AH`
              margin: 0;
              font-family: 'Instrument Serif', Georgia, serif;
              font-size: 1.35rem;
              font-weight: 400;
              color: var(--nd-text);
              line-height: 1.2;
              letter-spacing: -0.02em;
            `,children:s}),(0,n.Y)("p",{css:i.AH`
              margin: 0.45rem 0 0;
              font-size: 1.15rem;
              font-weight: 800;
              color: var(--nd-accent);
              letter-spacing: -0.02em;
            `,children:(c=e.ar,new Intl.NumberFormat("hu-HU",{style:"currency",currency:"HUF",maximumFractionDigits:0}).format(c))})]}),(0,n.Y)("dl",{css:i.AH`
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.45rem;
            margin: 0;
            padding-top: 0.35rem;
            border-top: 1px solid var(--nd-border);
          `,children:[["Km",`${e.futottKm.toLocaleString("hu-HU")} km`],["Váltó",e.valto],["Teljesítmény",l(e)],["Évjárat",String(e.evjarat)]].map(([e,r])=>(0,n.FD)("div",{children:[(0,n.Y)("dt",{css:i.AH`
                  margin: 0;
                  font-size: 0.62rem;
                  letter-spacing: 0.1em;
                  text-transform: uppercase;
                  color: var(--nd-text-muted);
                  font-weight: 700;
                `,children:e}),(0,n.Y)("dd",{css:i.AH`
                  margin: 0.15rem 0 0;
                  font-size: 0.84rem;
                  color: var(--nd-text);
                  font-weight: 600;
                `,children:r})]},e))}),(0,n.Y)(o.N_,{to:`/autok/${encodeURIComponent(e.id)}`,css:i.AH`
            margin-top: auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            border-radius: 999px;
            border: 1px solid rgba(212, 175, 55, 0.35);
            background: transparent;
            color: #f0e2b0 !important;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            text-decoration: none;
            transition: background 0.25s, color 0.25s, border-color 0.25s;

            &:hover {
              background: linear-gradient(135deg, #f0e2b0, #d4af37);
              color: #0a1220 !important;
              border-color: transparent;
            }
          `,children:"Részletek"})]})]});var c}},944(e,r,a){a.d(r,{A:()=>d});var n=a(445),t=a(540),i=a(437);const o=i.i7`
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,d=({children:e,className:r,delay:a=0,once:d=!0})=>{const m=(0,t.useRef)(null),[l,s]=(0,t.useState)(!1);return(0,t.useEffect)(()=>{const e=m.current;if(!e)return;if("undefined"!=typeof window&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return void s(!0);const r=new IntersectionObserver(([e])=>{e.isIntersecting?(s(!0),d&&r.disconnect()):d||s(!1)},{threshold:.12,rootMargin:"0px 0px -8% 0px"});return r.observe(e),()=>r.disconnect()},[d]),(0,n.Y)("div",{ref:m,className:r,css:i.AH`
        opacity: ${l?1:0};
        transform: translateY(${l?"0":"28px"});
        animation: ${l?o:"none"} 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        animation-delay: ${l?`${a}ms`:"0ms"};
        @media (prefers-reduced-motion: reduce) {
          opacity: 1;
          transform: none;
          animation: none;
        }
      `,children:e})}},685(e,r,a){a.r(r),a.d(r,{default:()=>A});var n=a(445),t=a(540),i=a(437);const o=i.AH`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 0;
  background: transparent;
  
  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`,d=i.AH`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`,m=i.AH`
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--nd-text-muted);
`,l=i.AH`
  padding: 0.72rem 0.85rem;
  border: 1px solid var(--nd-border);
  border-radius: 10px;
  font-size: 0.95rem;
  width: 100%;
  background: var(--nd-surface-2);
  color: var(--nd-text);

  &::placeholder {
    color: var(--nd-text-muted);
  }

  &:focus {
    border-color: var(--nd-accent);
    outline: none;
  }
`,s=i.AH`
  ${l};
  cursor: pointer;
  option {
    background: var(--nd-bg-elevated);
    color: var(--nd-text);
  }
`,c=i.AH`
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`,p=i.AH`
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  background: transparent;
  color: var(--nd-accent-text);
  border: 1px solid var(--nd-border);
  border-radius: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  flex: 1 1 auto;

  &:hover {
    background: var(--nd-accent-soft);
    border-color: var(--nd-accent);
  }
`,g=["Toyota","Volkswagen","BMW","Suzuki"],h=["Benzin","Dízel","Elektromos","Hibrid","LPG"],u=["Manuális","Automatikus"],v=({filters:e,onFiltersChange:r,markak:a})=>{const i=t.useMemo(()=>[...new Set([...g,...a??[]])].sort((e,r)=>e.localeCompare(r,"hu")),[a]),v=a=>n=>{r({...e,[a]:n.target.value})};return(0,n.FD)("form",{css:o,onSubmit:e=>e.preventDefault(),role:"search",children:[(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-marka",css:m,children:"Márka"}),(0,n.FD)("select",{id:"search-marka",css:s,value:e.marka,onChange:v("marka"),children:[(0,n.Y)("option",{value:"",children:"Összes"}),i.map(e=>(0,n.Y)("option",{value:e,children:e},e))]})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-modell",css:m,children:"Modell"}),(0,n.Y)("input",{id:"search-modell",css:l,type:"text",value:e.modell,onChange:v("modell"),placeholder:"pl. Corolla"})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-min-ar",css:m,children:"Min. ár (Ft)"}),(0,n.Y)("input",{id:"search-min-ar",css:l,type:"number",value:e.minAr,onChange:v("minAr"),placeholder:"pl. 3000000",min:0})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-max-ar",css:m,children:"Max. ár (Ft)"}),(0,n.Y)("input",{id:"search-max-ar",css:l,type:"number",value:e.maxAr,onChange:v("maxAr"),placeholder:"pl. 10000000",min:0})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-min-ev",css:m,children:"Min. évjárat"}),(0,n.Y)("input",{id:"search-min-ev",css:l,type:"number",value:e.minEvjarat,onChange:v("minEvjarat"),placeholder:"pl. 2015",min:1990,max:2030})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-max-ev",css:m,children:"Max. évjárat"}),(0,n.Y)("input",{id:"search-max-ev",css:l,type:"number",value:e.maxEvjarat,onChange:v("maxEvjarat"),placeholder:"pl. 2024",min:1990,max:2030})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-min-km",css:m,children:"Min. futástelj. (km)"}),(0,n.Y)("input",{id:"search-min-km",css:l,type:"number",value:e.minKm,onChange:v("minKm"),placeholder:"pl. 0",min:0})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-max-km",css:m,children:"Max. futástelj. (km)"}),(0,n.Y)("input",{id:"search-max-km",css:l,type:"number",value:e.maxKm,onChange:v("maxKm"),placeholder:"pl. 150000",min:0})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-uzemanyag",css:m,children:"Üzemanyag"}),(0,n.FD)("select",{id:"search-uzemanyag",css:s,value:e.uzemanyag,onChange:v("uzemanyag"),children:[(0,n.Y)("option",{value:"",children:"Összes"}),h.map(e=>(0,n.Y)("option",{value:e,children:e},e))]})]}),(0,n.FD)("div",{css:d,children:[(0,n.Y)("label",{htmlFor:"search-valto",css:m,children:"Váltó"}),(0,n.FD)("select",{id:"search-valto",css:s,value:e.valto,onChange:v("valto"),children:[(0,n.Y)("option",{value:"",children:"Összes"}),u.map(e=>(0,n.Y)("option",{value:e,children:e},e))]})]}),(0,n.Y)("div",{css:c,children:(0,n.Y)("button",{type:"button",onClick:()=>r({marka:"",modell:"",minAr:"",maxAr:"",minEvjarat:"",maxEvjarat:"",minKm:"",maxKm:"",uzemanyag:"",valto:""}),css:p,children:"Szűrők törlése"})})]})};var f=a(219),b=a(944),x=a(430),w=a(178);const k={marka:"",modell:"",minAr:"",maxAr:"",minEvjarat:"",maxEvjarat:"",minKm:"",maxKm:"",uzemanyag:"",valto:""},A=()=>{const{cars:e,isLoading:r,loadError:a}=(0,x.rU)(),[o,d]=(0,t.useState)(k),m=(0,t.useMemo)(()=>e.filter(e=>!e.elkelt),[e]),l=(0,t.useMemo)(()=>[...new Set(m.map(e=>e.marka))].sort((e,r)=>e.localeCompare(r,"hu")),[m]),s=(0,t.useMemo)(()=>function(e,r){return e.filter(e=>!(r.marka&&e.marka.toLowerCase()!==r.marka.toLowerCase()||r.modell&&!e.modell.toLowerCase().includes(r.modell.toLowerCase())||r.minAr&&e.ar<Number(r.minAr)||r.maxAr&&e.ar>Number(r.maxAr)||r.minEvjarat&&e.evjarat<Number(r.minEvjarat)||r.maxEvjarat&&e.evjarat>Number(r.maxEvjarat)||r.minKm&&e.futottKm<Number(r.minKm)||r.maxKm&&e.futottKm>Number(r.maxKm)||r.uzemanyag&&e.uzemanyag!==r.uzemanyag||r.valto&&e.valto!==r.valto))}(m,o),[m,o]);return(0,n.FD)("article",{css:i.AH`
        background: var(--nd-bg);
        color: var(--nd-text);
      `,children:[(0,n.Y)("section",{css:i.AH`
          background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(26, 77, 109, 0.18), transparent 65%),
            var(--nd-bg);
          padding: clamp(2.25rem, 5vw, 3.5rem) 0;
          border-bottom: 1px solid var(--nd-border);
        `,children:(0,n.Y)("div",{css:w.cr,children:(0,n.FD)(b.A,{children:[(0,n.Y)("h1",{css:i.AH`
                margin: 0 0 0.75rem;
                font-family: 'Instrument Serif', Georgia, serif;
                font-size: clamp(1.85rem, 4vw, 2.8rem);
                font-weight: 400;
                color: var(--nd-text);
                letter-spacing: -0.03em;
              `,children:"Kínálatunk"}),(0,n.Y)("p",{css:i.AH`
                margin: 0 0 1.25rem;
                color: var(--nd-text-muted);
                max-width: min(42rem, 100%);
                line-height: 1.65;
                font-size: clamp(0.9rem, 2.5vw, 1rem);
                overflow-wrap: break-word;
              `,children:"Szűrhető katalógus — minden jármű részletes állapotlappal érhető el. Az adminban módosított kínálat itt azonnal megjelenik."}),(0,n.Y)("div",{css:i.AH`
                background: var(--nd-surface-2);
                border: 1px solid var(--nd-border);
                border-radius: 18px;
                padding: clamp(1rem, 3vw, 1.35rem);
              `,children:(0,n.Y)(v,{filters:o,onFiltersChange:d,markak:l})})]})})}),(0,n.Y)("section",{css:i.AH`
          padding: clamp(2rem, 5vw, 3rem) 0 clamp(3rem, 7vw, 4.5rem);
          background: var(--nd-bg);
        `,children:(0,n.FD)("div",{css:i.AH`
            box-sizing: border-box;
            width: 100%;
            max-width: calc(${f.s}px * 4 + 1.35rem * 3 + 2.5rem);
            margin: 0 auto;
            min-width: 0;
            padding-left: clamp(0.65rem, 3.5vw, 1.25rem);
            padding-right: clamp(0.65rem, 3.5vw, 1.25rem);
          `,children:[(0,n.Y)(b.A,{children:(0,n.Y)("h2",{css:[w.Kx,i.AH`text-align: center; color: var(--nd-text);`],children:"Aktuális kínálatunk"})}),r?(0,n.Y)("p",{css:w.p$,children:"Autók betöltése…"}):a?(0,n.FD)("p",{css:w.p$,children:["Nem sikerült betölteni az autókat. (",a,")"]}):s.length>0?(0,n.Y)("div",{css:i.AH`
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
                gap: 1.35rem;
                width: 100%;
                justify-items: center;
              `,children:s.map((e,r)=>(0,n.Y)(b.A,{delay:70*Math.min(r,8),children:(0,n.Y)(f.A,{car:e})},e.id))}):(0,n.Y)("p",{css:w.p$,children:"A keresésnek megfelelő, jelenleg eladó gépjármű nincs. Lazítson a szűrőfeltételeken."})]})})]})}},178(e,r,a){a.d(r,{Ac:()=>h,EB:()=>m,Kx:()=>l,N9:()=>d,O6:()=>p,Sz:()=>s,Vq:()=>v,cF:()=>f,cr:()=>t,f$:()=>w,fJ:()=>i,iY:()=>g,iq:()=>b,kJ:()=>u,p$:()=>k,pK:()=>x,wc:()=>c,xM:()=>o});var n=a(437);n.AH`
  padding-left: clamp(0.65rem, 3.5vw, 1.25rem);
  padding-right: clamp(0.65rem, 3.5vw, 1.25rem);
`;const t=n.AH`
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  min-width: 0;
  padding-left: clamp(0.65rem, 3.5vw, 1.25rem);
  padding-right: clamp(0.65rem, 3.5vw, 1.25rem);
`,i=n.AH`
  box-sizing: border-box;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  min-width: 0;
  padding-left: clamp(0.65rem, 3.5vw, 1.25rem);
  padding-right: clamp(0.65rem, 3.5vw, 1.25rem);
  position: relative;
  z-index: 1;
`,o=n.AH`
  background: var(--nd-bg);
  padding: clamp(2.25rem, 5vw, 3.5rem) 0;
`,d=n.AH`
  background: var(--nd-bg-elevated);
  padding: clamp(2.25rem, 5vw, 3.5rem) 0;
  border-top: 1px solid var(--nd-border);
  border-bottom: 1px solid var(--nd-border);
`,m=n.AH`
  background: linear-gradient(135deg, #0e1520 0%, #070b12 100%);
  color: #f8fafc;
  padding: clamp(2.5rem, 5vw, 3.75rem) 0;

  [data-theme='light'] & {
    background: linear-gradient(135deg, #1a4d6d 0%, #0c1220 100%);
    color: #f8fafc;
  }
`,l=n.AH`
  margin: 0 0 1rem;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--nd-text);
`,s=n.AH`
  margin: 0 0 0.85rem;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(1.35rem, 2.8vw, 1.85rem);
  font-weight: 400;
  color: var(--nd-text);
`,c=n.AH`
  margin: 0 0 0.5rem;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 400;
  text-align: center;
  color: #f8fafc;
`,p=n.AH`
  margin: 0 auto clamp(1.35rem, 5vw, 2rem);
  max-width: min(36rem, 100%);
  padding: 0 0.15rem;
  text-align: center;
  color: rgba(248, 250, 252, 0.72);
  line-height: 1.65;
  font-size: clamp(0.9rem, 2.5vw, 0.98rem);
  overflow-wrap: break-word;
`,g=n.AH`
  display: grid;
  gap: clamp(1rem, 3vw, 1.35rem);
  margin-top: 1.35rem;
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`,h=n.AH`
  background: var(--nd-card);
  border: 1px solid var(--nd-border);
  border-radius: 14px;
  padding: clamp(1.15rem, 4vw, 1.65rem) clamp(1.1rem, 3vw, 1.5rem) clamp(1.05rem, 3vw, 1.5rem);
  text-align: center;
  box-shadow: var(--nd-shadow);

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.02rem;
    font-weight: 800;
    color: var(--nd-text);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  p {
    margin: 0;
    color: var(--nd-text-muted);
    line-height: 1.7;
    font-size: 0.95rem;
  }
`,u=n.AH`
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a4d6d, #0c1220);
  border: 1px solid rgba(212, 175, 55, 0.35);
  color: #e8d59a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 800;
`,v=n.AH`
  line-height: 1;
  font-size: 1.1rem;
`,f=n.AH`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(1.1rem, 3vw, 1.5rem);
  @media (min-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 960px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`,b=n.AH`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.35rem 1.25rem;
  text-align: center;

  h3 {
    margin: 0 0 0.45rem;
    font-size: 1rem;
    font-weight: 800;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  p {
    margin: 0;
    color: rgba(248, 250, 252, 0.58);
    line-height: 1.65;
    font-size: 0.92rem;
  }
`,x=n.AH`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-bottom: 0.85rem;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a4d6d, #0c1220);
  border: 1px solid rgba(212, 175, 55, 0.35);
  color: #e8d59a;
  font-weight: 900;
  font-size: 1.05rem;
`,w=n.AH`
  margin: 0 auto;
  padding: 0;
  list-style: none;
  max-width: 42rem;
  overflow-wrap: anywhere;

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.85rem;
    color: var(--nd-text-muted);
    line-height: 1.65;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.55rem;
      width: 9px;
      height: 9px;
      background: var(--nd-accent);
      border-radius: 1px;
    }
    &:last-of-type {
      margin-bottom: 0;
    }
  }
`,k=n.AH`
  text-align: center;
  padding: 2.75rem 1rem;
  color: var(--nd-text-muted);
  background: var(--nd-surface-2);
  border: 1px dashed var(--nd-border);
  border-radius: 14px;
`;n.AH`
  background: var(--nd-surface-2);
  border: 1px solid var(--nd-border);
  border-radius: 18px;
  padding: clamp(1.15rem, 2.5vw, 1.65rem);
`}}]);