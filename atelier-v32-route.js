/* A functional connection diagram. Orthogonal A* routes around expanded
   reading/control rectangles. Calculated only on layout changes, not audio frames. */
(() => {
  const inside=(p,r)=>p.x>r.left+.01&&p.x<r.right-.01&&p.y>r.top+.01&&p.y<r.bottom-.01;
  const clear=(a,b,rects)=>!rects.some(r=>Math.abs(a.x-b.x)<.01
    ? a.x>r.left+.01&&a.x<r.right-.01&&Math.max(a.y,b.y)>r.top+.01&&Math.min(a.y,b.y)<r.bottom-.01
    : a.y>r.top+.01&&a.y<r.bottom-.01&&Math.max(a.x,b.x)>r.left+.01&&Math.min(a.x,b.x)<r.right-.01);
  const simplify=points=>points.filter((p,i)=>!i||i===points.length-1||!((points[i-1].x===p.x&&p.x===points[i+1].x)||(points[i-1].y===p.y&&p.y===points[i+1].y)));
  function route(start,end,rects,width,height){
    const margin=110;
    const blocks=rects.filter(r=>r.bottom>=Math.min(start.y,end.y)-margin&&r.top<=Math.max(start.y,end.y)+margin&&!inside(start,r)&&!inside(end,r));
    const xs=[...new Set([8,width-8,start.x,end.x,...blocks.flatMap(r=>[Math.max(8,r.left),Math.min(width-8,r.right)])])].sort((a,b)=>a-b);
    const ys=[...new Set([Math.max(4,Math.min(start.y,end.y)-margin),Math.min(height-4,Math.max(start.y,end.y)+margin),start.y,end.y,...blocks.flatMap(r=>[Math.max(4,r.top),Math.min(height-4,r.bottom)])])].sort((a,b)=>a-b);
    const nx=xs.length, ny=ys.length, initial=ys.indexOf(start.y)*nx+xs.indexOf(start.x), target=ys.indexOf(end.y)*nx+xs.indexOf(end.x);
    const point=id=>({x:xs[id%nx],y:ys[Math.floor(id/nx)]});
    const heuristic=id=>{const p=point(id);return Math.abs(p.x-end.x)+Math.abs(p.y-end.y);};
    const heap=[],scores=new Map([[initial,0]]),previous=new Map(),done=new Set();
    const push=(id,f)=>{heap.push({id,f});let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p].f<=f)break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p;}};
    const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;while(true){let c=i*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[i].f<=heap[c].f)break;[heap[i],heap[c]]=[heap[c],heap[i]];i=c;}}return first.id;};
    push(initial,heuristic(initial));
    while(heap.length){
      const id=pop();if(done.has(id))continue;
      if(id===target){let ids=[id];while(previous.has(ids[0]))ids.unshift(previous.get(ids[0]));return simplify(ids.map(point));}
      done.add(id);const x=id%nx,y=Math.floor(id/nx),a=point(id);
      for(const next of [x>0?id-1:-1,x<nx-1?id+1:-1,y>0?id-nx:-1,y<ny-1?id+nx:-1]){
        if(next<0||done.has(next))continue;const b=point(next);if(blocks.some(r=>inside(b,r))||!clear(a,b,blocks))continue;
        const cost=scores.get(id)+Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
        if(cost<(scores.get(next)??Infinity)){scores.set(next,cost);previous.set(next,id);push(next,cost+heuristic(next));}
      }
    }
    return null; // Never draw a known collision as a fallback.
  }
  function rounded(points){
    if(!points.length)return '';
    let d=`M ${points[0].x} ${points[0].y}`;
    for(let i=1;i<points.length-1;i++){
      const a=points[i-1],p=points[i],b=points[i+1],before=Math.hypot(p.x-a.x,p.y-a.y),after=Math.hypot(b.x-p.x,b.y-p.y),r=Math.min(10,before/2,after/2);
      if(!r)continue;
      d+=` L ${p.x+(a.x-p.x)*r/before} ${p.y+(a.y-p.y)*r/before} Q ${p.x} ${p.y} ${p.x+(b.x-p.x)*r/after} ${p.y+(b.y-p.y)*r/after}`;
    }
    const end=points.at(-1);return d+` L ${end.x} ${end.y}`;
  }
  function connect(points,rects,width,height){
    let d='',failures=0,segments=[],failed=[];
    for(let i=1;i<points.length;i++){
      const found=route(points[i-1],points[i],rects,width,height);
      if(!found){failures++;failed.push({start:points[i-1],end:points[i]});continue;}
      d+=' '+rounded(found);segments.push(found);
    }
    return {d:d.trim(),failures,segments,failed};
  }
  function measure(main){
    const origin=main.getBoundingClientRect();
    const padding=main.clientWidth<700?10:20;
    return [...main.querySelectorAll('h1,h2,h3,p,figcaption,summary,button,label,input,a:not([data-charge-node]):not([data-energy-object]),.pv-tear-ticket__leaf,.pv-actions,.pv-follow-links,.pv-tracklist,.pv-thoughts__windows,.pv-next-release__form,video,[data-native-preview],[data-ep-preview]')]
      .filter(e=>{
        const closed=e.closest('details:not([open])');
        return !e.closest('[hidden],.sr-only,.pv-room-rail')&&e.getClientRects().length&&(!closed||closed.querySelector('summary')?.contains(e));
      })
      .flatMap(e=>{
        // A room label stretches across a chapter whose mark is an endpoint.
        // Protect its actual glyphs, not the empty width containing the mark.
        if(e.matches('.pv-room-label')){const range=document.createRange();range.selectNodeContents(e);return [...range.getClientRects()];}
        return [e.getBoundingClientRect()];
      }).filter(r=>r.width>3&&r.height>3)
      .map(r=>({left:r.left-origin.left-padding,right:r.right-origin.left+padding,top:r.top-origin.top-padding,bottom:r.bottom-origin.top+padding}));
  }
  const api={route,connect,rounded,measure,clear,inside};
  if(typeof window!=='undefined')window.PVStudyRoute=api;
  if(typeof module!=='undefined')module.exports=api;
})();
