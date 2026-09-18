"use strict";(self.webpackChunknovadrive_katalogus=self.webpackChunknovadrive_katalogus||[]).push([[842],{842(e,r,t){t.r(r),t.d(r,{default:()=>A});var a=t(445),n=t(437),i=t(976),l=t(430),d=t(178);const o=n.AH`
  position: relative;
  background: linear-gradient(165deg, #0f0f10 0%, #1a2230 42%, #0c1220 100%);
  color: var(--nd-text);
  padding: clamp(2.85rem, 8vw, 5rem) 0 clamp(3rem, 7vw, 4.75rem);
  overflow: hidden;

  [data-theme='light'] & {
    background: linear-gradient(165deg, #f7f8fb 0%, #eef2f7 45%, #f4f6f9 100%);
    color: var(--nd-text);
  }
`,s=n.AH`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 55% at 75% -10%, rgba(26, 77, 109, 0.28) 0%, transparent 55%),
    radial-gradient(circle at 10% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 45%);
  pointer-events: none;

  [data-theme='light'] & {
    background:
      radial-gradient(ellipse 80% 55% at 75% -10%, rgba(26, 77, 109, 0.12) 0%, transparent 55%),
      radial-gradient(circle at 10% 80%, rgba(154, 123, 26, 0.08) 0%, transparent 45%);
  }
`,m=n.AH`
  display: grid;
  gap: clamp(1.35rem, 5vw, 2.75rem);
  align-items: start;
  @media (min-width: 940px) {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.15fr);
    gap: 3.25rem;
  }
`,c=n.AH`
  @media (min-width: 940px) {
    position: sticky;
    top: 6rem;
  }
`,p=n.AH`
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: var(--nd-shadow), inset 0 0 0 1px var(--nd-border);
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid rgba(212, 175, 55, 0.35);
    border-radius: inherit;
  }
`,g=n.AH`
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  display: block;
  opacity: 0.92;
  @media (max-width: 939px) {
    aspect-ratio: 16 / 10;
  }
`,h=n.AH`
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.45rem 0.95rem;
  background: rgba(12, 18, 32, 0.78);
  border: 1px solid rgba(212, 175, 55, 0.45);
  color: #f8fafc;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);

  [data-theme='light'] & {
    background: rgba(255, 255, 255, 0.9);
    color: #0c1220;
    border-color: rgba(154, 123, 26, 0.45);
  }
`,f=n.AH`
  margin: 0 0 1rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--nd-accent);
`,v=n.AH`
  margin: 0 0 1.15rem;
  font-size: clamp(1.75rem, 4.2vw, 2.75rem);
  line-height: 1.09;
  font-weight: 500;
  font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  letter-spacing: -0.015em;
  color: var(--nd-text);

  strong {
    font-weight: 800;
    color: var(--nd-text);
    background: linear-gradient(120deg, var(--nd-text) 0%, var(--nd-accent-text) 90%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`,b=n.AH`
  height: 2px;
  width: clamp(72px, 12vw, 120px);
  background: linear-gradient(90deg, var(--nd-accent), var(--nd-navy), var(--nd-accent));
  margin: 0 0 1.35rem;
  border-radius: 2px;
`,k=n.AH`
  margin: 0 0 1.85rem;
  font-size: clamp(0.95rem, 2.9vw, 1.04rem);
  line-height: 1.82;
  color: var(--nd-text-muted);
  max-width: 38rem;
  overflow-wrap: break-word;
`,u=n.AH`
  display: grid;
  gap: 1.1rem;
  margin-bottom: 1.85rem;
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`,x=n.AH`
  padding: 1rem 1.05rem;
  border-radius: 10px;
  background: var(--nd-surface-2);
  border: 1px solid var(--nd-border);

  h3 {
    margin: 0 0 0.4rem;
    font-size: 0.76rem;
    font-weight: 800;
    color: var(--nd-text);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  p {
    margin: 0;
    font-size: 0.86rem;
    line-height: 1.6;
    color: var(--nd-text-muted);
  }
`,z=n.AH`
  display: block;
  font-size: 1.85rem;
  font-weight: 200;
  line-height: 1;
  color: var(--nd-accent);
  opacity: 0.75;
  margin-bottom: 0.65rem;
  font-variant-numeric: tabular-nums;
`,w=n.AH`
  margin: 0;
  padding: clamp(1rem, 3vw, 1.25rem) clamp(1rem, 3vw, 1.35rem);
  border-left: 4px solid var(--nd-navy);
  background: var(--nd-surface-2);
  border-radius: 0 10px 10px 0;
  font-size: 1.05rem;
  font-style: italic;
  font-family: 'Instrument Serif', Georgia, serif;
  line-height: 1.72;
  color: var(--nd-text);

  cite {
    display: block;
    margin-top: 0.95rem;
    font-size: 0.82rem;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--nd-accent);
    font-family: 'DM Sans', sans-serif;
  }
`,y=n.AH`
  color: var(--nd-accent-text) !important;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
  &:hover {
    color: var(--nd-text) !important;
  }
`;function Y({symbol:e}){return(0,a.Y)("div",{css:d.kJ,children:e})}const A=()=>{const{site:e}=(0,l.rU)();return(0,a.FD)("article",{css:n.AH`background:var(--nd-bg);color:var(--nd-text)`,children:[(0,a.FD)("section",{css:o,children:[(0,a.Y)("div",{css:s,"aria-hidden":!0}),(0,a.Y)("div",{css:d.fJ,children:(0,a.FD)("div",{css:m,children:[(0,a.Y)("div",{css:c,children:(0,a.FD)("div",{css:p,children:[(0,a.Y)("img",{src:e.heroAutoImage,alt:"",css:g}),(0,a.Y)("span",{css:h,children:"NovaDrive Motors"})]})}),(0,a.FD)("div",{children:[(0,a.Y)("p",{css:f,children:"Rólunk · prémium használtautó szemlélettel"}),(0,a.FD)("h1",{css:v,children:["Az autó állapota nem rejtély — ",(0,a.Y)("strong",{children:"transzparens adat,"})," tiszta bizalom"]}),(0,a.Y)("div",{css:b}),(0,a.Y)("p",{css:k,children:"A NovaDrive Motors célja, hogy a használt jármű vásárlása ne „vakon” történjen. Minden gépjárműhöz strukturált állapotlap tartozik: gumik állapota, futómű, fékek, olaj‑ és kenőcsere előzmények, vezérlés — hogy ön előre lássa, miben áll ma a technikai tartalom, nemcsak hogy milyen a karosszéria fotón."}),(0,a.FD)("div",{css:u,children:[(0,a.FD)("div",{css:x,children:[(0,a.Y)("span",{css:z,children:"01"}),(0,a.Y)("h3",{children:"Átláthatóság"}),(0,a.Y)("p",{children:"Ugyanaz a szintű dokumentálás és lapstruktúra minden gépen — összehasonlítani is könnyebb."})]}),(0,a.FD)("div",{css:x,children:[(0,a.Y)("span",{css:z,children:"02"}),(0,a.Y)("h3",{children:"Selekció"}),(0,a.Y)("p",{children:"Nem tömeglista: válogatott kínálat, amelyhez igény szerint személyesen is egyeztethet."})]}),(0,a.FD)("div",{css:x,children:[(0,a.Y)("span",{css:z,children:"03"}),(0,a.Y)("h3",{children:"Szakmai fókusz"}),(0,a.Y)("p",{children:"A hangsúly az üzemeltetési és szerelési kockázat előre láthatóságán — nem pusztán a díszletes hirdetésen."})]})]}),(0,a.FD)("blockquote",{css:w,children:["„Nálunk egy adatlap annyit ér, amennyire őszinte: ha valami számon van kérhető és rögzítve van, azt közöljük is.”",(0,a.Y)("cite",{children:"— NovaDrive Motors filozófiája"})]})]})]})})]}),(0,a.Y)("section",{css:d.N9,children:(0,a.FD)("div",{css:d.cr,children:[(0,a.Y)("h2",{css:d.Sz,children:"Mit kapsz nálunk"}),(0,a.FD)("div",{css:d.iY,children:[(0,a.FD)("article",{css:d.Ac,children:[(0,a.Y)(Y,{symbol:(0,a.Y)("span",{css:d.Vq,children:"◆"})}),(0,a.Y)("h3",{children:"Részletes állapotlap"}),(0,a.Y)("p",{children:"Gumik állapota (darabonként), futómű, fékek, olaj‑, szűrő‑ és vezérlés kapcsán rögzített adatok — dátumokkal és rövid szakmai megjegyzésekkel, ahol indokolt."})]}),(0,a.FD)("article",{css:d.Ac,children:[(0,a.Y)(Y,{symbol:(0,a.Y)("span",{css:d.Vq,children:"€"})}),(0,a.Y)("h3",{children:"Árak és állapot egy helyen"}),(0,a.Y)("p",{children:"Nem kell három böngésző fül között vadászni: vételár, km, üzemanyag és állapotkövető adat egy felületen, nyomtatásra és megtekintésre előkészítve."})]})]})]})}),(0,a.Y)("section",{css:d.EB,children:(0,a.FD)("div",{css:d.cr,children:[(0,a.Y)("h2",{css:d.wc,children:"Három lépésben a megfelelő járműhöz"}),(0,a.Y)("p",{css:d.O6,children:"Böngésszen strukturált állapotinformációk alapján, majd egyeztessen megtekintést személyesen."}),(0,a.FD)("ol",{css:d.cF,children:[(0,a.FD)("li",{css:d.iq,children:[(0,a.Y)("span",{css:d.pK,children:"1"}),(0,a.Y)("h3",{children:"Kínálat böngészése"}),(0,a.FD)("p",{children:["A"," ",(0,a.Y)(i.N_,{to:"/kinalat",css:y,children:"Kínálatunk"})," ","oldalon szűrhet márka, modell és üzemeltetési adat szerint; minden autóhoz részletes adatlap tartozik."]})]}),(0,a.FD)("li",{css:d.iq,children:[(0,a.Y)("span",{css:d.pK,children:"2"}),(0,a.Y)("h3",{children:"Állapotlap áttekintése"}),(0,a.Y)("p",{children:"Szervizmúlt szerinti adatnézet — előre tájékozottan hívjon, kevesebb ismeretlen."})]}),(0,a.FD)("li",{css:d.iq,children:[(0,a.Y)("span",{css:d.pK,children:"3"}),(0,a.Y)("h3",{children:"Időpont és megtekintés"}),(0,a.FD)("p",{children:["A"," ",(0,a.Y)(i.N_,{to:"/kapcsolat",css:y,children:"Kapcsolat"})," ","oldalon elérhetőségeinken egyeztetünk egy mindkét félnek kényelmes időablakot."]})]})]})]})}),(0,a.Y)("section",{css:d.xM,children:(0,a.FD)("div",{css:d.cr,children:[(0,a.Y)("h2",{css:d.Kx,children:"Miért válasszon minket?"}),(0,a.Y)("ul",{css:d.f$,children:["Strukturált állapotkövetés – nem véletlen mondatok tömege egy képernyőn.","Prémium, letisztult felület: az autó kapja a középpontot, nem a zaj.","Rugalmas előzetes tájékozódás és egyeztetés – kiszámítható lépésekkel.","Hosszú távú bizalom építése: ami rögzítve van papíron, annak látszania kell személyesen is."].map(e=>(0,a.Y)("li",{children:e},e))})]})})]})}},178(e,r,t){t.d(r,{Ac:()=>h,EB:()=>o,Kx:()=>s,N9:()=>d,O6:()=>p,Sz:()=>m,Vq:()=>v,cF:()=>b,cr:()=>n,f$:()=>x,fJ:()=>i,iY:()=>g,iq:()=>k,kJ:()=>f,p$:()=>z,pK:()=>u,wc:()=>c,xM:()=>l});var a=t(437);a.AH`
  padding-left: clamp(0.65rem, 3.5vw, 1.25rem);
  padding-right: clamp(0.65rem, 3.5vw, 1.25rem);
`;const n=a.AH`
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  min-width: 0;
  padding-left: clamp(0.65rem, 3.5vw, 1.25rem);
  padding-right: clamp(0.65rem, 3.5vw, 1.25rem);
`,i=a.AH`
  box-sizing: border-box;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  min-width: 0;
  padding-left: clamp(0.65rem, 3.5vw, 1.25rem);
  padding-right: clamp(0.65rem, 3.5vw, 1.25rem);
  position: relative;
  z-index: 1;
`,l=a.AH`
  background: var(--nd-bg);
  padding: clamp(2.25rem, 5vw, 3.5rem) 0;
`,d=a.AH`
  background: var(--nd-bg-elevated);
  padding: clamp(2.25rem, 5vw, 3.5rem) 0;
  border-top: 1px solid var(--nd-border);
  border-bottom: 1px solid var(--nd-border);
`,o=a.AH`
  background: linear-gradient(135deg, #0e1520 0%, #070b12 100%);
  color: #f8fafc;
  padding: clamp(2.5rem, 5vw, 3.75rem) 0;

  [data-theme='light'] & {
    background: linear-gradient(135deg, #1a4d6d 0%, #0c1220 100%);
    color: #f8fafc;
  }
`,s=a.AH`
  margin: 0 0 1rem;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--nd-text);
`,m=a.AH`
  margin: 0 0 0.85rem;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(1.35rem, 2.8vw, 1.85rem);
  font-weight: 400;
  color: var(--nd-text);
`,c=a.AH`
  margin: 0 0 0.5rem;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 400;
  text-align: center;
  color: #f8fafc;
`,p=a.AH`
  margin: 0 auto clamp(1.35rem, 5vw, 2rem);
  max-width: min(36rem, 100%);
  padding: 0 0.15rem;
  text-align: center;
  color: rgba(248, 250, 252, 0.72);
  line-height: 1.65;
  font-size: clamp(0.9rem, 2.5vw, 0.98rem);
  overflow-wrap: break-word;
`,g=a.AH`
  display: grid;
  gap: clamp(1rem, 3vw, 1.35rem);
  margin-top: 1.35rem;
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`,h=a.AH`
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
`,f=a.AH`
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
`,v=a.AH`
  line-height: 1;
  font-size: 1.1rem;
`,b=a.AH`
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
`,k=a.AH`
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
`,u=a.AH`
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
`,x=a.AH`
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
`,z=a.AH`
  text-align: center;
  padding: 2.75rem 1rem;
  color: var(--nd-text-muted);
  background: var(--nd-surface-2);
  border: 1px dashed var(--nd-border);
  border-radius: 14px;
`;a.AH`
  background: var(--nd-surface-2);
  border: 1px solid var(--nd-border);
  border-radius: 18px;
  padding: clamp(1.15rem, 2.5vw, 1.65rem);
`}}]);