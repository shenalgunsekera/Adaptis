import puppeteer from "puppeteer-core";
/* The system bars specific pairings outright. This checks the site for each. */
const PAGES=["","what-we-do","what-we-do/capital","who-we-serve","customer-stories","about","contact"];
const b=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true,args:["--no-sandbox"]});
const bad=[];
for(const slug of PAGES){
  const p=await b.newPage();
  await p.emulateMediaFeatures([{name:"prefers-reduced-motion",value:"reduce"}]);
  await p.setViewport({width:1440,height:900});
  await p.goto("http://localhost:3000/"+slug,{waitUntil:"load"});
  await new Promise(r=>setTimeout(r,350));
  const hits=await p.evaluate(()=>{
    const hex=c=>{const m=c.match(/\d+/g);if(!m)return null;const a=m.length>3?+m[3]:1;if(a===0)return null;
      return "#"+m.slice(0,3).map(v=>(+v).toString(16).padStart(2,"0")).join("").toUpperCase();};
    const groundOf=el=>{let n=el;while(n&&n!==document.documentElement){const c=getComputedStyle(n).backgroundColor;
      const m=c.match(/\d+/g); if(m&&(m.length<4||+m[3]>0.85)){const h=hex(c); if(h)return h;} n=n.parentElement;} return "#33332C";};
    const out=[];
    for(const el of document.querySelectorAll("*")){
      const t=el.textContent; if(!t||!t.trim()||el.children.length)continue;
      const cs=getComputedStyle(el); if(cs.display==="none"||cs.visibility==="hidden")continue;
      const r=el.getBoundingClientRect(); if(!r.width||!r.height)continue;
      const fg=hex(cs.color), bg=groundOf(el); if(!fg)continue;
      // Barred: Billabong on Ink (2.20:1); Halite as type on anything but
      // Cassiopeia; Naples / Naples light / Apricot / Quiet as text at all.
      if(fg==="#1B6F81"&&(bg==="#33332C"||bg==="#09324A")) out.push(`Billabong text on ${bg}`);
      if(fg==="#09324A"&&bg!=="#AED0C9") out.push(`Halite text on ${bg}`);
      if(["#FAD758","#FCE9A6","#F1B393","#B1AEAC"].includes(fg)) out.push(`${fg} used as text`);
      if(fg==="#AED0C9"&&bg==="#33332C") out.push("Cassiopeia text on Ink (temperature clash)");
    }
    return [...new Set(out)];
  });
  if(hits.length){ console.log("/"+slug); hits.forEach(h=>{console.log("   BARRED:",h); bad.push(h);}); }
  await p.close();
}
await b.close();
console.log(bad.length? `\n${bad.length} barred pairing(s)` : "\nNo barred pairing anywhere: no Billabong on Ink, no Halite type off Cassiopeia,\nno Naples / Naples light / Apricot / Quiet as text, no Cassiopeia on Ink.");
