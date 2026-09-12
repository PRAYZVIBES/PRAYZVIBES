/* PRAYZVIBES v34 · reversible inherited-hero text-safety adapter.
   Load AFTER v32/v33 world/composition scripts. No content, asset, typography,
   SVG artwork or destination is changed; no new route/audio runtime is created.

   Cause: the inherited anchors are whole-link centres. Enlarged wrapping
   labels can reach those points, including the four flex-layout symbols in
   the v34 study; the existing router then excludes their obstacles because a
   route endpoint lies inside them. Anchor each hero signal to its unchanged
   visual mark, and keep all six hero labels protected.

   Verify independently at 390px / html 36px in EN/DE/FR and normal 390/1440:
   compare whole-link/visual-mark centres; repeat the inherited 2px-sample,
   3px-clearance text audit. The data fields below describe adapter operation,
   not a claim of zero visible collisions. v33/base files remain untouched. */
(() => {
  'use strict';
  const start = () => {
    const route = window.PVStudyRoute;
    const main = document.querySelector('main');
    const hero = main?.querySelector('.aw-hero');
    if (!route || !main || !hero || route.v34OriginSafety || typeof route.connect !== 'function' || typeof route.measure !== 'function') return;
    const originalConnect = route.connect;
    const originalMeasure = route.measure;
    const rectangleKey = (r) => [r.left,r.right,r.top,r.bottom].map((value)=>value.toFixed(2)).join('|');
    route.measure = function(...args) {
      const measured = Reflect.apply(originalMeasure,this,args);
      const host = args[0];
      if (host !== main || !Array.isArray(measured)) return measured;
      const rects = measured.slice();
      const known = new Set(rects.map(rectangleKey));
      const base = main.getBoundingClientRect();
      let labels = 0, glyphs = 0, added = 0;
      hero.querySelectorAll('.atelier-signal > span:not(.atelier-stencil),.pv-atelier-controls > span').forEach((label) => {
        if (!label.getClientRects().length || label.closest('[hidden]')) return;
        const range = document.createRange();
        range.selectNodeContents(label);
        const boxes = [...range.getClientRects()].filter((r)=>r.width>2&&r.height>2);
        if (boxes.length) labels++;
        boxes.forEach((r) => {
          glyphs++;
          const box = {left:r.left-base.left-8,right:r.right-base.left+8,top:r.top-base.top-8,bottom:r.bottom-base.top+8};
          const key = rectangleKey(box);
          if (!known.has(key)) { rects.push(box); known.add(key); added++; }
        });
      });
      hero.dataset.v34ProtectedLabels = String(labels);
      hero.dataset.v34ProtectedGlyphRects = String(glyphs);
      hero.dataset.v34AddedGlyphRects = String(added);
      return rects;
    };
    route.connect = function(...args) {
      const points = args[0];
      if (!Array.isArray(points)) return Reflect.apply(originalConnect,this,args);
      const base = main.getBoundingClientRect();
      const anchors = [...hero.querySelectorAll('.atelier-signal')].flatMap((signal,index) => {
        const visual = signal.querySelector('.atelier-stencil') || signal.querySelector('img');
        if (!visual) return [];
        const link = signal.getBoundingClientRect(), mark = visual.getBoundingClientRect();
        if (link.width<2 || link.height<2 || mark.width<2 || mark.height<2) return [];
        const old = {x:link.left-base.left+link.width/2,y:link.top-base.top+link.height/2};
        const next = {x:mark.left-base.left+mark.width/2,y:mark.top-base.top+mark.height/2};
        return [{signal,key:signal.dataset.chargeNode || signal.getAttribute('aria-label') || String(index),old,next,replacements:0}];
      });
      const anchored = points.map((point) => {
        const anchor = anchors.find(({old}) => Math.abs(point.x-old.x)<=.75 && Math.abs(point.y-old.y)<=.75);
        if (!anchor) return point;
        anchor.replacements++;
        return {...point,x:anchor.next.x,y:anchor.next.y};
      });
      const replacements = anchors.reduce((count,anchor)=>count+anchor.replacements,0);
      if (replacements) {
        args[0] = anchored;
        const metrics = anchors.filter((anchor)=>anchor.replacements).map(({signal,key,old,next,replacements:count}) => {
          const delta = Math.hypot(next.x-old.x,next.y-old.y).toFixed(2);
          signal.dataset.v34Anchor = 'visual-mark';
          signal.dataset.v34AnchorDelta = delta;
          signal.dataset.v34AnchorPoints = String(count);
          if (signal.classList.contains('atelier-signal--origin')) {
            hero.dataset.v34OriginAnchor = 'visual-mark';
            hero.dataset.v34OriginAnchorDelta = delta;
            hero.dataset.v34OriginAnchorPoints = String(count);
          }
          return {mark:key,from:old,to:next,delta:Number(delta),points:count};
        });
        // Full-route calls include all five marks. A later local two-point
        // route must not erase those diagnostics with a smaller subset.
        if (anchors.every((anchor)=>anchor.replacements)) {
          hero.dataset.v34MarkAnchors = JSON.stringify(metrics);
          hero.dataset.v34AnchoredMarks = String(metrics.length);
        }
      }
      // Preserve the previous wrapper's receiver, arguments and return value.
      // No obstacle is removed, no collision is concealed, no route is redrawn
      // independently. Existing world geometry still owns the visible paths.
      return Reflect.apply(originalConnect,this,args);
    };
    route.v34OriginSafety = true;
    hero.dataset.v34Safety = 'hero-visual-anchors';
    window.dispatchEvent(new Event('pv:composition'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
