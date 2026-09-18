(()=>{"use strict";var e,t,r,a,n,o={436(e,t,r){r.d(t,{E_:()=>d,qe:()=>l,sn:()=>s});var a=r(867),n=r(712);async function o(e){const t=await fetch(`${e}`,{headers:{Accept:"application/json"},credentials:"same-origin"});if(!t.ok)throw new Error(`API hiba (${t.status}): ${e}`);return t.json()}function i(e){return{...e,elkelt:Boolean(e.elkelt),detailedData:(0,n.CV)(e.detailedData,e),conditionSheet:(0,a.yP)(e.conditionSheet,e)}}async function s(){return((await o("/api/cars.php")).cars??[]).map(i)}async function l(){return(await o("/api/site.php")).site}async function d(){try{const e=await fetch("/admin/session.php",{headers:{Accept:"application/json"},credentials:"same-origin"});if(!e.ok)return{loggedIn:!1};const t=await e.json();return{loggedIn:Boolean(t.loggedIn),username:t.username,expiresAt:"number"==typeof t.expiresAt?t.expiresAt:void 0,idleSeconds:"number"==typeof t.idleSeconds?t.idleSeconds:void 0}}catch{return{loggedIn:!1}}}},317(e,t,r){r.d(t,{A:()=>i});var a=r(445),n=r(540),o=r(437);const i=({size:e=44,className:t,title:r="NovaDrive Motors"})=>{const i=n.useId().replace(/:/g,""),s=`ndBg-${i}`,l=`ndGold-${i}`;return(0,a.FD)("svg",{className:t,width:e,height:e,viewBox:"0 0 64 64",role:"img","aria-label":r,css:o.AH`
        display: block;
        flex-shrink: 0;
        border-radius: 14px;
        box-shadow: 0 8px 24px rgba(6, 10, 18, 0.35);
      `,children:[(0,a.FD)("defs",{children:[(0,a.FD)("linearGradient",{id:s,x1:"8",y1:"4",x2:"56",y2:"60",gradientUnits:"userSpaceOnUse",children:[(0,a.Y)("stop",{stopColor:"#0a1220"}),(0,a.Y)("stop",{offset:"0.55",stopColor:"#163a52"}),(0,a.Y)("stop",{offset:"1",stopColor:"#0c1a28"})]}),(0,a.FD)("linearGradient",{id:l,x1:"14",y1:"12",x2:"50",y2:"52",gradientUnits:"userSpaceOnUse",children:[(0,a.Y)("stop",{stopColor:"#f0e2b0"}),(0,a.Y)("stop",{offset:"0.45",stopColor:"#d4af37"}),(0,a.Y)("stop",{offset:"1",stopColor:"#9a7b1a"})]})]}),(0,a.Y)("rect",{width:"64",height:"64",rx:"14",fill:`url(#${s})`}),(0,a.Y)("rect",{x:"2.25",y:"2.25",width:"59.5",height:"59.5",rx:"12.5",fill:"none",stroke:`url(#${l})`,strokeWidth:"1.4",opacity:"0.9"}),(0,a.Y)("text",{x:"32",y:"34",textAnchor:"middle",dominantBaseline:"central",fill:`url(#${l})`,fontFamily:"'DM Sans', 'Segoe UI', system-ui, sans-serif",fontSize:"26",fontWeight:"800",letterSpacing:"-1.2",children:"ND"})]})}},430(e,t,r){r.d(t,{hh:()=>h,rU:()=>p});var a=r(445),n=r(540),o=(r(436),r(150)),i=r(784),s=r(867),l=r(712);const d="novadrive-app-cars",m="novadrive-app-site",c={logoUrl:(0,i.V)("/pictures/logo.svg"),heroAutoImage:(0,i.V)("/pictures/kep1.png"),phoneTel:"+36123456789",phoneDisplay:"+36 1 234 5678",openingHoursShort:"Hétfő – Péntek 09:00 – 18:00 · Szombat 09:00 – 13:00",openingHoursLong:"Hétfő – Péntek: 09:00 – 18:00\nSzombat: 09:00 – 13:00\nVasárnap: Zárva",facebookUrl:"https://www.facebook.com/",contactEmail:"info@novadrive.hu",contactAddressDisplay:"Budapest · megtekintés előzetes időpont egyeztetéssel (demó)",contactMapLatitude:47.4979,contactMapLongitude:19.0402,contactMapSearchQuery:"Budapest"};function u(){return o.Au.map(e=>({...e,detailedData:(0,l.CV)(e.detailedData,e),conditionSheet:(0,s.yP)(e.conditionSheet,e)}))}const g=(0,n.createContext)(null),h=({children:e})=>{const[t,r]=(0,n.useState)([]),[i,h]=(0,n.useState)(c),[p,f]=(0,n.useState)(!0),[k,b]=(0,n.useState)(null),[v,y]=(0,n.useState)("local"),[z,C]=(0,n.useState)(!1),w=(0,n.useCallback)(async()=>(f(!0),b(null),r(function(){try{const e=localStorage.getItem(d);if(null===e)return u();const t=JSON.parse(e);return Array.isArray(t)?(0,o.V8)(t.map(e=>({...e,elkelt:Boolean(e.elkelt),detailedData:(0,l.CV)(e.detailedData,e),conditionSheet:(0,s.yP)(e.conditionSheet,e)}))):u()}catch{return u()}}()),h(function(){try{const e=localStorage.getItem(m);if(null===e)return{...c};const t=JSON.parse(e);return{...c,...t}}catch{return{...c}}}()),y("local"),f(!1),void C(!0)),[]);(0,n.useEffect)(()=>{w()},[w]),(0,n.useEffect)(()=>{z&&function(e){try{localStorage.setItem(d,JSON.stringify(e))}catch{}}(t)},[t,z,v]),(0,n.useEffect)(()=>{z&&function(e){try{localStorage.setItem(m,JSON.stringify(e))}catch{}}(i)},[i,z,v]);const x=(0,n.useCallback)(e=>{h(t=>({...t,...e}))},[]),D=(0,n.useCallback)(e=>{h(e)},[]),M=(0,n.useMemo)(()=>({cars:t,setCars:r,site:i,updateSite:x,replaceSite:D,isLoading:p,loadError:k,dataSource:v,refreshFromApi:w}),[t,i,x,D,p,k,v,w]);return(0,a.Y)(g.Provider,{value:M,children:e})};function p(){const e=(0,n.useContext)(g);if(!e)throw new Error("useSiteData must be used within SiteDataProvider");return e}},150(e,t,r){r.d(t,{Au:()=>l,V8:()=>d,ZA:()=>o});var a=r(712),n=r(784);const o="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e0e0e0' width='400' height='300'/%3E%3Ctext x='200' y='150' font-family='Arial,sans-serif' font-size='18' fill='%23666' text-anchor='middle' dominant-baseline='middle'%3EAut%C3%B3 k%C3%A9p%3C/text%3E%3C/svg%3E",i={corolla:(0,n.V)("/pictures/toyota-corolla.jpg"),golf:(0,n.V)("/pictures/vw-golf.jpg"),bmw320d:(0,n.V)("/pictures/bmw-320d.jpg"),vitara:(0,n.V)("/pictures/suzuki-vitara.jpg")},s=e=>[e,`${e}?v=2`,`${e}?v=3`],l=[{id:"1",marka:"Toyota",modell:"Corolla",evjarat:2020,ar:485e4,futottKm:45e3,uzemanyag:"Hibrid",valto:"Automatikus",leiras:"Magyarországi, vezetett szerviztörténetű Toyota Corolla hibrid hajtással, alacsony fogyasztással és rendezett belső térrel.",kepUrl:i.corolla,imageUrls:s(i.corolla),elkelt:!1,detailedData:(0,a.ax)({id:"1",marka:"Toyota",modell:"Corolla",uzemanyag:"Hibrid",valto:"Automatikus"}),conditionSheet:{tires:{frontLeft:{status:"Jó",treadDepthMm:"6,2",dotNumber:"DOT1125",lastChanged:"2026-11-12",note:"Michelin nyári gumi, egyenletes kopás"},frontRight:{status:"Jó",treadDepthMm:"6,1",dotNumber:"DOT1125",lastChanged:"2026-11-12",note:"Michelin nyári gumi, egyenletes kopás"},rearLeft:{status:"Kiváló",treadDepthMm:"6,8",dotNumber:"DOT3325",lastChanged:"2026-11-12",note:"Hátsó tengelyen frissebb mintázat"},rearRight:{status:"Kiváló",treadDepthMm:"6,7",dotNumber:"DOT3325",lastChanged:"2026-11-12",note:"Hátsó tengelyen frissebb mintázat"}},suspension:{status:"Jó",lastChanged:"2026-02-18",note:"Átvizsgálva, kopogásmentes futómű"},brakes:{status:"Jó",lastChanged:"2026-02-18",note:"Első fékbetétek kb. 70%-os állapotban"},oilChange:{status:"Kiváló",lastChanged:"2026-01-20",note:"0W-20 motorolaj és szűrők cserélve"},timingService:{status:"Kiváló",lastChanged:"2026-01-20",note:"Láncos vezérlés, rendellenes zaj nincs"},brakeFluid:{status:"Jó",lastChanged:"2026-07-05",note:"Fékolaj csere igazolt"}}},{id:"2",marka:"Volkswagen",modell:"Golf",evjarat:2019,ar:425e4,futottKm:72e3,uzemanyag:"Dízel",valto:"Manuális",leiras:"Takarékos 1.6 TDI Golf, rendezett karosszériával, digitális szerviztörténettel és kényelmes Comfortline felszereltséggel.",kepUrl:i.golf,imageUrls:s(i.golf),elkelt:!1,detailedData:(0,a.ax)({id:"2",marka:"Volkswagen",modell:"Golf",uzemanyag:"Dízel",valto:"Manuális"}),conditionSheet:{tires:{frontLeft:{status:"Megfelelő",treadDepthMm:"4,7",dotNumber:"DOT4523",lastChanged:"2026-10-03",note:"Continental nyári gumi, még használható"},frontRight:{status:"Megfelelő",treadDepthMm:"4,6",dotNumber:"DOT4523",lastChanged:"2026-10-03",note:"Continental nyári gumi, még használható"},rearLeft:{status:"Jó",treadDepthMm:"5,4",dotNumber:"DOT0624",lastChanged:"2026-10-03",note:"Egyenletes kopáskép"},rearRight:{status:"Jó",treadDepthMm:"5,3",dotNumber:"DOT0624",lastChanged:"2026-10-03",note:"Egyenletes kopáskép"}},suspension:{status:"Jó",lastChanged:"2026-03-08",note:"Lengéscsillapítók és szilentek normál állapotban"},brakes:{status:"Megfelelő",lastChanged:"2026-09-16",note:"Hátsó fékbetétek középtávon cserések lehetnek"},oilChange:{status:"Kiváló",lastChanged:"2026-02-04",note:"5W-30 olaj, olajszűrő, levegőszűrő cserélve"},timingService:{status:"Jó",lastChanged:"2026-11-21",note:"Vezérműszíj és vízpumpa cserélve 61 000 km-nél"},brakeFluid:{status:"Jó",lastChanged:"2026-09-16",note:"Fékolaj forráspont ellenőrizve, érték rendben"}}},{id:"3",marka:"BMW",modell:"320d",evjarat:2021,ar:895e4,futottKm:28e3,uzemanyag:"Dízel",valto:"Automatikus",leiras:"G20-as BMW 320d automata váltóval, prémium felszereltséggel, alacsony futásteljesítménnyel és végig dokumentált előélettel.",kepUrl:i.bmw320d,imageUrls:s(i.bmw320d),elkelt:!1,detailedData:(0,a.ax)({id:"3",marka:"BMW",modell:"320d",uzemanyag:"Dízel",valto:"Automatikus"}),conditionSheet:{tires:{frontLeft:{status:"Kiváló",treadDepthMm:"7,0",dotNumber:"DOT1925",lastChanged:"2026-10-24",note:"Pirelli prémium nyári gumi"},frontRight:{status:"Kiváló",treadDepthMm:"7,0",dotNumber:"DOT1925",lastChanged:"2026-10-24",note:"Pirelli prémium nyári gumi"},rearLeft:{status:"Kiváló",treadDepthMm:"6,8",dotNumber:"DOT1725",lastChanged:"2026-10-24",note:"Pirelli prémium nyári gumi"},rearRight:{status:"Kiváló",treadDepthMm:"6,8",dotNumber:"DOT1725",lastChanged:"2026-10-24",note:"Pirelli prémium nyári gumi"}},suspension:{status:"Kiváló",lastChanged:"2026-01-30",note:"Futómű diagnosztika hibamentes"},brakes:{status:"Jó",lastChanged:"2026-01-30",note:"Gyári féktárcsák, betétek kb. 75%-os állapotban"},oilChange:{status:"Kiváló",lastChanged:"2026-01-30",note:"BMW Longlife-04 olaj és szűrők cserélve"},timingService:{status:"Kiváló",lastChanged:"2026-01-30",note:"Láncos vezérlés, diagnosztika szerint rendben"},brakeFluid:{status:"Kiváló",lastChanged:"2026-01-30",note:"Fékolaj csere elvégezve"}}},{id:"4",marka:"Suzuki",modell:"Vitara",evjarat:2018,ar:365e4,futottKm:95e3,uzemanyag:"Benzin",valto:"Manuális",leiras:"Megbízható, szívó benzines Suzuki Vitara GL+ felszereltséggel, kedvező fenntartással és praktikus SUV karosszériával.",kepUrl:i.vitara,imageUrls:s(i.vitara),elkelt:!1,detailedData:(0,a.ax)({id:"4",marka:"Suzuki",modell:"Vitara",uzemanyag:"Benzin",valto:"Manuális"}),conditionSheet:{tires:{frontLeft:{status:"Jó",treadDepthMm:"5,8",dotNumber:"DOT4024",lastChanged:"2026-04-09",note:"Négyévszakos gumi, normál kopás"},frontRight:{status:"Jó",treadDepthMm:"5,7",dotNumber:"DOT4024",lastChanged:"2026-04-09",note:"Négyévszakos gumi, normál kopás"},rearLeft:{status:"Jó",treadDepthMm:"6,0",dotNumber:"DOT1225",lastChanged:"2026-04-09",note:"Négyévszakos gumi, normál kopás"},rearRight:{status:"Jó",treadDepthMm:"5,9",dotNumber:"DOT1225",lastChanged:"2026-04-09",note:"Négyévszakos gumi, normál kopás"}},suspension:{status:"Megfelelő",lastChanged:"2026-03-22",note:"Jobb első stabilizátor pálca cserélve, futómű beállítva"},brakes:{status:"Jó",lastChanged:"2026-12-02",note:"Első fékbetétek cserélve"},oilChange:{status:"Kiváló",lastChanged:"2026-03-22",note:"5W-30 olaj és szűrők cserélve"},timingService:{status:"Kiváló",lastChanged:"2026-03-22",note:"Láncos vezérlés, ellenőrzés alapján rendben"},brakeFluid:{status:"Jó",lastChanged:"2026-12-02",note:"Fékolaj csere igazolt"}}}];function d(e){const t=new Map(l.map(e=>[e.id,e]));return e.map(e=>{const r=t.get(e.id);if(!r)return e;const a=(e.kepUrl??"").trim(),n=Array.isArray(e.imageUrls)&&e.imageUrls.some(e=>""!==e.trim());return""===a||a===o||function(e){if(!e.startsWith("data:image/svg+xml"))return!1;const t=e.indexOf(",");if(-1===t)return!1;try{return decodeURIComponent(e.slice(t+1)).includes("Autó kép")}catch{return!1}}(a)?{...e,kepUrl:r.kepUrl,imageUrls:n?e.imageUrls:r.imageUrls}:n?e:{...e,imageUrls:r.imageUrls}})}},504(e,t,r){r.d(t,{U:()=>n});var a=r(540);function n(e){const[t,r]=(0,a.useState)(()=>"undefined"!=typeof window&&window.matchMedia(e).matches);return(0,a.useEffect)(()=>{const t=window.matchMedia(e),a=()=>r(t.matches);return a(),t.addEventListener("change",a),()=>t.removeEventListener("change",a)},[e]),t}},960(e,t,r){var a=r(445),n=r(540),o=r(338),i=r(976),s=r(437),l=r(767),d=r(430),m=r(504),c=(r(436),r(317));const u=(0,n.createContext)(null),g="novadrive-theme";function h(){if("undefined"==typeof window)return"dark";try{const e=localStorage.getItem(g);if("light"===e||"dark"===e)return e}catch{}return"dark"}const p=({children:e})=>{const[t,r]=(0,n.useState)(h);(0,n.useEffect)(()=>{document.documentElement.setAttribute("data-theme",t);try{localStorage.setItem(g,t)}catch{}},[t]);const o=(0,n.useCallback)(e=>{r(e)},[]),i=(0,n.useCallback)(()=>{r(e=>"dark"===e?"light":"dark")},[]),s=(0,n.useMemo)(()=>({theme:t,toggleTheme:i,setTheme:o}),[t,i,o]);return(0,a.Y)(u.Provider,{value:s,children:e})},f=()=>{const{theme:e,toggleTheme:t}=function(){const e=(0,n.useContext)(u);if(!e)throw new Error("useTheme must be used within ThemeProvider");return e}(),r="dark"===e;return(0,a.Y)("button",{type:"button",onClick:t,"aria-label":r?"Világos mód":"Sötét mód",title:r?"Világos mód":"Sötét mód",css:s.AH`
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        padding: 0;
        border-radius: 10px;
        border: 1px solid var(--nd-border);
        background: var(--nd-surface-2);
        color: var(--nd-accent);
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s, color 0.2s;
        flex-shrink: 0;

        &:hover {
          border-color: var(--nd-accent);
          background: var(--nd-accent-soft);
        }
      `,children:r?(0,a.FD)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none","aria-hidden":!0,children:[(0,a.Y)("circle",{cx:"12",cy:"12",r:"4.25",stroke:"currentColor",strokeWidth:"1.75"}),(0,a.Y)("path",{d:"M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.05 5.05l1.55 1.55M17.4 17.4l1.55 1.55M5.05 18.95l1.55-1.55M17.4 6.6l1.55-1.55",stroke:"currentColor",strokeWidth:"1.75",strokeLinecap:"round"})]}):(0,a.Y)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none","aria-hidden":!0,children:(0,a.Y)("path",{d:"M20.2 13.35A7.75 7.75 0 0 1 10.65 3.8 8.5 8.5 0 1 0 20.2 13.35Z",stroke:"currentColor",strokeWidth:"1.75",strokeLinejoin:"round"})})})},k=(0,n.lazy)(()=>r.e(676).then(r.bind(r,676))),b=(0,n.lazy)(()=>r.e(842).then(r.bind(r,842))),v=(0,n.lazy)(()=>r.e(685).then(r.bind(r,685))),y=(0,n.lazy)(()=>r.e(163).then(r.bind(r,163))),z=(0,n.lazy)(()=>r.e(688).then(r.bind(r,688))),C=(0,n.lazy)(()=>r.e(516).then(r.bind(r,516))),w=(s.AH`
  margin-left: 0.45rem;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  color: var(--nd-accent);
  letter-spacing: 0.04em;
`,(0,a.Y)("div",{css:s.AH`
      min-height: 50vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--nd-text-muted);
      font-size: 0.95rem;
      background: var(--nd-bg);
    `,children:"Betöltés…"})),x=s.AH`
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-width: 0;
  padding: 0.6rem clamp(0.6rem, 3.5vw, 1rem) 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  min-width: 0;
`,D=s.AH`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem clamp(0.35rem, 3vw, 1.25rem);
  width: 100%;
  min-width: 0;
`,M=s.AH`
  color: var(--nd-text-muted);
  padding: 0.52rem min(1rem, 3.5vw);
  text-decoration: none;
  font-weight: 700;
  font-size: clamp(0.62rem, 1.95vw, 0.72rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  min-height: 40px;
  line-height: 1.25;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--nd-accent-text);
  }

  &[aria-current='page'] {
    color: var(--nd-accent-text);
    background: var(--nd-accent-soft);
  }
`,S=s.AH`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.2rem 0.35rem;
  justify-content: flex-end;
  min-width: 0;
`,j=s.AH`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.5rem 0.72rem;
  min-height: 44px;
  min-width: 44px;
  border: 1px solid var(--nd-border);
  border-radius: 10px;
  background: var(--nd-surface-2);
  cursor: pointer;
  font-weight: 700;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--nd-text);

  &:hover {
    border-color: var(--nd-accent);
    color: var(--nd-accent-text);
  }
  flex-shrink: 0;
`,A=s.AH`
  width: 100%;
  padding: 0.65rem 0 0;
  margin-top: 0.65rem;
  border-top: 1px solid var(--nd-border);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  align-items: stretch;
  box-sizing: border-box;
  min-width: 0;

  > a,
  > button {
    width: 100%;
    justify-content: flex-start;
    padding: 0.65rem 0.85rem;
    font-size: 0.74rem;
    box-sizing: border-box;
  }
`,E=s.AH`
  display: flex;
  align-items: center;
  gap: clamp(8px, 2vw, 12px);
  color: var(--nd-text);
  text-decoration: none;
  min-width: 0;
  flex: 1 1 auto;
  max-width: 100%;

  span {
    font-size: clamp(0.92rem, 3.5vw, 1.2rem);
    font-weight: 800;
    letter-spacing: 0.14em;
    color: var(--nd-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  small {
    display: block;
    margin-top: 0.1rem;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    font-weight: 600;
    color: var(--nd-accent);
    text-transform: uppercase;
  }
`,O=s.AH`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.55rem 0 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  flex-wrap: wrap;
`,T=s.AH`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,N=s.AH`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  &:hover {
    opacity: 0.92;
  }
`,F=({onNavigate:e,adminLoggedIn:t,adminCountdown:r})=>(0,a.FD)(a.FK,{children:[(0,a.Y)(i.k2,{end:!0,to:"/rolunk",css:M,onClick:e,children:"Rólunk"}),(0,a.Y)(i.k2,{end:!0,to:"/kinalat",css:M,onClick:e,children:"Kínálatunk"}),(0,a.Y)(i.k2,{end:!0,to:"/kapcsolat",css:M,onClick:e,children:"Kapcsolat"}),(0,a.Y)(i.k2,{end:!0,to:"/admin",css:M,onClick:e,children:"Admin"})]}),Y=({facebookUrl:e})=>(0,a.Y)("div",{css:T,children:(0,a.Y)("a",{href:e,target:"_blank",rel:"noopener noreferrer",css:s.AH`
          ${N};
          background: #1877f2;
          color: #fff;
          text-decoration: none;
        `,"aria-label":"Facebook",children:(0,a.Y)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":!0,children:(0,a.Y)("path",{d:"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"})})})}),L=()=>{const e=(0,l.zy)(),{site:t}=(0,d.rU)(),r=(0,m.U)("(max-width: 1100px)"),[o,u]=(0,n.useState)(!1),[g,h]=(0,n.useState)(!1),[p,M]=(0,n.useState)(null),[T,N]=(0,n.useState)("");(0,n.useEffect)(()=>{u(!1)},[e.pathname]),(0,n.useEffect)(()=>{},[e.pathname]),(0,n.useEffect)(()=>{},[g]),(0,n.useEffect)(()=>{N("")},[g,p]);const L=!e.pathname.startsWith("/admin");return(0,a.FD)(a.FK,{children:[(0,a.Y)("a",{href:"#main-content",css:s.AH`position:absolute;top:-100px;left:1rem;padding:0.75rem;background:#1a4d6d;color:#fff;border-radius:8px;z-index:10001`,children:"Ugrás a tartalomra"}),(0,a.FD)("header",{css:s.AH`
          background: var(--nd-header);
          color: var(--nd-text);
          backdrop-filter: blur(18px) saturate(1.2);
          -webkit-backdrop-filter: blur(18px) saturate(1.2);
          border-bottom: 1px solid var(--nd-border);
          position: sticky;
          top: 0;
          z-index: 100;
        `,role:"banner",children:[(0,a.Y)("div",{css:s.AH`
            background: linear-gradient(90deg, var(--nd-accent-soft), transparent 40%, transparent 60%, rgba(26, 77, 109, 0.18));
            border-bottom: 1px solid var(--nd-border);
            color: var(--nd-text-muted);
          `,children:(0,a.FD)("div",{css:s.AH`
              box-sizing: border-box;
              width: 100%;
              max-width: 1240px;
              margin: 0 auto;
              min-width: 0;
              padding: 0.4rem clamp(0.65rem, 3.5vw, 1.25rem);
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: clamp(0.75rem, 4vw, 2rem);
              flex-wrap: wrap;
              font-size: clamp(0.7rem, 2vw, 0.78rem);
              letter-spacing: 0.04em;
              line-height: 1.45;
            `,children:[(0,a.Y)("span",{children:t.openingHoursShort}),(0,a.Y)("a",{href:`tel:${t.phoneTel.replace(/\s/g,"")}`,css:s.AH`
                font-weight: 700;
                color: var(--nd-accent-text) !important;
                text-decoration: none;
                word-break: break-all;
                &:hover {
                  color: var(--nd-text) !important;
                }
              `,children:t.phoneDisplay})]})}),(0,a.FD)("nav",{css:x,"aria-label":"Fő navigáció",children:[(0,a.FD)("div",{css:D,children:[(0,a.FD)(i.k2,{to:"/",css:E,onClick:()=>u(!1),children:[(0,a.Y)(c.A,{size:44}),(0,a.FD)("span",{children:["NOVADRIVE",(0,a.Y)("small",{children:"Motors"})]})]}),!r&&(0,a.FD)("div",{css:S,children:[(0,a.Y)(F,{adminLoggedIn:g,adminCountdown:T}),(0,a.Y)(f,{}),(0,a.Y)(Y,{facebookUrl:t.facebookUrl})]}),r?(0,a.FD)("div",{css:s.AH`display:flex;align-items:center;gap:0.45rem;flex-shrink:0`,children:[(0,a.Y)(f,{}),(0,a.FD)("button",{type:"button",css:j,"aria-expanded":o,"aria-controls":"main-nav-drawer",onClick:()=>u(e=>!e),children:[(0,a.Y)("span",{"aria-hidden":!0,children:"☰"}),(0,a.Y)("span",{children:"Menü"})]})]}):null]}),r&&o?(0,a.FD)("div",{id:"main-nav-drawer",css:A,children:[(0,a.Y)(F,{adminLoggedIn:g,adminCountdown:T,onNavigate:()=>u(!1)}),(0,a.Y)("div",{css:O,children:(0,a.Y)(Y,{facebookUrl:t.facebookUrl})})]}):null]}),L&&(0,a.Y)("div",{"aria-hidden":!0,css:s.AH`
              height: 3px;
              background: linear-gradient(90deg, #0c1220 0%, #1a4d6d 55%, #c9a227 100%);
            `})]}),(0,a.Y)("main",{id:"main-content",css:s.AH`
          min-height: calc(100vh - 72px);
          background: var(--nd-bg);
          width: 100%;
          overflow-x: clip;
        `,role:"main",children:(0,a.Y)(n.Suspense,{fallback:w,children:(0,a.FD)(l.BV,{children:[(0,a.Y)(l.qh,{path:"/",element:(0,a.Y)(k,{})}),(0,a.Y)(l.qh,{path:"/rolunk",element:(0,a.Y)(b,{})}),(0,a.Y)(l.qh,{path:"/kinalat",element:(0,a.Y)(v,{})}),(0,a.Y)(l.qh,{path:"/kapcsolat",element:(0,a.Y)(y,{})}),(0,a.Y)(l.qh,{path:"/autok/:id",element:(0,a.Y)(z,{})}),(0,a.Y)(l.qh,{path:"/admin/*",element:(0,a.Y)(C,{})})]})})}),(0,a.FD)("footer",{css:s.AH`
          background: var(--nd-bg-elevated);
          color: var(--nd-text);
          padding: clamp(1.75rem, 5vw, 2.75rem) clamp(0.65rem, 3.5vw, 1rem) clamp(1.35rem, 4vw, 2rem);
          border-top: 1px solid var(--nd-border);
        `,role:"contentinfo",children:[(0,a.FD)("div",{css:s.AH`
            box-sizing: border-box;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            min-width: 0;
            display: grid;
            gap: clamp(1.25rem, 4vw, 1.85rem);
            grid-template-columns: 1fr;
            @media (min-width: 760px) {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          `,children:[(0,a.FD)("div",{children:[(0,a.Y)("h2",{css:s.AH`margin:0 0 0.55rem;font-size:1.1rem;color:#fff;font-weight:900;letter-spacing:0.06em`,children:"NovaDrive Motors"}),(0,a.Y)("p",{css:s.AH`margin:0;line-height:1.65;color:#b3b3b3;font-size:0.93rem`,children:"Prémium transzparencia használt autó választáshoz. Részletes állapotlapok, egyenes kommunikáció."})]}),(0,a.FD)("div",{children:[(0,a.Y)("h3",{css:s.AH`margin:0 0 0.55rem;font-size:0.78rem;color:#c9a227;text-transform:uppercase;letter-spacing:0.12em;font-weight:800`,children:"Kapcsolat"}),(0,a.Y)("p",{css:s.AH`margin:0 0 0.35rem;overflow-wrap:break-word`,children:(0,a.Y)("a",{href:`tel:${t.phoneTel.replace(/\s/g,"")}`,css:s.AH`
                  color: #fff;
                  font-weight: 800;
                  font-size: 1.05rem;
                  word-break: break-word;
                  &:hover {
                    color: #ffeebb;
                  }
                `,children:t.phoneDisplay})}),t.contactEmail.trim()?(0,a.Y)("p",{css:s.AH`margin:0.35rem 0 0;font-size:0.88rem;overflow-wrap:anywhere`,children:(0,a.Y)("a",{href:`mailto:${t.contactEmail.trim()}`,css:s.AH`color:#d1cfc9;text-decoration:underline`,children:t.contactEmail.trim()})}):null,(0,a.Y)("p",{css:s.AH`margin:0.5rem 0 0;font-size:0.85rem;color:#9a9590;line-height:1.5;overflow-wrap:break-word`,children:t.contactAddressDisplay})]}),(0,a.FD)("div",{children:[(0,a.Y)("h3",{css:s.AH`margin:0 0 0.55rem;font-size:0.78rem;color:#c9a227;text-transform:uppercase;letter-spacing:0.12em;font-weight:800`,children:"Nyitvatartás"}),(0,a.Y)("p",{css:s.AH`margin:0;line-height:1.8;font-size:0.92rem;color:#c9c9c9;white-space:pre-line`,children:t.openingHoursLong})]})]}),(0,a.FD)("p",{css:s.AH`
            box-sizing: border-box;
            width: 100%;
            max-width: 1200px;
            margin: clamp(1.35rem, 4vw, 2rem) auto 0;
            min-width: 0;
            padding: clamp(0.85rem, 3vw, 1.15rem) clamp(0.5rem, 2vw, 0) 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #888;
            font-size: clamp(0.76rem, 2.2vw, 0.82rem);
            text-align: center;
            line-height: 1.5;
          `,children:["© ",(new Date).getFullYear()," NovaDrive Motors. Minden jog fenntartva."," · Portfólió demó"]})]})]})},K=s.AH`
  :root,
  [data-theme='dark'] {
    --nd-bg: #070b12;
    --nd-bg-elevated: #0c1220;
    --nd-surface: #121826;
    --nd-surface-2: rgba(255, 255, 255, 0.04);
    --nd-text: #e8edf5;
    --nd-text-muted: rgba(232, 237, 245, 0.62);
    --nd-border: rgba(255, 255, 255, 0.12);
    --nd-accent: #d4af37;
    --nd-accent-soft: rgba(212, 175, 55, 0.12);
    --nd-accent-text: #e8d59a;
    --nd-navy: #1a4d6d;
    --nd-card: linear-gradient(180deg, #121826 0%, #0c121c 100%);
    --nd-header: rgba(8, 12, 20, 0.92);
    --nd-hero-overlay: linear-gradient(
      180deg,
      rgba(8, 12, 22, 0.55) 0%,
      rgba(8, 12, 22, 0.35) 42%,
      rgba(8, 12, 22, 0.72) 100%
    );
    --nd-shadow: 0 22px 50px rgba(0, 0, 0, 0.35);
    color-scheme: dark;
  }

  [data-theme='light'] {
    --nd-bg: #f4f6f9;
    --nd-bg-elevated: #ffffff;
    --nd-surface: #ffffff;
    --nd-surface-2: rgba(12, 18, 32, 0.04);
    --nd-text: #121820;
    --nd-text-muted: rgba(18, 24, 32, 0.62);
    --nd-border: rgba(12, 18, 32, 0.12);
    --nd-accent: #9a7b1a;
    --nd-accent-soft: rgba(154, 123, 26, 0.12);
    --nd-accent-text: #7a6214;
    --nd-navy: #1a4d6d;
    --nd-card: linear-gradient(180deg, #ffffff 0%, #f7f8fb 100%);
    --nd-header: rgba(255, 255, 255, 0.92);
    --nd-hero-overlay: linear-gradient(
      180deg,
      rgba(247, 249, 252, 0.35) 0%,
      rgba(247, 249, 252, 0.2) 40%,
      rgba(12, 18, 32, 0.55) 100%
    );
    --nd-shadow: 0 18px 40px rgba(12, 18, 32, 0.1);
    color-scheme: light;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html {
    scroll-behavior: smooth;
    overflow-x: clip;
    -webkit-text-size-adjust: 100%;
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }
  html,
  body,
  #root {
    background-color: var(--nd-bg);
    min-width: 0;
    max-width: 100vw;
  }
  body {
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: var(--nd-text);
    -webkit-font-smoothing: antialiased;
    overflow-x: clip;
    text-rendering: optimizeLegibility;
    transition: background-color 0.35s ease, color 0.35s ease;
  }
  #root {
    isolation: isolate;
  }
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  iframe {
    max-width: 100%;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 3px solid var(--nd-navy);
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;class H extends n.Component{constructor(e){super(e),this.state={hasError:!1,error:null}}static getDerivedStateFromError(e){return{hasError:!0,error:e}}componentDidCatch(e,t){console.error("Alkalmazás hiba:",e,t)}render(){return this.state.hasError&&this.state.error?(0,a.FD)("div",{style:{padding:"2rem",margin:"2rem",background:"#fff3cd",border:"2px solid #ffc107",borderRadius:"8px"},children:[(0,a.Y)("h2",{children:"Hiba történt"}),(0,a.Y)("p",{children:this.state.error.message}),(0,a.Y)("button",{onClick:()=>window.location.reload(),style:{padding:"0.5rem 1rem",background:"#ffc107",border:"none",cursor:"pointer"},children:"Oldal újratöltése"})]}):this.props.children}}const U=H,J="/projects/project-3".replace(/\/$/,""),R=J?`${J}/index.html`:"/index.html",B=J?`${J}/`:"/";window.location.pathname!==R&&window.location.pathname!==`${J}/index.html`||window.location.replace(B);const I=document.getElementById("root");I&&o.createRoot(I).render((0,a.Y)(n.StrictMode,{children:(0,a.Y)(U,{children:(0,a.Y)(()=>(0,a.FD)(a.FK,{children:[(0,a.Y)(s.mL,{styles:K}),(0,a.Y)(p,{children:(0,a.Y)(i.Kd,{basename:"/projects/project-3",children:(0,a.Y)(d.hh,{children:(0,a.Y)(L,{})})})})]}),{})})}))},867(e,t,r){r.d(t,{G:()=>s,t8:()=>a,yP:()=>c});const a=["Kiváló","Jó","Megfelelő","Cserére szorul","Ismeretlen"],n={tires:{frontLeft:{status:"Jó",treadDepthMm:"5,8",dotNumber:"DOT2524",lastChanged:"2026-10-15",note:"Normál kopás, egyenletes futás"},frontRight:{status:"Jó",treadDepthMm:"5,8",dotNumber:"DOT2524",lastChanged:"2026-10-15",note:"Normál kopás, egyenletes futás"},rearLeft:{status:"Jó",treadDepthMm:"6,0",dotNumber:"DOT2824",lastChanged:"2026-10-15",note:"Normál kopás, egyenletes futás"},rearRight:{status:"Jó",treadDepthMm:"6,0",dotNumber:"DOT2824",lastChanged:"2026-10-15",note:"Normál kopás, egyenletes futás"}},suspension:{status:"Jó",lastChanged:"2026-02-10",note:"Átvizsgálva, normál használati állapotban"},brakes:{status:"Jó",lastChanged:"2026-02-10",note:"Fékhatás rendben, kopás normál tartományban"},oilChange:{status:"Kiváló",lastChanged:"2026-02-10",note:"Olaj és szűrők cserélve"},timingService:{status:"Jó",lastChanged:"2026-02-10",note:"Ellenőrizve, rendellenes zaj nincs"},brakeFluid:{status:"Jó",lastChanged:"2026-08-20",note:"Fékolaj ellenőrizve, érték rendben"}},o={1:{tires:{frontLeft:{status:"Jó",treadDepthMm:"6,2",dotNumber:"DOT1125",lastChanged:"2026-11-12",note:"Michelin nyári gumi, egyenletes kopás"},frontRight:{status:"Jó",treadDepthMm:"6,1",dotNumber:"DOT1125",lastChanged:"2026-11-12",note:"Michelin nyári gumi, egyenletes kopás"},rearLeft:{status:"Kiváló",treadDepthMm:"6,8",dotNumber:"DOT3325",lastChanged:"2026-11-12",note:"Hátsó tengelyen frissebb mintázat"},rearRight:{status:"Kiváló",treadDepthMm:"6,7",dotNumber:"DOT3325",lastChanged:"2026-11-12",note:"Hátsó tengelyen frissebb mintázat"}},suspension:{status:"Jó",lastChanged:"2026-02-18",note:"Átvizsgálva, kopogásmentes futómű"},brakes:{status:"Jó",lastChanged:"2026-02-18",note:"Első fékbetétek kb. 70%-os állapotban"},oilChange:{status:"Kiváló",lastChanged:"2026-01-20",note:"0W-20 motorolaj és szűrők cserélve"},timingService:{status:"Kiváló",lastChanged:"2026-01-20",note:"Láncos vezérlés, rendellenes zaj nincs"},brakeFluid:{status:"Jó",lastChanged:"2026-07-05",note:"Fékolaj csere igazolt"}},2:{tires:{frontLeft:{status:"Megfelelő",treadDepthMm:"4,7",dotNumber:"DOT4523",lastChanged:"2026-10-03",note:"Continental nyári gumi, még használható"},frontRight:{status:"Megfelelő",treadDepthMm:"4,6",dotNumber:"DOT4523",lastChanged:"2026-10-03",note:"Continental nyári gumi, még használható"},rearLeft:{status:"Jó",treadDepthMm:"5,4",dotNumber:"DOT0624",lastChanged:"2026-10-03",note:"Egyenletes kopáskép"},rearRight:{status:"Jó",treadDepthMm:"5,3",dotNumber:"DOT0624",lastChanged:"2026-10-03",note:"Egyenletes kopáskép"}},suspension:{status:"Jó",lastChanged:"2026-03-08",note:"Lengéscsillapítók és szilentek normál állapotban"},brakes:{status:"Megfelelő",lastChanged:"2026-09-16",note:"Hátsó fékbetétek középtávon cserések lehetnek"},oilChange:{status:"Kiváló",lastChanged:"2026-02-04",note:"5W-30 olaj, olajszűrő, levegőszűrő cserélve"},timingService:{status:"Jó",lastChanged:"2026-11-21",note:"Vezérműszíj és vízpumpa cserélve 61 000 km-nél"},brakeFluid:{status:"Jó",lastChanged:"2026-09-16",note:"Fékolaj forráspont ellenőrizve, érték rendben"}},3:{tires:{frontLeft:{status:"Kiváló",treadDepthMm:"7,0",dotNumber:"DOT1925",lastChanged:"2026-10-24",note:"Pirelli prémium nyári gumi"},frontRight:{status:"Kiváló",treadDepthMm:"7,0",dotNumber:"DOT1925",lastChanged:"2026-10-24",note:"Pirelli prémium nyári gumi"},rearLeft:{status:"Kiváló",treadDepthMm:"6,8",dotNumber:"DOT1725",lastChanged:"2026-10-24",note:"Pirelli prémium nyári gumi"},rearRight:{status:"Kiváló",treadDepthMm:"6,8",dotNumber:"DOT1725",lastChanged:"2026-10-24",note:"Pirelli prémium nyári gumi"}},suspension:{status:"Kiváló",lastChanged:"2026-01-30",note:"Futómű diagnosztika hibamentes"},brakes:{status:"Jó",lastChanged:"2026-01-30",note:"Gyári féktárcsák, betétek kb. 75%-os állapotban"},oilChange:{status:"Kiváló",lastChanged:"2026-01-30",note:"BMW Longlife-04 olaj és szűrők cserélve"},timingService:{status:"Kiváló",lastChanged:"2026-01-30",note:"Láncos vezérlés, diagnosztika szerint rendben"},brakeFluid:{status:"Kiváló",lastChanged:"2026-01-30",note:"Fékolaj csere elvégezve"}},4:{tires:{frontLeft:{status:"Jó",treadDepthMm:"5,8",dotNumber:"DOT4024",lastChanged:"2026-04-09",note:"Négyévszakos gumi, normál kopás"},frontRight:{status:"Jó",treadDepthMm:"5,7",dotNumber:"DOT4024",lastChanged:"2026-04-09",note:"Négyévszakos gumi, normál kopás"},rearLeft:{status:"Jó",treadDepthMm:"6,0",dotNumber:"DOT1225",lastChanged:"2026-04-09",note:"Négyévszakos gumi, normál kopás"},rearRight:{status:"Jó",treadDepthMm:"5,9",dotNumber:"DOT1225",lastChanged:"2026-04-09",note:"Négyévszakos gumi, normál kopás"}},suspension:{status:"Megfelelő",lastChanged:"2026-03-22",note:"Jobb első stabilizátor pálca cserélve, futómű beállítva"},brakes:{status:"Jó",lastChanged:"2026-12-02",note:"Első fékbetétek cserélve"},oilChange:{status:"Kiváló",lastChanged:"2026-03-22",note:"5W-30 olaj és szűrők cserélve"},timingService:{status:"Kiváló",lastChanged:"2026-03-22",note:"Láncos vezérlés, ellenőrzés alapján rendben"},brakeFluid:{status:"Jó",lastChanged:"2026-12-02",note:"Fékolaj csere igazolt"}}},i=e=>({...e}),s=e=>{return t=(e=>{if(e?.id&&o[e.id])return o[e.id];const t=`${e?.marka??""} ${e?.modell??""}`.toLowerCase();return t.includes("toyota")&&t.includes("corolla")?o[1]:t.includes("volkswagen")&&t.includes("golf")?o[2]:t.includes("bmw")&&t.includes("320")?o[3]:t.includes("suzuki")&&t.includes("vitara")?o[4]:n})(e),{tires:{frontLeft:i(t.tires.frontLeft),frontRight:i(t.tires.frontRight),rearLeft:i(t.tires.rearLeft),rearRight:i(t.tires.rearRight)},suspension:i(t.suspension),brakes:i(t.brakes),oilChange:i(t.oilChange),timingService:i(t.timingService),brakeFluid:i(t.brakeFluid)};var t},l=e=>({status:e?.status??"Ismeretlen",lastChanged:e?.lastChanged??"",note:e?.note??""}),d=e=>({...l(e),treadDepthMm:e?.treadDepthMm??"",dotNumber:e?.dotNumber??""}),m=e=>"Ismeretlen"===e.status&&""===e.lastChanged.trim()&&""===e.note.trim(),c=(e,t)=>{const r={tires:{frontLeft:d(e?.tires?.frontLeft),frontRight:d(e?.tires?.frontRight),rearLeft:d(e?.tires?.rearLeft),rearRight:d(e?.tires?.rearRight)},suspension:l(e?.suspension),brakes:l(e?.brakes),oilChange:l(e?.oilChange),timingService:l(e?.timingService),brakeFluid:l(e?.brakeFluid)};return(e=>Object.values(e.tires).every(e=>m(e)&&""===e.treadDepthMm.trim()&&""===e.dotNumber.trim())&&m(e.suspension)&&m(e.brakes)&&m(e.oilChange)&&m(e.timingService)&&m(e.brakeFluid))(r)?s(t):r}},712(e,t,r){r.d(t,{CV:()=>i,ax:()=>o});const a={title:"Részletes járműadatok",brandId:"",modelId:"",typeId:"",variant:"",otherModel:"",otherType:"",bodyType:"Személyautó",condition:"Megkímélt",origin:"Magyarországi forgalomba helyezés",color:"Metál szürke",doors:5,seats:5,firstRegistration:"2020/06",inspectionValidUntil:"2026/06",documents:"Érvényes magyar okmányok",serviceBook:"Vezetett szerviztörténet",numberOfKeys:"2 db gyári kulcs",engineDisplacementCcm:1598,powerKw:85,powerHp:116,torqueNm:250,drivetrain:"Elsőkerék-hajtás",cylinders:4,emissionClass:"Euro 6",environmentalClass:"EURO 6",combinedConsumption:"5,2 l/100 km",cityConsumption:"6,1 l/100 km",highwayConsumption:"4,6 l/100 km",ownWeightKg:1320,totalWeightKg:1850,trunkCapacityLiter:380,climate:"Digitális kétzónás klíma",upholstery:"Szövet kárpit",equipment:{comfort:["Tempomat","Elektromos ablakok elöl-hátul","Multifunkciós kormány","Állítható kormány"],safety:["ABS","ESP","Front- és oldallégzsákok","ISOFIX rögzítési pontok"],multimedia:["Bluetooth kihangosító","USB csatlakozó","Fedélzeti számítógép"],exterior:["Könnyűfém felni","LED nappali menetfény","Fényezett lökhárítók"],other:["Dohányzásmentes utastér","Rendszeresen karbantartott"]}},n={1:{title:"Toyota Corolla 1.8 Hybrid e-CVT Comfort",bodyType:"Ferdehátú",condition:"Megkímélt, rendszeresen szervizelt",origin:"Magyarországi első forgalomba helyezés",color:"Gyöngyház fehér",doors:5,seats:5,firstRegistration:"2020/07",inspectionValidUntil:"2026/07",documents:"Érvényes magyar okmányok, törzskönyv rendelkezésre áll",serviceBook:"Vezetett márkaszerviz előélet",numberOfKeys:"2 db gyári kulcs",engineDisplacementCcm:1798,powerKw:90,powerHp:122,torqueNm:142,drivetrain:"Elsőkerék-hajtás",cylinders:4,emissionClass:"Euro 6d-TEMP",environmentalClass:"EURO 6d-TEMP",combinedConsumption:"4,5 l/100 km",cityConsumption:"3,9 l/100 km",highwayConsumption:"5,0 l/100 km",ownWeightKg:1370,totalWeightKg:1835,trunkCapacityLiter:361,climate:"Digitális kétzónás automata klíma",upholstery:"Sötét szövet kárpit",equipment:{comfort:["Kulcs nélküli indítás","Tempomat","Elektromos ablakok elöl-hátul","Multifunkciós bőrkormány"],safety:["Toyota Safety Sense","Sávtartó asszisztens","Táblafelismerő","Adaptív tempomat","Tolatókamera"],multimedia:["Érintőkijelzős multimédia","Bluetooth","Apple CarPlay","Android Auto","USB csatlakozó"],exterior:["LED fényszóró","LED nappali menetfény","Könnyűfém felni","Elektromosan állítható tükrök"],other:["Dohányzásmentes","Alacsony fogyasztású hibrid hajtás","Frissen átvizsgálva"]}},2:{title:"Volkswagen Golf 1.6 TDI Comfortline",bodyType:"Ferdehátú",condition:"Normál használati nyomokkal, jó műszaki állapotban",origin:"EU-s eredet, magyar okmányokkal",color:"Indium szürke metál",doors:5,seats:5,firstRegistration:"2019/04",inspectionValidUntil:"2026/04",documents:"Érvényes magyar forgalmi, törzskönyv rendelkezésre áll",serviceBook:"Digitális szerviztörténet",numberOfKeys:"2 db kulcs",engineDisplacementCcm:1598,powerKw:85,powerHp:115,torqueNm:250,drivetrain:"Elsőkerék-hajtás",cylinders:4,emissionClass:"Euro 6",environmentalClass:"EURO 6",combinedConsumption:"4,3 l/100 km",cityConsumption:"5,1 l/100 km",highwayConsumption:"3,8 l/100 km",ownWeightKg:1295,totalWeightKg:1850,trunkCapacityLiter:380,climate:"Digitális kétzónás Climatronic",upholstery:"Sötét szövet kárpit",equipment:{comfort:["Tempomat","Esőérzékelő","Automata fényszórókapcsolás","Elektromos ablakok elöl-hátul"],safety:["Front Assist","Fáradtságérzékelő","ABS","ESP","ISOFIX"],multimedia:["Composition Media","Bluetooth","USB","Fedélzeti számítógép"],exterior:["Könnyűfém felni","LED nappali menetfény","Fűthető külső tükrök"],other:["Gazdaságos dízelmotor","Nagy csomagtér","Rendezett belső tér"]}},3:{title:"BMW 320d Steptronic Advantage",bodyType:"Limousine",condition:"Prémium állapot, garázsban tartott",origin:"Magyarországi első forgalomba helyezés",color:"Black Sapphire metál",doors:4,seats:5,firstRegistration:"2021/09",inspectionValidUntil:"2027/09",documents:"Érvényes magyar okmányok, törzskönyv rendelkezésre áll",serviceBook:"BMW digitális szervizkönyv",numberOfKeys:"2 db gyári kulcs",engineDisplacementCcm:1995,powerKw:140,powerHp:190,torqueNm:400,drivetrain:"Hátsókerék-hajtás",cylinders:4,emissionClass:"Euro 6d",environmentalClass:"EURO 6d",combinedConsumption:"4,8 l/100 km",cityConsumption:"5,8 l/100 km",highwayConsumption:"4,2 l/100 km",ownWeightKg:1545,totalWeightKg:2085,trunkCapacityLiter:480,climate:"Háromzónás automata klíma",upholstery:"Fekete Sensatec kárpit",equipment:{comfort:["Elektromos ülésállítás","Ülésfűtés elöl","Tempomat fékfunkcióval","Sport bőrkormány"],safety:["Parkolóradar elöl-hátul","Tolatókamera","Sávelhagyás figyelmeztető","LED fényszóró","Vészfék asszisztens"],multimedia:["BMW Live Cockpit","Navigáció","Bluetooth","Apple CarPlay","Digitális műszeregység"],exterior:["17 colos könnyűfém felni","LED hátsó lámpa","Elektromosan behajtható tükrök"],other:["Prémium vezetési élmény","Alacsony futásteljesítmény","Frissen szervizelve"]}},4:{title:"Suzuki Vitara 1.6 GL+",bodyType:"Városi terepjáró / SUV",condition:"Jó állapot, normál használati nyomokkal",origin:"Magyarországi első forgalomba helyezés",color:"Galactic Gray metál",doors:5,seats:5,firstRegistration:"2018/05",inspectionValidUntil:"2026/05",documents:"Érvényes magyar okmányok",serviceBook:"Részben vezetett szervizkönyv, számlákkal igazolt karbantartás",numberOfKeys:"2 db kulcs",engineDisplacementCcm:1586,powerKw:88,powerHp:120,torqueNm:156,drivetrain:"Elsőkerék-hajtás",cylinders:4,emissionClass:"Euro 6",environmentalClass:"EURO 6",combinedConsumption:"5,7 l/100 km",cityConsumption:"6,8 l/100 km",highwayConsumption:"5,0 l/100 km",ownWeightKg:1075,totalWeightKg:1730,trunkCapacityLiter:375,climate:"Automata klíma",upholstery:"Szövet kárpit",equipment:{comfort:["Tempomat","Ülésfűtés elöl","Elektromos ablakok","Multifunkciós kormány"],safety:["ABS","ESP","Lejtmenetvezérlő","ISOFIX","Tolatókamera"],multimedia:["Érintőkijelző","Bluetooth","USB","Navigáció előkészítés"],exterior:["Könnyűfém felni","Tetősín","LED nappali menetfény","Fűthető tükrök"],other:["Megbízható szívó benzinmotor","Magas üléspozíció","Kedvező fenntartás"]}}},o=e=>{return t=(e=>{if(e?.id&&n[e.id])return n[e.id];const t=`${e?.marka??""} ${e?.modell??""}`.toLowerCase();return t.includes("toyota")&&t.includes("corolla")?n[1]:t.includes("volkswagen")&&t.includes("golf")?n[2]:t.includes("bmw")&&t.includes("320")?n[3]:t.includes("suzuki")&&t.includes("vitara")?n[4]:a})(e),{...t,equipment:{comfort:[...t.equipment.comfort],safety:[...t.equipment.safety],multimedia:[...t.equipment.multimedia],exterior:[...t.equipment.exterior],other:[...t.equipment.other]}};var t},i=(e,t)=>{const r=o(t),a=(e=>{const t=e.trim();return t?/^\d+$/.test(t)?`EURO ${t}`:t:""})(e?.environmentalClass??r.environmentalClass);return{...r,...e,brandId:e?.brandId??r.brandId??"",modelId:e?.modelId??r.modelId??"",typeId:e?.typeId??r.typeId??"",variant:e?.variant??r.variant??"",otherModel:e?.otherModel??r.otherModel??"",otherType:e?.otherType??r.otherType??"",environmentalClass:a,equipment:{comfort:e?.equipment?.comfort??r.equipment.comfort,safety:e?.equipment?.safety??r.equipment.safety,multimedia:e?.equipment?.multimedia??r.equipment.multimedia,exterior:e?.equipment?.exterior??r.equipment.exterior,other:e?.equipment?.other??r.equipment.other}}}},784(e,t,r){function a(e){if(!e.startsWith("/"))return e;const t=String("/projects/project-3").replace(/\/$/,"");return t?`${t}${e}`:e}r.d(t,{V:()=>a})}},i={};function s(e){var t=i[e];if(void 0!==t)return t.exports;var r=i[e]={exports:{}};return o[e](r,r.exports,s),r.exports}s.m=o,e=[],s.O=(t,r,a,n)=>{if(!r){var o=1/0;for(m=0;m<e.length;m++){for(var[r,a,n]=e[m],i=!0,l=0;l<r.length;l++)(!1&n||o>=n)&&Object.keys(s.O).every(e=>s.O[e](r[l]))?r.splice(l--,1):(i=!1,n<o&&(o=n));if(i){e.splice(m--,1);var d=a();void 0!==d&&(t=d)}}return t}n=n||0;for(var m=e.length;m>0&&e[m-1][2]>n;m--)e[m]=e[m-1];e[m]=[r,a,n]},s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},r=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,s.t=function(e,a){if(1&a&&(e=this(e)),8&a)return e;if("object"==typeof e&&e){if(4&a&&e.__esModule)return e;if(16&a&&"function"==typeof e.then)return e}var n=Object.create(null);s.r(n);var o={};t=t||[null,r({}),r([]),r(r)];for(var i=2&a&&e;("object"==typeof i||"function"==typeof i)&&!~t.indexOf(i);i=r(i))Object.getOwnPropertyNames(i).forEach(t=>o[t]=()=>e[t]);return o.default=()=>e,s.d(n,o),n},s.d=(e,t)=>{for(var r in t)s.o(t,r)&&!s.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},s.f={},s.e=e=>Promise.all(Object.keys(s.f).reduce((t,r)=>(s.f[r](e,t),t),[])),s.u=e=>e+"."+{163:"668f2c07d0fecf9450b4",516:"1fbbc0955a93f1ac9fa2",676:"ded2b4ac9cf2e4484df1",685:"b58361bbde43c928f08f",688:"46e5cd9ab55cd43eeb2e",842:"6123de1554db02a3f57e"}[e]+".js",s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a={},n="novadrive-katalogus:",s.l=(e,t,r,o)=>{if(a[e])a[e].push(t);else{var i,l;if(void 0!==r)for(var d=document.getElementsByTagName("script"),m=0;m<d.length;m++){var c=d[m];if(c.getAttribute("src")==e||c.getAttribute("data-webpack")==n+r){i=c;break}}i||(l=!0,(i=document.createElement("script")).charset="utf-8",s.nc&&i.setAttribute("nonce",s.nc),i.setAttribute("data-webpack",n+r),i.src=e),a[e]=[t];var u=(t,r)=>{i.onerror=i.onload=null,clearTimeout(g);var n=a[e];if(delete a[e],i.parentNode&&i.parentNode.removeChild(i),n&&n.forEach(e=>e(r)),t)return t(r)},g=setTimeout(u.bind(null,void 0,{type:"timeout",target:i}),12e4);i.onerror=u.bind(null,i.onerror),i.onload=u.bind(null,i.onload),l&&document.head.appendChild(i)}},s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.p="/projects/project-3/",(()=>{var e={792:0};s.f.j=(t,r)=>{var a=s.o(e,t)?e[t]:void 0;if(0!==a)if(a)r.push(a[2]);else{var n=new Promise((r,n)=>a=e[t]=[r,n]);r.push(a[2]=n);var o=s.p+s.u(t),i=new Error;s.l(o,r=>{if(s.o(e,t)&&(0!==(a=e[t])&&(e[t]=void 0),a)){var n=r&&("load"===r.type?"missing":r.type),o=r&&r.target&&r.target.src;i.message="Loading chunk "+t+" failed.\n("+n+": "+o+")",i.name="ChunkLoadError",i.type=n,i.request=o,a[1](i)}},"chunk-"+t,t)}},s.O.j=t=>0===e[t];var t=(t,r)=>{var a,n,[o,i,l]=r,d=0;if(o.some(t=>0!==e[t])){for(a in i)s.o(i,a)&&(s.m[a]=i[a]);if(l)var m=l(s)}for(t&&t(r);d<o.length;d++)n=o[d],s.o(e,n)&&e[n]&&e[n][0](),e[n]=0;return s.O(m)},r=self.webpackChunknovadrive_katalogus=self.webpackChunknovadrive_katalogus||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})();var l=s.O(void 0,[96],()=>s(960));l=s.O(l)})();