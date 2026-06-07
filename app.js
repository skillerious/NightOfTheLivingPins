const $ = (s, r=document)=>r.querySelector(s);
    const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
    const body = document.body;
    $('#currentYear')?.replaceChildren(String(new Date().getFullYear()));
    const navPhaseLabels = [
      ['overview','Plan'],
      ['editor','Foundation'],
      ['blockout','Build'],
      ['markers','Gameplay'],
      ['lighting','Art Pass'],
      ['screens','Polish'],
      ['checklist','Track']
    ];
    navPhaseLabels.forEach(([page,label])=>{
      const link = $(`#toc a[data-page="${page}"]`);
      if(!link || link.previousElementSibling?.classList.contains('navGroupLabel')) return;
      const group = document.createElement('span');
      group.className = 'navGroupLabel';
      group.textContent = label;
      link.before(group);
    });
    const materialsNav = $('#toc a[data-page="materials"]');
    if(materialsNav){
      materialsNav.dataset.search = `${materialsNav.dataset.search || ''} textures texture import texture sets roughness normal base color`.trim();
    }
    const overviewNav = $('#toc a[data-page="overview"]');
    if(overviewNav){
      overviewNav.dataset.search = `${overviewNav.dataset.search || ''} beginner tutorial new user workflow detailed start here`.trim();
    }
    const setupNav = $('#toc a[data-page="setup"]');
    if(setupNav){
      setupNav.dataset.search = `${setupNav.dataset.search || ''} unreal engine 5.7 latest stable install epic games launcher project browser beginner`.trim();
    }
    const screensNav = $('#toc a[data-page="screens"]');
    if(screensNav){
      screensNav.dataset.search = `${screensNav.dataset.search || ''} current build progress screenshots lane blockout lighting fog review orthographic`.trim();
    }
    const resourcesNav = $('#toc a[data-page="resources"]');
    if(resourcesNav){
      resourcesNav.dataset.search = `${resourcesNav.dataset.search || ''} official documentation unreal engine 5.7 up to date links`.trim();
    }
    const openNavBtn = $('#openNav');
    const setNavOpen = open => {
      body.classList.toggle('navOpen', open);
      openNavBtn?.setAttribute('aria-expanded', String(open));
    };
    openNavBtn?.addEventListener('click',()=>setNavOpen(!body.classList.contains('navOpen')));
    $('#closeNav')?.addEventListener('click',()=>setNavOpen(false));
    $('#navScrim')?.addEventListener('click',()=>setNavOpen(false));
    document.addEventListener('keydown',e=>{ if(e.key === 'Escape'){ closeLightbox(); setNavOpen(false); } });
    $$('#toc a').forEach(a=>a.addEventListener('click',()=>setNavOpen(false)));

    const lightbox = $('#diagramLightbox');
    const lightboxImg = $('#diagramLightboxImg');
    const lightboxStage = $('#diagramLightboxStage');
    const lightboxTitle = $('#diagramLightboxTitle');
    const zoomLabel = $('#diagramZoomLabel');
    let diagramZoom = 1;
    let lightboxDiagramNode = null;
    let lightboxZoomTarget = lightboxImg;

    function setDiagramZoom(value){
      diagramZoom = Math.min(3, Math.max(.5, value));
      if(lightboxZoomTarget) lightboxZoomTarget.style.width = (diagramZoom * 100) + '%';
      if(zoomLabel) zoomLabel.textContent = Math.round(diagramZoom * 100) + '%';
    }
    function clearLightboxContent(){
      lightboxDiagramNode?.remove();
      lightboxDiagramNode = null;
      if(lightboxImg){
        lightboxImg.style.display = '';
        lightboxImg.style.width = '100%';
        lightboxImg.removeAttribute('src');
      }
      lightboxZoomTarget = lightboxImg;
    }
    function openDiagramLightbox(frame){
      if(!lightbox || !lightboxImg || !frame) return;
      const img = $('img', frame);
      const liveDiagram = $('.diagramSource', frame);
      const title = frame.closest('.diagramWrap')?.querySelector('.diagramTitle strong')?.textContent || img?.alt || 'Diagram';
      lightboxTitle.textContent = title;
      clearLightboxContent();
      if(liveDiagram){
        lightboxDiagramNode = liveDiagram.cloneNode(true);
        lightboxDiagramNode.classList.remove('diagramSource');
        lightboxDiagramNode.classList.add('lightboxDiagramClone');
        lightboxDiagramNode.removeAttribute('aria-hidden');
        lightboxImg.style.display = 'none';
        lightboxStage.appendChild(lightboxDiagramNode);
        lightboxZoomTarget = lightboxDiagramNode;
      }else if(img){
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt || title;
        lightboxZoomTarget = lightboxImg;
      }
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
      body.classList.add('lightboxOpen');
      setDiagramZoom(1);
      lightboxStage.scrollLeft = 0;
      lightboxStage.scrollTop = 0;
      $('#diagramLightboxClose')?.focus();
    }
    function closeLightbox(){
      if(!lightbox?.classList.contains('open')) return;
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden','true');
      body.classList.remove('lightboxOpen');
      clearLightboxContent();
    }
    $$('.diagramImageFrame').forEach(frame=>{
      const img = $('img', frame);
      const source = frame.nextElementSibling?.classList.contains('diagramSource') ? frame.nextElementSibling : null;
      if(source){
        frame.appendChild(source);
        source.removeAttribute('aria-hidden');
        frame.classList.add('hasLiveDiagram');
      }
      const title = frame.closest('.diagramWrap')?.querySelector('.diagramTitle strong')?.textContent || img?.alt || 'diagram';
      frame.setAttribute('role','button');
      frame.setAttribute('tabindex','0');
      frame.setAttribute('aria-label', 'Open ' + title + ' in zoom viewer');
      frame.addEventListener('click',()=>openDiagramLightbox(frame));
      frame.addEventListener('keydown',e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openDiagramLightbox(frame); } });
    });
    $('#diagramLightboxClose')?.addEventListener('click', closeLightbox);
    $('#diagramZoomIn')?.addEventListener('click',()=>setDiagramZoom(diagramZoom + .25));
    $('#diagramZoomOut')?.addEventListener('click',()=>setDiagramZoom(diagramZoom - .25));
    $('#diagramZoomReset')?.addEventListener('click',()=>{ setDiagramZoom(1); lightboxStage.scrollLeft = 0; lightboxStage.scrollTop = 0; });
    lightbox?.addEventListener('click',e=>{ if(e.target === lightbox) closeLightbox(); });
    lightboxStage?.addEventListener('wheel',e=>{
      if(!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setDiagramZoom(diagramZoom + (e.deltaY < 0 ? .15 : -.15));
    },{passive:false});
    let panStart = null;
    lightboxStage?.addEventListener('pointerdown',e=>{
      if(!lightbox?.classList.contains('open')) return;
      panStart = {x:e.clientX,y:e.clientY,left:lightboxStage.scrollLeft,top:lightboxStage.scrollTop,id:e.pointerId};
      lightboxStage.classList.add('dragging');
      lightboxStage.setPointerCapture(e.pointerId);
    });
    lightboxStage?.addEventListener('pointermove',e=>{
      if(!panStart) return;
      lightboxStage.scrollLeft = panStart.left - (e.clientX - panStart.x);
      lightboxStage.scrollTop = panStart.top - (e.clientY - panStart.y);
    });
    lightboxStage?.addEventListener('pointerup',()=>{ panStart = null; lightboxStage.classList.remove('dragging'); });
    lightboxStage?.addEventListener('pointercancel',()=>{ panStart = null; lightboxStage.classList.remove('dragging'); });

    const progressKey = 'nolp-progress';
    const checklistTaskIds = [
      'ueinstall',
      'editororientation',
      'folders',
      'map',
      'storyspine',
      'blockout',
      'pins',
      'markers',
      'controlstates',
      'mousecontrols',
      'cameradirector',
      'collision',
      'placeholders',
      'lighting',
      'fogpost',
      'materials',
      'textures',
      'decals',
      'backmachine',
      'dressing',
      'cameras',
      'reuse'
    ];
    const phaseKey = 'nolp-current-phase';
    const phaseLabels = {
      all:'All phases',
      foundation:'Foundation',
      blockout:'Blockout',
      gameplay:'Gameplay',
      art:'Art pass',
      polish:'Polish'
    };
    let currentPhase = localStorage.getItem(phaseKey) || 'all';
    let hideDone = false;

    function taskBoxes(){
      return $$('input[type="checkbox"][data-task]');
    }
    function savedProgress(){
      try{ return JSON.parse(localStorage.getItem(progressKey)||'{}') || {}; }catch(e){ return {}; }
    }
    function updateSidebarProgress(done, total){
      const pct = total ? Math.round((done/total)*100) : 0;
      $('#progressFill')?.style.setProperty('width', pct + '%');
      $('#progressLabel')?.replaceChildren(pct + '%');
      $('#doneCount')?.replaceChildren(String(done));
      $('#totalCount')?.replaceChildren(String(total));
    }
    function updateSidebarProgressFromStorage(){
      const saved = savedProgress();
      const done = checklistTaskIds.filter(id=>!!saved[id]).length;
      updateSidebarProgress(done, checklistTaskIds.length);
    }
    function stepPhase(step){
      return step?.dataset.phase || 'foundation';
    }
    function boxesInPhase(boxes, phase=currentPhase){
      return phase === 'all' ? boxes : boxes.filter(b=>stepPhase(b.closest('.step')) === phase);
    }
    function refreshTaskVisibility(){
      $$('.step').forEach(step=>{
        const phaseMatch = currentPhase === 'all' || stepPhase(step) === currentPhase;
        const doneMatch = hideDone && step.classList.contains('done');
        step.hidden = !phaseMatch || doneMatch;
      });
    }
    function updatePhaseButtons(boxes){
      $$('#phaseButtons button').forEach(button=>{
        const phase = button.dataset.phase || 'all';
        const scoped = boxesInPhase(boxes, phase);
        const done = scoped.filter(b=>b.checked).length;
        button.classList.toggle('active', phase === currentPhase);
        button.textContent = `${phaseLabels[phase] || phase} (${done}/${scoped.length})`;
      });
    }
    function updateWalkthroughPanel(boxes){
      const activeBoxes = boxesInPhase(boxes);
      const done = boxes.filter(b=>b.checked).length;
      const total = boxes.length;
      const activeDone = activeBoxes.filter(b=>b.checked).length;
      const activeTotal = activeBoxes.length;
      const activePct = activeTotal ? Math.round((activeDone / activeTotal) * 100) : 0;
      const next = activeBoxes.find(b=>!b.checked) || boxes.find(b=>!b.checked);
      $('#phaseProgressFill')?.style.setProperty('width', activePct + '%');
      $('#phaseSummary')?.replaceChildren(currentPhase === 'all' ? `Showing all ${total} tasks.` : `Showing ${phaseLabels[currentPhase]}: ${activeDone}/${activeTotal} complete.`);
      $('#nextTaskCount')?.replaceChildren(`${done} of ${total} done`);
      if(next){
        const step = next.closest('.step');
        $('#nextTaskTitle')?.replaceChildren(step?.querySelector('h3')?.textContent || 'Next task');
        $('#nextTaskDetail')?.replaceChildren(step?.querySelector('p')?.textContent || 'Open this checklist item and complete the next build action.');
        $('#nextTaskPhase')?.replaceChildren(phaseLabels[stepPhase(step)] || 'Build phase');
        $('#jumpNextTask')?.removeAttribute('disabled');
        $('#jumpNextTask')?.replaceChildren('Jump to next task');
      }else{
        $('#nextTaskTitle')?.replaceChildren('Walkthrough complete');
        $('#nextTaskDetail')?.replaceChildren('Every checklist item is complete. Review screenshots, save the map, and keep the template clean before building variants.');
        $('#nextTaskPhase')?.replaceChildren('All phases');
        $('#jumpNextTask')?.setAttribute('disabled','disabled');
        $('#jumpNextTask')?.replaceChildren('All tasks done');
      }
    }
    function updateProgress(){
      const boxes = taskBoxes();
      if(!boxes.length){
        updateSidebarProgressFromStorage();
        return;
      }
      const done = boxes.filter(b=>b.checked).length;
      updateSidebarProgress(done, boxes.length);
      boxes.forEach(b=>b.closest('.step')?.classList.toggle('done', b.checked));
      localStorage.setItem(progressKey, JSON.stringify(Object.fromEntries(boxes.map(b=>[b.dataset.task,b.checked]))));
      updatePhaseButtons(boxes);
      refreshTaskVisibility();
      updateWalkthroughPanel(boxes);
    }
    function setActivePhase(phase){
      currentPhase = phaseLabels[phase] ? phase : 'all';
      localStorage.setItem(phaseKey, currentPhase);
      updateProgress();
    }
    function loadProgress(){
      const boxes = taskBoxes();
      const saved = savedProgress();
      if(!boxes.length){
        updateSidebarProgressFromStorage();
        return;
      }
      boxes.forEach(b=>{ b.checked=!!saved[b.dataset.task]; b.addEventListener('change',updateProgress); });
      setActivePhase(currentPhase);
    }
    loadProgress();

    $$('#phaseButtons button').forEach(button=>button.addEventListener('click',()=>setActivePhase(button.dataset.phase || 'all')));
    $('#jumpNextTask')?.addEventListener('click',()=>{
      const boxes = taskBoxes();
      let next = boxesInPhase(boxes).find(b=>!b.checked);
      if(!next){
        next = boxes.find(b=>!b.checked);
        if(next && currentPhase !== 'all') setActivePhase('all');
      }
      const step = next?.closest('.step');
      if(!step) return;
      step.scrollIntoView({behavior:'smooth',block:'center'});
      step.classList.add('focused');
      next.focus({preventScroll:true});
      setTimeout(()=>step.classList.remove('focused'),1700);
    });

    $('#resetProgress')?.addEventListener('click',()=>{ if(confirm('Reset the checklist progress?')){ localStorage.removeItem(progressKey); taskBoxes().forEach(b=>b.checked=false); updateProgress(); }});
    $('#collapseDone')?.addEventListener('click',e=>{
      hideDone=!hideDone;
      e.currentTarget.textContent = hideDone ? 'Show completed tasks' : 'Hide completed tasks';
      refreshTaskVisibility();
      updateWalkthroughPanel(taskBoxes());
    });

    $$('.copyBtn').forEach(btn=>btn.addEventListener('click', async()=>{
      const code = btn.closest('.codeBlock')?.querySelector('code')?.innerText || '';
      try{ await navigator.clipboard.writeText(code); btn.textContent='Copied'; setTimeout(()=>btn.textContent='Copy',1200); }
      catch(e){ btn.textContent='Select text'; setTimeout(()=>btn.textContent='Copy',1500); }
    }));

    $$('.tabs').forEach(tabs=>{
      const buttons=$$('.tabButtons button',tabs); const panels=$$('.tabPanel',tabs);
      buttons.forEach((b,i)=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.remove('active'));panels.forEach(x=>x.classList.remove('active'));b.classList.add('active');panels[i].classList.add('active');}));
    });

    const links = $$('#toc a');
    const currentPage = body.dataset.page || '';
    links.forEach(link=>{
      const active = link.dataset.page === currentPage;
      link.classList.toggle('active', active);
      if(active) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });

    $('#guideSearch')?.addEventListener('input', e=>{
      const q=e.target.value.trim().toLowerCase();
      let matches = 0;
      $$('.navGroupLabel').forEach(label=>label.classList.toggle('navFiltered', !!q));
      links.forEach(link=>{
        const hay=((link.dataset.search || '')+' '+link.textContent).toLowerCase();
        const matched = !q || hay.includes(q);
        if(matched) matches++;
        link.classList.toggle('navFiltered', q && !matched);
      });
      const status = $('#searchStatus');
      if(status){
        status.classList.toggle('show', !!q);
        status.textContent = q ? `${matches} of ${links.length} pages match` : '';
      }
    });

    const topBtn=$('#topBtn');
    window.addEventListener('scroll',()=>{ topBtn?.classList.toggle('show', window.scrollY>700); });
    topBtn?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    $('#printBtn')?.addEventListener('click',()=>window.print());
    $('#mobilePrint')?.addEventListener('click',()=>window.print());

