"use strict";(self.webpackChunknovadrive_katalogus=self.webpackChunknovadrive_katalogus||[]).push([[676],{219(e,r,t){t.d(r,{A:()=>l,s:()=>d});var n=t(445),i=t(540),a=t(437),o=t(976),s=t(150);const d=300;function c(e){const r=Number(e.detailedData?.powerKw??0),t=Number(e.detailedData?.powerHp??0);return r>0&&t>0?`${r} kW / ${t} LE`:r>0?`${r} kW`:t>0?`${t} LE`:"—"}const l=({car:e})=>{const[r,t]=(0,i.useState)(e.kepUrl||s.ZA),l=`${e.marka} ${e.modell}`.trim();return(0,i.useEffect)(()=>{t(e.kepUrl||s.ZA)},[e.kepUrl]),(0,n.FD)("article",{css:a.AH`
        box-sizing: border-box;
        width: min(100%, ${d}px);
        flex: 1 1 min(100%, ${d}px);
        max-width: ${d}px;
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
      `,children:[(0,n.FD)(o.N_,{to:`/autok/${encodeURIComponent(e.id)}`,css:a.AH`
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
        `,children:[(0,n.Y)("img",{src:r,alt:l,css:a.AH`
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            display: block;
            transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
            article:hover & {
              transform: scale(1.06);
            }
          `,loading:"lazy",onError:()=>t(s.ZA)}),(0,n.FD)("span",{css:a.AH`
            position: absolute;
            left: 0.85rem;
            bottom: 0.75rem;
            z-index: 1;
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #e8d59a;
          `,children:[e.evjarat," · ",e.uzemanyag]})]}),(0,n.FD)("div",{css:a.AH`
          padding: 1rem 1.05rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          flex: 1;
        `,children:[(0,n.FD)("div",{children:[(0,n.Y)("h3",{css:a.AH`
              margin: 0;
              font-family: 'Instrument Serif', Georgia, serif;
              font-size: 1.35rem;
              font-weight: 400;
              color: var(--nd-text);
              line-height: 1.2;
              letter-spacing: -0.02em;
            `,children:l}),(0,n.Y)("p",{css:a.AH`
              margin: 0.45rem 0 0;
              font-size: 1.15rem;
              font-weight: 800;
              color: var(--nd-accent);
              letter-spacing: -0.02em;
            `,children:(m=e.ar,new Intl.NumberFormat("hu-HU",{style:"currency",currency:"HUF",maximumFractionDigits:0}).format(m))})]}),(0,n.Y)("dl",{css:a.AH`
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.45rem;
            margin: 0;
            padding-top: 0.35rem;
            border-top: 1px solid var(--nd-border);
          `,children:[["Km",`${e.futottKm.toLocaleString("hu-HU")} km`],["Váltó",e.valto],["Teljesítmény",c(e)],["Évjárat",String(e.evjarat)]].map(([e,r])=>(0,n.FD)("div",{children:[(0,n.Y)("dt",{css:a.AH`
                  margin: 0;
                  font-size: 0.62rem;
                  letter-spacing: 0.1em;
                  text-transform: uppercase;
                  color: var(--nd-text-muted);
                  font-weight: 700;
                `,children:e}),(0,n.Y)("dd",{css:a.AH`
                  margin: 0.15rem 0 0;
                  font-size: 0.84rem;
                  color: var(--nd-text);
                  font-weight: 600;
                `,children:r})]},e))}),(0,n.Y)(o.N_,{to:`/autok/${encodeURIComponent(e.id)}`,css:a.AH`
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
          `,children:"Részletek"})]})]});var m}},944(e,r,t){t.d(r,{A:()=>s});var n=t(445),i=t(540),a=t(437);const o=a.i7`
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,s=({children:e,className:r,delay:t=0,once:s=!0})=>{const d=(0,i.useRef)(null),[c,l]=(0,i.useState)(!1);return(0,i.useEffect)(()=>{const e=d.current;if(!e)return;if("undefined"!=typeof window&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return void l(!0);const r=new IntersectionObserver(([e])=>{e.isIntersecting?(l(!0),s&&r.disconnect()):s||l(!1)},{threshold:.12,rootMargin:"0px 0px -8% 0px"});return r.observe(e),()=>r.disconnect()},[s]),(0,n.Y)("div",{ref:d,className:r,css:a.AH`
        opacity: ${c?1:0};
        transform: translateY(${c?"0":"28px"});
        animation: ${c?o:"none"} 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        animation-delay: ${c?`${t}ms`:"0ms"};
        @media (prefers-reduced-motion: reduce) {
          opacity: 1;
          transform: none;
          animation: none;
        }
      `,children:e})}},676(e,r,t){t.r(r),t.d(r,{default:()=>U});var n=t(445),i=t(540),a=t(437),o=t(976),s=t(430),d=t(317),c=t(504);const l=a.i7`
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
`,m=a.i7`
  from { transform: scale(1.08); opacity: 0.55; }
  to { transform: scale(1.02); opacity: 1; }
`,p=a.i7`
  0%, 100% { filter: drop-shadow(0 0 0 transparent); }
  50% { filter: drop-shadow(0 8px 28px rgba(212, 175, 55, 0.28)); }
`,g=a.AH`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--nd-bg-elevated);
  text-align: center;
  min-height: clamp(420px, 78svh, 720px);
  display: flex;
  align-items: center;
  @media (max-height: 560px) {
    min-height: min(520px, 100svh);
  }
`,h=a.AH`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
  animation: ${m} 1.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,f=a.AH`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--nd-hero-overlay),
    radial-gradient(ellipse 70% 60% at 50% 40%, rgba(26, 77, 109, 0.18) 0%, transparent 70%);
`,u=a.AH`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: none;
  box-sizing: border-box;
  margin: 0;
  padding: clamp(2.5rem, 10vw, 4.5rem) 0 clamp(2.75rem, 11vw, 5rem);
`,b=a.AH`
  max-width: 920px;
  margin: 0 auto;
  padding: 0 clamp(0.6rem, 4vw, 1.15rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
`,x=a.AH`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.65rem;
  text-align: left;
  animation: ${l} 0.9s cubic-bezier(0.16, 1, 0.3, 1) both,
    ${p} 3.2s ease-in-out 1s infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,w=a.AH`
  margin: 0;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(2.15rem, 5.5vw, 3.15rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
  color: #f8fafc;
  text-shadow: 0 2px 28px rgba(0, 0, 0, 0.55);
`,v=a.AH`
  margin: 0.25rem 0 0;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #d4af37;
`,k=a.AH`
  margin: 0 0 1rem;
  font-size: clamp(1.45rem, 3.6vw, 2.15rem);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
  animation: ${l} 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,y=a.AH`
  display: block;
  margin-bottom: 0.15rem;
  color: #f7fafc;
  text-shadow: 0 2px 28px rgba(0, 0, 0, 0.55);
`,A=a.AH`
  display: block;
  font-size: 0.94em;
  color: #c9a227;
  text-shadow: 0 2px 22px rgba(0, 0, 0, 0.5);
`,z=a.AH`
  margin: 0 auto 1.5rem;
  max-width: 34rem;
  font-size: clamp(0.98rem, 2vw, 1.1rem);
  line-height: 1.75;
  color: rgba(241, 245, 249, 0.9);
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.45);
  animation: ${l} 1s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,H=a.AH`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.15rem;
  max-width: 100%;
  animation: ${l} 1.05s cubic-bezier(0.16, 1, 0.3, 1) 0.34s both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`,Y=a.AH`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 48px;
  min-width: min(100%, 16rem);
  padding: 0.9rem 1.75rem 1rem;
  color: #f8f4ea !important;
  font-weight: 800;
  font-size: 0.82rem;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  border-radius: 4px;
  border: 1px solid rgba(212, 175, 55, 0.5) !important;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.12) inset,
    0 12px 30px rgba(0, 0, 0, 0.28) !important;
  text-decoration: none !important;
  background-color: #151515 !important;
  background-image:
    linear-gradient(165deg, #2a2a2a 0%, #151515 55%, #0f0f0f 100%),
    linear-gradient(90deg, transparent, #d4af37, transparent) !important;
  background-size: auto, 56% 2px;
  background-position: center, center calc(100% - 7px);
  background-repeat: no-repeat;
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background-size 0.25s ease,
    color 0.25s ease;

  @media (max-width: 480px) {
    width: 100%;
    min-width: 0;
  }

  &:hover,
  &:focus-visible,
  &:visited {
    color: #fff !important;
    border-color: rgba(212, 175, 55, 0.85) !important;
    background-size: auto, 84% 2px;
  }
`,$=a.AH`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0.82rem 1.45rem;
  margin: 0 auto;
  width: auto;
  background: linear-gradient(165deg, #2a6a8f 0%, #1a4d6d 48%, #0c1220 100%);
  color: #fff !important;
  font-weight: 800;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 4px;
  border: 1px solid rgba(255, 230, 180, 0.35);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.22) inset,
    0 10px 28px rgba(0, 0, 0, 0.28);
  text-decoration: none;
  animation: ${l} 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.44s both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
  @media (max-width: 480px) {
    width: 100%;
  }

  &:hover {
    border-color: rgba(248, 231, 160, 0.65);
    background: linear-gradient(165deg, #347a9f 0%, #1f5a7d 48%, #0c1220 100%);
  }
`,D=a.AH`
  margin: 0.85rem 0 0;
  color: #f8fafc;
  font-weight: 800;
  font-size: 1rem;
  line-height: 1.3;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.55);
`,F=()=>{const{site:e}=(0,s.rU)(),[r,t]=(0,i.useState)(!1),a=(0,c.U)("(max-width: 480px)"),l=`tel:${e.phoneTel.replace(/\s/g,"")}`,m=(0,i.useMemo)(()=>"undefined"!=typeof window&&/android|iphone|ipad|ipod|windows phone|mobile/i.test(window.navigator.userAgent),[]);return(0,n.FD)("header",{css:g,role:"banner",children:[(0,n.Y)("img",{src:e.heroAutoImage,alt:"",css:h,loading:"eager"}),(0,n.Y)("div",{css:f,"aria-hidden":!0}),(0,n.Y)("div",{css:u,children:(0,n.FD)("div",{css:b,children:[(0,n.FD)("div",{css:x,children:[(0,n.Y)(d.A,{size:a?52:68}),(0,n.FD)("div",{children:[(0,n.Y)("p",{css:w,children:"NovaDrive"}),(0,n.Y)("p",{css:v,children:"Motors"})]})]}),(0,n.FD)("h1",{css:k,children:[(0,n.Y)("span",{css:y,children:"Válasszon autót"}),(0,n.Y)("span",{css:A,children:"átlátható állapotlappal"})]}),(0,n.Y)("p",{css:z,children:"Válogatott használt autók részletes, autónkénti technikai állapotkövetéssel — hogy nyugodtan döntsön."}),(0,n.FD)("div",{css:H,children:[(0,n.Y)(o.N_,{to:"/kinalat",css:Y,children:"Megnézem a kínálatot"}),(0,n.Y)(o.N_,{to:"/kapcsolat",css:Y,children:"Kapcsolat"})]}),(0,n.Y)("a",{href:l,css:$,onClick:e=>{m||(e.preventDefault(),t(e=>!e))},children:"Hívjon most"}),r&&!m?(0,n.Y)("p",{css:D,children:e.phoneDisplay}):null]})})]})};var j=t(219),N=t(944);const U=()=>{const{cars:e}=(0,s.rU)(),r=(0,i.useMemo)(()=>e.filter(e=>!e.elkelt).slice(0,4),[e]);return(0,n.FD)("article",{css:a.AH`
        background: var(--nd-bg);
        color: var(--nd-text);
      `,children:[(0,n.Y)(F,{}),(0,n.Y)("section",{css:a.AH`
          padding: clamp(2.75rem, 7vw, 4.5rem) 0 clamp(2rem, 5vw, 3rem);
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(26, 77, 109, 0.14), transparent 60%),
            var(--nd-bg);
        `,children:(0,n.FD)("div",{css:a.AH`
            width: 100%;
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 clamp(0.75rem, 3.5vw, 1.35rem);
          `,children:[(0,n.Y)(N.A,{children:(0,n.FD)("div",{css:a.AH`
                display: flex;
                flex-wrap: wrap;
                align-items: end;
                justify-content: space-between;
                gap: 1rem 1.5rem;
                margin-bottom: 1.75rem;
              `,children:[(0,n.FD)("div",{children:[(0,n.Y)("p",{css:a.AH`
                    margin: 0 0 0.45rem;
                    font-size: 0.72rem;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: var(--nd-accent);
                  `,children:"Válogatott kínálat"}),(0,n.Y)("h2",{css:a.AH`
                    margin: 0;
                    font-family: 'Instrument Serif', Georgia, serif;
                    font-size: clamp(1.85rem, 4vw, 2.75rem);
                    font-weight: 400;
                    letter-spacing: -0.03em;
                    color: var(--nd-text);
                  `,children:"Autók, amelyeket érdemes megnézni"})]}),(0,n.Y)(o.N_,{to:"/kinalat",css:a.AH`
                  display: inline-flex;
                  align-items: center;
                  min-height: 44px;
                  padding: 0 1.25rem;
                  border-radius: 6px;
                  border: 1px solid var(--nd-border);
                  color: var(--nd-accent-text) !important;
                  font-size: 0.72rem;
                  font-weight: 800;
                  letter-spacing: 0.12em;
                  text-transform: uppercase;
                  text-decoration: none;
                  &:hover {
                    background: var(--nd-accent-soft);
                  }
                `,children:"Teljes kínálat →"})]})}),(0,n.Y)("div",{css:a.AH`
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
              gap: 1.15rem;
              justify-items: center;
            `,children:r.map((e,r)=>(0,n.Y)(N.A,{delay:90*r,children:(0,n.Y)(j.A,{car:e})},e.id))})]})}),(0,n.Y)("section",{css:a.AH`
          padding: clamp(2rem, 5vw, 3.25rem) 0 clamp(3rem, 7vw, 4.5rem);
        `,children:(0,n.Y)("div",{css:a.AH`
            width: 100%;
            max-width: 1120px;
            margin: 0 auto;
            padding: 0 clamp(0.75rem, 3.5vw, 1.25rem);
          `,children:(0,n.Y)(N.A,{children:(0,n.FD)("div",{css:a.AH`
                border-radius: 22px;
                overflow: hidden;
                border: 1px solid var(--nd-border);
                background: var(--nd-surface);
                box-shadow: var(--nd-shadow);
              `,children:[(0,n.Y)("iframe",{css:a.AH`
                  width: 100%;
                  height: clamp(280px, 50vw, 400px);
                  border: 0;
                  display: block;
                  filter: grayscale(0.35) contrast(1.05);
                `,src:"https://www.google.com/maps?q=Budapest&output=embed",title:"NovaDrive Motors - helyszín demó",loading:"lazy",referrerPolicy:"no-referrer-when-downgrade",allowFullScreen:!0}),(0,n.FD)("p",{css:a.AH`
                  margin: 0;
                  padding: 1rem 1.15rem;
                  text-align: center;
                  font-size: 0.9rem;
                  color: var(--nd-text-muted);
                  a {
                    color: var(--nd-accent);
                    font-weight: 700;
                  }
                `,children:["Demó helyszín: Budapest ·"," ",(0,n.Y)("a",{href:"https://www.google.com/maps/search/?api=1&query=Budapest",target:"_blank",rel:"noopener noreferrer",children:"Térkép megnyitása"})]})]})})})})]})}}}]);