(() => {
  // A clean test link lets the player restart the complete story in the same browser.
  // Clear only this game's saved progress, then remove the flag so refreshes keep the new run.
  if (new URLSearchParams(location.search).has('restart')) {
    [
      'case25ChapterProgressV1', 'case25RoundOneResultsV1', 'case25RoundTwoResultsV1',
      'case25RoundThreeResultsV1', 'case25RoundThreeResultsV2', 'case25SecretLevelStateV1', 'case25File03NorthQuayV1',
      'case25FinancialCaseV1', 'case25HomeSeen', 'case25Chapter01Started',
      'case25File003StageV2', 'case25File004V1', 'case25File005V1', 'case25LoginPassed'
    ].forEach(key => localStorage.removeItem(key));
    const cleanUrl = new URL(location.href);
    cleanUrl.searchParams.delete('restart');
    history.replaceState(null, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
  }
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const order = ['titleScene','lakeScene','clueScene','caseScene','archiveScene','transmissionScene','homeScene','recordsScene','phaseTwoScene','chapterEntryScene','secretLevelScene','secretRewardScene'];
  const scenes = order.map(id => document.getElementById(id));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PROGRESS_KEY = 'case25ChapterProgressV1';
  const ROUND_KEYS = {1:'case25RoundOneResultsV1',2:'case25RoundTwoResultsV1',3:'case25RoundThreeResultsV2'};
  const roundOneQuestions = [
    {id:'01',title:'The Masked Shinobi',difficulty:'MEDIUM',xp:10,prompt:'A figure hides behind a false identity, manipulates events from the shadows, and keeps his true motives concealed. Which individual fits the clues?',options:['Itachi Uchiha','Sasuke Uchiha','Madara Uchiha','Obito Uchiha'],answer:'Obito Uchiha',acceptedAnswers:['Obito','Obito Uchiha']},
    {id:'02',title:'The Uchiha Cipher',difficulty:'HARD',xp:20,prompt:'Which character’s tragic story connects the Mangekyō Sharingan abilities Tsukuyomi, Amaterasu, and Susanoo with a devastating sacrifice for his younger brother?',options:['Itachi Uchiha','Shisui Uchiha','Madara Uchiha','Obito Uchiha'],answer:'Itachi Uchiha',acceptedAnswers:['Itachi','Itachi Uchiha']},
    {id:'03',title:'The Three Scrolls',difficulty:'FUN CHALLENGE',xp:15,prompt:'Three scrolls are marked A, B, and C. Only one contains the secret message. Scroll A says “The message is in B.” Scroll B says “The message is not in B.” Scroll C says “The message is in B.” Exactly two statements are true. Which scroll contains the message?',options:['Scroll A','Scroll B','Scroll C'],answer:'Scroll B'}
  ];
  const roundTwoQuestions = [
    {id:'04',title:'The Salvatore File',difficulty:'MEDIUM',xp:10,prompt:'Which pair of brothers matches these descriptions: first, the sarcastic, bourbon-loving vampire; second, the brother associated with restraint and trying to do the right thing?',options:['Damon and Stefan','Stefan and Damon','Klaus and Elijah','Enzo and Alaric'],answer:'Damon and Stefan',explanation:'Damon is the sarcastic, bourbon-loving brother; Stefan is the more restrained brother who keeps trying to do the right thing.'},
    {id:'05',title:'The Immortality Paradox',difficulty:'HARD',xp:20,prompt:'A vampire claims, “No one can kill me.” A witch replies, “That doesn’t mean you’re impossible to kill.” What is the key distinction?',options:['Immortality means never aging.','A normal method failing doesn’t mean every possible method fails.','Witches are always stronger than vampires.','Every vampire can be killed by sunlight.'],answer:'A normal method failing doesn’t mean every possible method fails.',explanation:'Surviving one kind of threat does not prove that every possible threat will fail.'},
    {id:'06',title:'The Founders’ Marker',difficulty:'FUN CHALLENGE',xp:15,prompt:'In the show, a special object is used to mark the founding families and keep them bound to Mystic Falls. What is this object?',options:['The Gilbert journal','The moonstone','The Founders’ Bell','The Ashes of a Witch'],answer:'The Founders’ Bell',explanation:'The Founders’ Bell is tied to Mystic Falls’ founding families and their supernatural history.'}
  ];
  const roundThreeQuestions = [
    {id:'07',title:'The Three Walls',difficulty:'MEDIUM',xp:10,prompt:'In the story, humanity lives within three massive walls. What are the names of these three walls (from outermost to innermost)?',options:['Maria, Rose, Sina','Rose, Maria, Sina','Sina, Rose, Maria','Maria, Sina, Rose'],answer:'Maria, Rose, Sina',explanation:'From the outside inward: Wall Maria, Wall Rose, then Wall Sina.'},
    {id:'08',title:'The Titan’s Code',difficulty:'HARD',xp:20,prompt:'In the story, certain people can transform into Titans through an inheritance passed down across generations. What is this inheritance called?',options:['The Coordinate','The Founding Titan','The Titan Shifter power','The Ackerman bloodline'],answer:'The Titan Shifter power',explanation:'The inherited ability to transform into a Titan is Titan Shifter power.'},
    {id:'09',title:'The Last Transmission',difficulty:'HARD',xp:20,prompt:'What is the name of the power that allows the user to see memories of both past and future holders of the Attack Titan?',options:['The Founding','The Paths','The Coordinate','The Attack Titan’s future memory ability'],answer:'The Paths',explanation:'The Paths connect all Subjects of Ymir and carry memories across time.'}
  ];
  const questionSet=n=>n===2?roundTwoQuestions:n===3?roundThreeQuestions:roundOneQuestions;
  let roundNumber=1,questions=roundOneQuestions;
  const emptyRound=(items=questions)=>({questions:items.map(q=>({id:q.id,answer:null,attempts:[],xpAwarded:0,complete:false}))});
  let secretTestMode=false;
  let secretTestRounds={1:emptyRound(roundOneQuestions),2:emptyRound(roundTwoQuestions),3:emptyRound(roundThreeQuestions)};
  function readRound(n=roundNumber){const items=questionSet(n);if(secretTestMode)return secretTestRounds[n]||emptyRound(items);try{const saved=JSON.parse(localStorage.getItem(ROUND_KEYS[n])||'null');if(!saved||!Array.isArray(saved.questions)||saved.questions.length!==items.length)return emptyRound(items);return {questions:emptyRound(items).questions.map((q,i)=>({...q,...saved.questions[i],attempts:Array.isArray(saved.questions[i].attempts)?saved.questions[i].attempts:[],id:q.id}))};}catch{return emptyRound(items);}}
  let round=readRound(1),activeQuestion=0;
  const persistRound=()=>{if(secretTestMode){secretTestRounds[roundNumber]=round;return;}localStorage.setItem(ROUND_KEYS[roundNumber],JSON.stringify(round));};
  function selectRound(n){roundNumber=n;questions=questionSet(n);round=readRound(n);}
  const LEVEL_STATE_KEY='case25SecretLevelStateV1';
  function readLevelState(){try{return JSON.parse(localStorage.getItem(LEVEL_STATE_KEY)||'{}');}catch{return {};}}
  let levelState=readLevelState();
  function persistLevelState(){localStorage.setItem(LEVEL_STATE_KEY,JSON.stringify(levelState));}
  const chapterConfig = [
    { id: 1, title: 'THE DISAPPEARANCE', file: 'FILE 01' },
    { id: 2, title: 'THE FINANCIAL RECORDS', file: 'FILE 02' },
    { id: 3, title: 'UNASSIGNED', file: 'FILE 03' }
  ];
  const readProgress = () => {
      try { return { chapterOneComplete:false, chapterOneStarted:false, chapterTwoComplete:false, fileTwoComplete:false, file02Complete:false, caseAccepted:false, file02TransitionSeen:false, unlockedChapter:1, noticeDismissed:false, noticeVisible:false, evidence001Viewed:false, evidence001Closed:false, file03PuzzleComplete:false, ...(JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}')) }; }
    catch { return { chapterOneComplete:false, chapterOneStarted:false, fileTwoComplete:false, file02Complete:false, caseAccepted:false, file02TransitionSeen:false, unlockedChapter:1, noticeDismissed:false }; }
  };
  let progress = readProgress();
  const persistProgress = () => localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  // ?cliff re-arms the Day 1 cliffhanger without touching any other progress
  if(new URLSearchParams(location.search).has('cliff')){progress.cliffSeen=false;progress.cliffReplayed=false;progress.file04WallSeen=false;progress.file03PuzzleComplete=true;persistProgress();try{sessionStorage.setItem('case25PlayCliff','1');}catch{}const u=new URL(location.href);u.searchParams.delete('cliff');history.replaceState(null,'',u);}
  let timers = [], clueIndex = 0, audioContext = null, audioNodes = [];
  let soundBus = null; // must exist before the first showHomeBoard() -> stopSound() on page load
  let musicWanted = true;
  // File 003's puzzles play without the score: it fades out while the stage is open and comes back after.
  function setMusic(on){musicWanted=on;if(audioContext&&soundBus)soundBus.gain.setTargetAtTime(on?1:.0001,audioContext.currentTime,.5);}
  // Wall intro state and artwork points; showHomeBoard() reads them on page load, so they live up here.
  let wallIntroRun = 0;
  const WALL_FOUR_CLASSES = ['wall-thread-pulse','wall-four-intro','wall-four-card','wall-four-string','wall-four-rest'];
  let wallFourRun = 0;
  const WALL_FIVE_CLASSES = ['wall-thread-pulse','wall-five-intro','wall-five-card','wall-five-string','wall-five-rest'];
  let wallFiveRun = 0;
  const F5C = [['.file05-art-number', 'FILE 005', 60], ['.file05-art-title', 'THE LAST TRANSMISSION', 40]];
  const F4C = [['.file04-art-number', 'FILE 004', 60], ['.file04-art-title', 'THE LANTERN FIRE', 42]];
  const F3C = [['.file03-art-number', 'FILE 003', 60], ['.file03-art-title', 'THE FINANCIAL TRAIL', 42]];
  const F2C = { num: 'FILE 002', title: 'THE UNEXPECTED SIGNAL', copy: 'Something else is buried\nwithin this archive.' };
  const WALL_THREE_CLASSES = ['wall-thread-pulse','wall-three-intro','wall-three-dot','wall-three-card','wall-three-type','wall-three-string','wall-three-rest'];
  let wallThreeRun = 0;
  const WALL_ART = {
    pinOne: { x: 642, y: 322 }, pinTwo: { x: 1220, y: 245 }, completed: { x: 650, y: 408 }, twoDone: { x: 1218, y: 379 },
    cardOne: { x: 648, y: 382, w: 140, h: 110 }, cardTwo: { x: 1217, y: 330, w: 160, h: 125 }
  };
  const WALL_INTRO_CLASSES = ['wall-intro','wall-one-dim','wall-dot-one','wall-stage-one','wall-stamp','wall-dot-two','wall-stage-two','wall-stage-string','wall-stage-rest'];
  const later = (fn, ms) => { const t = setTimeout(fn, reducedMotion ? 0 : ms); timers.push(t); return t; };
  const laterWait = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  let sceneHistory = [], goingBack = false;
  function show(scene) {
    const current = scenes.find(s => s.classList.contains('active'));
    if (!goingBack && current && current !== scene) sceneHistory.push(current);
    // BACK or SKIP can interrupt a timed push before it cleans up; never come back to a half-finished zoom
    if (scene === scenes[0]) { scene.classList.remove('leaving'); scene.querySelectorAll('.title-match-art').forEach(n => n.remove()); }
    if (scene === scenes[1]) scene.classList.remove('lake-pushing');
    // smooth hand-off (see .scene-leaving / sceneSettle in style.css)
    scene.classList.remove('scene-leaving');
    if (current && current !== scene && !reducedMotion) { current.classList.add('scene-leaving'); setTimeout(() => current.classList.remove('scene-leaving'), 1300); }
    $('#backButton').disabled = !sceneHistory.length;
    scenes.forEach(s => s.classList.toggle('active', s === scene));
    const acceptedCaseOnly = scene === scenes[6] && scene.classList.contains('closure-revealed');
    document.body.classList.toggle('file-one-closed', acceptedCaseOnly);
    const archive = scene === scenes[4];
    // Skip intro only belongs to the opening: title, lake, clues and case file. Elsewhere it would jump back to the archive login.
    $('#skipIntro').classList.toggle('is-hidden', !(scenes.indexOf(scene) <= 3 || scene === scenes[8]));
    $('#soundToggle').classList.toggle('is-hidden', acceptedCaseOnly || archive || scene === scenes[9] || scene === scenes[10] || scene === scenes[11]);
  }
  function paintProgress() {
    const complete = !!progress.chapterOneComplete || !!progress.caseAccepted || previewHome;
    const secondUnlocked = !!progress.file02TransitionSeen;
    const secondComplete = !!progress.fileTwoComplete || !!progress.file02Complete;
    $('#fileOneStatus').textContent = complete ? 'CLASSIFIED' : progress.chapterOneStarted ? 'IN PROGRESS' : 'ACTIVE';
    $('#fileOne').classList.toggle('completed', complete);
    $('#fileTwo').classList.toggle('unlocked', secondUnlocked);
    $('#fileTwo').classList.toggle('completed', secondComplete);
    if ($('#fileTwoStatus')) $('#fileTwoStatus').textContent = secondComplete ? 'CLASSIFIED' : 'ACTIVE';
    if (secondComplete) {
      $('#fileTwoBegin').textContent = 'CLASSIFIED';
      $('#fileTwoBegin').disabled = false;
      $('#file02ArtBegin').hidden = true;
      if ($('#file02CompletedStamp')) $('#file02CompletedStamp').hidden = false;
      if ($('#continueFileThree')) $('#continueFileThree').hidden = false;
    } else {
      $('#fileTwoBegin').textContent = 'BEGIN →';
      $('#fileTwoBegin').disabled = !secondUnlocked || !$('#homeScene').classList.contains('file-two-begin-visible');
      $('#file02ArtBegin').hidden = !secondUnlocked;
      if ($('#file02CompletedStamp')) $('#file02CompletedStamp').hidden = true;
      if ($('#continueFileThree')) $('#continueFileThree').hidden = true;
    }
    const thirdUnlocked=Number(progress.unlockedChapter)>=3;const thirdRevealed=thirdUnlocked&&(!!progress.file03Revealed||!!progress.file03PuzzleComplete);$('#homeScene').classList.toggle('file-three-revealed',thirdRevealed);$('#homeScene').classList.toggle('file-three-completed',!!progress.file03PuzzleComplete);if($('#continueFileThree')&&thirdRevealed)$('#continueFileThree').hidden=true;$('#fileThree').disabled=!thirdUnlocked;$('#fileThree').classList.toggle('unlocked',thirdUnlocked);$('#fileThreeStatus').textContent=progress.file03PuzzleComplete?'CLASSIFIED':thirdUnlocked?'AVAILABLE':'LOCKED';$('#fileThree').setAttribute('aria-label',thirdUnlocked?'Open Project North Quay':'File 03 locked');
    $('#homeScene').classList.toggle('file-two-lit', secondUnlocked);
    $('#homeScene').classList.toggle('file-two-completed', secondComplete);
    // Files open one at a time: File 03's card stays off the wall until File 02 is finished.
    // (file03WallSeen === false means File 02 was just finished and the File 03 reveal has not played yet.)
    $('#homeScene').classList.toggle('file-three-locked', !secondComplete || progress.file03WallSeen === false);
    $('#homeScene').classList.toggle('await-file-three', secondComplete && progress.file03WallSeen === false);
    $('#homeScene').classList.toggle('await-file-four', !!progress.file03PuzzleComplete && progress.file04WallSeen === false);
    $('#homeScene').classList.toggle('peter-charged', !!progress.file03PuzzleComplete);
    $('#homeScene').classList.toggle('cliff-seen', !!progress.cliffSeen);
    $('#homeScene').classList.toggle('await-file-five', !!progress.file04Complete && progress.file05WallSeen === false);
    // The spotlight follows the file the player should open next; finished files fall back into the dark.
    const thirdDone = !!progress.file03PuzzleComplete, thirdOpen = secondComplete && progress.file03WallSeen !== false;
    const fourthOpen = thirdDone && progress.file04WallSeen !== false, fourthDone = !!progress.file04Complete;
    $('#homeScene').classList.toggle('file-four-locked', !fourthOpen);
    $('#homeScene').classList.toggle('file-four-completed', fourthDone);
    const fifthOpen = fourthDone && progress.file05WallSeen !== false, fifthDone = !!progress.file05Complete;
    $('#homeScene').classList.toggle('file-five-locked', !fifthOpen);
    $('#homeScene').classList.toggle('file-five-completed', fifthDone);
    const active = !secondComplete ? 'two' : thirdOpen && !thirdDone ? 'three' : fourthOpen && !fourthDone ? 'four' : fifthOpen && !fifthDone ? 'five' : 'none';
    ['one','two','three','four','five','none'].forEach(k => $('#homeScene').classList.toggle('active-' + k, k === active));
    // Once File 01 is accepted, land on its closed board cleanly. The older
    // financial-lead popup belongs to a different route and must not overlay it.
    const showLeadNotice=!!progress.noticeVisible&&!progress.noticeDismissed&&!progress.caseAccepted;
    $('#leadNotice').classList.toggle('visible', showLeadNotice);
    $('#leadNotice').setAttribute('aria-hidden', String(!showLeadNotice));
    $('#continueFileTwo').hidden = !progress.caseAccepted || progress.file02TransitionSeen;
    $('#file02ArtBegin').hidden = !progress.file02TransitionSeen;
  }
  function showHomeBoard() {
    clearTimers(); stopSound();
    document.body.classList.remove('case-finished');
    const home=$('#homeScene');
    home.classList.remove('dossier-open','archive-transitioning');
    endWallIntro(); endWallThree(false); endWallFour(false); endWallFive(false);
    home.classList.remove('closure-revealed','closure-sequence','closure-continue-ready','file-one-dimming','file-two-signal','file-two-paper','file-two-number-visible','file-two-title-visible','file-two-copy-visible','file-two-begin-visible');
    const showFileOneClosure=!!progress.caseAccepted&&!progress.file02TransitionSeen;
    if(showFileOneClosure) home.classList.add('closure-revealed');
    if(progress.file02TransitionSeen) home.classList.add('file-two-available','file-two-number-visible','file-two-title-visible','file-two-copy-visible','file-two-begin-visible');
    home.classList.add('board-mode','document-lit','wall-reveal');
    $('#fileClosedNotice').classList.remove('visible');
    $('#homeCaption').hidden=true; $('#wallHotspot').hidden=true;
    $('#messageDossier').setAttribute('aria-hidden','true');
    paintProgress(); show(home);
    // Place the wall overlays (File 002/03 marks, string) now; the board image may have loaded before its listener.
    // ?cliff: once he is on the wall, the cliffhanger plays by itself
    let wantCliff=false;try{wantCliff=sessionStorage.getItem('case25PlayCliff')==='1';}catch{}
    if(wantCliff){try{sessionStorage.removeItem('case25PlayCliff');}catch{}setTimeout(()=>{if($('#homeScene').classList.contains('active')&&$('#cliffhanger').hidden)playCliffhanger();},1800);}
    requestAnimationFrame(()=>{wallGeometry();placeClipping();if(progress.arrestNew&&progress.file03PuzzleComplete)dropClipping();});
  }
  function roundXp(n=roundNumber){const state=n===roundNumber?round:readRound(n);return state.questions.reduce((sum,q)=>sum+(q.complete?Number(q.xpAwarded)||0:0),0);}
  function earnedXp(){return [1,2,3].reduce((sum,n)=>sum+roundXp(n),0);}
  function completedCount(){return round.questions.filter(q=>q.complete).length;}
  function setReferenceFeedback(message,kind=''){const feedback=$('#secretRefFeedback');feedback.textContent=message;feedback.classList.toggle('is-error',kind==='error');feedback.classList.toggle('is-success',kind==='success');feedback.hidden=!message;if(message&&(kind==='error'||kind==='success'))pulseRef(kind==='error'?'ref-wrong':'ref-right');}
  // A correct answer flashes gold, lets the verdict register for a beat, then moves on without a Continue button.
  let autoNextTimer=0;
  function autoAdvanceAfterCorrect(){
    const scene=$('#secretLevelScene'),kind=scene.dataset.reference;clearTimeout(autoNextTimer);
    autoNextTimer=setTimeout(()=>{if(scene.dataset.reference===kind&&scene.classList.contains('active'))$('#questionContinue').click();},reducedMotion?600:1700);
  }
  // Moving between painted screens. Entering a round: three rings lock one by one, ACCESS GRANTED, then they
  // blow outward onto the round screen. Question to question: a quieter effect per round, set in REF_Q_STYLE
  // ('develop' = the next question develops like a photograph, 'iris' = it opens out of a glowing ring).
  let refSwapToken=0,refPulseTimer=0;
  const CUT_ROMAN={'round-intro':'ROUND I','round-two-intro':'ROUND II','round-three-intro':'ROUND III'};
  const REF_Q_STYLE={1:'iris',2:'iris',3:'iris'};
  const refRoundOf=kind=>{const n=Number(String(kind).slice(1))||1;return n<=3?1:n<=6?2:3;};
  function buildCutRings(){
    const svg=$('#cutRings');if(svg.childElementCount)return;
    const ns='http://www.w3.org/2000/svg',mk=(t,at,p)=>{const e=document.createElementNS(ns,t);for(const k in at)e.setAttribute(k,at[k]);p.append(e);return e;};
    [[92,60],[74,40],[56,24]].forEach(([r,n])=>{
      const g=mk('g',{},svg),c=2*Math.PI*r/n;
      mk('circle',{class:'ring',r},g);mk('circle',{class:'ring tick',r,'stroke-dasharray':`${(c*.14).toFixed(2)} ${(c*.86).toFixed(2)}`},g);
    });
    mk('path',{d:'M0 -99 L-4 -108 L4 -108Z',fill:'#d9a44e'},svg);
  }
  function endRefTransition(){
    refSwapToken++;const cut=$('#secretCut'),scene=$('#secretLevelScene');
    cut.getAnimations({subtree:true}).forEach(a=>a.cancel());
    scene.querySelectorAll('.ref-clone,.ref-ring').forEach(e=>e.remove());
    $('#secretReferenceArt').getAnimations().forEach(a=>a.cancel());
    cut.classList.remove('run','round');cut.querySelectorAll('.cut-k,.cut-s').forEach(p=>{p.textContent='';p.classList.remove('typing');});
    cut.querySelectorAll('.cut-rings g').forEach(g=>g.classList.remove('locked'));
    scene.classList.remove('ref-changing','cut-glitch');
  }
  function typeCutText(el,text,ms,token){
    // the full line is laid out (hidden) from the start, so letters appear in place and nothing re-centres
    const on=document.createElement('i'),off=document.createElement('i');off.style.visibility='hidden';off.textContent=text;
    el.replaceChildren(on,off);el.classList.add('typing');let n=0;
    return new Promise(done=>{
      const tick=()=>{if(token!==refSwapToken)return done();n++;keyTick();on.textContent=text.slice(0,n);off.textContent=text.slice(n);if(n<text.length)setTimeout(tick,ms);else{el.classList.remove('typing');done();}};
      tick();
    });
  }
  function setRefArt(art,src,prevKind,kind){
    const scene=$('#secretLevelScene'),cur=art.getAttribute('src')||'';
    if(cur===src)return;
    const quiet=reducedMotion||kind==='unexpected'||!prevKind||prevKind==='none'||!scene.classList.contains('active');
    if(quiet){endRefTransition();art.src=src;return;}
    const token=++refSwapToken,round=/intro$/.test(kind);
    const cut=$('#secretCut'),body=cut.querySelector('.cut-body'),svg=$('#cutRings'),text=cut.querySelector('.cut-text'),kEl=cut.querySelector('.cut-k'),sEl=cut.querySelector('.cut-s');
    const wait=ms=>new Promise(r=>setTimeout(r,ms)),alive=()=>token===refSwapToken;
    (async()=>{
      scene.classList.add('ref-changing');
      const next=new Image();next.src=src;
      const decoded=Promise.race([(next.decode?next.decode():Promise.resolve()).catch(()=>{}),wait(1500)]);
      if(round){
        buildCutRings();
        cut.getAnimations({subtree:true}).forEach(a=>a.cancel());
        cut.classList.add('round','run');
        body.animate([{opacity:0},{opacity:1}],{duration:380,fill:'forwards'});
        await wait(380);if(!alive())return;
        const rings=[...svg.querySelectorAll('g')],spins=[[1116,1250],[-1188,1600],[792,2000]];
        await Promise.all(rings.map((r,i)=>r.animate([{transform:'rotate(0deg)'},{transform:`rotate(${spins[i][0]}deg)`}],{duration:spins[i][1],easing:'cubic-bezier(.15,.7,.1,1)',fill:'forwards'}).finished.then(()=>{
          if(!alive())return;r.classList.add('locked');body.animate([{filter:'brightness(1.5)'},{filter:'brightness(1)'}],{duration:220});
        }).catch(()=>{})));
        if(!alive())return;
        await typeCutText(kEl,'ACCESS GRANTED',34,token);await wait(150);if(!alive())return;
        await typeCutText(sEl,CUT_ROMAN[kind]||'',85,token);await wait(700);if(!alive())return;
        await decoded;if(!alive())return;
        art.src=src;layoutSecretReference(kind);
        art.animate([{transform:'scale(1.25)',filter:'brightness(.4) blur(4px)'},{transform:'scale(1)',filter:'brightness(1) blur(0)'}],{duration:1100,easing:'ease-out'});
        svg.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(-50%,-50%) scale(3.4)',opacity:0}],{duration:900,easing:'ease-in',fill:'forwards'});
        text.animate([{opacity:1},{opacity:0}],{duration:400,fill:'forwards'});
        body.animate([{opacity:1},{opacity:0}],{duration:900,delay:200,fill:'forwards'});
        scene.classList.remove('ref-changing');
        await wait(1150);if(!alive())return;
        endRefTransition();return;
      }
      if(REF_Q_STYLE[refRoundOf(kind)]==='iris'){
        const clone=document.createElement('img');clone.className='secret-reference-art ref-clone';clone.alt='';clone.src=src;clone.style.clipPath='circle(0% at 50% 50%)';
        const ring=document.createElement('div');ring.className='ref-ring';
        await decoded;if(!alive())return;
        scene.insertBefore(clone,$('#secretReferenceControls'));scene.append(ring);
        art.animate([{transform:'scale(1)',filter:'none'},{transform:'scale(.97)',filter:'brightness(.55)'}],{duration:640,easing:'ease-in',fill:'forwards'});
        ring.animate([{transform:'translate(-50%,-50%) scale(0)',opacity:1},{transform:'translate(-50%,-50%) scale(14)',opacity:0}],{duration:700,easing:'ease-in'});
        clone.animate([{clipPath:'circle(0% at 50% 50%)'},{clipPath:'circle(90% at 50% 50%)'}],{duration:700,easing:'cubic-bezier(.5,0,.2,1)',fill:'forwards'});
        await wait(720);if(!alive())return;
        art.getAnimations().forEach(a=>a.cancel());art.src=src;layoutSecretReference(kind);
        await (art.decode?art.decode().catch(()=>{}):Promise.resolve());if(!alive())return;
        clone.remove();ring.remove();endRefTransition();return;
      }
      // 'develop': the question darkens to sepia, then the next one develops in from dark and blurred
      await art.animate([{filter:'none'},{filter:'brightness(.3) sepia(.8)'}],{duration:340,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
      await decoded;if(!alive())return;
      art.getAnimations().forEach(a=>a.cancel());art.src=src;layoutSecretReference(kind);
      art.animate([{filter:'brightness(.12) sepia(1) contrast(1.4) blur(5px)',opacity:.9},{filter:'brightness(.6) sepia(.7) contrast(1.15) blur(2px)',offset:.5},{filter:'none',opacity:1}],{duration:1100,easing:'ease-out'});
      await wait(600);if(!alive())return;scene.classList.remove('ref-changing');
      await wait(520);if(!alive())return;
      endRefTransition();
    })();
  }
  $('#secretReferenceArt').addEventListener('animationend',e=>{if(/^ref(Enter|Tune)/.test(e.animationName))e.target.classList.remove('ref-enter','ref-enter-intro','ref-tune');});
  function pulseRef(cls){const scene=$('#secretLevelScene');scene.classList.remove('ref-wrong','ref-right');void scene.offsetWidth;scene.classList.add(cls);clearTimeout(refPulseTimer);refPulseTimer=setTimeout(()=>scene.classList.remove('ref-wrong','ref-right'),700);}
  // Hotspots are measured against the painted artwork itself (x, y, w, h as % of the image), so they
  // stay on the painted buttons at any window shape instead of drifting with object-fit:cover.
  const REF_HOTSPOTS={
    unexpected:{button:[38.3,76.7,27.8,8.8]},
    'round-intro':{button:[36.2,80.9,28.6,7.4]},
    'round-two-intro':{button:[40.0,79.6,26.3,8.9]},
    'round-three-intro':{button:[39.7,76.6,21.1,8.9]},
    q01:{answers:[[43.2,48.8,43.7,6.9],[43.2,56.1,43.7,7.3],[43.2,63.8,43.7,6.9],[43.2,71.1,43.7,7.3]],submit:[63.1,80.5,24.4,9.3]},
    q02:{answers:[[39.8,47.8,42.6,6.9],[39.8,55.1,42.6,6.9],[39.8,62.3,42.6,6.9],[39.8,69.6,42.6,7.3]],submit:[59.7,79.4,22.9,8.5]},
    q03:{answers:[[40.9,57.4,37.2,5.8],[40.6,63.6,37.4,5.8],[40.9,69.8,37.2,6.2]],submit:[58.1,77.7,20.7,8.3]},
    q04:{answers:[[43.2,56.2,50.6,6.9],[43.2,63.9,50.6,6.4],[43.2,71.7,50.6,6.4],[43.2,79.0,50.6,6.9]],submit:[55.8,88.8,23.5,8.6]},
    q05:{answers:[[45.7,49.8,48.8,7.2],[45.9,58.3,48.6,7.7],[45.9,66.8,48.6,7.7],[45.9,75.3,48.6,8.1]],submit:[57.4,85.1,23.4,8.5]},
    q06:{answers:[[50.2,51.9,42.1,6.4],[50.2,59.6,41.9,6.4],[50.2,66.8,41.9,6.4],[50.2,74.0,42.1,6.4]],submit:[60.5,83.0,23.2,8.5]},
    q07:{answers:[[43.3,50.6,36.4,6.4],[43.3,57.9,36.4,6.4],[43.3,65.1,36.4,6.8],[43.3,72.3,36.6,7.7]],submit:[50.7,81.3,23.0,8.5]},
    q08:{answers:[[38.0,44.7,37.6,6.8],[38.0,52.3,37.6,6.8],[38.0,60.0,37.6,6.8],[38.0,67.7,37.6,6.8]],submit:[55.5,76.6,20.3,8.5]},
    q09:{answers:[[41.4,48.5,38.8,6.8],[41.4,55.7,38.8,7.2],[41.4,63.8,38.8,6.8],[41.4,71.1,38.8,7.7]],submit:[49.8,80.9,22.2,8.1]}
  };
  function placeRefBox(el,box){if(!el||!box)return;el.style.left=box[0]+'%';el.style.top=box[1]+'%';el.style.width=box[2]+'%';el.style.height=box[3]+'%';}
  function layoutSecretReference(kind){
    const scene=$('#secretLevelScene'),art=$('#secretReferenceArt'),stage=$('#secretRefStage');
    kind=kind||scene.dataset.reference;
    const nw=art.naturalWidth,nh=art.naturalHeight,sw=scene.clientWidth,sh=scene.clientHeight;
    if(nw&&nh&&sw&&sh){const k=Math.max(sw/nw,sh/nh),w=nw*k,h=nh*k;stage.style.left=(sw-w)/2+'px';stage.style.top=(sh-h)/2+'px';stage.style.width=w+'px';stage.style.height=h+'px';}
    const spots=REF_HOTSPOTS[kind]||{};
    placeRefBox($('#secretRefEnter'),kind==='unexpected'?spots.button:null);
    placeRefBox($('#secretRefRound'),kind!=='unexpected'?spots.button:null);
    placeRefBox($('#secretRefSubmit'),spots.submit);
    placeRefBox($('#secretRefContinue'),spots.submit);
    $$('#secretRefAnswers .secret-reference-answer').forEach((answer,i)=>placeRefBox(answer,spots.answers&&spots.answers[i]));
  }
  $('#secretReferenceArt').addEventListener('load',()=>layoutSecretReference());
  window.addEventListener('resize',()=>layoutSecretReference());
  function setSecretReference(kind){const scene=$('#secretLevelScene'),art=$('#secretReferenceArt'),active=kind!=='none',intro=kind==='unexpected'||kind==='round-intro'||kind==='round-two-intro'||kind==='round-three-intro',quiz=/^q0[1-9]$/.test(kind);const prevKind=scene.dataset.reference;scene.dataset.reference=kind;scene.classList.toggle('reference-intro',intro);scene.classList.toggle('reference-quiz',quiz);art.hidden=!active;if(!active)endRefTransition();setReferenceFeedback('');const n=kind.startsWith('q0')?Number(kind.slice(1)):0;if(active)setRefArt(art,kind==='unexpected'?'assets/secret-level/unexpected-transmission-blank.jpg':kind==='round-intro'?'assets/secret-level/round-one-intro.png':kind==='round-two-intro'?'assets/secret-level/round-two-intro.png':kind==='round-three-intro'?'assets/secret-level/round-three-intro.png':n<=3?`assets/secret-level/round-one-${kind}.png`:n<=6?`assets/secret-level/round-two-${kind}.png`:`assets/secret-level/round-three-${kind}.png`,prevKind,kind);$('#secretRefEnter').hidden=kind!=='unexpected';$('#secretRefRound').hidden=!intro||kind==='unexpected';$('#secretRefRound').setAttribute('aria-label',kind==='round-two-intro'?'Begin Round II':kind==='round-three-intro'?'Begin Round III':'Begin Round I');$('#secretRefSubmit').hidden=!quiz;$('#secretRefContinue').hidden=true;$('#secretRefSkip').hidden=!quiz;$('#secretRefAnswers').replaceChildren();if(quiz){const count=kind==='q03'?3:4;for(let i=0;i<count;i++){const b=document.createElement('button');b.type='button';b.className='secret-reference-answer';b.dataset.index=String(i);b.setAttribute('aria-label',`Answer ${String.fromCharCode(65+i)}`);b.addEventListener('click',()=>{const radio=$$('#answerOptions input[name="roundAnswer"]')[i];if(radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));$('#secretRefAnswers').querySelectorAll('.secret-reference-answer').forEach((answer,index)=>answer.classList.toggle('selected',index===i));}else if(kind==='q02'){$('#answerText').value='Itachi';}});$('#secretRefAnswers').append(b);}}layoutSecretReference(kind);}
  // File 002 opening. The paper is clean art; the notice is live text laid over the spots where it was painted
  // (x, y = line centre and w = line width in artwork pixels, r = tilt) so it can type itself out.
  const INTRO_ART_W=1672,INTRO_ART_H=941,INTRO_TYPE_SPEED=.6,INTRO_PAUSE_SCALE=.55;
  const INTRO_STEPS=[
    {lines:[{t:'\u26A1 UNEXPECTED TRANSMISSION DETECTED',x:838,y:182,w:555,r:-4.2,c:'red',s:18}],pause:420},
    {plate:{k:'banner',x:848,y:247,w:548,h:78,r:-4.7},lines:[{t:'A SECRET LEVEL',x:850,y:249,w:433,r:-4.7,c:'cream',s:62}],pause:380,glitch:true},
    {lines:[{t:'HAS BEEN UNLOCKED',x:852,y:319,w:393,r:-4.6,c:'red',s:52}],pause:260},
    {plate:{k:'rule',x:748,y:368,w:340,r:-4.8},pause:520},
    {lines:[{t:'Well, well, Detective...',x:858,y:402,w:245,r:-1.4,s:18},{t:"Looks like you've stumbled upon a secret level",x:860,y:426,w:476,r:-1.4,s:14},{t:"you weren't meant to find.",x:858,y:449,w:267,r:-1.4,s:16}],pause:520},
    {lines:[{t:'Before the real investigation resumes,',x:864,y:490,w:392,r:-1.4,s:14},{t:"there's a little detour waiting for you.",x:863,y:513,w:420,r:-1.4,s:14}],pause:520},
    {plate:{k:'strip',x:862,y:570,w:610,h:58,r:-1.3},lines:[{t:'3 ROUNDS. 9 QUESTIONS. 1 HIDDEN REWARD.',x:862,y:569,w:550,r:-1.3,c:'red',s:18}],pause:520},
    {lines:[{t:'Clear the level to unlock your next lead.',x:861,y:626,w:423,r:-1.4,s:14},{t:'Think fast, Detective. No cheating.',x:861,y:649,w:357,r:-1.4,s:14},{t:'Some doors open only to those who know',x:863,y:673,w:393,r:-1.4,s:14},{t:'a little more than they let on.',x:862,y:697,w:319,r:-1.4,s:14}],pause:450}
  ];
  let introSeq=0,introBuilt=false;
  const introPct=(v,total)=>(v/total*100).toFixed(3)+'%';
  function fitIntroFont(el,targetW,textEl){
    // Scale the font so the line is exactly as wide as the line it replaces on the painted paper.
    el.style.fontSize=(100/INTRO_ART_W*100)+'cqw';
    const stageW=$('#secretRefStage').getBoundingClientRect().width||INTRO_ART_W,probe=textEl||el;
    const natural=probe.getBoundingClientRect().width/(stageW/INTRO_ART_W);
    if(natural>0)el.style.fontSize=(100*targetW/natural/INTRO_ART_W*100)+'cqw';
  }
  function buildSecretIntro(){
    const host=$('#secretIntroType');host.replaceChildren();
    const placeBox=(el,x,y,w,h,r)=>{el.style.left=introPct(x-w/2,INTRO_ART_W);el.style.top=introPct(y-(h||0)/2,INTRO_ART_H);el.style.width=introPct(w,INTRO_ART_W);if(h)el.style.height=introPct(h,INTRO_ART_H);el.style.transform=`rotate(${r}deg)`;};
    INTRO_STEPS.forEach(step=>{
      if(step.plate){const p=step.plate,el=document.createElement('div');el.className='plate '+p.k;placeBox(el,p.x,p.y,p.w,p.h,p.r);if(p.k==='rule'){el.style.left=introPct(p.x,INTRO_ART_W);el.style.top=introPct(p.y,INTRO_ART_H);el.style.width=introPct(p.w,INTRO_ART_W);el.style.transform=`rotate(${p.r}deg)`;}host.append(el);step.plateEl=el;}
      (step.lines||[]).forEach(line=>{
        const el=document.createElement('div');el.className='il'+(line.c?' '+line.c:'');
        const on=document.createElement('i'),off=document.createElement('i');on.className='on';off.className='off';off.textContent=line.t;el.append(on,off);
        host.append(el);fitIntroFont(el,line.w,off);
        const lh=parseFloat(el.style.fontSize)||1;
        placeBox(el,line.x,line.y,line.w,0,line.r);el.style.top=`calc(${introPct(line.y,INTRO_ART_H)} - ${lh/2}cqw)`;
        line.el=el;line.on=on;line.off=off;
      });
    });
    const label=$('#secretRefEnter .secret-enter-label');
    if(label){fitIntroFont(label,301,label);}
    introBuilt=true;
  }
  function revealIntroInstantly(){
    INTRO_STEPS.forEach(step=>{step.plateEl&&step.plateEl.classList.add('show');(step.lines||[]).forEach(l=>{l.on.textContent=l.t;l.off.textContent='';l.el.classList.remove('typing');});});
    const scene=$('#secretLevelScene');scene.classList.add('intro-ready');
  }
  function typeIntroLine(line,done,seq){
    line.el.classList.add('typing');let n=0;
    const tick=()=>{
      if(seq!==introSeq)return;
      n++;keyTick();line.on.textContent=line.t.slice(0,n);line.off.textContent=line.t.slice(n);
      if(n>=line.t.length){line.el.classList.remove('typing');done();return;}
      const ch=line.t[n-1],step=line.s*INTRO_TYPE_SPEED,jitter=/[.,]/.test(ch)?step*5:Math.random()*step*.7;
      laterWait(tick,step+jitter);
    };
    laterWait(tick,line.s*INTRO_TYPE_SPEED);
  }
  function runIntroSteps(seq){
    const scene=$('#secretLevelScene');
    let si=0;
    const nextStep=()=>{
      if(seq!==introSeq)return;
      if(si>=INTRO_STEPS.length){laterWait(()=>{if(seq!==introSeq)return;scene.classList.add('intro-ready');},350);return;}
      const step=INTRO_STEPS[si++];
      if(step.plateEl)step.plateEl.classList.add('show');
      const finish=()=>{if(step.glitch){const host=$('#secretIntroType');host.classList.add('glitch');laterWait(()=>host.classList.remove('glitch'),240);}laterWait(nextStep,(step.pause||300)*INTRO_PAUSE_SCALE);};
      const lines=step.lines||[];let li=0;
      const nextLine=()=>{if(seq!==introSeq)return;if(li>=lines.length){finish();return;}typeIntroLine(lines[li++],()=>laterWait(nextLine,70),seq);};
      laterWait(nextLine,step.plate&&step.plate.k!=='rule'?380:60);
    };
    nextStep();
  }
  function playSecretSignal(seq,afterSignal){
    const sig=$('#secretSignal'),scene=$('#secretLevelScene'),cv=sig.querySelector('canvas'),g=cv.getContext('2d');
    const freq=sig.querySelector('.tl b'),pct=sig.querySelector('.bl b'),mid=sig.querySelector('.mid'),hud=sig.querySelector('.hud');
    sig.getAnimations({subtree:true}).forEach(a=>a.cancel());
    mid.textContent='SEARCHING';mid.style.color='';
    sig.hidden=false;sig.className='secret-signal';scene.classList.add('intro-hold');
    void sig.offsetWidth;sig.classList.add('run');
    const t0=performance.now(),LOCK=3200;
    const loop=()=>{
      if(seq!==introSeq)return;
      const t=performance.now()-t0,L=Math.min(1,t/LOCK),k=L*L*(3-2*L);
      g.clearRect(0,0,960,540);
      // one thin line tuning from static to a calm wave, with a faint afterglow
      for(let pass=0;pass<2;pass++){
        g.beginPath();g.lineWidth=pass?1.2:4;g.strokeStyle=pass?'rgba(255,214,150,.95)':'rgba(217,164,78,.16)';
        for(let x=0;x<=960;x+=3){
          const calm=Math.sin(x*.012+t*.0016)*38*Math.sin(x*.0036+.8),noise=(Math.random()*2-1)*(70*(1-k)+3);
          const y=270+calm*(.25+.75*k)+noise*(.4+.6*(1-k));x?g.lineTo(x,y):g.moveTo(x,y);
        }
        g.stroke();
      }
      freq.textContent=k<.93?(Math.random()*999).toFixed(3).padStart(7,'0'):'014.820';pct.textContent=Math.floor(k*100);
      if(L<1)requestAnimationFrame(loop);else{mid.textContent='SIGNAL LOCKED';mid.style.color='#f4dca4';}
    };
    loop();
    // hand-off: the lamp starts rising while the signal dissolves, so the two overlap instead of cutting
    laterWait(()=>{
      if(seq!==introSeq)return;
      afterSignal();
      cv.animate([{opacity:.9,transform:'scaleY(1)'},{opacity:0,transform:'scaleY(.2)'}],{duration:1500,easing:'ease-in-out',fill:'forwards'});
      hud.animate([{opacity:1},{opacity:0}],{duration:1100,delay:200,easing:'ease-in',fill:'forwards'});
      sig.animate([{opacity:1},{opacity:1,offset:.7},{opacity:0}],{duration:1700,fill:'forwards'});
    },LOCK+600);
    laterWait(()=>{if(seq!==introSeq)return;sig.hidden=true;sig.className='secret-signal';sig.getAnimations({subtree:true}).forEach(a=>a.cancel());},LOCK+600+1800);
  }
  function endSecretIntro(){
    introSeq++;clearTimers();
    const sig=$('#secretSignal');sig.getAnimations({subtree:true}).forEach(x=>x.cancel());sig.hidden=true;sig.className='secret-signal';
    $('#secretLevelScene').classList.remove('intro-lamp','intro-hold');
  }
  function playSecretIntro(){
    const scene=$('#secretLevelScene'),seq=++introSeq;
    scene.classList.add('intro-playing');scene.classList.remove('intro-ready','intro-lamp');
    const start=()=>{if(!introBuilt||!$('#secretIntroType').childElementCount)buildSecretIntro();};
    const reset=()=>{INTRO_STEPS.forEach(step=>{step.plateEl&&step.plateEl.classList.remove('show');(step.lines||[]).forEach(l=>{l.on.textContent='';l.off.textContent=l.t;l.el.classList.remove('typing');});});};
    const begin=()=>{
      start();reset();
      if(reducedMotion){revealIntroInstantly();return;}
      scene.classList.remove('intro-hold');scene.classList.add('intro-lamp');
      laterWait(()=>runIntroSteps(seq),2900);
      laterWait(()=>scene.classList.remove('intro-lamp'),5600);
    };
    const go=()=>{if(seq!==introSeq)return;if(reducedMotion){begin();return;}playSecretSignal(seq,begin);};
    // wait for the stage to be laid out and the typewriter font to load, so line widths fit the paper
    (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{layoutSecretReference('unexpected');start();go();})));
  }
  // clicking anywhere while it types finishes the notice at once
  $('#secretLevelScene').addEventListener('click',e=>{
    const scene=$('#secretLevelScene');
    if(!scene.classList.contains('intro-playing')||scene.classList.contains('intro-ready')||scene.dataset.reference!=='unexpected')return;
    introSeq++;clearTimers();const sig=$('#secretSignal');sig.getAnimations({subtree:true}).forEach(x=>x.cancel());sig.hidden=true;sig.className='secret-signal';scene.classList.remove('intro-lamp','intro-hold');revealIntroInstantly();
  });
  function openSecretLevel({testMode=false}={}){clearTimers();secretTestMode=testMode;if(testMode)secretTestRounds={1:emptyRound(roundOneQuestions),2:emptyRound(roundTwoQuestions),3:emptyRound(roundThreeQuestions)};setSecretReference('unexpected');$('#secretIntro').hidden=false;$('#secretDashboard').hidden=true;$('#roundIntro').hidden=true;$('#roundTwoIntro').hidden=true;$('#roundThreeIntro').hidden=true;$('#quizInterface').hidden=true;$('#dossierInterface').hidden=true;show($('#secretLevelScene'));playSecretIntro();}
  function openSecretDashboard(){clearTimers();setSecretReference('none');renderSecretDashboard();$('#secretIntro').hidden=true;$('#secretDashboard').hidden=false;$('#roundIntro').hidden=true;$('#roundTwoIntro').hidden=true;$('#roundThreeIntro').hidden=true;$('#quizInterface').hidden=true;$('#dossierInterface').hidden=true;}
  function renderSecretDashboard(){const records=[1,2,3].map(n=>readRound(n));const done=records.reduce((sum,r)=>sum+r.questions.filter(q=>q.complete).length,0);$('#secretQuestionsComplete').textContent=`${done} / 9 QUESTIONS`;$('#secretXpTotal').textContent=`${earnedXp()} XP`;$('#secretDashboardProgress').style.setProperty('--secret-progress',`${done/9*100}%`);$('#secretDashboardRounds').querySelectorAll('[data-round]').forEach((card,i)=>{const complete=records[i].questions.every(q=>q.complete);card.classList.toggle('complete',complete);card.querySelector('small').textContent=complete?'CLEARED':`ROUND 0${i+1}`;});}
  // Final numbers come from the saved rounds and the question table, not from fixed text:
  // XP earned over the XP on offer, and trials the investigator actually solved (verified, XP awarded).
  function finalStats(){
    const records=[1,2,3].map(n=>readRound(n)),sets=[roundOneQuestions,roundTwoQuestions,roundThreeQuestions];
    const max=sets.flat().reduce((s,q)=>s+q.xp,0),total=sets.reduce((s,set)=>s+set.length,0);
    let xp=0,solved=0;
    records.forEach(r=>r.questions.forEach(q=>{const got=q.complete?Number(q.xpAwarded)||0:0;xp+=got;if(got>0)solved++;}));
    return {xp,max,solved,total};
  }
  // Painted screen, so it is lit rather than typed: the lantern lights the left side, a scan line then works down
  // the paper in steps (heading, each paragraph, report rows) and the numbers count up as their row appears.
  const FIN_STOPS=[[17.5,620,0],[22.6,380,180],[31.2,640,180],[40.1,640,180],[43.8,380,160],[50.4,560,420],[60,560,120],[65.5,330,0,'xp'],[71.2,330,0,'trials'],[76.8,330,0,'case'],[82.4,330,0,'det'],[87.3,420,220],[100,420,0,'btn']];
  let finSeq=0;
  function layoutFinStage(){
    const scene=$('#secretRewardScene'),art=$('#finalArt'),stage=$('#finStage');
    const nw=art.naturalWidth||1672,nh=art.naturalHeight||941,sw=scene.clientWidth,sh=scene.clientHeight;
    if(!sw||!sh)return;
    const k=Math.max(sw/nw,sh/nh),w=nw*k,hgt=nh*k;
    stage.style.left=(sw-w)/2+'px';stage.style.top=(sh-hgt)/2+'px';stage.style.width=w+'px';stage.style.height=hgt+'px';
  }
  $('#finalArt').addEventListener('load',layoutFinStage);
  window.addEventListener('resize',layoutFinStage);
  function finalStateInstant(stats){
    const stage=$('#finStage');
    stage.getAnimations({subtree:true}).forEach(a=>a.cancel());
    $('#finLamp').classList.add('done');$('#finVeil').classList.add('done');$('#finScan').style.opacity=0;
    $('#finalXpValue').textContent=String(stats.xp);$('#finalTrialsValue').textContent=String(stats.solved);
    stage.querySelectorAll('.final-report-row').forEach(r=>{r.style.opacity=1;});
    stage.classList.add('fin-ready');
  }
  function playFinalReport(stats){
    const seq=++finSeq,stage=$('#finStage'),lamp=$('#finLamp'),veil=$('#finVeil'),scan=$('#finScan');
    const rows={xp:stage.querySelector('.row-xp'),trials:stage.querySelector('.row-trials')};
    stage.getAnimations({subtree:true}).forEach(a=>a.cancel());
    stage.classList.remove('fin-ready');lamp.classList.remove('done','run');veil.classList.remove('done');
    scan.style.opacity=0;veil.style.clipPath='inset(0% 0 0 0)';
    Object.values(rows).forEach(r=>{r.style.opacity=0;});
    $('#finalXpValue').textContent='0';$('#finalTrialsValue').textContent='0';
    layoutFinStage();
    if(reducedMotion){finalStateInstant(stats);return;}
    const wait=ms=>new Promise(r=>setTimeout(r,ms)),alive=()=>seq===finSeq;
    const count=(el,to,ms)=>{const t0=performance.now();const tick=()=>{if(!alive())return;const p=Math.min(1,(performance.now()-t0)/ms),e=1-Math.pow(1-p,3);el.textContent=String(Math.round(to*e));if(p<1)requestAnimationFrame(tick);};tick();};
    (async()=>{
      stage.animate([{transform:'scale(1.035)'},{transform:'scale(1)'}],{duration:11000,easing:'ease-out'});
      $('#completionStage').animate([{opacity:0},{opacity:1}],{duration:700,easing:'ease-out'});
      void lamp.offsetWidth;lamp.classList.add('run');
      await wait(2300);if(!alive())return;
      lamp.classList.add('done');
      let cur=0;
      const reveal=async(to,ms)=>{
        const o={duration:ms,easing:'cubic-bezier(.45,0,.25,1)',fill:'forwards'};
        veil.animate([{clipPath:`inset(${cur}% 0 0 0)`},{clipPath:`inset(${to}% 0 0 0)`}],o);
        scan.animate([{top:cur+'%',opacity:1},{top:to+'%',opacity:to>=100?0:1}],o);
        cur=to;await wait(ms);
      };
      for(const [to,ms,dwell,tag] of FIN_STOPS){
        if(!alive())return;
        if(tag==='xp'){rows.xp.animate([{opacity:0},{opacity:1}],{duration:260,fill:'forwards'});count($('#finalXpValue'),stats.xp,1100);}
        if(tag==='trials'){rows.trials.animate([{opacity:0},{opacity:1}],{duration:260,fill:'forwards'});count($('#finalTrialsValue'),stats.solved,900);}
        if(tag==='case')stage.querySelector('.glow-case').animate([{opacity:0},{opacity:1,offset:.3},{opacity:0}],{duration:900});
        if(tag==='det')stage.querySelector('.glow-det').animate([{opacity:0},{opacity:1,offset:.12},{opacity:.15,offset:.3},{opacity:1,offset:.45},{opacity:.2,offset:.7},{opacity:.9,offset:.85},{opacity:0}],{duration:1400});
        await reveal(to,ms);if(!alive())return;
        if(to===17.5){
          // the wax seal "presses" as the heading is revealed
          $('#finSealRing').animate([{opacity:.9,transform:'translate(-50%,-50%) scale(.3)'},{opacity:0,transform:'translate(-50%,-50%) scale(1.9)'}],{duration:900,easing:'ease-out'});
          stage.animate([{transform:'translate(0,0)'},{transform:'translate(-3px,2px)'},{transform:'translate(2px,-1px)'},{transform:'translate(0,0)'}],{duration:240});
        }
        if(dwell)await wait(dwell);
      }
      if(!alive())return;
      veil.classList.add('done');scan.style.opacity=0;stage.classList.add('fin-ready');
    })();
  }
  // clicking the report while it is being revealed finishes it at once
  $('#completionStage').addEventListener('click',e=>{
    if(e.target.closest('#finalClaimButton')||$('#finStage').classList.contains('fin-ready'))return;
    finSeq++;finalStateInstant(finalStats());
  });
  function startSecretReward(){
    clearTimers();
    const scene=$('#secretRewardScene');
    const stats=finalStats();
    $('#finalXpMax').textContent=` / ${stats.max}`;
    $('#finalXpValue').textContent=String(stats.xp);
    $('#finalTrialsValue').textContent=String(stats.solved);
    $('#completionStage').hidden=false;
    $('#chocolateRewardStage').hidden=true;
    show(scene);
    playFinalReport(stats);
  }
  function openRoundIntro(){selectRound(1);setSecretReference('round-intro');$('#secretIntro').hidden=true;$('#secretDashboard').hidden=true;$('#roundIntro').hidden=false;$('#roundTwoIntro').hidden=true;$('#roundThreeIntro').hidden=true;$('#quizInterface').hidden=true;$('#dossierInterface').hidden=true;}
  function renderRoundRecord(){
    const host=$('#roundRecord');host.replaceChildren();
    round.questions.forEach((record,i)=>{
      const q=questions[i],row=document.createElement('section');row.className='record-row';row.style.setProperty('--record-index',i);
      const heading=document.createElement('h2');heading.textContent=`${q.id} — ${q.title}`;row.append(heading);
      const final=document.createElement('p');final.className='record-answer';final.textContent=`Final answer: ${record.answer||'—'}`;row.append(final);
      if(record.attempts.length>1){const history=document.createElement('p');history.className='record-history';history.textContent=`Earlier conclusion${record.attempts.length>2?'s':''}: ${record.attempts.slice(0,-1).map(a=>a.answer).join(' · ')}`;row.append(history);}
      const verified=document.createElement('span');verified.className='record-verified';verified.textContent=record.complete?'VERIFIED':'REQUIRES REVIEW';row.append(verified);
      const xp=document.createElement('span');xp.className='record-xp';xp.textContent=`+${record.xpAwarded||0} XP`;row.append(xp);
      const attempts=document.createElement('small');attempts.className='record-attempts';attempts.textContent=`${record.attempts.length} ATTEMPT${record.attempts.length===1?'':'S'}`;row.append(attempts);host.append(row);
    });
    const total=roundXp(),count=completedCount(),maximum=questions.reduce((s,q)=>s+q.xp,0);
    $('#recordTransmission').textContent=`TRANSMISSION 0${roundNumber}`;
    $('#recordRoundTitle').textContent=roundNumber===2?'ROUND II — THE IMMORTAL’S GAME':roundNumber===3?'ROUND III — BEYOND THE WALLS':'ROUND I — THE SHINOBI TEST';
    $('#recordRoundLabel').textContent=`ROUND ${roundNumber} · INVESTIGATION RECORD`;
    $('#recordTotal').textContent=`${total} / ${maximum} XP`;$('#recordScoreLabel').textContent=roundNumber===3?'ROUND III SCORE':'ROUND SCORE';
    $('#recordOverall').textContent=`OVERALL EARNED · ${earnedXp()} XP`;
    $('#recordVerified').textContent=`${count} / ${questions.length} VERIFIED`;
    $('#dossierScore').textContent=`OVERALL SCORE: ${earnedXp()} XP`;
    $('#recordSummary').textContent=roundNumber===3?'THREE FINAL TRIALS. THREE CONCLUSIONS VERIFIED.':roundNumber===2?'THREE FILES EXAMINED. THREE CONCLUSIONS VERIFIED.':'THREE QUESTIONS EXAMINED. THREE CONCLUSIONS VERIFIED.';
    $('#recordClosing').textContent=roundNumber===3?'Beyond the walls, the truth was always there. We just had to look.':roundNumber===2?'Some truths survive every attempt to bury them.':'Every conclusion verified. The investigation continues.';
    $('#roundContinue').textContent='CONTINUE →';
    $('#roundContinue').hidden=count!==questions.length;
  }
  function showRoundDossier(){round=readRound();if(completedCount()!==questions.length)return;if(!secretTestMode){levelState[`round${roundNumber}Complete`]=true;persistLevelState();}if(roundNumber===1){selectRound(2);setSecretReference('round-two-intro');$('#secretIntro').hidden=true;$('#secretDashboard').hidden=true;$('#roundIntro').hidden=true;$('#roundTwoIntro').hidden=false;$('#roundThreeIntro').hidden=true;$('#quizInterface').hidden=true;$('#dossierInterface').hidden=true;return;}if(roundNumber===2){selectRound(3);setSecretReference('round-three-intro');$('#secretIntro').hidden=true;$('#secretDashboard').hidden=true;$('#roundIntro').hidden=true;$('#roundTwoIntro').hidden=true;$('#roundThreeIntro').hidden=false;$('#quizInterface').hidden=true;$('#dossierInterface').hidden=true;return;}$('#dossierInterface').hidden=true;startSecretReward();}
  function renderQuestion(){
    round=readRound();const i=round.questions.findIndex(q=>!q.complete);
    if(i<0){showRoundDossier();return;}
    activeQuestion=i;const q=questions[i],record=round.questions[i];
    setSecretReference(roundNumber===1?`q0${i+1}`:roundNumber===2?`q0${i+4}`:roundNumber===3?`q0${i+7}`:'none');
    $('#quizInterface').hidden=false;$('#dossierInterface').hidden=true;$('#secretIntro').hidden=true;$('#secretDashboard').hidden=true;$('#roundIntro').hidden=true;$('#roundTwoIntro').hidden=true;$('#roundThreeIntro').hidden=true;$('#quizInterface').dataset.round=String(roundNumber);$('#quizInterface').dataset.question=q.id;
    $('#quizProgress').textContent=`${String(i+1).padStart(2,'0')} / ${questions.length}`;$('#quizScore').textContent=`SCORE: ${earnedXp()}`;
    $('#quizSteps').style.setProperty('--step-progress',`${questions.length>1?i/(questions.length-1)*100:0}%`);
    $('#quizSteps').querySelectorAll('[data-step]').forEach((step,index)=>{step.classList.toggle('current',index===i);step.classList.toggle('complete',index<i&&round.questions[index].complete);});
    const roundLabel=roundNumber===2?'ROUND II — THE IMMORTAL’S GAME':roundNumber===3?'ROUND III — BEYOND THE WALLS':'ROUND I — THE SHINOBI TEST';$('#quizHeaderRound').textContent=roundLabel;
    $('#questionNumber').textContent=q.id;$('#questionDifficulty').textContent=q.difficulty;$('#questionXp').textContent=`${q.xp} XP`;
    $('#questionTitle').textContent=q.title;$('#questionPrompt').textContent=q.prompt;
    const paper=$('#quizInterface .quiz-paper');paper.classList.remove('question-enter');void paper.offsetWidth;paper.classList.add('question-enter');
    const evidenceWall=$('#quizInterface .secret-evidence-wall');evidenceWall.classList.remove('evidence-enter');void evidenceWall.offsetWidth;evidenceWall.classList.add('evidence-enter');
    const evidenceArt=['assets/secret-level/q01-shinobi.jpg','assets/secret-level/q02-cipher.jpg','assets/secret-level/q03-scrolls.jpg','assets/secret-level/q04-salvatore.jpg','assets/secret-level/q05-immortality.jpg','assets/secret-level/q06-bell.jpg','assets/secret-level/q07-walls.jpg','assets/secret-level/q08-code.jpg','assets/secret-level/q09-transmission.jpg'][Number(q.id)-1];
    $('#secretEvidenceArt').src=evidenceArt;$('#secretEvidenceCaption').textContent=`CASE 25 · EVIDENCE ${q.id}`;
    const options=$('#answerOptions');options.replaceChildren();$('#answerText').hidden=!q.text;$('#answerTextLabel').hidden=!q.text;$('#answerText').value='';
    if(q.options)q.options.forEach((value,index)=>{const label=document.createElement('label');label.className='answer-option';const radio=document.createElement('input');radio.type='radio';radio.name='roundAnswer';radio.value=value;const key=document.createElement('span');key.textContent=String.fromCharCode(65+index);const text=document.createElement('span');text.textContent=value;label.append(radio,key,text);radio.addEventListener('change',()=>options.querySelectorAll('.answer-option').forEach(option=>option.classList.toggle('selected',option===label)));options.append(label);});
    const last=record.attempts.at(-1);$('#answerFeedback').textContent=last&&!last.correct?'CONCLUSION REJECTED · REVIEW THE EVIDENCE AND TRY AGAIN.':'';setReferenceFeedback('');$('#secretRefSubmit').hidden=false;$('#secretRefSkip').hidden=false;
    $('#answerFeedback').classList.toggle('rejected',!!last&&!last.correct);$('#answerExplanation').hidden=true;$('#questionContinue').hidden=true;$('#secretRefContinue').hidden=true;$('#questionSkip').hidden=false;$('#answerForm').querySelector('.submit-answer').hidden=false;$('#answerForm').querySelector('.submit-answer').disabled=false;
  }
  $('#answerForm').addEventListener('submit',event=>{
    event.preventDefault();const q=questions[activeQuestion],record=round.questions[activeQuestion];
    if(!q||record.complete)return;
    const selected=q.text?$('#answerText').value.trim():$('#answerOptions input:checked')?.value;
    if(!selected){$('#answerFeedback').textContent='RECORD A CONCLUSION BEFORE SUBMITTING.';setReferenceFeedback('Select an answer before submitting.','error');return;}
    const normalized=value=>String(value).trim().toLowerCase().replace(/[^a-z0-9]/g,'');
    const correct=(q.acceptedAnswers||[q.answer]).some(answer=>normalized(selected)===normalized(answer));record.attempts.push({answer:selected,correct});
    if(correct&&!record.complete){record.answer=selected;record.complete=true;record.xpAwarded=q.xp;persistRound();renderSecretDashboard();$('#answerFeedback').textContent='EVIDENCE VERIFIED · XP RECORDED.';setReferenceFeedback(`Evidence verified · +${q.xp} XP recorded.`,'success');$('#answerFeedback').classList.remove('rejected');$('#answerForm').querySelector('.submit-answer').disabled=true;$('#quizScore').textContent=`SCORE: ${earnedXp()}`;
      $('#answerExplanation').textContent=q.explanation||'The answer matches the evidence in this trial.';$('#answerExplanation').hidden=false;$('#answerForm .submit-answer').hidden=true;$('#secretRefSubmit').hidden=true;$('#questionSkip').hidden=true;$('#secretRefSkip').hidden=true;$('#questionContinue').textContent='CONTINUE →';$('#questionContinue').hidden=false;$('#secretRefContinue').hidden=true;autoAdvanceAfterCorrect();}
    else{const wrongCount=record.attempts.filter(attempt=>!attempt.correct).length;if(wrongCount>=2){record.complete=true;record.answer=q.answer;record.xpAwarded=0;persistRound();$('#answerFeedback').innerHTML=`CONCLUSION REJECTED TWICE · THE CORRECT ANSWER IS <strong>${q.answer}</strong>.`;setReferenceFeedback(`Incorrect conclusion (2/2). The correct answer is: ${q.answer}. Click Continue to proceed.`,'error');$('#answerFeedback').classList.add('rejected');$('#answerForm .submit-answer').hidden=true;$('#secretRefSubmit').hidden=true;$('#questionSkip').hidden=true;$('#secretRefSkip').hidden=true;$('#questionContinue').textContent='CONTINUE →';$('#questionContinue').hidden=false;$('#secretRefContinue').hidden=false;}else{persistRound();$('#answerFeedback').textContent='CONCLUSION REJECTED · REVIEW THE EVIDENCE AND TRY AGAIN.';setReferenceFeedback('Incorrect conclusion — 1 attempt remaining. Try again.','error');$('#answerFeedback').classList.add('rejected');$('#secretRefSubmit').hidden=false;$('#secretRefContinue').hidden=true;$('#secretRefSkip').hidden=false;}}
  });
  // File 03 keeps its puzzle answers separate from the shared chapter progression.
  const FILE03_KEY='case25File03NorthQuayV1';
  const F3_QUESTIONS=[
    {title:'ONE ENTRY TOO MANY?',prompt:'The bank export contains four rows. How many underlying transfers are supported by the records provided?',options:['Three','Four','Six'],answer:0,explain:'The records support three underlying transfers: T-17, T-22 and T-31. The fourth row, T-31-R, is explicitly marked as a replay of T-31, not a separately confirmed payment.',hint:'Look closely at Document 3. One entry is explicitly marked as a replay of an earlier transaction.'},
    {title:'THE EXTRA ROW',prompt:'Which entry in the bank export is explicitly marked as a replay of an earlier transaction?',options:['T-17','T-31-R','NQ-104-R','T-22'],answer:1,explain:'The bank export explicitly labels T-31-R as a replay and references the original transaction T-31. This is not independent confirmation of another payment.',hint:'Check the status column in the bank export. Look for the entry labelled REPLAY and the original transaction reference.'}
  ];
  function readFile03(){
    const fresh={stage:'transmission',transmissionViewed:false,coverOpened:false,answers:[null,null],attempts:[[],[]],question03Text:'',question03Accepted:false,deductionDraft:'',deductionAccepted:false,finalViewed:false,p2:{stage:'locked',answers:['','','',''],accepted:[false,false,false,false],attempts:[0,0,0,0],draft:'',finalAccepted:false,transmissionViewed:false},p3:{stage:'locked',q1:{times:['','',''],accepted:false,xpAwarded:0,attempts:0},q2:{order:[],reliability:[],reasoning:'',accepted:false,xpAwarded:0,attempts:0},q3:{answer:null,accepted:false,xpAwarded:0,attempts:[]},q4:{draft:'',accepted:false,xpAwarded:0,attempts:0},transmissionViewed:false,reportViewed:false,finalTransmissionViewed:false,giftShown:false,complete:false,xpAwarded:0}};
    try{const saved=JSON.parse(localStorage.getItem(FILE03_KEY)||'{}'),state={...fresh,...saved,answers:Array.isArray(saved.answers)?[...fresh.answers,...saved.answers].slice(0,2):fresh.answers,attempts:Array.isArray(saved.attempts)?[...fresh.attempts,...saved.attempts].slice(0,2):fresh.attempts};state.p2={...fresh.p2,...(saved.p2||{}),answers:Array.isArray(saved.p2?.answers)?[...fresh.p2.answers,...saved.p2.answers].slice(0,4):fresh.p2.answers,accepted:Array.isArray(saved.p2?.accepted)?[...fresh.p2.accepted,...saved.p2.accepted].slice(0,4):fresh.p2.accepted,attempts:Array.isArray(saved.p2?.attempts)?[...fresh.p2.attempts,...saved.p2.attempts].slice(0,4):fresh.p2.attempts};
      state.p3={...fresh.p3,...(saved.p3||{}),q1:{...fresh.p3.q1,...(saved.p3?.q1||{}),times:Array.isArray(saved.p3?.q1?.times)?[...fresh.p3.q1.times,...saved.p3.q1.times].slice(0,3):fresh.p3.q1.times},q2:{...fresh.p3.q2,...(saved.p3?.q2||{}),order:Array.isArray(saved.p3?.q2?.order)?saved.p3.q2.order:[],reliability:Array.isArray(saved.p3?.q2?.reliability)?saved.p3.q2.reliability:[]},q3:{...fresh.p3.q3,...(saved.p3?.q3||{}),attempts:Array.isArray(saved.p3?.q3?.attempts)?saved.p3.q3.attempts:[]},q4:{...fresh.p3.q4,...(saved.p3?.q4||{})}};
      state.answers=state.answers.map((value,i)=>value===F3_QUESTIONS[i].answer?value:null);
      if(state.question03Accepted&&!validateAllocation(state.question03Text||'').accepted)state.question03Accepted=false;
      if(state.deductionAccepted&&!validateFinalDeduction(state.deductionDraft||'').accepted)state.deductionAccepted=false;
      if(state.p2.stage==='complete'&&state.p3.stage==='locked'){state.p3.stage='intro';state.stage='p3Intro';}
      if(!state.transmissionViewed&&state.p3.stage==='locked')state.stage='transmission';
      else if(!state.coverOpened)state.stage='cover';
      else if(state.stage==='deduction'&&!(state.answers.every(v=>v!==null)&&state.question03Accepted))state.stage='question';
      else if(['accepted','final','complete'].includes(state.stage)&&!state.deductionAccepted)state.stage='deduction';
      return state;
    }catch{return fresh;}
  }
  let file03=readFile03(),f3Selected=null;
  if(!file03.p3.complete&&progress.file03PuzzleComplete){progress.file03PuzzleComplete=false;persistProgress();}else if(file03.p3.complete&&!progress.file03PuzzleComplete){progress.file03PuzzleComplete=true;persistProgress();}
  function saveFile03(){localStorage.setItem(FILE03_KEY,JSON.stringify(file03));}
  function setF3Panel(name){
    ['f3Transmission','f3Cover','p2Intro','f3Question','f3Deduction','f3Accepted','f3FinalMessage','p2Document','p3Intro','p3Question','p3Evidence','p3Transmission','p3Report','p3FinalTransmission','p3GiftPopup'].forEach(id=>{$('#'+id).hidden=id!==name;});
  }
  function typeFile03(target,text,button){
    target.textContent='';
    if(reducedMotion){target.textContent=text;button.hidden=false;button.focus();return;}
    let i=0;const type=()=>{target.textContent=text.slice(0,i++);if(i<=text.length){const t=setTimeout(type,24);timers.push(t);}else{button.hidden=false;button.focus();}};
    type();
  }
  const F3_OPENING=`Detective,\n\nYou've followed the trail this far.\n\nBut tell me something.\n\nWhen a man disappears,\ndoes the story end with him?\n\nOr does it leave behind something\nthat someone desperately wants forgotten?\n\nThere are things buried in this case\nthat were never meant to be found.\n\nSome were hidden deliberately.\nSome were left in plain sight.\n\nAnd some may change everything\nyou think you know about Thomas Reed.\n\nYou have the story.\nNow decide what it means.\n\nBe careful, Detective.\nThe deeper you look,\nthe less certain the truth becomes.\n\n— M`;
  const F3_ENDING=`Detective,\n\nYou found the discrepancy.\n\nYou questioned the repeated entry.\n\nAnd, more importantly, you questioned the record that claimed to explain it.\n\nMost people stop when the numbers appear to agree.\n\nYou didn't.\n\nBut money leaves more than one kind of trail.\n\nSomeone knew what the records would show.\n\nSomeone knew what they would leave out.\n\nFind the person who knew what the published story left out.\n\n— M`;
  const P2_TRANSMISSION=`You found the omission.\n\nBut an absence is not an answer.\n\nA name can be protected.\n\nA record can be replaced.\n\nA truth can survive without ever being printed.\n\nTell me, Detective—\n\nWhen two accounts disagree,\nwhich one is lying?\n\nThe one that changed?\n\nOr the one that never should have existed?\n\nYou have been reading what remains.\n\nNow look at what cannot fit.\n\n— M`;
  const P2_DOCS=[
    {title:'THE LANTERN ACCOUNTS: A SECOND INVESTIGATION',byline:'DANIEL CROSS — DRAFT COPY',body:["The disappearance of Thomas Reed has halted an examination of The Lantern's expansion financing. The account records show ₹2.4 crore that cannot presently be reconciled against verified expenditure.","Peter Shaw has said that Thomas left the venue alone. That statement remains uncorroborated by an independent witness.","A person with direct knowledge of the accounts provided this reporter with a copy of a record absent from the public archive. The source claims to have seen an earlier version before replacement pages were filed.","[PARAGRAPH REMOVED BEFORE PUBLICATION]","The missing records do not establish that Thomas's disappearance was staged. They establish that the financial review is incomplete.","Requests for comment were sent to both surviving business partners. Neither supplied the original records."]},
    {title:'THE LANTERN ACCOUNTS: QUESTIONS REMAIN',byline:'DANIEL CROSS — PUBLISHED COPY',body:["The disappearance of Thomas Reed has halted an examination of The Lantern's expansion financing. The account records show ₹2.4 crore that cannot presently be reconciled against verified expenditure.","Peter Shaw has said that Thomas left the venue alone. That statement remains uncorroborated by an independent witness.","The financial review remains incomplete. The missing records do not establish that Thomas's disappearance was staged.","Requests for comment were sent to both surviving business partners. Neither supplied the original records."]},
    {title:'RECOVERED MESSAGE — SENDER UNVERIFIED',byline:'ARCHIVE FRAGMENT · SIGNED “— E”',body:['You asked whether the entry was real.','It was real. I saw the earlier register before the replacement pages were filed.','You may publish the entry. You may not publish my name.','If you print the full account, they will know where you got it.','Do not mistake my silence for proof that Thomas is innocent.','— E']}
  ];
  const P2_QUESTIONS=[
    {title:'THE MISSING PARAGRAPH',difficulty:'EASY',prompt:'Compare Document 1 (unpublished draft) with Document 2 (published article). What material information appears in the draft but is absent from the published article?',hint:'The missing passage describes more than an unexplained financial balance. What did the source claim to have seen, and how did Daniel obtain the information?',explain:'The draft identifies an insider source who provided Daniel with a record missing from the public archive. The source claimed to have seen an earlier version before replacement pages were filed. The published article omits this source information, preventing readers from assessing the claim and the record’s provenance.',groups:[/direct knowledge|insider|source.{0,50}(account|insider|knowledge)/,/absent from (the )?public archive|missing from (the )?public archive|record.{0,35}archive/,/earlier version|earlier register|before replacement pages|replacement pages were filed/]},
    {title:'THE UNNAMED SOURCE',difficulty:'MEDIUM',prompt:'Examine Document 3 — the recovered message signed “— E.” What does the message suggest about the source’s intentions, and what does the signature establish?',hint:'Separate what the sender explicitly says from what you infer from the signature. What does the sender ask Daniel to protect, and what warning do they give?',explain:'The message indicates that the source fears being identified and wants their name withheld. The signature E may point toward Elena, but a signature alone does not independently establish who sent the message. The source’s warning also means their silence should not be treated as proof of Thomas’s innocence.',groups:[/protect.{0,25}(ident|name)|anonym|withhold.{0,20}name|fear.{0,30}(expos|identif)/,/signature.{0,45}(not|does not|cannot|doesn’t).{0,20}(prove|establish|confirm|identity)|e.{0,35}(not|does not|cannot).{0,20}(prove|establish|confirm)|identity.{0,30}(unknown|unproven|not established)/,/silence.{0,50}(not|does not|cannot).{0,20}(proof|prove)|not.{0,30}proof.{0,30}innocent/]},
    {title:'WHY WAS IT REMOVED?',difficulty:'MEDIUM–HARD',prompt:'Compare the unpublished draft, published article, and recovered message. Which explanation for Daniel’s omission is supported by the evidence, and which parts remain speculation?',hint:'The source explicitly asks Daniel to withhold their name. Does that make source protection plausible? Does it prove why Daniel made the editorial decision?',explain:'Protecting the source is consistent with the recovered message, but the documents do not establish Daniel’s precise motive. His omission removed information readers would need to evaluate the source and the record. The evidence supports a concern about transparency, not a definitive accusation of deliberate deception.',groups:[/protect.{0,30}source|source.{0,30}protect|confidential source|anonymity.{0,30}plausible/,/motive.{0,40}(unknown|unproven|not established|not proven)|does not establish.{0,30}motive|cannot prove.{0,30}motive|exact motive.{0,30}(unknown|unproven)/,/omission.{0,50}(assess|evaluat|provenance)|transparen|provenance/,/speculat|other motives?.{0,35}(unknown|unproven|not established)|deliberate deception.{0,25}(speculat|unproven|not established)/]},
    {title:'THE JOURNALIST’S SECRET',difficulty:'HARD',prompt:'Based on these three documents alone, what can you conclude about Daniel Cross’s involvement in the case? What can you not conclude? Your answer must distinguish what the documents establish from what remains unknown.',hint:'Separate the editorial omission from the underlying events. What does the draft establish about Daniel’s source, and what does it not prove about Daniel himself?',explain:'You found the omission. You identified the source’s fear. And you did not confuse suspicion with proof. Daniel withheld information. That much the documents establish. Why he withheld it remains another question.',groups:[/omitt(ed|s|ion)|draft.{0,50}published|published.{0,50}(missing|omit)/,/earlier (version|register)|replacement pages|source.{0,50}(claim|saw)/,/signature.{0,40}(not|does not|cannot).{0,20}(prove|establish|confirm)|identity.{0,30}(unknown|unproven|not established)|e.{0,30}(clue|not proof)/,/protect.{0,30}source|source.{0,30}protect|motive.{0,40}(unknown|unproven|not)/,/transparen|provenance|readers.{0,30}(assess|evaluat)|omission.{0,50}(assess|evaluat)/,/not.{0,60}(prove|establish).{0,50}(divert|disappear|fire|wrongdoing|culpab)|withhold.{0,60}(not|does not|cannot).{0,30}(prove|establish)|editorial.{0,50}(not|does not|cannot).{0,40}(prove|establish)/]}
  ];
  const P3_EVENTS=[
    {label:'Rear entrance activity · corrected 19:45:31–19:47:18',kind:'CORRECTED'},
    {label:"Peter Shaw's reported departure · approximately 20:10",kind:'ESTIMATED'},
    {label:'Damaged boat located · 07:10 following morning',kind:'SEARCH RECORD'},
    {label:'Watch and jacket entered into inventory · 08:05 following morning',kind:'SEARCH RECORD'}
  ];
  const P3_TRANSMISSION=`TIMELINE REVIEWED\n\nYou corrected the clock.\n\nYou separated the record from the witness.\n\nBut you could not establish the moment the story changed.\n\nThat is not a failure of calculation, Detective.\n\nIt is a failure of the evidence.\n\nYour next file contains something older than Thomas's disappearance.\n\nACCESS STATUS: PARTIAL\n\n— M`;
  function p3Normalize(text){return String(text||'').toLowerCase().replace(/[’]/g,"'").replace(/doesn't/g,'does not').replace(/can't/g,'cannot').replace(/isn't/g,'is not').replace(/[^a-z0-9: ]/g,' ').replace(/\s+/g,' ').trim();}
  function p3TimesCorrect(times){const expected=['19:45:31','19:46:02','19:47:18'];return expected.map((value,i)=>{const digits=String(times[i]||'').replace(/\D/g,'');return digits===value.replace(/\D/g,'');});}
  function p3TimelineResult(state){const order=state.order||[],reliability=state.reliability||[],reason=p3Normalize(state.reasoning);const ordered=order.length===4&&order.every((v,i)=>Number(v)===i);const labels=reliability.length===5&&P3_EVENTS.every((e,i)=>reliability[i]===e.kind)&&reliability[4]==='UNVERIFIED';const clock=/camera|parking/.test(reason)&&/(unverif|unknown|not calibrated|cannot correct|can't correct|no (independent|reliable) (clock|time|calibration)|no way to correct)/.test(reason);const align=/(align|synchron|compare|place|order|between)/.test(reason)&&/(cannot|can't|not confidently|not reliably|cannot safely|unknown|unverified)/.test(reason);return {accepted:ordered&&labels&&clock&&align,ordered,labels,clock,align};}
  function p3DeductionResult(text){const t=p3Normalize(text);const groups=[/seven minutes|7 minutes|subtract.{0,20}7|clock.{0,35}(fast|correct|seven|7)/,/credential.{0,80}(not|does not|cannot|unknown|identify|identity)|does not identify|not identify.{0,30}(person|user)|identity.{0,30}(unknown|not established)/,/peter.{0,70}(approx|estimate|uncorroborat|not proven|not confirmed)|uncorroborat.{0,40}peter|estimate.{0,40}peter/,/camera.{0,80}(unverif|unknown|not calibrated)|unverif.{0,40}camera/,/following morning|next morning|07:10|08:05|search records?.{0,70}(not|does not|only|when)|records?.{0,80}(not establish|do not establish).{0,50}(disappear|when)/,/(unknown|uncertain|not establish|cannot establish|not proven).{0,70}(lake|die|disappear|movement|route)|whether.{0,50}(lake|die|disappear)|exact (time|sequence|movement)/,/(calibrat|identif|witness|travel record|independent evidence|additional evidence|corroborat).{0,90}(footage|camera|timestamp|witness|record|evidence|movement|time)?/];const missing=groups.map((re,i)=>re.test(t)?null:i).filter(i=>i!==null);const unsupported=/(peter.{0,25}(murder|kill|killed)|thomas.{0,55}(murdered|died).{0,30}(lake|ash)|definitely lied)/.test(t)&&!/(not|cannot|unknown|unproven|unverified|uncertain|no evidence|does not establish|may|might|could)/.test(t);if(unsupported)missing.push(7);return {accepted:!unsupported&&missing.length<=2,missing};}
  function p3Award(record,xp){if(!record.accepted){record.accepted=true;record.xpAwarded=xp;file03.p3.xpAwarded+=xp;}}
  function p3RenderQuestion(index){const p=file03.p3;file03.stage='p3q'+(index+1);p.stage='q'+(index+1);saveFile03();setF3Panel('p3Question');$('#p3Progress').querySelectorAll('i').forEach((n,i)=>n.classList.toggle('done',i<index));$('#p3Feedback').hidden=true;$('#p3Submit').hidden=false;$('#p3Next').hidden=true;$('#p3Submit').disabled=false;$('#p3ViewEvidence').hidden=false;let body=$('#p3QuestionBody');body.replaceChildren();$('#p3Difficulty').textContent=['10 XP','20 XP','20 XP','30 XP'][index];$('#p3QCount').textContent=`INVESTIGATION 003 · ${index===3?'FINAL DEDUCTION':`EVIDENCE TEST 0${index+1}`}`;
    if(index===0){$('#p3QTitle').textContent='THE CLOCK THAT LIED';$('#p3Difficulty').textContent='10 XP';body.innerHTML='<p class="f3-prompt">The rear entrance access-control system (Document T2) was later found to be <b>seven minutes fast</b>. Displayed events: credential presented <b>19:52:31</b>; door opened <b>19:53:02</b>; door closed <b>19:54:18</b>.</p><p class="p3-question">What were the corrected times of all three events? Enter HH:MM:SS.</p><div class="p3-time-grid">'+['Credential presented','Door opened','Door closed'].map((label,i)=>`<label>${label}<input class="p3-time" data-time="${i}" inputmode="numeric" placeholder="HH:MM:SS" maxlength="8" value="${(p.q1.times[i]||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"></label>`).join('')+'</div>';}
    body.querySelectorAll('[data-time]').forEach(input=>input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');p.q1.times=[...body.querySelectorAll('[data-time]')].map(x=>x.value);saveFile03();}));
    if(index===1){$('#p3QTitle').textContent='FOUR RECORDS. ONE EVENING.';$('#p3Difficulty').textContent='20 XP';body.innerHTML=`<p class="f3-prompt">Arrange the events whose timing can be placed in sequence. Classify each record as Corrected, Estimated, Unverified, or Search Record. Keep the camera record outside the timed sequence because its clock cannot be aligned.</p><div class="p3-timeline-rows">${Array.from({length:4},(_,slot)=>`<div class="p3-timeline-row"><label>POSITION ${slot+1}<select data-order="${slot}"><option value="">Choose event…</option>${P3_EVENTS.map((e,i)=>`<option value="${i}" ${p.q2.order[slot]!==undefined&&Number(p.q2.order[slot])===i?'selected':''}>${e.label}</option>`).join('')}</select></label><label>RELIABILITY<select data-reliability="${slot}"><option value="">Classify…</option>${['CORRECTED','ESTIMATED','UNVERIFIED','SEARCH RECORD'].map(v=>`<option ${p.q2.reliability[slot]===v?'selected':''}>${v}</option>`).join('')}</select></label></div>`).join('')}</div><div class="p3-camera-row"><b>UNSYNCHRONIZED RECORD</b><span>Vehicle enters at displayed 20:16:11 and leaves at 20:19:04; camera clock unverified.</span><label>RELIABILITY <select data-reliability="4"><option value="">Classify…</option>${['CORRECTED','ESTIMATED','UNVERIFIED','SEARCH RECORD'].map(v=>`<option ${p.q2.reliability[4]===v?'selected':''}>${v}</option>`).join('')}</select></label></div><label class="p3-reason-label">Why can the camera time not be confidently synchronized with the venue clock?<textarea id="p3TimelineReason" class="f3-written" placeholder="Explain what is known about each clock…"></textarea></label>`;$('#p3TimelineReason').value=p.q2.reasoning||'';}
    body.querySelectorAll('[data-order],[data-reliability]').forEach(input=>input.addEventListener('change',()=>{p.q2.order=[...body.querySelectorAll('[data-order]')].map(x=>x.value);p.q2.reliability=[...body.querySelectorAll('[data-reliability]')].map(x=>x.value);p.q2.reasoning=$('#p3TimelineReason').value;saveFile03();}));$('#p3TimelineReason')?.addEventListener('input',e=>{p.q2.reasoning=e.target.value;p.q2.order=[...body.querySelectorAll('[data-order]')].map(x=>x.value);p.q2.reliability=[...body.querySelectorAll('[data-reliability]')].map(x=>x.value);saveFile03();});
    if(index===2){$('#p3QTitle').textContent='A WITNESS OR A LIE?';$('#p3Difficulty').textContent='20 XP';body.innerHTML='<p class="f3-prompt">Peter Shaw claims Thomas left The Lantern alone at approximately 20:10. The access log records credential use but does not identify the person. The parking camera shows a vehicle but cannot identify its occupants.</p><p class="p3-question">Which conclusion is best supported?</p><div class="f3-options p3-options" role="radiogroup" aria-label="Select your conclusion">'+['Peter definitely lied because the access log shows someone at the rear entrance earlier.','The vehicle on camera proves Peter followed Thomas.',"Peter's account remains uncorroborated, but the records do not conclusively disprove it.",'The recovered watch proves Thomas died at Lake Ash.'].map((v,i)=>`<label class="f3-option"><input type="radio" name="p3-q3" value="${i}" ${p.q3.answer===i?'checked':''}><span class="f3-radio"></span><span>${String.fromCharCode(65+i)}. ${v}</span></label>`).join('')+'</div>';body.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{p.q3.answer=Number(input.value);saveFile03();}));}
    if(index===3){$('#p3QTitle').textContent='THE LAST KNOWN MOVEMENTS';$('#p3Difficulty').textContent='30 XP';body.innerHTML=`<p class="f3-prompt">You have examined all four documents. The venue clock has been corrected. The camera clock remains unverified. Peter\'s statement is an estimate, and the following morning\'s search records document recovered items but do not establish when Thomas disappeared.</p><p class="p3-question">Write your final deduction. What can you establish about Thomas’s departure and disappearance, and what evidence would you need to reconstruct his movements reliably?</p><p class="p3-requirements">Distinguish established facts, reported claims, unknowns or uncertainties, and additional evidence needed.</p><textarea id="p3Deduction" class="f3-written p3-deduction" maxlength="1000" placeholder="Write your final case assessment, Detective...">${(p.q4.draft||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea><div class="p3-counter" id="p3Counter">${(p.q4.draft||'').length} / 1000 characters</div>`;$('#p3Deduction').addEventListener('input',e=>{p.q4.draft=e.target.value;$('#p3Counter').textContent=`${e.target.value.length} / 1000 characters`;saveFile03();});}
    const records=[p.q1,p.q2,p.q3,p.q4];if(records[index].accepted){const copy=['The access-control clock was seven minutes fast. Subtracting seven minutes from each displayed timestamp gives the corrected sequence. These times record credential use and door activity; they do not identify the person.','You separated corrected timestamps from estimates and unverified times. The records cannot establish a single, fully synchronized timeline of Thomas’s movements.','Peter’s statement remains uncorroborated, but the supplied records do not conclusively disprove it.','You corrected what could be corrected, questioned what could not be verified, and left unanswered questions unanswered.'][index];p3CorrectFeedback(['CLOCK CORRECTION VERIFIED','TIMELINE REVIEWED','EVIDENCE INTERPRETED CORRECTLY','DEDUCTION ACCEPTED'][index],copy);if(index===3)$('#p3Next').textContent='RECEIVE FINAL TRANSMISSION →';}
  }
  function p3ShowEvidence(){const host=$('#p3EvidenceBody');host.innerHTML='';const docs=[['T1','PETER SHAW’S STATEMENT','Peter reported that Thomas left The Lantern alone at approximately 20:10. The time is an estimate; the supplied file contains no independent witness corroboration.'],['T2','REAR ENTRANCE ACCESS LOG','Displayed: credential 19:52:31; door opened 19:53:02; closed 19:54:18. System clock later found seven minutes fast. Corrected: 19:45:31, 19:46:02, 19:47:18. The log records credential use, not the user’s identity.'],['T3','PARKING CAMERA INDEX','A vehicle enters the frame at displayed 20:16:11 and leaves at 20:19:04. Camera clock is unverified; plate and occupants cannot be identified.'],['T4','LAKE ASH SEARCH SUMMARY','Damaged boat located 07:10 the following morning. Watch and jacket entered into inventory at 08:05. These entries document search and inventory activity, not when Thomas disappeared.']];docs.forEach(([id,title,text])=>{const card=document.createElement('section');card.className='p3-evidence-card';card.innerHTML=`<small>${id}</small><h3>${title}</h3><p></p>`;card.querySelector('p').textContent=text;host.append(card);});file03.p3.evidenceReturnStage=file03.p3.stage||'q1';file03.stage='p3Evidence';saveFile03();setF3Panel('p3Evidence');}
  function p3OpenTransmission(){setF3Panel('p3Transmission');$('#p3TransmissionContinue').hidden=true;const target=$('#p3TransmissionCopy');if(file03.p3.transmissionViewed){target.textContent=P3_TRANSMISSION;$('#p3TransmissionContinue').hidden=false;return;}$('#p3Transmission').classList.add('signal-glitch');laterWait(()=>$('#p3Transmission').classList.remove('signal-glitch'),reducedMotion?0:850);target.textContent='';if(reducedMotion){target.textContent=P3_TRANSMISSION;file03.p3.transmissionViewed=true;saveFile03();$('#p3TransmissionContinue').hidden=false;return;}let i=0;const type=()=>{target.textContent=P3_TRANSMISSION.slice(0,i++);if(i<=P3_TRANSMISSION.length){const timer=setTimeout(type,24);timers.push(timer);}else laterWait(()=>{$('#p3TransmissionContinue').hidden=false;file03.p3.transmissionViewed=true;saveFile03();},500);};type();}
  const P3_FINAL_COPY=`Well done, Detective.\n\nYou followed the money.\nYou questioned the accounts.\nYou traced the gaps between what was said and what could be proven.\n\nPiece by piece, the scattered records became a story.\n\nThe missing pieces have been weighed against what remains. And where the records fall silent, you've made your judgment.\n\nPerhaps that is inevitable. An investigation cannot remain a collection of questions forever.\n\nYour findings have been recorded.\nYour deductions have been preserved.\nThe archive now holds your account of what happened.\n\nTHE RECORD IS COMPLETE.\n\nI've spent a great deal of time putting these pieces together. It seems only fair to know that someone, at last, has seen them through.\n\nA pleasure, Detective.\n\n— M`;
  const P3_FINAL_HTML=`<p>Well done, Detective.</p><p>You followed the money.<br>You questioned the accounts.<br>You traced the gaps between what was said and what could be proven.</p><p>Piece by piece, the scattered records became a story.</p><p>The missing pieces have been weighed against what remains. And where the records fall silent, you've made your judgment.</p><p>Perhaps that is inevitable. An investigation cannot remain a collection of questions forever.</p><p>Your findings have been recorded.<br>Your deductions have been preserved.<br>The archive now holds your account of what happened.</p><p class="p3-record-complete">THE RECORD IS COMPLETE.</p><p>I've spent a great deal of time putting these pieces together. It seems only fair to know that someone, at last, has seen them through.</p><p>A pleasure, Detective.</p><p>— M</p>`;
  function p3RenderFinalTransmission(){
    const copy=$('#p3FinalCopy'),button=$('#p3FinalContinue');setF3Panel('p3FinalTransmission');button.hidden=true;
    if(file03.p3.finalTransmissionViewed){copy.innerHTML=P3_FINAL_HTML;button.hidden=false;return;}
    copy.textContent='';let i=0;
    const finish=()=>{copy.innerHTML=P3_FINAL_HTML;file03.p3.finalTransmissionViewed=true;file03.p3.stage='finalTransmission';saveFile03();button.hidden=false;button.focus();};
    if(reducedMotion){finish();return;}
    const type=()=>{copy.textContent=P3_FINAL_COPY.slice(0,i++);if(i<=P3_FINAL_COPY.length){timers.push(setTimeout(type,12));}else finish();};laterWait(type,320);
  }
  function p3ShowGift(){setF3Panel('p3GiftPopup');$('#p3GiftContinue').disabled=false;file03.p3.giftShown=true;file03.p3.stage='giftPopup';file03.stage='p3GiftPopup';saveFile03();}
  function p3CorrectFeedback(title,copy){const box=$('#p3Feedback');box.hidden=false;box.className='f3-feedback good';box.innerHTML=`<strong>${title}</strong><p>${copy}</p>`;$('#p3Submit').hidden=true;$('#p3Next').hidden=false;$('#p3Next').textContent='CONTINUE →';}
  function evaluateP2(text,index){const value=text.toLowerCase().replace(/[’]/g,"'").replace(/doesn't/g,'does not').replace(/isn't/g,'is not').replace(/can't/g,'cannot').replace(/won't/g,'will not').replace(/\s+/g,' ');const q=P2_QUESTIONS[index],missing=q.groups.map((re,i)=>re.test(value)?null:i).filter(i=>i!==null);return {accepted:q.groups.length-missing.length>=Math.ceil(q.groups.length/2),missing};}
  file03.p2.accepted=file03.p2.accepted.map((accepted,index)=>Boolean(accepted&&evaluateP2(file03.p2.answers[index]||'',index).accepted));
  const p2SavedQuestion=Number((file03.stage.match(/^p2question([0-3])$/)||[])[1]);
  const p2FirstIncomplete=file03.p2.accepted.indexOf(false);
  if(['p2accepted','p2final'].includes(file03.stage)&&p2FirstIncomplete>=0){file03.stage='p2question'+p2FirstIncomplete;file03.p2.stage='question'+p2FirstIncomplete;}
  else if(p2FirstIncomplete>=0&&Number.isInteger(p2SavedQuestion)&&p2SavedQuestion>p2FirstIncomplete){file03.stage='p2question'+p2FirstIncomplete;file03.p2.stage='question'+p2FirstIncomplete;}
  function renderP2Question(index){const q=P2_QUESTIONS[index];file03.p2.stage='question'+index;file03.stage='p2question'+index;saveFile03();setF3Panel('f3Question');$('#f3QCount').textContent=`INVESTIGATION 002 · QUESTION 0${index+1} / 04`;
    $('#f3QTitle').textContent=q.title;$('#f3Difficulty').textContent=q.difficulty;$('#f3Prompt').textContent=q.prompt;$('#f3Progress').innerHTML='<i></i><i></i><i></i><i></i>';
    $('#f3Progress').querySelectorAll('i').forEach((n,i)=>n.classList.toggle('done',i<=index));$('#p2Docs').hidden=false;$('#f3Options').hidden=true;$('#f3WrittenLabel').hidden=false;$('#f3WrittenLabel').textContent=index===3?'YOUR FINAL DEDUCTION':'YOUR ANSWER';$('#f3Written').hidden=false;$('#f3Written').placeholder=['Write your answer here...','Interpret the message...','Separate evidence from speculation...','Write your final deduction, Detective...'][index];$('#f3Written').value=file03.p2.answers[index]||'';$('#f3Feedback').hidden=true;$('#f3Next').hidden=true;$('#f3Submit').hidden=false;$('#f3Submit').disabled=!$('#f3Written').value.trim();$('#f3Submit').textContent=index===3?'SUBMIT FINAL DEDUCTION →':'SUBMIT ANSWER →';
    $('#f3Written').oninput=()=>{file03.p2.answers[index]=$('#f3Written').value;saveFile03();$('#f3Submit').disabled=!$('#f3Written').value.trim();};
    if(file03.p2.accepted[index]){const fb=$('#f3Feedback');fb.hidden=false;fb.className='f3-feedback good';fb.innerHTML='<strong>'+(['CORRECT — EVIDENCE VERIFIED','CORRECT — SOURCE ANALYSIS ACCEPTED','CORRECT — MOTIVE DISTINGUISHED FROM FACT','CONCLUSION ACCEPTED'][index])+'</strong>'+q.explain;$('#f3Submit').hidden=true;$('#f3Next').hidden=false;$('#f3Next').textContent=index===3?'RECEIVE TRANSMISSION →':'CONTINUE →';$('#f3Next').dataset.p2='accepted';}
  }
  function showP2Document(index){const doc=P2_DOCS[index];$('#p2DocByline').textContent=doc.byline;$('#p2DocTitle').textContent=doc.title;const body=$('#p2DocBody');body.replaceChildren(...doc.body.map(line=>{const p=document.createElement('p');p.textContent=line;return p;}));file03.p2.returnStage=file03.p2.stage;setF3Panel('p2Document');}
  function openFile03(){
    if(Number(progress.unlockedChapter)<3)return;
    openF3Stage();return;
    clearTimers();
    const home=$('#homeScene'),flow=$('#fileThreeFlow');home.classList.add('file-three-open');flow.classList.add('visible');flow.setAttribute('aria-hidden','false');
    if(file03.stage==='p3FinalTransmission'){p3RenderFinalTransmission();}
    else if(file03.stage==='p3GiftPopup'){setF3Panel('p3GiftPopup');}
    else if(file03.stage==='p3Intro'){setF3Panel('p3Intro');}
    else if(/^p3q[1-4]$/.test(file03.stage)){p3RenderQuestion(Number(file03.stage.slice(-1))-1);}
    else if(file03.stage==='p3Evidence'){p3ShowEvidence();}
    else if(file03.stage==='p3Transmission'){p3OpenTransmission();}
    else if(file03.stage==='p3Report'||file03.stage==='p3Complete'){setF3Panel('p3Report');$('#p3Report').classList.add('p3-report-ready');if(file03.stage==='p3Complete')$('#p3Report').querySelector('.p3-open-stamp').textContent='FILE 003 COMPLETE';}
    else if(file03.stage==='p2Intro'){setF3Panel('p2Intro');}
    else if(/^p2question[0-3]$/.test(file03.stage)){renderP2Question(Number(file03.stage.slice(-1)));}
    else if(file03.stage==='p2accepted'){setF3Panel('f3Accepted');$('#f3AcceptedTitle').textContent='CONCLUSION ACCEPTED';$('#f3Accepted').querySelectorAll('p')[0].textContent='You found the omission. You identified the source’s fear. And you did not confuse suspicion with proof.';$('#f3Accepted').querySelectorAll('p')[1].textContent='Daniel withheld information. That much the documents establish. Why he withheld it remains another question.';$('#f3Receive').textContent='RECEIVE TRANSMISSION →';}
    else if(file03.stage==='p2final'){setF3Panel('f3FinalMessage');$('#f3FinalTitle').textContent='INCOMING TRANSMISSION';$('#f3FinalMeta').innerHTML='SOURCE: M<br/>ARCHIVE FRAGMENT 002';$('#f3CloseFinal').textContent='CONTINUE →';$('#f3CloseFinal').hidden=true;typeFile03($('#f3FinalCopy'),P2_TRANSMISSION,$('#f3CloseFinal'));}
    else if(file03.stage==='home'||file03.stage==='transmission'){
      file03.stage='transmission';file03.transmissionViewed=true;saveFile03();setF3Panel('f3Transmission');$('#f3TransmissionContinue').hidden=true;
      $('#f3Transmission').classList.add('signal-glitch');laterWait(()=>$('#f3Transmission').classList.remove('signal-glitch'),reducedMotion?0:850);
      typeFile03($('#f3Message'),F3_OPENING,$('#f3TransmissionContinue'));
    }else if(file03.stage==='cover'){setF3Panel('f3Cover');}
    else if(file03.stage==='question'||file03.stage==='question03'||file03.stage==='question03accepted'){setF3Panel('f3Question');renderF3Question();if(file03.question03Accepted){$('#f3Feedback').hidden=false;$('#f3Feedback').className='f3-feedback good';$('#f3Feedback').innerHTML='<strong>CORRECT — DOCUMENT STATUS VERIFIED</strong>The allocation sheet is a lead, not proof. Its suggested mappings need original approvals and bank confirmations.';$('#f3Submit').hidden=true;$('#f3Next').hidden=false;$('#f3Next').textContent='CONTINUE →';}}
    else if(file03.stage==='deduction'){setF3Panel('f3Deduction');}
    else if(file03.stage==='accepted'){setF3Panel('f3Accepted');}
    else{setF3Panel('f3FinalMessage');$('#f3FinalTitle').textContent='INCOMING TRANSMISSION';$('#f3FinalMeta').innerHTML='SOURCE: M<br/>ARCHIVE FRAGMENT 001';$('#f3CloseFinal').textContent='CONTINUE →';$('#f3CloseFinal').hidden=true;typeFile03($('#f3FinalCopy'),F3_ENDING,$('#f3CloseFinal'));}
  }
  function closeFile03(){
    clearTimers();$('#fileThreeFlow').classList.remove('visible');$('#fileThreeFlow').setAttribute('aria-hidden','true');$('#homeScene').classList.remove('file-three-open');saveFile03();
  }
  function renderF3Question(){
    const index=file03.answers[0]===null?0:1;
    if(file03.answers.every(v=>v!==null)){file03.stage='question03';saveFile03();renderF3Question03();return;}
    const q=F3_QUESTIONS[index];f3Selected=null;$('#f3QCount').textContent='QUESTION 0'+(index+1)+' / 03';$('#f3QTitle').textContent=q.title;$('#f3Difficulty').textContent=index?'EASY — MEDIUM':'EASY';$('#f3Prompt').textContent=q.prompt;
    $('#f3Progress').querySelectorAll('i').forEach((node,i)=>node.classList.toggle('done',i<=index));
    const host=$('#f3Options');host.replaceChildren();host.setAttribute('role','radiogroup');host.setAttribute('aria-label','Select an answer');
    q.options.forEach((value,i)=>{const label=document.createElement('label');label.className='f3-option';const input=document.createElement('input');input.type='radio';input.name='file03-answer';input.value=String(i);input.setAttribute('aria-label',String.fromCharCode(65+i)+'. '+value);const radio=document.createElement('span');radio.className='f3-radio';const text=document.createElement('span');text.textContent=String.fromCharCode(65+i)+'. '+value;label.append(input,radio,text);input.addEventListener('change',()=>{f3Selected=i;host.querySelectorAll('.f3-option').forEach(el=>el.classList.toggle('selected',el===label));$('#f3Submit').disabled=false;});host.append(label);});
    $('#f3WrittenLabel').hidden=true;$('#f3Written').hidden=true;$('#f3Feedback').hidden=true;$('#f3Next').hidden=true;$('#f3Next').textContent='CONTINUE →';$('#f3Next').dataset.retry='';$('#f3Submit').hidden=false;$('#f3Submit').disabled=true;$('#f3Submit').textContent='SUBMIT ANSWER →';
  }
  function renderF3Question03(){
    $('#f3QCount').textContent='QUESTION 03 / 03';$('#f3QTitle').textContent='A REPEATED PATTERN?';$('#f3Difficulty').textContent='EASY — MEDIUM';$('#f3Prompt').textContent='The payment-allocation sheet matches each transfer to an invoice. Can you treat those matches as verified facts? Explain your answer.';$('#f3Progress').querySelectorAll('i').forEach(node=>node.classList.add('done'));$('#f3Options').replaceChildren();$('#f3WrittenLabel').hidden=false;$('#f3Written').hidden=false;$('#f3Written').value=file03.question03Text||'';$('#f3Feedback').hidden=true;$('#f3Next').hidden=true;$('#f3Next').textContent='CONTINUE →';$('#f3Submit').hidden=false;$('#f3Submit').disabled=!$('#f3Written').value.trim();$('#f3Submit').textContent='SUBMIT DEDUCTION →';
    $('#f3Written').oninput=()=>{file03.question03Text=$('#f3Written').value;saveFile03();$('#f3Submit').disabled=!$('#f3Written').value.trim();};
  }
  function validateAllocation(text){
    const t=text.toLowerCase(),hasUnverified=/unverif|not verified|not verified|cannot.*verif|can't.*verif|not.*reliable/.test(t);
    const hasNotProof=/(not|cannot|can't|does not|doesn't|isn't|aren't|not independently).{0,55}(proof|prove|verified|established|confirm|fact)|suggest|lead,? not|not.{0,35}(fact|established|proof)/.test(t);
    const hasMissing=/approval|signature/.test(t)&&/bank|confirm|statement|record/.test(t);
    return {accepted:hasUnverified&&hasNotProof&&hasMissing,missing:[!hasUnverified?'Mark PA-07 as an unverified copy.':'',!hasNotProof?'Explain that the invoice matches are suggested, not independently established facts.':'',!hasMissing?'Name missing original approvals/signatures and supporting bank confirmations.':''].filter(Boolean)};
  }
  function validateFinalDeduction(text){
    const t=text.toLowerCase(),n=t.replace(/,/g,'');
    const balance=/(2[.]4|2[.]40|2 40).{0,18}(crore|cr)|(?:₹|rs\.?\s*)2[.]4/.test(n);
    const refs=/t\s*[-–]?17/.test(t)&&/t\s*[-–]?22/.test(t)&&/t\s*[-–]?31/.test(t);
    const replay=/t\s*[-–]?31\s*[-–]?r/.test(t)&&/replay|duplicate|repeat|not.*separate|not.*additional/.test(t);
    const invoiceRefs=/nq\s*[-–]?104(?!\s*[-–]?r)/.test(t)&&/nq\s*[-–]?118/.test(t)&&/nq\s*[-–]?123/.test(t);
    const allocation=/unverif|not verified|unverified/.test(t)&&/(suggest|not.*establish|not.*prove|not.*confirm|cannot.*verify|can't.*verify)/.test(t);
    const records=/approval|signature/.test(t)&&/bank|confirm/.test(t);
    const unconfirmedInvoice=/nq\s*[-–]?104\s*[-–]?r/.test(t)&&/(unconfirm|not.*paid|not.*payment|no.*payment|revision|replacement|supplier.*confirm)/.test(t);
    const cautiousStatement=/(not|cannot|can't|does not|doesn't|no evidence|not established|not proven).{0,80}(prove|establish|confirm|evidence|show|demonstrate)/.test(t)||/(prove|establish|confirm|evidence|show|demonstrate).{0,80}(not|cannot|can't|does not|doesn't|no evidence|not established|not proven)/.test(t);
    const caution=cautiousStatement&&/(deliver|delivery)/.test(t)&&/(owner|ownership|beneficiar)/.test(t)&&/(personal benefit|benefit|benefited)/.test(t)&&/(culpab|responsib|stole|theft)/.test(t);
    const missing=[!balance?'State the ₹2.40 crore unreconciled balance.':'',!refs?'Identify all three underlying transfer references: T-17, T-22 and T-31.':'',!replay?'Explain that T-31-R is a replay, not a separately confirmed payment.':'',!invoiceRefs?'Identify the invoices tentatively matched to T-17, T-22 and T-31: NQ-104, NQ-118 and NQ-123.':'',!unconfirmedInvoice?'Address NQ-104-R: it has no separately confirmed payment, and its revision/replacement status needs confirmation.':'',!allocation?'Describe PA-07 as unverified and its mappings as suggestions rather than established facts.':'',!records?'Name the missing original approvals/signatures and bank confirmations.':'',!caution?'Clarify that the records do not prove delivery, account ownership, personal benefit, or individual culpability.':''].filter(Boolean);
    return {accepted:missing.length===0,missing};
  }
  const FILE02_KEY='case25FinancialCaseV1';
  const F2_QUESTIONS=[
    {title:'FOLLOW THE MONEY',kind:'EASY',prompt:'Based on the account records, what can you establish with confidence, and what remains unverified?',options:['The ₹2.40 crore was a confirmed payment to a specific vendor.','The ₹2.40 crore remains unreconciled against verified expenditure, and the supporting records have not been provided.','The ₹2.40 crore was received by Peter Shaw.','The account records are complete and show no discrepancies.'],answer:1,hint:'Separate the verified expenses from the red “Not Verified” balance. What do the notes say about supporting documents?',docs:[0,1,2,3]},
    {title:'THE UNCONFIRMED DEPARTURE',kind:'MEDIUM',prompt:'Which parts of Peter’s account are independently corroborated by the supplied evidence?',options:['Peter’s claim that Thomas left alone at 20:10 is fully corroborated.','The access log confirms Peter was at the rear entrance at 20:10.','Peter’s account is not independently corroborated by the access log or the parking camera.','The parking camera confirms the vehicle was driven by Peter.'],answer:2,hint:'The access log identifies credential types, not people. The camera does not clearly show the plate or occupants.',docs:[4,5,6,7]},
    {title:'THE MISSING ORIGINALS',kind:'MEDIUM–HARD',prompt:'Both partners were asked to provide the original records, but neither did. What does this establish about Peter’s involvement?',options:['It proves Peter deliberately destroyed the records.','It proves Peter was the only person with access to the records.','It establishes that the original records remain unavailable, preventing verification.','It proves Peter and Daniel both received the ₹2.40 crore.'],answer:2,hint:'State what the missing records prevent investigators from doing. Do not turn non-production into proof of who removed them.',docs:[8,9,10,11]},
    {title:'BUILD THE CASE',kind:'FINAL DEDUCTION',prompt:'Using all four documents, explain why Peter Shaw is a central suspect. Then identify the strongest unresolved gaps in the case against him.',written:true,hint:'Connect the unreconciled funds, Peter’s uncorroborated account, the unknown access credential, and the missing originals. Distinguish suspicion from what the records actually prove.',docs:[0,1,2,3,4,5,6,7,8,9,10,11]}
  ];
  const F2_DOCS=[
    ['ACCOUNT RECONCILIATION REPORT','Verified expenditure is listed by category. The report separately marks ₹2,40,00,000 as UNRECONCILED / NOT VERIFIED. Its notes say supporting records were requested and had not been provided. This is an unexplained balance, not proof that a named person received it.'],
    ['BANK EXPORT','The supplied export contains the listed bank rows associated with the reviewed account. The export alone does not identify a personal beneficiary for the unreconciled balance. Original bank confirmations and source records are still needed to verify the trail.'],
    ['INTERNAL COMPLIANCE NOTE','Compliance records that the ₹2.40 crore balance could not be matched to verified expenditure. The review remains incomplete because supporting invoices, approvals, and bank records are absent.'],
    ['EMAIL REQUEST','Finance requested original invoices, vendor agreements, bank statements, and supporting records for the unreconciled amount. The request sought documentation to complete the audit; the request itself does not establish where the money went.'],
    ['PETER SHAW’S STATEMENT','Peter says Thomas left The Lantern alone at approximately 20:10, that he did not accompany him, and that he does not know where Thomas went afterward. This is Peter’s reported account, not independent corroboration.'],
    ['PARKING CAMERA INDEX','A vehicle appears in the parking-exit camera around the reported period. The number plate is not clearly visible and the occupants cannot be identified. The image does not establish that Peter drove or followed Thomas.'],
    ['REAR ENTRANCE ACCESS LOG','The log records earlier events under credential “Card — P.S.” and later door activity around 20:09–20:10 under “Card — Unknown.” A credential label records system activity; the supplied log does not identify the person using the unknown card.'],
    ['TIMELINE NOTE','Peter’s stated departure time is approximate. The later unknown-card access falls near that estimate, but no supplied record connects the unknown credential to Peter or establishes Thomas’s movements after leaving. The camera time and identity remain unverified.'],
    ['REQUEST FOR ORIGINAL ACCOUNTS','Finance asked Peter Shaw to provide original invoices, vendor agreements, bank statements, and supporting records for the unreconciled amount. The originals were not supplied.'],
    ['REPLY FROM PETER','Peter replied that he was travelling, did not have access to the original files, and would ask his team to share what was available. He also noted some documents may have been handled by Thomas. The reply does not prove deliberate destruction or exclusive access.'],
    ['INTERNAL EMAIL','A later compliance email records that the requested originals and supporting records had still not been received from either partner. The audit could not be completed.'],
    ['BOARD MEETING NOTE','The board note records that the financial review remained open pending original supporting documents. It does not resolve the unreconciled balance or identify who controlled the missing records.']
  ];
  const f2Fresh=()=>({step:0,answers:['','','',''],accepted:[false,false,false,false],complete:false});
  function readF2(){try{const saved=JSON.parse(localStorage.getItem(FILE02_KEY)||'{}');const fresh=f2Fresh();return {...fresh,...saved,answers:Array.isArray(saved.answers)?[...fresh.answers,...saved.answers].slice(0,4):fresh.answers,accepted:Array.isArray(saved.accepted)?[...fresh.accepted,...saved.accepted].slice(0,4):fresh.accepted};}catch{return f2Fresh();}}
  let f2=readF2(),f2ReturnStep=0;
  function saveF2(){localStorage.setItem(FILE02_KEY,JSON.stringify(f2));}
  function closeFinancialFlow(){clearTimers();$('#fileTwoFlow').classList.remove('visible');$('#fileTwoFlow').setAttribute('aria-hidden','true');$('#homeScene').classList.remove('file-two-open');}
  function openFinancialEntry(){clearTimers();show(scenes[9]);}
  function openFinancialFile(){
    clearTimers();$('#chapterEntryScene').classList.remove('active');
    const home=$('#homeScene'),flow=$('#fileTwoFlow');home.classList.add('file-two-open');flow.classList.add('visible');flow.setAttribute('aria-hidden','false');
    show(home);
    if(f2.complete){showF2Transmission();return;}renderF2Question(f2.step);
  }
  function setF2Panel(id){['f2QuestionPanel','f2Evidence','f2Transmission'].forEach(name=>{$('#'+name).hidden=name!==id;});}
  function renderF2Question(index){
    f2.step=Math.max(0,Math.min(3,index));saveF2();const q=F2_QUESTIONS[index];setF2Panel('f2QuestionPanel');$('#f2QuestionCount').textContent=`QUESTION ${index+1} OF 4`;$('#f2QuestionTitle').textContent=q.title;$('#f2Difficulty').textContent=q.kind;$('#f2Prompt').textContent=q.prompt;
    $('#f2Instruction').textContent=q.written?'Explain what the documents establish and what remains unproven. Keep your answer under 500 words.':'Select the best option.';
    $('#f2Progress').querySelectorAll('i').forEach((dot,i)=>dot.classList.toggle('done',i<=index));
    const tabs=$('#f2DocTabs');tabs.replaceChildren();q.docs.forEach(docIndex=>{const button=document.createElement('button');button.type='button';button.textContent=`DOCUMENT ${docIndex+1} · ${F2_DOCS[docIndex][0]}`;button.addEventListener('click',()=>showF2Evidence(docIndex));tabs.append(button);});
    const options=$('#f2Options');options.replaceChildren();options.hidden=!!q.written;$('#f2Written').hidden=!q.written;$('#f2WrittenLabel').hidden=!q.written;$('#f2WrittenLabel').textContent='YOUR CASE ASSESSMENT';$('#f2Written').value=f2.answers[index]||'';$('#f2Written').placeholder='Type your evidence-based assessment here…';$('#f2WordCount').hidden=!q.written;updateF2WordCount();
    if(q.options)q.options.forEach((option,i)=>{const label=document.createElement('label');label.className='f3-option';const input=document.createElement('input');input.type='radio';input.name='f2-answer';input.value=String(i);input.setAttribute('aria-label',String.fromCharCode(65+i)+'. '+option);const radio=document.createElement('span');radio.className='f3-radio';const text=document.createElement('span');text.textContent=String.fromCharCode(65+i)+'. '+option;label.append(input,radio,text);input.addEventListener('change',()=>{f2.answers[index]=input.value;saveF2();options.querySelectorAll('.f3-option').forEach(el=>el.classList.toggle('selected',el===label));$('#f2Submit').disabled=false;});options.append(label);if(f2.answers[index]===String(i)){input.checked=true;label.classList.add('selected');}});
    $('#f2Written').oninput=()=>{f2.answers[index]=$('#f2Written').value;saveF2();$('#f2Submit').disabled=!$('#f2Written').value.trim();updateF2WordCount();};
    $('#f2HintText').hidden=true;$('#f2HintText').textContent=q.hint;$('#f2Feedback').hidden=true;$('#f2Next').hidden=true;$('#f2Submit').hidden=false;$('#f2Submit').disabled=q.written?!f2.answers[index].trim():!f2.answers[index];$('#f2Submit').textContent=q.written?'SUBMIT FINAL DEDUCTION →':'SUBMIT ANSWER →';
    if(f2.accepted?.[index])showF2Accepted(index);
  }
  function updateF2WordCount(){const text=$('#f2Written').value.trim();const count=text?text.split(/\s+/).length:0;$('#f2WordCount').textContent=`${count} / 500 words`;$('#f2Written').setAttribute('aria-invalid',String(count>500));}
  function showF2Evidence(index){f2ReturnStep=f2.step;$('#f2EvidenceMeta').textContent=`CASE 25 · DOCUMENT ${index+1}`;$('#f2EvidenceTitle').textContent=F2_DOCS[index][0];$('#f2EvidenceBody').replaceChildren();F2_DOCS[index][1].split(/(?<=\.)\s+/).forEach(line=>{const p=document.createElement('p');p.textContent=line;$('#f2EvidenceBody').append(p);});setF2Panel('f2Evidence');}
  function showF2Accepted(index){const fb=$('#f2Feedback');fb.hidden=false;fb.className='f3-feedback good';fb.innerHTML=`<strong>${['RECORDS RECONCILED','CLAIM NOT CORROBORATED','VERIFICATION GAP ESTABLISHED','CASE ASSESSMENT ACCEPTED'][index]}</strong>${['The ₹2.40 crore remains unreconciled; the supplied records do not identify a recipient.','The statement is not independently corroborated, and the supplied camera and access records do not identify Peter.','The original records remain unavailable, preventing verification. Their absence alone does not prove who withheld or destroyed them.','Peter is a central suspect because of the unresolved financial balance, his uncorroborated account, the unknown access event, and missing originals. The records still do not prove that he received the funds or caused Thomas’s disappearance.'][index]}`;$('#f2Submit').hidden=true;$('#f2Next').hidden=false;$('#f2Next').textContent=index===3?'RECEIVE TRANSMISSION →':'CONTINUE →';}
  function f2DeductionAccepted(text){const t=String(text||'').toLowerCase();const groups=[/peter/,/(2\s*[.]\s*40|2[.]4|unreconcil|unexplained).{0,80}(crore|fund|amount|balance|money)?|(?:crore|fund|amount|balance|money).{0,80}(2\s*[.]\s*40|2[.]4|unreconcil|unexplained)/,/original.{0,60}(missing|not provided|unavailable|not supplied)|missing.{0,60}(original|record)|not provided.{0,60}(original|document)/,/(unknown|unidentified).{0,50}(card|credential|person|user)|card.{0,50}(unknown|unidentified)|access log/,/(not prove|does not prove|cannot prove|cannot establish|not establish|unproven|unverified|no direct evidence|not enough evidence|remains unknown|not conclusive)/];return groups.filter(re=>re.test(t)).length>=groups.length-1&&groups[0].test(t);}
  function showF2Transmission(){setF2Panel('f2Transmission');}
  function showClue(index) {
    const shots = $$('.evidence-shot'); clueIndex = (index + shots.length) % shots.length;
    shots.forEach((s,i) => s.classList.toggle('current', i === clueIndex));
    $('#sceneNumber').textContent = String(clueIndex + 1).padStart(2,'0');
  }
  function runClues() {
    show(scenes[2]); showClue(0);
    later(() => showClue(1), 1300); later(() => showClue(2), 2600);
    later(() => show(scenes[3]), 4000);
    later(() => { const cs = $('#caseScene'); if (!cs.querySelector('.thud-flash')) { const f = document.createElement('i'); f.className = 'thud-flash'; cs.append(f); } cs.classList.remove('thud'); void cs.offsetWidth; cs.classList.add('thud'); setTimeout(() => cs.classList.remove('thud'), 450); }, reducedMotion ? 0 : 4450);
    later(() => openArchive(), 8000);
  }
  // The four code boxes and the ACCESS ARCHIVE button are painted into login.png at these spots (image pixels).
  // The real inputs and button are placed on them from the artwork's rendered size, so they line up whatever the window shape.
  const LOGIN_CODE_BOXES = { x: 712.3, y: 483.7, w: 302.5, h: 70.1 }, LOGIN_ACCESS_BUTTON = { x: 680, y: 583, w: 365, h: 56 };
  function placeCodeBoxes() {
    const scene = $('#archiveScene'), img = scene.querySelector('.reference-stage-art'), panel = $('#archivePanel');
    if (!img.naturalWidth) return;
    const scale = Math.max(scene.clientWidth / img.naturalWidth, scene.clientHeight / img.naturalHeight);
    const imgLeft = (scene.clientWidth - img.naturalWidth * scale) / 2, imgTop = (scene.clientHeight - img.naturalHeight * scale) / 2;
    const panelLeft = panel.offsetLeft - panel.offsetWidth / 2, panelTop = panel.offsetTop - panel.offsetHeight / 2;
    const place = (el, box) => {
      const set = (prop, value) => el.style.setProperty(prop, `${value}px`, 'important');
      set('left', imgLeft + box.x * scale - panelLeft); set('top', imgTop + box.y * scale - panelTop);
      set('width', box.w * scale); set('height', box.h * scale);
    };
    place(panel.querySelector('.digit-row'), LOGIN_CODE_BOXES); place($('#accessButton'), LOGIN_ACCESS_BUTTON);
  }
  $('#archiveScene .reference-stage-art').addEventListener('load', placeCodeBoxes);
  addEventListener('resize', placeCodeBoxes);
  function openArchive() { startSound(); clearTimers(); scenes[0].classList.remove('leaving'); $('#archiveScene').classList.add('opening'); show(scenes[4]); placeCodeBoxes(); later(() => $('#digit-1').focus(), 800); }
  function resetLogin() {
    $('#archiveScene').classList.remove('decrypting','unsealed','opening');
    $('#loginError').textContent = ''; $$('.digit').forEach(d => d.value = '');
    $('#archivePanel').classList.remove('pin-error');
    if(typeof syncCodeState==='function')syncCodeState();
    $('#archivePanel').style.opacity = ''; $('#archivePanel').style.transform = '';
  }
  function startStory() {
    clearTimers(); stopSound(); resetLogin(); show(scenes[0]);
    later(pushIntoLake, 4500);
  }
  // Title -> lake match cut. The lake photo on the title art (man on the dock) sits at this point
  // of title.png; the camera pushes into it and the lake scene dissolves in over the zoom.
  const TITLE_PHOTO = { x: 400, y: 390 }, TITLE_SPOT = { x: 330, y: 370, w: 260, h: 200 };
  function pushIntoLake() {
    const title = scenes[0], img = title.querySelector('.reference-stage-art');
    const r = img.getBoundingClientRect(), scale = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
    const fx = (r.width - img.naturalWidth * scale) / 2 + TITLE_PHOTO.x * scale;
    const fy = (r.height - img.naturalHeight * scale) / 2 + TITLE_PHOTO.y * scale;
    img.style.setProperty('--focus-x', `${fx}px`); img.style.setProperty('--focus-y', `${fy}px`);
    const toEl = (x, y) => [(r.width - img.naturalWidth * scale) / 2 + x * scale, (r.height - img.naturalHeight * scale) / 2 + y * scale];
    const [sx, sy] = toEl(TITLE_SPOT.x, TITLE_SPOT.y);
    img.style.setProperty('--spot-x', `${sx}px`); img.style.setProperty('--spot-y', `${sy}px`);
    img.style.setProperty('--spot-w', `${TITLE_SPOT.w * scale}px`); img.style.setProperty('--spot-h', `${TITLE_SPOT.h * scale}px`);
    img.style.setProperty('--shift-x', `${innerWidth / 2 - r.left - fx}px`); img.style.setProperty('--shift-y', `${innerHeight / 2 - r.top - fy}px`);
    title.classList.add('leaving'); playImpact(.8);
    if (reducedMotion) {
      later(() => { show(scenes[1]); setTimeout(() => title.classList.remove('leaving'), 1400); }, 1200);
      return;
    }
    // Swap the dock photo for the real opening frame, tilted to sit inside the photo and carried through
    // the same zoom, so the push lands on exactly the image the lake scene starts from.
    const W = innerWidth, H = innerHeight, PUSH = 2200, TILT = 14, END_SCALE = 3.2;
    // scene coordinates: the title image box starts at (r.left, r.top), which is above the viewport
    const sx0 = r.left + fx, sy0 = r.top + fy, k = .5;
    const match = document.createElement('img');
    match.src = img.src.replace('title.png', 'opening.png'); match.alt = ''; match.className = 'title-match-art'; match.setAttribute('aria-hidden', 'true');
    match.style.cssText = `position:absolute;z-index:31;left:0;top:0;width:${W}px;height:${H}px;object-fit:cover;transform-origin:0 0;pointer-events:none;display:block!important;opacity:0;filter:brightness(.8)`;
    title.append(match);
    const place = `translate(${sx0}px,${sy0}px) rotate(${-TILT}deg) scale(${k}) translate(${-W / 2}px,${-H / 2}px)`;
    const zoom = (shift, scale, rot) => `translate(${sx0}px,${sy0}px) translate(${shift}) scale(${scale}) rotate(${rot}deg) translate(${-sx0}px,${-sy0}px) ${place}`;
    const shift = `${W / 2 - sx0}px,${H / 2 - sy0}px`;
    // lands at exactly 1.1x, the lake scene's first frame
    const push = match.animate([
      { transform: zoom('0px,0px', 1.015, 0), opacity: 0, offset: 0 },
      { opacity: 0, offset: .1 },
      { opacity: 1, offset: .35 },
      { transform: zoom(shift, 1.1 / k, TILT), opacity: 1, offset: 1 }
    ], { duration: PUSH, easing: 'cubic-bezier(.62,0,.32,1)', fill: 'forwards' });
    // the lake only takes over once the push has landed on its first frame
    later(() => {
      show(scenes[1]);
      // keep pace with the lake art's own lakeSettle so the two stay identical while they cross-fade
      push.cancel(); match.style.transformOrigin = '50% 50%'; match.style.opacity = '1';
      match.animate([{ transform: 'scale(1.1)', filter: 'brightness(.8)' }, { transform: 'scale(1)', filter: 'none' }],
        { duration: 3000, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
      setTimeout(() => { title.classList.remove('leaving'); match.remove(); }, 1400);
    }, PUSH);
  }
  // Requested flow: title (2), Lake Ash opening (1), clues (3), case file (4), login (5), decryption, transmission, homepage.
  const previewHome = new URLSearchParams(location.search).get('screen') === 'home';
  // once he has been let into the archive, a refresh or a closed tab brings him back to the wall, not the intro
  let homeSeen=false;try{homeSeen=localStorage.getItem('case25HomeSeen')==='1';}catch{}
  // a returning player (refresh, closed tab, Day 2) sees the intro and enters the access code again, then the wall
  // opens with all of his progress instead of the first-time transmission
  const returning=progress.caseAccepted||homeSeen;
  if(previewHome) showHomeBoard(); else later(pushIntoLake, 4500);
  $('#playIntro').addEventListener('click', () => {
    const lake = $('#lakeScene');
    if (lake.classList.contains('lake-pushing')) return;
    clearTimers(); startSound(); playImpact(1);
    if (reducedMotion) { runClues(); return; }
    // the camera pushes down the dock into the dark, then the clues begin
    lake.classList.add('lake-pushing');
    later(() => { runClues(); setTimeout(() => lake.classList.remove('lake-pushing'), 900); }, 1150);
  });
  $('#skipIntro').addEventListener('click', () => { if ($('#phaseTwoScene').classList.contains('active')) skipFile01ToEnd(); else openArchive(); });
  $('#nextEvidence').addEventListener('click', () => showClue(clueIndex + 1));
  $('#prevEvidence').addEventListener('click', () => showClue(clueIndex - 1));
  $('#reopenCase').addEventListener('click', openArchive);
  $('#replayIntro').addEventListener('click', startStory);

  const digits = $$('.digit');
  const accessButton = $('#accessButton');
  const syncCodeState = () => {
    // Stays clickable: submitting an incomplete code moves focus to the first empty box instead of doing nothing.
    accessButton.setAttribute('aria-disabled', String(!digits.every(d => /^\d$/.test(d.value))));
    digits.forEach(d => d.setAttribute('aria-invalid', String($('#digit-1').closest('.archive-panel').classList.contains('pin-error'))));
  };
  function fillCode(text, from=0) {
    const chars = String(text).replace(/\D/g,'').slice(0,4);
    if(chars.length===4){digits.forEach((d,i)=>d.value=chars[i]);digits[3].focus();}
    else {
      let slot=from;
      [...chars].forEach(c=>{while(slot<4&&digits[slot].value)slot++;if(slot<4)digits[slot++].value=c;});
      digits[Math.min(slot,3)]?.focus();
    }
    $('#loginError').textContent='';$('#archivePanel').classList.remove('pin-error');syncCodeState();
  }
  digits.forEach((input,i) => {
    input.addEventListener('input', () => {
      const entered=input.value.replace(/\D/g,'');
      if(entered.length>1){fillCode(entered,i);return;}
      input.value=entered.slice(-1);$('#loginError').textContent='';$('#archivePanel').classList.remove('pin-error');
      if(input.value&&i<3)digits[i+1].focus();syncCodeState();
    });
    input.addEventListener('keydown', e => {
      if(e.key==='Backspace'){
        e.preventDefault();$('#loginError').textContent='';$('#archivePanel').classList.remove('pin-error');
        if(input.value)input.value='';else if(i>0){digits[i-1].value='';digits[i-1].focus();}syncCodeState();
      }
      if(e.key==='ArrowLeft'&&i>0)digits[i-1].focus();
      if(e.key==='ArrowRight'&&i<3)digits[i+1].focus();
      if(e.key==='Enter'){e.preventDefault();submitCode();}
    });
    input.addEventListener('paste', e => {e.preventDefault();fillCode(e.clipboardData.getData('text'),i);});
  });
  syncCodeState();
  function submitCode() {
    if($('#archiveScene').classList.contains('decrypting')||$('#archiveScene').classList.contains('unsealed'))return;
    const code=digits.map(d=>d.value).join('');
    if(!/^\d{4}$/.test(code)){digits.find(d=>!d.value)?.focus();return;}
    if(code!=='6813'){$('#loginError').textContent='ACCESS DENIED · CHECK THE CASE RECORD.';$('#archivePanel').classList.remove('shake','pin-error');void $('#archivePanel').offsetWidth;$('#archivePanel').classList.add('shake','pin-error');digits.forEach(d=>d.value='');syncCodeState();digits[0].focus();setTimeout(()=>{$('#loginError').textContent='';$('#archivePanel').classList.remove('pin-error');},900);return;}
    $('#loginError').textContent='';try{localStorage.setItem('case25LoginPassed','1');}catch{}$('#archiveScene').classList.add('decrypting');let pct=0;
    const statuses=[[0,'VERIFYING CREDENTIALS...'],[18,'LOCATING ARCHIVE FRAGMENTS...'],[36,'RESTORING DAMAGED TRANSMISSION...'],[58,'RECONSTRUCTING CASE FILE...'],[79,'VERIFYING RECORD INTEGRITY...'],[100,'ARCHIVE RECOVERED']];
    const fill=$('#archiveProgress .progress-track i'); fill.style.width='0%';
    const interval=setInterval(()=>{pct=Math.min(100,pct+2);fill.style.width=pct+'%';$('#decryptPercent').textContent=String(pct).padStart(2,'0');const current=statuses.reduce((a,s)=>pct>=s[0]?s:a,statuses[0]);$('#archiveProgress small').textContent=current[1];if(pct===100){clearInterval(interval);$('#archiveProgress small').textContent='ARCHIVE RECOVERED';setTimeout(()=>{$('#archiveScene').classList.remove('decrypting');$('#archiveScene').classList.add('unsealed');later(()=>file1Bars(returning?showHomeBoard:showTransmission),500);},700);}},reducedMotion?20:120);
  }
  $('#accessButton').addEventListener('click',submitCode);
  function showTransmission(){
    clearTimers();
    const home = $('#homeScene');
    home.classList.remove('board-mode'); $('#homeCaption').hidden=false; $('#wallHotspot').hidden=false;
    show(scenes[6]);
    home.classList.remove('dossier-open','archive-transitioning','document-lit','wall-reveal');
    $('#messageDossier').setAttribute('aria-hidden','true');
    // Hold the untouched wall in silence, then slowly reveal the selected pinned document.
    later(() => { home.classList.add('document-lit'); sfx('dread'); }, reducedMotion ? 0 : 2200);
    later(() => home.classList.add('wall-reveal'), reducedMotion ? 0 : 6200);
  }
  $('#skipTyping').addEventListener('click',()=>$('#transmissionCopy').classList.add('typing-done'));
  $('#openInvestigation').addEventListener('click',()=>{ clearTimers(); localStorage.setItem('case25HomeSeen','1'); show(scenes[6]); });
  // shows which copy of the game the browser is running, so a stale cached copy is easy to spot
  {const m=(document.querySelector('script[src*="script.js"]')?.getAttribute('src')||'').match(/v=(\d+)/);const t=$('#buildTag');if(t)t.textContent='BUILD '+(m?m[1].slice(-6):'?');}
  $('#devFile03Button').addEventListener('click',()=>{
    progress.caseAccepted=true;progress.file02TransitionSeen=true;progress.fileTwoComplete=true;progress.file02Complete=true;
    progress.file03WallSeen=true;progress.file03Revealed=true;progress.unlockedChapter=Math.max(3,Number(progress.unlockedChapter)||1);
    progress.file03PuzzleComplete=false;
    f3s={screen:'opening',done:{},attempts:{},drafts:{},picks:{},live:{}};saveF3S();
    persistProgress();showHomeBoard();openFile03();
  });
  $('#devPuzzle4Button').addEventListener('click',()=>{
    progress.caseAccepted=true;progress.file02TransitionSeen=true;progress.fileTwoComplete=true;progress.file02Complete=true;
    progress.file03WallSeen=true;progress.file03Revealed=true;progress.unlockedChapter=Math.max(3,Number(progress.unlockedChapter)||1);
    progress.file03PuzzleComplete=false;
    f3s={screen:'p4-cover',done:{},attempts:{},drafts:{},picks:{},live:{p1read:true}};saveF3S();
    persistProgress();showHomeBoard();openFile03();
  });
  $('#beginChapter')?.addEventListener('click',()=>{ localStorage.setItem('case25Chapter01Started','1'); $('#beginChapter').textContent='CHAPTER 01 READY ✓'; });
  $('#wallHotspot').addEventListener('click',()=>{ if($('#homeScene').classList.contains('archive-transitioning'))return; $('#dossierOpen').click(); });
  $('#dossierClose').addEventListener('click',()=>{ $('#homeScene').classList.remove('dossier-open'); $('#messageDossier').setAttribute('aria-hidden','true'); $('#wallHotspot').focus(); });
  $('#dossierOpen').addEventListener('click',()=>{
    if($('#homeScene').classList.contains('archive-transitioning'))return;
    $('#homeScene').classList.add('archive-transitioning');
    $('#messageDossier').setAttribute('aria-hidden','true');
    startSound();
    setTimeout(()=>{
      $('#archiveTransition').classList.add('visible');
      setTimeout(()=>{
        $('#archiveTransition').classList.remove('visible');
        showRecords();
      },700);
    },220);
  });
  $('#fileOne').addEventListener('click',()=>{
    if(!$('#homeScene').classList.contains('board-mode'))return;
    progress.chapterOneStarted=true; persistProgress(); paintProgress(); startPhaseTwo();
  });
  $('#fileTwoBegin').addEventListener('click',()=>{
    if(!$('#fileTwoBegin').disabled){
      if(progress.fileTwoComplete||progress.file02Complete){
        startSecretReward();
      } else {
        openSecretLevel();
      }
    }
  });
  $('#dismissNotice').addEventListener('click',()=>{ progress.noticeDismissed=true; progress.noticeVisible=false; persistProgress(); paintProgress(); });
  $('#viewConnection').addEventListener('click',()=>{ progress.noticeVisible=false; progress.noticeDismissed=true; persistProgress(); paintProgress(); openFinancialEntry(); });
  $('#entryBack').addEventListener('click',()=>showHomeBoard());
  // Wall intro on the painted File 01 / File 002 board: a light finds File 01, its COMPLETED mark pulses,
  // a light finds File 002, a red string ties the two pins together, then the rest of the wall comes up.
  // Points are pixels on file-02-board.png; wallGeometry() turns them into on-screen positions.
  // After File 003 the papers report Peter's arrest: a clipping pinned to the wall beside File 003. The first time,
  // it is slapped onto the wall and its headline types itself; afterwards it simply hangs there.
  function placeClipping(){
    const clip=$('#arrestClipping'),card=$('#file03ArtCard');if(!clip||!card)return;
    const r=card.getBoundingClientRect(),h=$('#homeScene').getBoundingClientRect();if(!r.width)return;
    clip.style.left=(r.left-h.left-r.width*1.32)+'px';clip.style.top=(r.top-h.top+r.height*.18)+'px';clip.style.width=(r.width*1.18)+'px';clip.style.fontSize=(r.width/16)+'px';
  }
  addEventListener('resize',()=>requestAnimationFrame(placeClipping));
  // A police siren made in the browser: two tones sliding up and down, far away, then fading.
  function sirenSfx(ms){
    ensureSound();if(!audioContext||audioContext.state!=='running')return;
    const c=audioContext,t=c.currentTime,o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter(),l=c.createOscillator(),lg=c.createGain();
    o.type='sawtooth';o.frequency.value=720;l.frequency.value=.7;lg.gain.value=170;l.connect(lg);lg.connect(o.frequency);
    lp.type='lowpass';lp.frequency.value=1300;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+1.2);g.gain.setValueAtTime(.045,t+ms/1000-1.6);g.gain.exponentialRampToValueAtTime(.0001,t+ms/1000);
    o.connect(lp);lp.connect(g);g.connect(c.destination);o.start(t);l.start(t);o.stop(t+ms/1000+.1);l.stop(t+ms/1000+.1);
  }
  // Peter Shaw is taken into custody. Night outside The Lantern: rain, police lights washing red and blue, press flashes.
  // Two officers walk him from the door to the car. A last flash freezes the frame, it drains to black and white,
  // and the morning paper spins in with the photograph on its front page.
  function arrestScene(screen,done){
    screen.classList.add('ar-screen');
    const fig=(x,s,cls)=>`<g transform="translate(${x} 0)"><g class="ar-bob ${cls}"><g transform="scale(${s})">
      <circle cx="0" cy="-190" r="17"/><path d="M-26 -168 Q0 -178 26 -168 L32 -80 L-32 -80Z"/><path d="M-28 -82 L-24 0 L-8 0 L0 -60 L8 0 L24 0 L28 -82Z"/></g></g></g>`;
    screen.innerHTML=`<div class="ar-stage"><svg class="ar-street" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="arSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070c"/><stop offset="1" stop-color="#0d0f16"/></linearGradient>
      <linearGradient id="arWet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14161d"/><stop offset="1" stop-color="#050506"/></linearGradient>
      <radialGradient id="arDoor"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".85"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#arSky)"/>
      <rect x="80" y="120" width="760" height="560" fill="#0b0a0b"/><rect x="80" y="120" width="760" height="14" fill="#151314"/>
      ${[0,1,2,3].map(i=>`<rect x="${130+i*170}" y="200" width="110" height="140" fill="#14100c"/><rect x="${130+i*170}" y="200" width="110" height="140" fill="#ffb060" opacity="${[.08,.18,.05,.12][i]}"/>`).join('')}
      <text class="ar-neon" x="460" y="175" text-anchor="middle">THE LANTERN</text>
      <ellipse cx="560" cy="620" rx="160" ry="120" fill="url(#arDoor)"/><rect x="510" y="470" width="100" height="210" fill="#2a1a0c"/><rect x="516" y="476" width="88" height="204" fill="#ffcf8a" opacity=".55"/>
      <rect y="680" width="1600" height="220" fill="url(#arWet)"/>
      <rect class="ar-reflect" x="510" y="690" width="100" height="160" fill="#ffcf8a" opacity=".12"/>
      <g class="ar-car" fill="#030304"><path d="M1060 690 L1090 610 Q1110 585 1170 585 L1390 585 Q1440 585 1460 620 L1500 640 Q1530 650 1530 690Z"/><circle cx="1140" cy="700" r="34"/><circle cx="1440" cy="700" r="34"/>
        <rect class="ar-bar r" x="1200" y="570" width="60" height="14" rx="4" fill="#ff2a2a"/><rect class="ar-bar b" x="1262" y="570" width="60" height="14" rx="4" fill="#2a5bff"/></g>
      <g class="ar-group" fill="#030304" stroke="rgba(150,170,230,.28)" stroke-width="1.5" transform="translate(560 682)">${fig(-70,1.05,'ar-cop')}${fig(0,1,'ar-peter')}${fig(72,1.08,'ar-cop')}</g>
    </svg>
    <div class="ar-wash r"></div><div class="ar-wash b"></div><div class="ar-rain"></div><div class="ar-flash"></div>
    <div class="ar-cap"><small></small><b></b></div>
    <div class="ar-paper"><header><span>THE LAKE ASH COURIER</span><span>FRIDAY 17 OCTOBER</span></header><h1></h1><div class="ar-paper-body"><div class="ar-photo"><svg viewBox="0 0 400 260"><rect width="400" height="260" fill="#2b2b2b"/><rect x="40" y="40" width="150" height="150" fill="#3c3c3c"/><rect x="90" y="110" width="40" height="80" fill="#9a9a9a"/><g fill="#111" transform="translate(240 230) scale(.55)">${[-70,0,72].map(x=>`<g transform="translate(${x} 0)"><circle cx="0" cy="-190" r="17"/><path d="M-26 -168 Q0 -178 26 -168 L32 -80 L-32 -80Z"/><path d="M-28 -82 L-24 0 L-8 0 L0 -60 L8 0 L24 0 L28 -82Z"/></g>`).join('')}</g></svg><i>Peter Shaw is led from The Lantern late on Thursday night.</i></div><p>Peter Shaw, co-owner of The Lantern, was charged last night after boat-hire and card records placed him at the lake on the night Thomas Reed vanished.</p><p>Police say the evidence is “clear and documented”. Mr Shaw denies the charge.</p></div></div>
    <button type="button" class="f4-btn ar-go" hidden>CONTINUE →</button></div>`;
    const st=screen.querySelector('.ar-stage'),group=st.querySelector('.ar-group'),cap=st.querySelector('.ar-cap'),flash=st.querySelector('.ar-flash'),paper=st.querySelector('.ar-paper'),go=st.querySelector('.ar-go');
    const T=(ms,fn)=>laterWait(()=>{if(screen.isConnected)fn();},reducedMotion?0:ms);
    const type=(el,text,speed=45)=>{let i=0;const k=()=>{if(!el.isConnected)return;el.textContent=text.slice(0,++i);if(i<text.length)laterWait(k,speed);};k();};
    const flashOnce=(v=.8)=>flash.animate([{opacity:0},{opacity:v,offset:.08},{opacity:0}],{duration:420});
    go.addEventListener('click',done);
    let finished=false;
    const showPaper=()=>{if(finished)return;finished=true;
      st.classList.add('frozen');flashOnce(1);sfx('stamp');
      paper.classList.add('on');paper.animate([{transform:'translate(-50%,-50%) rotate(-900deg) scale(.05)',opacity:0},{opacity:1,offset:.25},{transform:'translate(-50%,-50%) rotate(-3deg) scale(1.06)',offset:.85},{transform:'translate(-50%,-50%) rotate(-3deg) scale(1)'}],{duration:reducedMotion?1:1500,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
      T(1550,()=>{sfx('stamp');st.animate([{transform:'none'},{transform:'translate(-4px,3px)'},{transform:'translate(3px,-2px)'},{transform:'none'}],{duration:260});});
      T(1900,()=>{type(paper.querySelector('h1'),'LANTERN CO-OWNER CHARGED IN LAKE ASH DISAPPEARANCE',38);sfx('sting');});
      T(4600,()=>{go.hidden=false;go.focus({preventScroll:true});});};
    if(reducedMotion){showPaper();return;}
    sirenSfx(9500);
    group.animate([{transform:'translate(560px,682px) scale(.82)',opacity:0},{opacity:1,offset:.08},{transform:'translate(1080px,700px) scale(1.08)'}],{duration:6200,delay:1600,easing:'linear',fill:'both'});
    st.querySelectorAll('.ar-bob').forEach((n,i)=>n.animate([{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],{duration:620,iterations:Infinity,delay:i*90}));
    T(900,()=>{cap.querySelector('small').classList.add('on');type(cap.querySelector('small'),'16 OCTOBER · 22:40 · OUTSIDE THE LANTERN',40);});
    T(3200,()=>{type(cap.querySelector('b'),'Peter Shaw is taken into custody.',55);});
    [2400,3100,3350,4700,5600,5800,6900].forEach(ms=>T(ms,()=>flashOnce(.35+Math.random()*.4)));
    T(4300,()=>sfx('key'));
    T(8200,showPaper);
    screen.addEventListener('click',e=>{if(!e.target.closest('button')&&!finished){screen.getAnimations({subtree:true}).forEach(a=>{if(a.effect?.target?.closest?.('.ar-group'))a.finish();});showPaper();}});
  }
  // The Day 1 cliffhanger: M's transmission pops up over the wall after File 003. It leaves nothing behind on the wall;
  // a small REPLAY button plays it again.
  const CLIFF_LINES=['Detective,','Peter Shaw will sleep in a cell tonight.\nYou put him there.','Before you opened the first file, I sealed an envelope.\nRead it now.','@sealed','Every page was placed so you would arrive exactly where you are tonight.','So tell me: did you solve this case,\nor did you follow the path I laid down?','Lake Ash was not the first night Peter Shaw lied.\nNine years ago, there was an incident at The Lantern.\nSomeone did not go home that night.\nThe report called it an accident.','!It was not.','@subject','I was in that room.\nI watched the lights flicker twice.','You asked who M was watching.\nYou never asked why M chose you.','!See you at the end.','— M','@next'];
  // The player's own name on the last card. Change it here; put his photo at assets/file-006/subject.jpg for the sketch.
  const SUBJECT_NAME='MR. SHAIK';
  let cliffRun=0;
  // ---- cliffhanger sound: its own score (low drone, a clock, a broken music box with echo) and M's voice ----
  let cliffAudio=null;
  function cliffScore(){
    cliffStop();ensureSound();const c=audioContext;if(!c)return;
    const prevMusic=musicWanted;setMusic(false);
    const out=c.createGain();out.gain.setValueAtTime(.0001,c.currentTime);out.gain.exponentialRampToValueAtTime(1,c.currentTime+5);out.connect(c.destination);
    const nodes=[],timers=[],t0=c.currentTime;
    const noise=(sec)=>{const b=c.createBuffer(2,c.sampleRate*sec|0,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;l=(l+.02*w)/1.02;d[i]=w*.6+l*2;}}return b;};
    // rain: a steady wash with a softer, closer layer
    const bed=c.createGain();bed.gain.value=.0001;bed.connect(out);
    const rain=c.createGain();rain.connect(out);
    const rb=noise(4);[[900,.5,.42],[2600,.6,.3],[6200,.8,.16]].forEach(([f,q,v])=>{const s=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain();s.buffer=rb;s.loop=true;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;g.gain.value=v;s.connect(bp);bp.connect(g);g.connect(rain);s.start();nodes.push(s);});
    // a few drops on the glass
    timers.push(setInterval(()=>{const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(1800+Math.random()*2400,t);o.frequency.exponentialRampToValueAtTime(600,t+.05);g.gain.setValueAtTime(.012,t);g.gain.exponentialRampToValueAtTime(.0001,t+.06);o.connect(g);g.connect(rain);o.start(t);o.stop(t+.08);},140));
    // low drone and a dark string cluster that breathes
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=480;lp.Q.value=2;lp.connect(bed);
    const swell=c.createGain();swell.gain.value=.5;swell.connect(lp);
    [[36.7,'sine',.22],[73.4,'sawtooth',.05],[77.8,'sawtooth',.045],[110,'sawtooth',.03],[116.5,'sawtooth',.028],[155.6,'triangle',.02]].forEach(([f,t,v],i)=>{const o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.value=f;o.detune.value=(i%2?7:-7);g.gain.value=v;o.connect(g);g.connect(swell);o.start();nodes.push(o);});
    const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.06;lg.gain.value=.4;lfo.connect(lg);lg.connect(swell.gain);lfo.start();nodes.push(lfo);
    const lfo2=c.createOscillator(),lg2=c.createGain();lfo2.frequency.value=.045;lg2.gain.value=260;lfo2.connect(lg2);lg2.connect(lp.frequency);lfo2.start();nodes.push(lfo2);
    // a slow low pulse, like a distant heart
    timers.push(setInterval(()=>{const t=c.currentTime;[0,.28].forEach((d,k)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(58,t+d);o.frequency.exponentialRampToValueAtTime(34,t+d+.3);g.gain.setValueAtTime(.0001,t+d);g.gain.exponentialRampToValueAtTime(k?.18:.28,t+d+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d+.45);o.connect(g);g.connect(bed);o.start(t+d);o.stop(t+d+.5);});},1900));
    // a glass tone now and then, high and wrong
    const glass=()=>{const t=c.currentTime,f=[1244.5,1318.5,1661.2,1760][Math.random()*4|0];[f,f*1.0072].forEach(fr=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=fr;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.018,t+1.6);g.gain.exponentialRampToValueAtTime(.0001,t+5.5);o.connect(g);g.connect(bed);o.start(t);o.stop(t+5.6);});};
    timers.push(setInterval(glass,9000));setTimeout(glass,3000);
    // thunder far away
    const thunder=()=>{const t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=rb;f.type='lowpass';f.frequency.value=220;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(2.2,t+.25);g.gain.exponentialRampToValueAtTime(.6,t+1.2);g.gain.exponentialRampToValueAtTime(.0001,t+4.5);if(!cliffAudio||cliffAudio.phase!=='rain')return;s.connect(f);f.connect(g);g.connect(rain);s.start(t,Math.random()*2);s.stop(t+4.6);const lb=document.querySelector('#cliffhanger .cc-stage');if(lb&&!lb.classList.contains('bolt')){lb.classList.add('bolt');setTimeout(()=>lb.classList.remove('bolt'),900);}};
    timers.push(setInterval(thunder,11000));setTimeout(thunder,1500);
    setTimeout(()=>{if(cliffAudio)cliffAudio.thunderNow=thunder;},0);
    cliffAudio={out,nodes,timers,prevMusic,rain,bed,phase:'rain',drive:null};
  }
  // The score moves with the scene: rain and thunder while the chair faces the window; the mysterious bed when he
  // turns and speaks; rain again when he turns away; the driving thriller cue over the full transmission.
  function cliffPhase(ph){
    const a=cliffAudio,c=audioContext;if(!a||!c||a.phase===ph)return;const t=c.currentTime;a.phase=ph;
    a.rain.gain.cancelScheduledValues(t);a.bed.gain.cancelScheduledValues(t);
    a.rain.gain.setTargetAtTime(ph==='rain'?1:.0001,t,ph==='rain'?1.4:1.8);
    a.bed.gain.setTargetAtTime(ph==='mystery'?1:ph==='final'?.35:.0001,t,1.6);
    if(ph==='rain'){const th=()=>{if(cliffAudio===a&&a.phase==='rain')a.thunderNow&&a.thunderNow();};setTimeout(th,1800);}
    if(ph==='final')cliffDrive();else if(a.drive){a.drive.gain.setTargetAtTime(.0001,t,1);const d=a.drive;a.drive=null;clearInterval(d.timer);}
  }
  function cliffDrive(){
    const a=cliffAudio,c=audioContext;if(!a||!c||a.drive)return;const t=c.currentTime;
    const mix=c.createGain();mix.gain.value=1;mix.connect(a.out);a.drive=mix;
    const at=t+.2,boom=c.createOscillator(),bg=c.createGain();boom.type='sine';boom.frequency.setValueAtTime(70,at);boom.frequency.exponentialRampToValueAtTime(28,at+1.8);bg.gain.setValueAtTime(.0001,at);bg.gain.exponentialRampToValueAtTime(1.1,at+.02);bg.gain.exponentialRampToValueAtTime(.0001,at+2.2);boom.connect(bg);bg.connect(mix);boom.start(at);boom.stop(at+2.3);
    const blp=c.createBiquadFilter();blp.type='lowpass';blp.frequency.setValueAtTime(200,at);blp.frequency.exponentialRampToValueAtTime(1400,at+.6);blp.frequency.exponentialRampToValueAtTime(300,at+4);blp.connect(mix);
    [73.4,87.3,110,146.8].forEach(f=>[0,8].forEach(dt=>{const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=f;o.detune.value=dt;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.09,at+.15);g.gain.exponentialRampToValueAtTime(.0001,at+4.5);o.connect(g);g.connect(blp);o.start(at);o.stop(at+4.6);}));
    const olp=c.createBiquadFilter();olp.type='lowpass';olp.frequency.value=900;olp.connect(mix);
    const pat=[73.4,73.4,87.3,73.4,77.8,73.4,87.3,98];let k=0;
    const tick=()=>{if(a.drive!==mix)return;const tt=c.currentTime+.05,f=pat[k%pat.length];k++;
      const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=f;g.gain.setValueAtTime(.0001,tt);g.gain.exponentialRampToValueAtTime(.16,tt+.01);g.gain.exponentialRampToValueAtTime(.0001,tt+.14);o.connect(g);g.connect(olp);o.start(tt);o.stop(tt+.16);
      if(k%2===0){const n=c.createOscillator(),ng=c.createGain();n.type='square';n.frequency.value=2200;ng.gain.setValueAtTime(.012,tt);ng.gain.exponentialRampToValueAtTime(.0001,tt+.03);n.connect(ng);ng.connect(mix);n.start(tt);n.stop(tt+.04);}
      if(k%16===1){const s2=c.createOscillator(),sg=c.createGain(),f2=[293.7,311.1,349.2,392][(k/16|0)%4];s2.type='sawtooth';s2.frequency.value=f2;sg.gain.setValueAtTime(.0001,tt);sg.gain.exponentialRampToValueAtTime(.035,tt+1.2);sg.gain.exponentialRampToValueAtTime(.0001,tt+2.5);s2.connect(sg);sg.connect(olp);s2.start(tt);s2.stop(tt+2.6);}
      if(k%32===0){const b=c.createOscillator(),bb=c.createGain();b.type='sine';b.frequency.setValueAtTime(60,tt);b.frequency.exponentialRampToValueAtTime(30,tt+.8);bb.gain.setValueAtTime(.6,tt);bb.gain.exponentialRampToValueAtTime(.0001,tt+1);b.connect(bb);bb.connect(mix);b.start(tt);b.stop(tt+1.1);}};
    setTimeout(()=>{if(a.drive===mix){mix.timer=setInterval(tick,160);a.timers.push(mix.timer);}},2000);
  }
  // the thud under the closing notice
  function cliffThud(){
    ensureSound();const c=audioContext;if(!c)return;const t=c.currentTime;
    const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(26,t+1.2);g.gain.setValueAtTime(1.6,t);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+1.7);
    const len=c.sampleRate*.3|0,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let k=0;k<len;k++)d[k]=(Math.random()*2-1)*Math.pow(1-k/len,4);
    const n=c.createBufferSource(),f=c.createBiquadFilter(),ng=c.createGain();n.buffer=b;f.type='lowpass';f.frequency.value=400;ng.gain.value=1.4;n.connect(f);f.connect(ng);ng.connect(c.destination);n.start(t);
  }
  function cliffStop(){
    if(!cliffAudio)return;const a=cliffAudio;cliffAudio=null;a.timers.forEach(clearInterval);
    try{const c=audioContext;a.out.gain.setTargetAtTime(.0001,c.currentTime,.6);setTimeout(()=>a.nodes.forEach(n=>{try{n.stop();}catch{}}),2500);}catch{}
    setMusic(a.prevMusic);try{speechSynthesis.cancel();}catch{}
  }
  // M reads the whole transmission: slow, low and amused, with a quiet laugh where it stings.
  // Each entry is a list of [text, pitch, rate]; 'L' is a laugh.
  const CLIFF_LAUGH={soft:['Heh. Heh.',.35,.85],long:['Ha. ha. ha. ha.',.3,.8],hm:['Hm. hm. hm.',.35,.8]};
  const CLIFF_READ={
    'Detective,':[['Detective.',.45,.7]],
    'Peter Shaw will sleep in a cell tonight.\nYou put him there.':[['Peter Shaw will sleep in a cell tonight.',.5,.8],CLIFF_LAUGH.soft,['You put him there.',.6,.72]],
    'Before you opened the first file, I sealed an envelope.\nRead it now.':[['Before you opened the first file, I sealed an envelope.',.5,.8],['Go on. Read it now.',.55,.75]],
    '@sealed':[['The record will say that Peter Shaw killed Thomas Reed.',.45,.8],['The record will say that Thomas Reed is dead.',.45,.8],['And you will give me a name.',.5,.8],['It will not be mine.',.4,.72],CLIFF_LAUGH.long],
    'Every page was placed so you would arrive exactly where you are tonight.':[['Every page was placed, so you would arrive, exactly where you are tonight.',.5,.78]],
    'So tell me: did you solve this case,\nor did you follow the path I laid down?':[['So tell me. Did you solve this case?',.6,.78],['Or did you follow the path I laid down?',.45,.75],CLIFF_LAUGH.hm],
    'Lake Ash was not the first night Peter Shaw lied.\nNine years ago, there was an incident at The Lantern.\nSomeone did not go home that night.\nThe report called it an accident.':[['Lake Ash was not the first night Peter Shaw lied.',.5,.8],['Nine years ago, there was an incident at The Lantern.',.45,.78],['Someone did not go home that night.',.4,.75],['The report called it an accident.',.55,.78],CLIFF_LAUGH.soft],
    '!It was not.':[['It was not.',.3,.6]],
    'I was in that room.\nI watched the lights flicker twice.':[['I was in that room.',.4,.72],['I watched the lights flicker. Twice.',.45,.72]],
    'You asked who M was watching.\nYou never asked why M chose you.':[['You asked who M was watching.',.5,.78],['You never asked, why M chose you.',.4,.72]],
    '@next':[['Shaik.',.45,.65],CLIFF_LAUGH.long],
    '!See you at the end.':[['See you at the end, Detective.',.4,.7],CLIFF_LAUGH.hm],
    '@meta':[['Oh. And Detective.',.6,.78],['This message was written three weeks ago.',.45,.75],CLIFF_LAUGH.long]};
  let cliffVoicePick=null;
  function cliffSay(key){
    try{const parts=CLIFF_READ[key];if(!parts||soundMuted||!('speechSynthesis' in window))return;
      if(!cliffVoicePick){const vs=speechSynthesis.getVoices();cliffVoicePick=['Daniel','Arthur','Google UK English Male','Fred','Alex','Aaron','Rishi'].map(n=>vs.find(v=>v.name.includes(n))).find(Boolean)||vs.find(v=>/^en/i.test(v.lang))||null;}
      parts.forEach(([text,pitch,rate])=>{const u=new SpeechSynthesisUtterance(text);if(cliffVoicePick)u.voice=cliffVoicePick;u.pitch=pitch;u.rate=rate;u.volume=1;speechSynthesis.speak(u);});}catch{}
  }
  // The cliffhanger, as a scene: the wall's lights die, the signal is acquired, M's lines glitch into place one by one,
  // the wax seal cracks, a flashbulb burns the 2016 photograph into view, a red thread runs down to the last card, and
  // the dark closes in on the player's own face to a heartbeat. A click shows it all at once.
  // ===== The cliffhanger, directed =====
  // A dark office in the rain. A high-backed chair faces the window; cigar smoke rises from it. The camera pushes in,
  // the chair turns, and M is there: hat, shadowed face, a cigar ember. He laughs. Then he talks, and every line on screen
  // waits for his voice (subtitles reveal word by word as he speaks). The sealed envelope drops onto the desk, the wax
  // cracks, the card rises out and "21 DAYS AGO" slams over it. The burnt 2016 photograph, the incident, the red thread
  // to Shaik's own card, a heartbeat. He leans back into the dark. Last, the header rewrites itself: it was scheduled.
  // A click anywhere skips straight to the full transmission.
  function cliffSpeak(text,pitch=.45,rate=.78,onWord){
    // speaks a line and resolves when the voice finishes; if the browser has no voice (or it never starts),
    // the words are revealed on a timer instead so the scene never stalls
    return new Promise(res=>{
      const words=text.split(' '),est=Math.max(800,words.length*400/rate);let done=false,started=false;
      const fin=()=>{if(!done){done=true;onWord&&onWord(text.length);res();}};
      const timed=()=>{let i=0;const step=est/words.length;const tick=()=>{if(done)return;i++;onWord&&onWord(words.slice(0,i).join(' ').length);if(i<words.length)setTimeout(tick,step);else setTimeout(fin,250);};tick();};
      try{
        if(soundMuted||!('speechSynthesis' in window)||!speechSynthesis.getVoices().length)throw 0;
        if(!cliffVoicePick){const vs=speechSynthesis.getVoices();cliffVoicePick=['Daniel','Arthur','Google UK English Male','Fred','Alex','Aaron','Rishi'].map(n=>vs.find(v=>v.name.includes(n))).find(Boolean)||vs.find(v=>/^en/i.test(v.lang))||null;}
        const u=new SpeechSynthesisUtterance(text);if(cliffVoicePick)u.voice=cliffVoicePick;u.pitch=pitch;u.rate=rate;u.volume=1;
        u.onstart=()=>{started=true;};
        u.onboundary=e=>{if(onWord&&e.name!=='sentence')onWord(e.charIndex);};
        u.onend=()=>setTimeout(fin,150);u.onerror=()=>{if(!started)timed();else setTimeout(fin,200);};
        speechSynthesis.speak(u);
        setTimeout(()=>{if(!started&&!done){try{speechSynthesis.cancel();}catch{}timed();}},1500);
        setTimeout(fin,est*2.5+2500);
      }catch{timed();}
    });
  }
  // a quiet, breathy chuckle under the spoken laugh
  function cliffChuckle(){
    ensureSound();const c=audioContext;if(!c)return;
    [0,.32,.62].forEach((d,i)=>{const t=c.currentTime+d,len=c.sampleRate*.5|0,b=c.createBuffer(1,len,c.sampleRate),dd=b.getChannelData(0);
      for(let k=0;k<len;k++)dd[k]=(Math.random()*2-1)*Math.pow(Math.sin(Math.PI*k/len),2);
      const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=700-i*120;g.gain.value=.22-i*.05;s.connect(f);f.connect(g);g.connect(c.destination);s.start(t);});
  }
  function cliffThunder(){
    ensureSound();const c=audioContext;if(!c)return;const len=c.sampleRate*2.6|0,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);
    for(let k=0;k<len;k++)d[k]=(Math.random()*2-1)*Math.pow(1-k/len,2.2);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=180;g.gain.value=2.4;s.connect(f);f.connect(g);g.connect(c.destination);s.start();
  }
  const CLIFF_META='QUEUED 03 OCT · 23:47   ·   RELEASE CONDITION: FILE 003 CLOSED   ·   STATUS: DELIVERED ON SCHEDULE';
  function cliffFinal(box){
    const letter=box.querySelector('.cliff-letter'),kick=box.querySelector('.cliff-kicker');box.querySelector('.cc-props').innerHTML='';
    try{speechSynthesis.cancel();}catch{}
    letter.innerHTML=CLIFF_LINES.filter(t=>t[0]!=='@').map(t=>`<p class="on ${t[0]==='!'?'red':t==='— M'?'sign':''}">${t.replace(/^!/,'').split('\n').map(l=>`<span class="ln">${f3sEsc(l)}</span>`).join('<br>')}</p>`).join('');
    kick.style.visibility='';kick.textContent='SCHEDULED TRANSMISSION · WRITTEN 03 OCT · RELEASED 23:47';
    box.querySelector('.cliff-meta').textContent=CLIFF_META;
    box.querySelector('.cliff-wrap .cliff-sealed').classList.add('on','cracked');box.querySelector('.cliff-wrap .cliff-subject').classList.add('on');
    const n=box.querySelector('.cliff-wrap .cliff-next');n.querySelector('.nx-name').textContent=SUBJECT_NAME;n.classList.add('on','stamped');
    box.classList.add('final','live','threaded','sent');box.classList.remove('focus','glitch','reveal');
    const go=box.querySelector('.cliff-go');go.hidden=true;if(go.parentNode!==box)box.append(go);
    // everything surfaces slowly: the header, each paragraph, the envelope, the photograph, his card, the queue line
    const seq=[box.querySelector('.cliff-wrap header'),...letter.children,box.querySelector('.cliff-wrap .cliff-sealed'),box.querySelector('.cliff-wrap .cliff-subject'),box.querySelector('.cliff-wrap .cliff-next'),box.querySelector('.cliff-meta')];
    let t=reducedMotion?0:300;const step=reducedMotion?0:650;
    seq.forEach(el=>{if(!el)return;el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:reducedMotion?1:1100,delay:t,easing:'ease-out',fill:'backwards'});t+=step;});
    let rp=box.querySelector('.cliff-replay-once');
    if(!rp){rp=document.createElement('button');rp.type='button';rp.className='cliff-replay-once';rp.textContent='↺ REPLAY';box.append(rp);
      rp.addEventListener('click',e=>{e.stopPropagation();progress.cliffReplayed=true;persistProgress();rp.hidden=true;box.querySelector('.cliff-notice')?.remove();playCliffhanger();});}
    rp.hidden=true;
    setTimeout(()=>{if(!box.classList.contains('final'))return;go.hidden=false;go.focus({preventScroll:true});rp.hidden=!!progress.cliffReplayed;},t+600);
    return t+600;
  }
  // a small system notice after everything: the message was scheduled three weeks ago
  function cliffNotice(box){
    box.querySelector('.cliff-notice')?.remove();
    box.insertAdjacentHTML('beforeend',`<div class="cliff-notice" role="status"><small>ARCHIVE SYSTEM · DELIVERY RECEIPT</small><b>THIS WAS NOT SENT TONIGHT.</b><p>Written <em>03 October, 23:47</em>. Three weeks before you opened the first file.</p><p>Held in the archive, unread, until one condition was met:<br><span>FILE 003 · CLOSED BY THE DETECTIVE</span></p><p class="q">Delivered on schedule. Exactly as planned.</p><button type="button">DISMISS</button></div>`);
    const n=box.querySelector('.cliff-notice');cliffThud();box.querySelector('.cliff-wrap')?.animate([{transform:'none'},{transform:'translate(-6px,4px)'},{transform:'translate(5px,-3px)'},{transform:'none'}],{duration:320});
    n.querySelector('button').addEventListener('click',e=>{e.stopPropagation();n.classList.add('out');setTimeout(()=>n.remove(),500);});
  }
  function playCliffhanger(){
    const box=$('#cliffhanger');
    if(!$('#homeScene').classList.contains('active'))return;
    const run=++cliffRun,alive=()=>run===cliffRun&&!box.hidden;
    const st=box.querySelector('.cc-stage'),room=st.querySelector('.cc-room'),sub=st.querySelector('.cc-sub'),props=st.querySelector('.cc-props'),stamp=st.querySelector('.cc-stamp'),ck=st.querySelector('.cc-kicker');
    const chair=st.querySelector('.cc-chair'),hand=st.querySelector('.cc-hand'),back=st.querySelector('.cc-back'),front=st.querySelector('.cc-front'),ember=st.querySelector('.cc-ember');
    // reset
    try{speechSynthesis.cancel();speechSynthesis.getVoices();}catch{}
    box.querySelectorAll('.cliff-fx').forEach(n=>n.remove());box.querySelector('.cliff-scene')?.remove();
    box.className='cliff';box.hidden=false;void box.offsetWidth;box.classList.add('in','cine');
    st.getAnimations({subtree:true}).forEach(a=>a.cancel());
    sub.innerHTML='';props.innerHTML='';stamp.textContent='';stamp.className='cc-stamp';ck.textContent='';
    st.className='cc-stage';chair.className='cc-chair';
    box.querySelector('.cliff-go').hidden=true;box.querySelector('.cliff-meta').textContent='';
    box.insertAdjacentHTML('beforeend','<div class="cliff-fx cliff-black"></div><div class="cliff-fx cliff-red"></div><div class="cliff-fx cliff-flash"></div>');
    const black=box.querySelector('.cliff-black'),red=box.querySelector('.cliff-red'),flash=box.querySelector('.cliff-flash');
    cliffScore();
    const wait=ms=>new Promise(r=>setTimeout(r,reducedMotion?0:ms));
    const jolt=(px=8)=>st.animate([{transform:'none'},{transform:`translate(${-px}px,${px/2}px)`},{transform:`translate(${px*.7}px,${-px/3}px)`},{transform:'none'}],{duration:320});
    const pop=(el,from='scale(2.4)')=>el.animate([{opacity:0,transform:from,filter:'blur(8px)'},{opacity:1,transform:'scale(.96)',filter:'blur(0)',offset:.7},{opacity:1,transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
    const laugh=async()=>{chair.classList.add('laugh');cliffChuckle();await wait(1900);chair.classList.remove('laugh');};
    // say a line with subtitles that follow the voice word by word
    const line=async(text,{pitch=.45,rate=.78,red:isRed=false,hold=500}={})=>{
      if(!alive())return;
      sub.className='cc-sub'+(isRed?' red':'');
      const words=text.split(' ');sub.innerHTML=words.map(w=>`<span>${f3sEsc(w)}</span>`).join(' ');
      const spans=[...sub.children],ends=[];let acc=0;words.forEach(w=>{acc+=w.length+1;ends.push(acc);});
      sub.animate([{opacity:0},{opacity:1}],{duration:300,fill:'forwards'});
      if(isRed){jolt(10);red.animate([{opacity:0},{opacity:.6,offset:.1},{opacity:0}],{duration:1400});sfx('sting');}
      await cliffSpeak(text,pitch,rate,ci=>spans.forEach((s,i)=>{if(ends[i]-1<=ci+1||ci>=text.length)s.classList.add('on');}));
      spans.forEach(s=>s.classList.add('on'));
      await wait(hold);
      if(alive())sub.animate([{opacity:1,transform:'translateX(-50%)'},{opacity:0,transform:'translateX(-50%) translateY(14px)'}],{duration:450,fill:'forwards'});
      await wait(380);
    };
    box.onclick=e=>{if(e.target.closest('.cliff-go'))return;if(box.classList.contains('final'))return;cliffRun++;try{speechSynthesis.cancel();}catch{}st.getAnimations({subtree:true}).forEach(a=>a.finish());cliffPhase('final');const tf=cliffFinal(box);setTimeout(()=>{if(box.classList.contains('final'))cliffNotice(box);},tf+400);};
    (async()=>{
      // 1. the lights die
      black.animate([{opacity:0},{opacity:.8,offset:.12},{opacity:.1,offset:.2},{opacity:.95,offset:.32},{opacity:.4,offset:.4},{opacity:1}],{duration:reducedMotion?1:1700,fill:'forwards'});
      sfx('dread');await wait(2000);if(!alive())return;
      // 2. the room: rain, a chair facing the window, smoke rising
      st.classList.add('on');black.animate([{opacity:1},{opacity:0}],{duration:2200,fill:'forwards'});
      room.animate([{transform:'scale(1.0)'},{transform:'scale(1.22) translateY(4%)'}],{duration:16000,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      ck.textContent='INCOMING TRANSMISSION · SOURCE: M · 23:47';ck.style.opacity=1;f4Decode(ck,1400);sfx('ink');
      await wait(3600);if(!alive())return;
      st.classList.add('bolt');cliffThunder();setTimeout(()=>st.classList.remove('bolt'),900);
      await wait(2400);if(!alive())return;
      // 3. the chair turns
      chair.classList.add('turning');sfx('paper');cliffPhase('mystery');await wait(3300);if(!alive())return;
      chair.classList.add('turned');
      const drag=()=>{if(!alive()||!chair.classList.contains('turned')||chair.classList.contains('away'))return;
        ember.animate([{r:5.5,fill:'#ff6a1a',filter:'drop-shadow(0 0 6px #ff7a2a)',offset:0},{r:5.5,fill:'#ff6a1a',offset:.3},{r:8.5,fill:'#ffd27a',filter:'drop-shadow(0 0 22px #ff8a2a) drop-shadow(0 0 40px #ff5a10)',offset:.55},{r:5.5,fill:'#ff6a1a',filter:'drop-shadow(0 0 6px #ff7a2a)'}],{duration:2600,easing:'ease-in-out'});
        chair.animate([{filter:'brightness(1)'},{filter:'brightness(1.25)',offset:.55},{filter:'brightness(1)'}],{duration:1800});
        hand.animate([{transform:'translate(232px,352px) rotate(14deg)'},{transform:'translate(196px,258px) rotate(-6deg)',offset:.3},{transform:'translate(196px,258px) rotate(-6deg)',offset:.7},{transform:'translate(232px,352px) rotate(14deg)'}],{duration:2600,easing:'cubic-bezier(.45,0,.3,1)'});
        setTimeout(()=>{if(!alive())return;for(let i=0;i<4;i++){const p=document.createElement('i');p.className='cc-puff';p.style.setProperty('--dx',(-40-Math.random()*90)+'px');p.style.setProperty('--dy',(-90-Math.random()*120)+'px');p.style.animationDelay=(i*.18)+'s';chair.append(p);setTimeout(()=>p.remove(),5200);}},2200);
        setTimeout(drag,7000+Math.random()*3000);};
      setTimeout(drag,2600);
      ember.animate([{r:5.5,filter:'none'},{r:9,filter:'drop-shadow(0 0 14px #ff7a2a)',offset:.5},{r:5.5,filter:'none'}],{duration:2400});
      await wait(1400);await laugh();if(!alive())return;
      await wait(400);
      // 4. he speaks
      await line('Detective.',{pitch:.45,rate:.68,hold:700});
      await line('Peter Shaw will sleep in a cell tonight.',{pitch:.5,rate:.8});
      await laugh();
      await line('You put him there.',{pitch:.6,rate:.72,hold:900});
      await line('Before you opened the first file, I sealed an envelope.',{pitch:.5,rate:.8,hold:200});
      // 5. the envelope
      if(!alive())return;
      props.innerHTML=`<div class="cc-env"><div class="cc-env-back"></div><div class="cc-env-card"><svg class="cc-blood" viewBox="0 0 400 250" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="bRough" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="9"/></filter><radialGradient id="bPool"><stop offset="0" stop-color="#4a0402"/><stop offset=".7" stop-color="#7a0a05"/><stop offset="1" stop-color="#8c1208" stop-opacity=".6"/></radialGradient></defs><g filter="url(#bRough)"><ellipse cx="338" cy="40" rx="34" ry="24" fill="url(#bPool)" opacity=".92"/><g fill="#6e0805" opacity=".9"><circle cx="284.2" cy="82.1" r="1.1"/><circle cx="353.3" cy="93.2" r="1.2"/><circle cx="413.9" cy="56.6" r="0.7"/><circle cx="330.6" cy="56.2" r="2.8"/><circle cx="371.1" cy="66.2" r="2.5"/><circle cx="279.3" cy="36.4" r="1.6"/><circle cx="340.5" cy="36.1" r="2.3"/><circle cx="335.8" cy="40.4" r="5.3"/><circle cx="336.6" cy="38.8" r="3.4"/><circle cx="332.9" cy="42.4" r="1.3"/><circle cx="336.8" cy="40.2" r="3.4"/><circle cx="334.9" cy="39.8" r="4.8"/><circle cx="342.9" cy="41.0" r="4.4"/><circle cx="341.9" cy="57.0" r="2.7"/><circle cx="312.7" cy="48.7" r="2.3"/><circle cx="337.1" cy="40.1" r="4.6"/><circle cx="337.9" cy="40.5" r="2.6"/><circle cx="353.8" cy="10.2" r="1.8"/><circle cx="330.6" cy="40.8" r="3.4"/><circle cx="337.4" cy="40.7" r="1.2"/><circle cx="376.7" cy="60.4" r="2.6"/><circle cx="338.2" cy="34.0" r="1.3"/><circle cx="354.8" cy="35.6" r="1.3"/><circle cx="302.4" cy="26.4" r="2.0"/><circle cx="325.9" cy="43.0" r="2.7"/><circle cx="293.6" cy="49.8" r="1.6"/><circle cx="287.2" cy="92.6" r="0.6"/><circle cx="338.7" cy="23.2" r="3.6"/><circle cx="329.0" cy="13.6" r="2.4"/><circle cx="338.0" cy="40.1" r="4.3"/><circle cx="337.9" cy="42.0" r="4.5"/><circle cx="337.7" cy="39.8" r="3.2"/><circle cx="372.9" cy="86.2" r="0.9"/><circle cx="374.0" cy="28.5" r="0.8"/><circle cx="270.4" cy="75.0" r="0.8"/><circle cx="347.7" cy="51.3" r="1.7"/><circle cx="368.7" cy="56.3" r="2.6"/><circle cx="344.8" cy="65.7" r="3.2"/><circle cx="341.9" cy="37.5" r="1.0"/><circle cx="350.1" cy="34.0" r="1.3"/><circle cx="341.0" cy="32.3" r="3.8"/><circle cx="333.7" cy="31.1" r="2.6"/><circle cx="323.3" cy="86.7" r="1.0"/><circle cx="328.1" cy="92.6" r="0.9"/><circle cx="310.8" cy="49.2" r="0.6"/><circle cx="325.9" cy="81.2" r="2.5"/></g><path d="M286 0c3 16 1 30-2 44-2 10 2 20 0 34-1 7-9 7-9-1 0-14-4-22-3-38 1-14 2-26 4-39z" fill="#5c0603"/><circle cx="279" cy="80" r="5.5" fill="#5c0603"/><path d="M306 0c2 9 1 17-1 25-1 5-6 5-6-1 0-7 1-15 3-24z" fill="#650704"/><circle cx="302" cy="30" r="3.4" fill="#650704"/><path d="M8 250c18-30 50-52 96-60 30-4 44 6 38 16-8 12-50 10-80 22-22 8-36 16-54 22z" fill="#5a0a05" opacity=".38"/><path d="M360 150c-30 10-70 40-96 70" stroke="#6a0905" stroke-width="7" stroke-linecap="round" opacity=".35" fill="none"/></g><g fill="none" stroke="#6a0905" stroke-width="1.6" opacity=".55" transform="rotate(-18 64 214)"><ellipse cx="64" cy="214" rx="4.0" ry="5.0"/><ellipse cx="64" cy="214" rx="7.2" ry="9.0"/><ellipse cx="64" cy="214" rx="10.4" ry="13.0"/><ellipse cx="64" cy="214" rx="13.6" ry="17.0"/><ellipse cx="64" cy="214" rx="16.8" ry="21.0"/><ellipse cx="64" cy="214" rx="20.0" ry="25.0"/></g><circle cx="150" cy="232" r="26" fill="none" stroke="#5a2a10" stroke-width="5" opacity=".18"/></svg><small>SEALED · 3 OCTOBER</small><p>The record will say that Peter Shaw killed Thomas Reed.</p><p>The record will say that Thomas Reed is dead.</p><p>And you will give me a name.</p><p class="r">It will not be mine.</p><i>— M</i></div><div class="cc-env-front"><svg class="cc-blood" viewBox="0 0 400 250" preserveAspectRatio="none" aria-hidden="true"><g filter="url(#bRough)"><path d="M30 250c8-44 34-66 72-76 26-6 34 12 22 26-12 14-44 22-56 50z" fill="#5e0905" opacity=".7"/><path d="M96 178c3 22-1 44-4 66h-7c0-22 2-44 11-66z" fill="#4e0603" opacity=".8"/><g fill="#6e0805" opacity=".85"><circle cx="318.3" cy="214.4" r="0.8"/><circle cx="316.4" cy="200.8" r="2.2"/><circle cx="326.7" cy="208.4" r="3.7"/><circle cx="332.3" cy="189.2" r="0.8"/><circle cx="331.6" cy="200.4" r="1.1"/><circle cx="308.6" cy="190.2" r="0.9"/><circle cx="356.6" cy="179.5" r="1.9"/><circle cx="338.7" cy="194.6" r="3.6"/><circle cx="389.4" cy="192.7" r="0.6"/><circle cx="370.2" cy="155.9" r="0.6"/><circle cx="363.4" cy="169.7" r="0.6"/><circle cx="318.0" cy="165.2" r="1.7"/><circle cx="392.3" cy="218.9" r="0.6"/><circle cx="385.3" cy="226.0" r="0.8"/><circle cx="336.9" cy="211.4" r="2.5"/><circle cx="323.1" cy="248.2" r="1.0"/><circle cx="319.4" cy="207.4" r="1.0"/><circle cx="340.6" cy="199.2" r="3.8"/><circle cx="304.9" cy="194.9" r="1.0"/><circle cx="328.3" cy="200.0" r="2.3"/><circle cx="283.1" cy="167.7" r="0.7"/><circle cx="349.9" cy="234.7" r="0.8"/><circle cx="337.4" cy="216.2" r="1.8"/><circle cx="330.9" cy="200.0" r="4.0"/><circle cx="327.1" cy="200.6" r="1.5"/><circle cx="333.7" cy="198.1" r="2.2"/><circle cx="351.5" cy="204.3" r="2.5"/><circle cx="328.9" cy="190.1" r="2.0"/><circle cx="355.8" cy="159.5" r="0.9"/><circle cx="389.5" cy="217.2" r="0.7"/><circle cx="329.5" cy="200.1" r="0.7"/><circle cx="350.0" cy="213.8" r="1.3"/><circle cx="330.9" cy="197.5" r="3.1"/><circle cx="343.5" cy="201.5" r="3.6"/></g><ellipse cx="330" cy="200" rx="20" ry="14" fill="#5c0603" opacity=".8"/><path d="M200 120c-10 30-6 60 2 90" stroke="#5c0603" stroke-width="5" stroke-linecap="round" opacity=".55" fill="none"/></g></svg></div><div class="cc-env-flap"></div><i class="cc-seal-drip"></i><b class="cc-seal l"></b><b class="cc-seal r2"></b></div>`;
      const env=props.querySelector('.cc-env'),card=env.querySelector('.cc-env-card'),cps=[...card.querySelectorAll('p')];
      st.classList.add('dim');
      env.animate([{transform:'translate(-50%,-160%) rotate(-24deg) scale(1.3)',opacity:0},{opacity:1,offset:.3},{transform:'translate(-50%,-50%) rotate(-4deg) scale(1)',opacity:1}],{duration:900,easing:'cubic-bezier(.5,0,.75,1.2)',fill:'forwards'});
      await wait(880);sfx('stamp');jolt(12);
      await line('Go on. Read it now.',{pitch:.55,rate:.75,hold:300});
      env.classList.add('crack');sfx('stamp');jolt(6);await wait(900);
      env.classList.add('open');await wait(1100);env.classList.add('out');sfx('paper');await wait(1300);if(!alive())return;
      await wait(400);
      for(const [i,t] of ['The record will say that Peter Shaw killed Thomas Reed.','The record will say that Thomas Reed is dead.','And you will give me a name.','It will not be mine.'].entries()){
        if(!alive())return;cps[i].classList.add('on');await cliffSpeak(t,i===3?.35:.45,i===3?.68:.8);await wait(200);}
      await laugh();if(!alive())return;
      env.animate([{opacity:1,transform:'translate(-50%,-50%) rotate(-4deg) scale(1)'},{opacity:0,transform:'translate(-50%,-40%) rotate(4deg) scale(.7)',filter:'blur(6px)'}],{duration:900,fill:'forwards'});
      await wait(700);st.classList.remove('dim');
      // 6. the trap
      await line('Every page was placed, so you would arrive, exactly where you are tonight.',{pitch:.5,rate:.78});
      await line('So tell me. Did you solve this case?',{pitch:.6,rate:.78,hold:200});
      await line('Or did you follow the path I laid down?',{pitch:.45,rate:.74,hold:200});
      await laugh();
      // 7. the incident
      await line('Lake Ash was not the first night Peter Shaw lied.',{pitch:.5,rate:.8});
      if(!alive())return;
      props.innerHTML='';const ph=box.querySelector('.cliff-wrap .cliff-subject').cloneNode(true);ph.className='cliff-subject burnt cc-photo on burning';props.append(ph);setTimeout(()=>ph.classList.remove('burning'),3300);
      flash.animate([{opacity:0},{opacity:1,offset:.06},{opacity:0}],{duration:1000});sfx('key');st.classList.add('dim');
      for(let e=0;e<18;e++){const em=document.createElement('i');em.className='cliff-ember';em.style.left=(10+Math.random()*80)+'%';em.style.animationDelay=(Math.random()*1.6)+'s';ph.append(em);}
      await line('Nine years ago, there was an incident at The Lantern.',{pitch:.45,rate:.78});
      await line('Someone did not go home that night.',{pitch:.4,rate:.74});
      await line('The report called it an accident.',{pitch:.55,rate:.78,hold:200});
      st.classList.add('bolt');cliffThunder();setTimeout(()=>st.classList.remove('bolt'),900);
      await line('It was not.',{pitch:.3,rate:.6,red:true,hold:900});
      await line('I was in that room.',{pitch:.4,rate:.72,hold:200});
      await line('I watched the lights flicker. Twice.',{pitch:.45,rate:.72,hold:500});
      ph.animate([{opacity:1},{opacity:0,filter:'blur(8px)'}],{duration:800,fill:'forwards'});await wait(600);st.classList.remove('dim');
      // 8. you
      await line('You asked who M was watching.',{pitch:.5,rate:.78,hold:200});
      await line('You never asked, why M chose you.',{pitch:.4,rate:.7,hold:300});
      if(!alive())return;
      props.innerHTML='';const nx=box.querySelector('.cliff-wrap .cliff-next').cloneNode(true);nx.className='cliff-next cc-next';nx.querySelector('.nx-name').textContent='';props.append(nx);
      st.classList.add('dim','focus');flash.animate([{opacity:0},{opacity:.8,offset:.08},{opacity:0}],{duration:700});sfx('key');
      requestAnimationFrame(()=>nx.classList.add('on'));
      [0,900,1800,2700].forEach(d=>setTimeout(()=>{if(alive())sfx('heart');},d+600));
      await wait(1600);const nm=nx.querySelector('.nx-name');for(let k=1;k<=SUBJECT_NAME.length;k++){if(!alive())return;nm.textContent=SUBJECT_NAME.slice(0,k);await wait(120);}
      await cliffSpeak('Mister Shaik.',.45,.65);
      nx.classList.add('stamped');sfx('stamp');jolt(8);await wait(500);
      await laugh();if(!alive())return;
      await wait(800);nx.animate([{opacity:1},{opacity:0,filter:'blur(8px)'}],{duration:900,fill:'forwards'});await wait(700);st.classList.remove('dim','focus');
      // 9. goodbye
      chair.classList.add('lean');
      await line('See you at the end, Detective.',{pitch:.4,rate:.7,red:true,hold:200});
      chair.classList.add('away');cliffChuckle();cliffPhase('rain');ember.animate([{opacity:1},{opacity:0}],{duration:3000,fill:'forwards'});
      await wait(3200);if(!alive())return;
      // 10. it was scheduled: the header rewrites itself in silence
      st.classList.add('glitch');setTimeout(()=>st.classList.remove('glitch'),400);sfx('dread');
      ck.textContent='SCHEDULED TRANSMISSION · WRITTEN 03 OCT · RELEASED 23:47';f4Decode(ck,1600);await wait(2600);if(!alive())return;
      // 11. the whole transmission, to read again
      st.animate([{opacity:1},{opacity:0}],{duration:1400,fill:'forwards'});await wait(1200);if(!alive())return;
      cliffPhase('final');const tf=cliffFinal(box);
      await wait(tf+400);if(alive())cliffNotice(box);
    })();
  }
  $('#cliffhanger .cliff-go').addEventListener('click',()=>{
    cliffStop();const box=$('#cliffhanger');cliffRun++;try{speechSynthesis.cancel();}catch{}progress.cliffSeen=true;persistProgress();paintProgress();
    box.classList.add('out');sfx('ink');setTimeout(()=>{box.hidden=true;box.classList.remove('in','out');},reducedMotion?0:1400);
  });
  $('#cliffReplay').addEventListener('click',()=>playCliffhanger());
  // testing aid: open File 004 from anywhere without touching File 003 progress
  $('#devFile04Button')?.addEventListener('click',()=>{progress.caseAccepted=true;progress.file03PuzzleComplete=true;progress.file04WallSeen=true;progress.cliffSeen=true;persistProgress();if(!$('#homeScene').classList.contains('active'))showHomeBoard();f4.screen='s1';saveF4();setTimeout(openF4Stage,400);});
  // testing aid: play the cliffhanger from anywhere
  $('#devCliffButton')?.addEventListener('click',()=>{if(!$('#homeScene').classList.contains('active'))showHomeBoard();setTimeout(playCliffhanger,600);});
  function dropClipping(){
    const clip=$('#arrestClipping'),hd=clip.querySelector('h5'),text='LANTERN CO-OWNER CHARGED IN LAKE ASH DISAPPEARANCE';
    progress.arrestNew=false;persistProgress();
    if(reducedMotion){hd.textContent=text;return;}
    hd.textContent='';
    clip.animate([{opacity:0,transform:'rotate(-14deg) scale(1.9)',filter:'blur(6px) brightness(1.6)'},{opacity:1,transform:'rotate(-3deg) scale(.97)',filter:'blur(0) brightness(1)',offset:.75},{opacity:1,transform:'rotate(-4deg) scale(1)'}],{duration:620,delay:1400,easing:'cubic-bezier(.3,0,.2,1)',fill:'backwards'});
    later(()=>{sfx('stamp');$('#homeScene').animate([{transform:'none'},{transform:'translate(-3px,2px)'},{transform:'translate(2px,-1px)'},{transform:'none'}],{duration:260});},1850);
    let i=0;const type=()=>{hd.textContent=text.slice(0,++i);if(i<text.length)later(type,42);};later(type,2300);
  }
  function wallGeometry() {
    const home = $('#homeScene'), img = $('.file02-board-art');
    if (!img.naturalWidth || !home.clientWidth) return;
    const scale = Math.max(home.clientWidth / img.naturalWidth, home.clientHeight / img.naturalHeight);
    const left = (home.clientWidth - img.naturalWidth * scale) / 2, top = (home.clientHeight - img.naturalHeight * scale) / 2;
    const at = p => [left + p.x * scale, top + p.y * scale];
    const vars = { one: WALL_ART.cardOne, two: WALL_ART.cardTwo };
    Object.entries(vars).forEach(([key, card]) => {
      const [x, y] = at(card);
      home.style.setProperty(`--wall-${key}-x`, `${x}px`); home.style.setProperty(`--wall-${key}-y`, `${y}px`);
      home.style.setProperty(`--wall-${key}-w`, `${card.w * scale}px`); home.style.setProperty(`--wall-${key}-h`, `${card.h * scale}px`);
    });
    const [p1x, p1y] = at(WALL_ART.pinOne), [p2x, p2y] = at(WALL_ART.pinTwo), [cx, cy] = at(WALL_ART.completed), [dx, dy] = at(WALL_ART.twoDone);
    [['pin-one', p1x, p1y], ['pin-two', p2x, p2y], ['completed', cx, cy], ['two-done', dx, dy]].forEach(([name, x, y]) => {
      home.style.setProperty(`--wall-${name}-x`, `${x}px`); home.style.setProperty(`--wall-${name}-y`, `${y}px`);
    });
    home.style.setProperty('--wall-scale', scale);
    // File 03's card is placed in CSS (50.5% / 47% of the wall); its pin sits near the top centre of the paper.
    const p3x = home.clientWidth * .505 + 179.5 * scale * .485, p3y = home.clientHeight * .47 + 132.75 * scale * .1;
    // The File 002 -> File 03 string runs behind File 002's paper: mask it out over the card (artwork px polygon).
    const hide = [[1112,246],[1328,250],[1332,414],[1112,414]].map(([x, y]) => at({ x, y }).join(',')).join(' ');
    $('#wallCardHide').setAttribute('points', hide);
    $('#wallCardMaskBase').setAttribute('width', home.clientWidth); $('#wallCardMaskBase').setAttribute('height', home.clientHeight);
    const p4x = home.clientWidth * .305 + 179.5 * scale * .485, p4y = home.clientHeight * .55 + 132.75 * scale * .1;
    home.style.setProperty('--wall-pin-four-x', `${p4x}px`); home.style.setProperty('--wall-pin-four-y', `${p4y}px`);
    home.style.setProperty('--wall-glow-four-x', `${p4x}px`); home.style.setProperty('--wall-glow-four-y', `${p4y + 62 * scale}px`);
    $('#wallString .wall-string-four').setAttribute('d', `M${p3x} ${p3y} Q${(p3x + p4x) / 2} ${(p3y + p4y) / 2 + 55 * scale} ${p4x} ${p4y}`);
    const p5x = home.clientWidth * .66 + 179.5 * scale * .485, p5y = home.clientHeight * .58 + 132.75 * scale * .1;
    home.style.setProperty('--wall-glow-five-x', `${p5x}px`); home.style.setProperty('--wall-glow-five-y', `${p5y + 62 * scale}px`);
    $('#wallString .wall-string-five').setAttribute('d', `M${p4x} ${p4y} Q${(p4x + p5x) / 2} ${Math.max(p4y, p5y) + 70 * scale} ${p5x} ${p5y}`);
    home.style.setProperty('--wall-pin-three-x', `${p3x}px`); home.style.setProperty('--wall-pin-three-y', `${p3y}px`);
    home.style.setProperty('--wall-glow-three-x', `${p3x}px`); home.style.setProperty('--wall-glow-three-y', `${p3y + 62 * scale}px`);
    $('#wallString .wall-string-three').setAttribute('d', `M${p2x} ${p2y} Q${(p3x + p2x) / 2} ${(p3y + p2y) / 2 + 55 * scale} ${p3x} ${p3y}`);
    $('#wallString path').setAttribute('d', `M${p1x} ${p1y} Q${(p1x + p2x) / 2} ${(p1y + p2y) / 2 + 70 * scale} ${p2x} ${p2y}`);
  }
  // File 002's card text: typed out on the plain paper during the reveal, otherwise shown in full.
  function fillFile02Card() {
    const root = $('#file02CardText');
    root.querySelector('.f2c-num').textContent = F2C.num; root.querySelector('.f2c-title').textContent = F2C.title;
    root.querySelector('.f2c-copy').textContent = F2C.copy; root.querySelector('.f2c-begin').classList.add('shown');
  }
  function typeFile02Card(run) {
    const root = $('#file02CardText'), begin = root.querySelector('.f2c-begin');
    const esc = c => c === '&' ? '&amp;' : c === '<' ? '&lt;' : c;
    const lines = [['.f2c-num', F2C.num, 60], ['.f2c-title', F2C.title, 40], ['.f2c-copy', F2C.copy, 22]].map(([sel, text, ms]) => {
      const node = root.querySelector(sel); node.innerHTML = [...text].map(c => `<span class="ch">${esc(c)}</span>`).join('');
      return { node, chars: [...node.querySelectorAll('.ch')], ms };
    });
    begin.classList.remove('shown');
    const caret = document.createElement('span'); caret.className = 'f2c-caret';
    const typeLine = i => {
      if (run !== wallIntroRun) return;
      if (i >= lines.length) { caret.remove(); setTimeout(() => { if (run === wallIntroRun) begin.classList.add('shown'); }, 200); return; }
      const { chars, ms } = lines[i]; let n = 0;
      const tick = () => {
        if (run !== wallIntroRun) return;
        const ch = chars[n++]; ch.classList.add('on'); ch.after(caret);
        if (n < chars.length) setTimeout(tick, ms); else setTimeout(() => typeLine(i + 1), 180);
      };
      tick();
    };
    typeLine(0);
  }
  function endWallIntro() { wallIntroRun++; $('#homeScene').classList.remove(...WALL_INTRO_CLASSES); document.body.classList.remove('wall-cinematic'); fillFile02Card(); }
  function playWallIntro() {
    const home = $('#homeScene'), run = ++wallIntroRun;
    wallGeometry();
    if (reducedMotion) return;
    home.classList.remove(...WALL_INTRO_CLASSES); home.classList.add('wall-intro');
    const step = (ms, cls) => setTimeout(() => { if (run === wallIntroRun) home.classList.add(cls); }, ms);
    // File 01 is already finished, so it just fades in dimmed; the spotlight goes to File 002, then the string ties them together.
    // Dark wall (0.6s) -> light rises on File 002 -> its text types in place -> string from File 01 -> wall lifts. ~6.5s.
    document.body.classList.add('wall-cinematic');
    home.classList.add('wall-one-dim');
    $('#file02CardText').querySelectorAll('.f2c-num,.f2c-title,.f2c-copy').forEach(n => { n.textContent = ''; }); $('#file02CardText .f2c-begin').classList.remove('shown');
    step(600, 'wall-stage-two');
    setTimeout(() => { if (run === wallIntroRun) typeFile02Card(run); }, 1500);
    step(4500, 'wall-stage-string'); step(5300, 'wall-stage-rest');
    setTimeout(() => { if (run === wallIntroRun) endWallIntro(); }, 6900);
  }
  // File 03 reveal, played once File 02 is finished: a bulb flickers on, the card fades in, then a string draws from File 002.
  // File 03's card text, typed in place during its reveal (same feel as File 002), otherwise shown in full.
  function fillFile03Card() {
    const card = $('#file03ArtCard');
    F3C.forEach(([sel, text]) => { card.querySelector(sel).textContent = text; });
    card.classList.remove('typing'); card.querySelector('.f3c-caret')?.remove();
  }
  function typeFile03Card(run) {
    const card = $('#file03ArtCard'), esc = c => c === '&' ? '&amp;' : c === '<' ? '&lt;' : c;
    const lines = F3C.map(([sel, text, ms]) => {
      const node = card.querySelector(sel); node.innerHTML = [...text].map(c => `<span class="ch">${esc(c)}</span>`).join('');
      return { chars: [...node.querySelectorAll('.ch')], ms };
    });
    const caret = document.createElement('span'); caret.className = 'f3c-caret';
    const typeLine = i => {
      if (run !== wallThreeRun) return;
      if (i >= lines.length) { caret.remove(); card.classList.add('typed'); return; }
      const { chars, ms } = lines[i]; let n = 0;
      const tick = () => {
        if (run !== wallThreeRun) return;
        const ch = chars[n++]; ch.classList.add('on'); ch.after(caret);
        if (n < chars.length) setTimeout(tick, ms); else setTimeout(() => typeLine(i + 1), 180);
      };
      tick();
    };
    typeLine(0);
  }
  function endWallThree(markSeen = true) {
    wallThreeRun++;
    $('#homeScene').classList.remove(...WALL_THREE_CLASSES); document.body.classList.remove('wall-cinematic');
    $('#file03ArtCard').classList.remove('typing', 'typed'); fillFile03Card();
    if (markSeen && progress.file03WallSeen === false) { progress.file03WallSeen = true; persistProgress(); paintProgress(); }
  }
  function playFile03Reveal() {
    const home = $('#homeScene'), run = ++wallThreeRun;
    wallGeometry();
    if (reducedMotion) { endWallThree(); return; }
    home.classList.remove(...WALL_THREE_CLASSES); home.classList.add('wall-three-intro'); document.body.classList.add('wall-cinematic');
    const step = (ms, cls) => setTimeout(() => { if (run === wallThreeRun) home.classList.add(cls); }, ms);
    // Same beats as the File 002 reveal: dark wall -> light rises on a blank File 03 card -> text types in place ->
    // red rule + INVESTIGATE -> string from File 002 -> wall lifts. ~6.8s.
    const card = $('#file03ArtCard'); card.classList.remove('typed'); card.classList.add('typing');
    F3C.forEach(([sel]) => { card.querySelector(sel).textContent = ''; });
    step(600, 'wall-three-card');
    setTimeout(() => { if (run === wallThreeRun) typeFile03Card(run); }, 1500);
    step(4300, 'wall-three-string'); step(5300, 'wall-three-rest'); step(6100, 'wall-thread-pulse');
    setTimeout(() => { if (run === wallThreeRun) endWallThree(); }, 6900);
  }
  // File 004 reveal: same beats as File 03's, string from File 003 to File 004.
  function fillFile04Card() { const card = $('#file04ArtCard'); F4C.forEach(([sel, text]) => { card.querySelector(sel).textContent = text; }); card.classList.remove('typing', 'typed'); }
  function typeFile04Card(run) {
    const card = $('#file04ArtCard');
    const lines = F4C.map(([sel, text, ms]) => { const node = card.querySelector(sel); node.innerHTML = [...text].map(c => `<span class="ch">${c}</span>`).join(''); return { chars: [...node.querySelectorAll('.ch')], ms }; });
    const caret = document.createElement('span'); caret.className = 'f3c-caret';
    const typeLine = i => {
      if (run !== wallFourRun) return;
      if (i >= lines.length) { caret.remove(); card.classList.add('typed'); return; }
      const { chars, ms } = lines[i]; let n = 0;
      const tick = () => { if (run !== wallFourRun) return; const ch = chars[n++]; ch.classList.add('on'); ch.after(caret); if (n < chars.length) setTimeout(tick, ms); else setTimeout(() => typeLine(i + 1), 180); };
      tick();
    };
    typeLine(0);
  }
  function endWallFour(markSeen = true) {
    wallFourRun++;
    $('#homeScene').classList.remove(...WALL_FOUR_CLASSES); document.body.classList.remove('wall-cinematic'); fillFile04Card();
    if (markSeen && progress.file04WallSeen === false) { progress.file04WallSeen = true; persistProgress(); paintProgress(); }
  }
  function playFile04Reveal() {
    const home = $('#homeScene'), run = ++wallFourRun;
    if (!home.classList.contains('active')) return;
    wallGeometry();
    if (reducedMotion) { endWallFour(); return; }
    home.classList.remove(...WALL_FOUR_CLASSES); home.classList.add('wall-four-intro'); document.body.classList.add('wall-cinematic');
    const step = (ms, cls) => setTimeout(() => { if (run === wallFourRun) home.classList.add(cls); }, ms);
    const card = $('#file04ArtCard'); card.classList.remove('typed'); card.classList.add('typing');
    F4C.forEach(([sel]) => { card.querySelector(sel).textContent = ''; });
    step(600, 'wall-four-card');
    setTimeout(() => { if (run === wallFourRun) typeFile04Card(run); }, 1500);
    step(4200, 'wall-four-string'); step(5200, 'wall-four-rest'); step(6000, 'wall-thread-pulse');
    setTimeout(() => { if (run === wallFourRun) endWallFour(); }, 6800);
  }
  $('#homeScene').addEventListener('click', event => {
    if (!$('#homeScene').classList.contains('wall-four-intro')) return;
    event.stopPropagation(); event.preventDefault(); endWallFour();
  }, true);
  $('#file04ArtCard').addEventListener('click', () => { if (!$('#homeScene').classList.contains('file-four-locked')) openF4Stage(); });
  // File 005 reveal: same beats, string from File 004 to File 005.
  function fillFile05Card() { const card = $('#file05ArtCard'); F5C.forEach(([sel, text]) => { card.querySelector(sel).textContent = text; }); card.classList.remove('typing', 'typed'); }
  function typeFile05Card(run) {
    const card = $('#file05ArtCard');
    const lines = F5C.map(([sel, text, ms]) => { const node = card.querySelector(sel); node.innerHTML = [...text].map(c => `<span class="ch">${c}</span>`).join(''); return { chars: [...node.querySelectorAll('.ch')], ms }; });
    const caret = document.createElement('span'); caret.className = 'f3c-caret';
    const typeLine = i => {
      if (run !== wallFiveRun) return;
      if (i >= lines.length) { caret.remove(); card.classList.add('typed'); return; }
      const { chars, ms } = lines[i]; let n = 0;
      const tick = () => { if (run !== wallFiveRun) return; const ch = chars[n++]; ch.classList.add('on'); ch.after(caret); if (n < chars.length) setTimeout(tick, ms); else setTimeout(() => typeLine(i + 1), 180); };
      tick();
    };
    typeLine(0);
  }
  function endWallFive(markSeen = true) {
    wallFiveRun++;
    $('#homeScene').classList.remove(...WALL_FIVE_CLASSES); document.body.classList.remove('wall-cinematic'); fillFile05Card();
    if (markSeen && progress.file05WallSeen === false) { progress.file05WallSeen = true; persistProgress(); paintProgress(); }
  }
  function playFile05Reveal() {
    const home = $('#homeScene'), run = ++wallFiveRun;
    if (!home.classList.contains('active')) return;
    wallGeometry();
    if (reducedMotion) { endWallFive(); return; }
    home.classList.remove(...WALL_FIVE_CLASSES); home.classList.add('wall-five-intro'); document.body.classList.add('wall-cinematic');
    const step = (ms, cls) => setTimeout(() => { if (run === wallFiveRun) home.classList.add(cls); }, ms);
    const card = $('#file05ArtCard'); card.classList.remove('typed'); card.classList.add('typing');
    F5C.forEach(([sel]) => { card.querySelector(sel).textContent = ''; });
    step(600, 'wall-five-card');
    setTimeout(() => { if (run === wallFiveRun) typeFile05Card(run); }, 1500);
    step(4200, 'wall-five-string'); step(5200, 'wall-five-rest'); step(6000, 'wall-thread-pulse');
    setTimeout(() => { if (run === wallFiveRun) endWallFive(); }, 6800);
  }
  $('#homeScene').addEventListener('click', event => {
    if (!$('#homeScene').classList.contains('wall-five-intro')) return;
    event.stopPropagation(); event.preventDefault(); endWallFive();
  }, true);
  $('#file05ArtCard').addEventListener('click', () => { if (!$('#homeScene').classList.contains('file-five-locked')) openF5Stage(); });
  // Any click during a reveal skips straight to the finished wall.
  $('#homeScene').addEventListener('click', event => {
    if (!$('#homeScene').classList.contains('wall-three-intro')) return;
    event.stopPropagation(); event.preventDefault(); endWallThree();
  }, true);
  // Any click during the intro skips straight to the finished wall.
  $('#homeScene').addEventListener('click', event => {
    if (!$('#homeScene').classList.contains('wall-intro')) return;
    event.stopPropagation(); event.preventDefault(); endWallIntro();
  }, true);
  fillFile02Card();
  $('.file02-board-art').addEventListener('load', wallGeometry);
  if ($('.file02-board-art').complete) requestAnimationFrame(wallGeometry);
  addEventListener('resize', wallGeometry);
  function continueFileTwoFlow(){
    const home=$('#homeScene');
    if(progress.file02TransitionSeen)return;
    progress.caseAccepted=true;
    progress.file02TransitionSeen=true;
    persistProgress();
    // Leave the File 01 closed view; it hides every other wall layer.
    home.classList.remove('closure-continue-ready','closure-revealed','closure-sequence');
    home.classList.add('file-one-dimming','file-two-signal');
    paintProgress(); playWallIntro();
    laterWait(()=>{
      home.classList.add('file-two-paper');
      const number=$('#fileTwo .file-two-number'),title=$('#fileTwo .file-two-title'),copy=$('#fileTwo .file-two-copy');
      number.textContent='';title.textContent='';copy.textContent='';$('#fileTwoBegin').disabled=true;
      const type=(node,value,delay,done)=>{
        let index=0;
        const step=()=>{node.textContent=value.slice(0,++index);if(index<value.length)laterWait(step,reducedMotion?0:delay);else if(done)laterWait(done,reducedMotion?0:320);};
        if(reducedMotion){node.textContent=value;if(done)done();}else laterWait(step,delay);
      };
      home.classList.add('file-two-number-visible');
      type(number,'FILE 002',75,()=>{
        home.classList.add('file-two-title-visible');
        type(title,'THE UNEXPECTED SIGNAL',82,()=>{
          home.classList.add('file-two-copy-visible');
          type(copy,'Something else is buried within this archive.',42,()=>laterWait(()=>{
            home.classList.add('file-two-begin-visible','file-two-available');paintProgress();
          },reducedMotion?0:520));
        });
      });
    },reducedMotion?0:1500);
  }
  window.continueFileTwoFlow=continueFileTwoFlow;
  $('#continueFileTwo').addEventListener('click',continueFileTwoFlow);
  $('#file01ArtOpen').addEventListener('click',()=>{
    progress.chapterOneStarted=true; persistProgress(); startPhaseTwo();
  });
  $('#file03ArtCard').addEventListener('click',()=>{
    progress.unlockedChapter=Math.max(3,Number(progress.unlockedChapter)||1);
    progress.file03Revealed=true;
    persistProgress(); paintProgress(); openFile03();
  });
  $('#file02Call').addEventListener('click',()=>$('#file02ArtBegin').click());
  $('#file02ArtBegin').addEventListener('click',()=>{
    if(progress.fileTwoComplete||progress.file02Complete){
      startSecretReward();
    } else {
      openSecretLevel();
    }
  });
  $('#openFinancialFile').addEventListener('click',openFinancialFile);
  $$('[data-f2-close]').forEach(button=>button.addEventListener('click',closeFinancialFlow));
  $('#f2Hint').addEventListener('click',()=>{$('#f2HintText').hidden=!$('#f2HintText').hidden;});
  $('#f2EvidenceClose').addEventListener('click',()=>renderF2Question(f2ReturnStep));
  $('#f2EvidenceDone').addEventListener('click',()=>renderF2Question(f2ReturnStep));
  $('#f2AnswerForm').addEventListener('submit',event=>{
    event.preventDefault();const index=f2.step,q=F2_QUESTIONS[index];if(!q||f2.accepted[index])return;
    if(q.written){const answer=$('#f2Written').value.trim();const words=answer?answer.split(/\s+/).length:0;if(words>500){$('#f2Feedback').hidden=false;$('#f2Feedback').textContent='KEEP THE CASE ASSESSMENT TO 500 WORDS OR FEWER.';return;}f2.answers[index]=answer;if(!f2DeductionAccepted(answer)){$('#f2Feedback').hidden=false;$('#f2Feedback').className='f3-feedback';$('#f2Feedback').innerHTML='<strong>THE CASE NEEDS MORE SUPPORT</strong>Address Peter’s connection to the financial discrepancy, the missing originals, the unknown access event, and what the evidence does not establish.';return;}}
    else if(Number(f2.answers[index])!==q.answer){$('#f2Feedback').hidden=false;$('#f2Feedback').className='f3-feedback';$('#f2Feedback').textContent='THAT CONCLUSION IS NOT SUPPORTED BY THE RECORDS. REVIEW THE EVIDENCE AND TRY AGAIN.';return;}
    f2.accepted[index]=true;saveF2();showF2Accepted(index);
  });
  $('#f2Next').addEventListener('click',()=>{if(f2.step<3)renderF2Question(f2.step+1);else showF2Transmission();});
  $('#f2Finish').addEventListener('click',()=>{f2.complete=true;saveF2();progress.chapterTwoComplete=true;progress.unlockedChapter=Math.max(3,Number(progress.unlockedChapter)||1);progress.noticeVisible=false;persistProgress();closeFinancialFlow();paintProgress();openFile03();});
  // The supplied Round I cover follows the transmission directly; the old dashboard is not part of this flow.
  $('#enterSecretLevel').addEventListener('click',openRoundIntro);
  $('#secretDashboardBegin').addEventListener('click',openRoundIntro);
  window.beginSecretRound=()=>{
    const intro=$('#secretLevelScene').dataset.reference;
    const target=intro==='round-two-intro'?2:intro==='round-three-intro'?3:1;
    selectRound(target);
    if(round.questions.every(q=>q.complete)){
      round.questions.forEach(q=>{q.complete=false;q.attempts=[];q.answer=null;q.xpAwarded=0;});
      persistRound();
    }
    renderQuestion();
  };
  $('#beginRound').addEventListener('click',window.beginSecretRound);
  $('#secretRefEnter').addEventListener('click',openRoundIntro);
  $('#secretRefRound').addEventListener('click',window.beginSecretRound);
  $('#secretReferenceArt')?.addEventListener('click',(e)=>{
    const ref=$('#secretLevelScene').dataset.reference;
    if(ref==='round-intro'||ref==='round-two-intro'||ref==='round-three-intro'){
      const rect=$('#secretReferenceArt').getBoundingClientRect();
      const clickY=(e.clientY-rect.top)/rect.height;
      if(clickY>0.70) window.beginSecretRound();
    } else if(ref==='unexpected'){
      const rect=$('#secretReferenceArt').getBoundingClientRect();
      const clickY=(e.clientY-rect.top)/rect.height;
      if(clickY>0.70) openRoundIntro();
    }
  });
  window.submitSecretAnswer=()=>$('#answerForm').requestSubmit();
  $('#secretRefSubmit').addEventListener('click',window.submitSecretAnswer);
  $('#secretRefContinue').addEventListener('click',()=>$('#questionContinue').click());
  $('#secretRefSkip').addEventListener('click',()=>$('#questionSkip').click());
  $('#quizClose').addEventListener('click',showHomeBoard);
  $('#questionContinue').addEventListener('click',renderQuestion);
  $('#questionSkip').addEventListener('click',()=>{
    const q=questions[activeQuestion],record=round.questions[activeQuestion];
    if(!q||record.complete)return;
    record.complete=true;record.answer='SKIPPED';record.xpAwarded=0;record.attempts.push({answer:'SKIPPED',correct:false});persistRound();renderQuestion();
  });
  $('#beginRoundTwo').addEventListener('click',()=>{selectRound(2);renderQuestion();});
  $('#beginRoundThree').addEventListener('click',()=>{selectRound(3);if(!secretTestMode){levelState.roundThreeStarted=true;persistLevelState();}renderQuestion();});
  $('#roundContinue').addEventListener('click',()=>{
    if(roundNumber===1){selectRound(2);setSecretReference('round-two-intro');$('#dossierInterface').hidden=true;$('#roundTwoIntro').hidden=false;return;}
    if(roundNumber===2){if(!secretTestMode){levelState.round2Complete=true;persistLevelState();}setSecretReference('round-three-intro');$('#dossierInterface').hidden=true;$('#roundThreeIntro').hidden=false;return;}
    $('#dossierInterface').hidden=true;startSecretReward();
  });
  let chocolateTimer = null,rewardSeq = 0;
  function finishChocolateReward() {
    if (chocolateTimer) {
      clearTimeout(chocolateTimer);
      chocolateTimer = null;
    }
    rewardSeq++;
    progress.caseAccepted = true;
    progress.file02TransitionSeen = true;
    progress.file02Complete = true;
    progress.fileTwoComplete = true;
    if (progress.file03WallSeen !== true) progress.file03WallSeen = false;
    persistProgress();
    // land on the wall with File 01 and File 02 both closed; File 03 appears only when the player presses CONTINUE
    showHomeBoard();
  }

  // Evidence 001. The text is the page's own copy: every text node is split into a typed part and a hidden part,
  // so the paper keeps its final layout while the letters appear. Blocks type one after another with a pause.
  function twPrepare(root){
    const blocks=[];
    root.forEach(block=>{
      const nodes=[],walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);
      let n;while((n=walker.nextNode())){if(n.nodeValue.trim())nodes.push(n);}
      const parts=nodes.map(node=>{
        const text=node.nodeValue,wrap=document.createElement('span'),on=document.createElement('span'),off=document.createElement('span');
        wrap.className='tw';off.style.visibility='hidden';off.textContent=text;wrap.append(on,off);node.replaceWith(wrap);return {on,off,text};
      });
      blocks.push({el:block,parts});
    });
    return blocks;
  }
  function twFinish(blocks){blocks.forEach(b=>b.el.classList.add('tw-on'));blocks.forEach(b=>b.parts.forEach(p=>{p.on.textContent=p.text;p.off.textContent='';}));document.querySelectorAll('.tw-caret').forEach(e=>e.remove());}
  function playChocolateReward(){
    const seq=++rewardSeq,stage=$('#chocolateRewardStage'),dossier=stage.querySelector('.chocolate-dossier');
    const hud=$('#chocolateReadingProgress'),btn=$('#continueToCase'),hint=$('#chocolateHint');
    // restore the pristine copy so a replay types from scratch
    if(!playChocolateReward.pristine)playChocolateReward.pristine=dossier.innerHTML;else dossier.innerHTML=playChocolateReward.pristine;
    stage.querySelectorAll('.tw-caret').forEach(e=>e.remove());
    stage.classList.remove('rw-leaving');
    stage.getAnimations({subtree:true}).forEach(a=>a.cancel());
    hud.classList.remove('ready');btn.disabled=true;hint.textContent='INTERCEPT SECURED';hint.style.opacity=.85;
    const q=s=>[...dossier.querySelectorAll(s)];
    const typed=twPrepare([...q('.dossier-header-badge span'),...q('.dossier-classification p'),...q('.dossier-letter-body > p, .dossier-letter-body > ul > li, .dossier-letter-body > .chocolate-signoff')]);
    const noteL=twPrepare([...stage.querySelectorAll('.chocolate-note-left p')]),noteR=twPrepare([...stage.querySelectorAll('.chocolate-note-right p')]);
    const ready=()=>{hud.classList.add('ready');btn.disabled=false;hint.textContent='TAKE YOUR TIME, DETECTIVE';btn.focus({preventScroll:true});};
    if(reducedMotion){twFinish(typed);twFinish(noteL);twFinish(noteR);ready();return;}
    stage.classList.add('rw-hide-extras');
    const wait=ms=>new Promise(r=>setTimeout(r,ms)),alive=()=>seq===rewardSeq;
    const bg=stage.querySelector('.chocolate-desk-bg'),extras={
      seal:stage.querySelector('.chocolate-wax-seal'),noteL:stage.querySelector('.chocolate-note-left'),noteR:stage.querySelector('.chocolate-note-right'),
      photo:stage.querySelector('.chocolate-photo-card'),sketch:stage.querySelector('.chocolate-sketches'),red:stage.querySelector('.dossier-red-seal')
    };
    const land=(el,from,ms,delay=0)=>{el.style.opacity='';return el.animate([{opacity:0,translate:from,scale:'.97'},{opacity:1,translate:'0 0',scale:'1'}],{duration:ms,delay,easing:'cubic-bezier(.2,.8,.25,1)',fill:'backwards'});};
    // typing speeds: a touch slower on the lines that are meant to land
    let skipped=false;
    const typeBlock=(b,ms)=>new Promise(done=>{
      const caret=document.createElement('span');caret.className='tw-caret';
      let pi=0,ci=0;
      const tick=()=>{
        if(!alive()||skipped){caret.remove();return done();}
        b.el.classList.add('tw-on');
        const part=b.parts[pi];if(!part){caret.remove();return done();}
        ci++;keyTick();part.on.textContent=part.text.slice(0,ci);part.off.textContent=part.text.slice(ci);part.on.after(caret);
        if(ci>=part.text.length){pi++;ci=0;}
        const ch=part.text[ci-1]||'',extra=/[.,:;?!]/.test(ch)?ms*7:Math.random()*ms*.6;
        setTimeout(tick,ms+extra);
      };
      tick();
    });
    const skip=()=>{if(skipped||hud.classList.contains('ready'))return;skipped=true;};
    stage.addEventListener('click',skip,{once:false});
    (async()=>{
      stage.animate([{opacity:0},{opacity:1}],{duration:900,easing:'ease-out'});
      bg.animate([{filter:'brightness(.08) saturate(.4)'},{filter:'brightness(.42) saturate(.65)'}],{duration:2600,easing:'ease-out'});
      dossier.animate([{opacity:0,translate:'140px 0',rotate:'2.2deg',scale:'.97'},{opacity:1,translate:'0 0',rotate:'0deg',scale:'1'}],{duration:1500,delay:700,easing:'cubic-bezier(.16,.84,.3,1)',fill:'backwards'});setTimeout(()=>{if(alive())sfx('paper');},760);
      dossier.style.visibility='';
      await wait(2250);if(!alive())return;sfx('stamp');
      extras.seal.style.opacity='';extras.seal.animate([{opacity:0,scale:'1.9'},{opacity:1,scale:'1'}],{duration:380,easing:'cubic-bezier(.3,1.2,.4,1)',fill:'backwards'});
      stage.animate([{transform:'translate(0,0)'},{transform:'translate(-2px,2px)'},{transform:'translate(1px,-1px)'},{transform:'translate(0,0)'}],{duration:200});
      await wait(450);if(!alive())return;
      for(let i=0;i<typed.length&&alive();i++){
        const b=typed[i],tag=b.el.tagName;
        const slow=b.el.classList.contains('chocolate-warning')||b.el.classList.contains('chocolate-lead-line');
        await typeBlock(b,slow?38:18);if(!alive())return;
        if(skipped)break;
        // extras land at the points they belong to in the story
        if(i===1)land(extras.noteL,'-30px 0',700);
        if(b.el.classList.contains('chocolate-list')||(b.el.parentElement&&b.el.parentElement.classList.contains('chocolate-list')&&b.el.nextElementSibling===null))land(extras.photo,'0 -40px',800);
        if(b.el.classList.contains('chocolate-warning')){stage.animate([{transform:'translate(0,0)'},{transform:'translate(-3px,0)'},{transform:'translate(3px,0)'},{transform:'translate(0,0)'}],{duration:240});extras.sketch.style.opacity='';extras.sketch.animate([{opacity:0},{opacity:1}],{duration:900});}
        await wait(tag==='LI'?160:b.el.classList.contains('letter-salutation')?520:380);
      }
      if(!alive())return;
      if(skipped){twFinish(typed);}
      // everything that has not landed yet lands together
      [['noteL','-30px 0'],['photo','0 -40px'],['sketch','0 0']].forEach(([k,from])=>{if(extras[k].style.opacity!==''||getComputedStyle(extras[k]).opacity==='0')land(extras[k],from,500);});
      stage.classList.remove('rw-hide-extras');
      await wait(300);if(!alive())return;
      // the note on the right is typed last, then the red case seal is stamped
      extras.noteR.style.opacity='';extras.noteR.animate([{opacity:0,translate:'30px 0',scale:'.97'},{opacity:1,translate:'0 0',scale:'1'}],{duration:600,easing:'cubic-bezier(.2,.8,.25,1)',fill:'backwards'});
      extras.red.style.opacity='';extras.red.animate([{opacity:0,scale:'2.2'},{opacity:.95,scale:'1'}],{duration:340,easing:'cubic-bezier(.3,1.1,.4,1)',fill:'backwards'});
      stage.animate([{transform:'translate(0,0)'},{transform:'translate(2px,3px)'},{transform:'translate(-2px,-1px)'},{transform:'translate(0,0)'}],{duration:220,delay:260});
      if(!skipped){for(const b of noteL.concat(noteR)){if(!alive())return;await typeBlock(b,22);}}
      twFinish(noteL);twFinish(noteR);
      await wait(500);if(!alive())return;
      ready();
    })();
  }
  async function leaveChocolateReward(){
    const stage=$('#chocolateRewardStage');
    $('#continueToCase').disabled=true;stage.classList.add('rw-leaving');
    if(!reducedMotion){
      stage.querySelector('.chocolate-dossier').animate([{translate:'0 0',opacity:1},{translate:'0 -18px',opacity:0}],{duration:700,easing:'ease-in',fill:'forwards'});
      await stage.animate([{opacity:1},{opacity:0}],{duration:900,delay:250,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
    }
    finishChocolateReward();
    stage.getAnimations({subtree:true}).forEach(a=>a.cancel());stage.classList.remove('rw-leaving');
  }

  $('#finalClaimButton')?.addEventListener('click',async ()=>{
    if (!reducedMotion) {
      // the report is stamped CLAIMED, the lamp dips to black, and only then does the desk come back up
      $('#finStage').classList.remove('fin-ready');
      const stamp=document.createElement('div');stamp.className='claim-stamp';stamp.setAttribute('aria-hidden','true');stamp.textContent='REWARD CLAIMED';
      $('#secretRewardScene').append(stamp);sfx('stamp');
      stamp.animate([{opacity:0,transform:'translate(-50%,-50%) rotate(-9deg) scale(2.6)'},{opacity:1,transform:'translate(-50%,-50%) rotate(-9deg) scale(1)',offset:.55},{opacity:1,transform:'translate(-50%,-50%) rotate(-9deg) scale(1)'}],{duration:620,easing:'cubic-bezier(.3,1.1,.4,1)',fill:'forwards'});
      await new Promise(r=>setTimeout(r,1000));
      await $('#completionStage').animate([{opacity:1,transform:'scale(1)',filter:'brightness(1)'},{opacity:0,transform:'scale(.965)',filter:'brightness(.15)'}],{duration:1200,easing:'ease-in-out',fill:'forwards'}).finished.catch(()=>{});
      stamp.animate([{opacity:1},{opacity:0}],{duration:300,fill:'forwards'});
      await new Promise(r=>setTimeout(r,520));stamp.remove();
    }
    $('#completionStage').getAnimations().forEach(a=>a.cancel());
    $('#completionStage').hidden = true;
    $('#chocolateRewardStage').hidden = false;
    if (chocolateTimer) { clearTimeout(chocolateTimer); chocolateTimer = null; }
    playChocolateReward();
  });
  $('#finalClaimHit')?.addEventListener('click',()=>{
    $('#finalClaimButton').click();
  });
  $('#continueToCase')?.addEventListener('click', leaveChocolateReward);
  function startFile03CinematicReveal() {
    clearTimers();
    const container = $('#f3CinematicContainer');
    if (!container) return;

    if ($('#continueFileThree')) $('#continueFileThree').hidden = true;

    container.hidden = false;
    container.className = 'f3-cinematic-container';
    const tag = $('#f3SheetTag');
    const title = $('#f3SheetTitle');
    const rule = $('#f3SheetRule');
    const copy = $('#f3SheetCopy');
    const btn = $('#f3InvestigateBtn');

    tag.textContent = '';
    title.textContent = '';
    copy.textContent = '';
    rule.classList.remove('drawn');
    btn.hidden = true;
    btn.className = 'f3-investigate-btn';
    btn.disabled = false;

    const typeText = (el, text, speed, onDone) => {
      if (reducedMotion) {
        el.textContent = text;
        if (onDone) onDone();
        return;
      }
      let i = 0;
      const step = () => {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) {
          laterWait(step, speed);
        } else if (onDone) {
          laterWait(onDone, 300);
        }
      };
      step();
    };

    // Stage 1 (0–1.5s): Tiny amber light point appears
    container.classList.add('stage-beacon');

    // Stage 2 (1.5–3s): Signal pulses and amber glow spreads
    laterWait(() => {
      container.classList.add('stage-pulse');
    }, reducedMotion ? 100 : 1500);

    // Stage 3 (3–4.5s): Parchment sheet materialises & settles over the light point
    laterWait(() => {
      container.classList.add('stage-sheet');
    }, reducedMotion ? 200 : 3000);

    // Stage 4 (4.5–7s): Restrained typewriter sequence
    laterWait(() => {
      typeText(tag, 'FILE 03', 45, () => {
        typeText(title, 'THE FINANCIAL TRAIL', 50, () => {
          rule.classList.add('drawn');
          laterWait(() => {
            typeText(copy, 'Missing funds. Altered records. Four people with something to hide.', 26, () => {
              // Stage 5 (7–8s): Antique-gold Investigate button fades in with glint
              btn.hidden = false;
              laterWait(() => {
                btn.classList.add('visible');
                laterWait(() => btn.classList.add('glint'), 400);
              }, 100);
            });
          }, 350);
        });
      });
    }, reducedMotion ? 400 : 4500);
  }

  $('#continueFileFive')?.addEventListener('click', () => {
    $('#homeScene').classList.remove('await-file-five');
    playFile05Reveal();
  });
  $('#continueFileFour')?.addEventListener('click', () => {
    if (!progress.cliffSeen) { playCliffhanger(); return; }
    $('#homeScene').classList.remove('await-file-four');
    playFile04Reveal();
  });
  $('#continueFileThree')?.addEventListener('click', () => {
    $('#homeScene').classList.remove('await-file-three');
    playFile03Reveal();
  });

  $('#f3InvestigateBtn')?.addEventListener('click', () => {
    const btn = $('#f3InvestigateBtn');
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.add('pressed');

    const home = $('#homeScene');
    home.classList.add('investigation-zoom-in');

    laterWait(() => {
      home.classList.add('investigation-fade-out');
      laterWait(() => {
        home.classList.remove('investigation-zoom-in', 'investigation-fade-out');
        $('#f3CinematicContainer').hidden = true;
        // Unlock chapter 3 and begin the real financial investigation
        progress.unlockedChapter = Math.max(3, Number(progress.unlockedChapter) || 1);
        progress.file03Revealed = true;
        persistProgress();
        paintProgress();
        openFile03();
      }, 700);
    }, reducedMotion ? 100 : 800);
  });
  $('#fileThree').addEventListener('click',()=>{if(!$('#fileThree').disabled)openFile03();});
  $('[data-f3-close]').addEventListener('click',closeFile03);
  // Re-run a scene's own entry so timed scenes keep moving forward after BACK instead of freezing.
  function reenterScene(scene){
    const index=scenes.indexOf(scene);
    if(index===0){scene.classList.remove('leaving');show(scene);later(pushIntoLake,4500);}
    else if(index===2)runClues();
    else if(index===3){show(scene);later(openArchive,4000);}
    else if(index===4){resetLogin();openArchive();}
    else if(index===6)showHomeBoard();
    else if(index===7)showRecords();
    else if(index===8)startPhaseTwo();
    else show(scene);
  }
  // Global back: close an open File 03 overlay first, otherwise return to the previous scene.
  $('#backButton').addEventListener('click',()=>{
    if(!$('#f3Stage').hidden){closeF3Stage();return;}
    if($('#fileThreeFlow').classList.contains('visible')){closeFile03();return;}
    // the access code is entered once; BACK steps over the login afterwards
    let loginPassed=false;try{loginPassed=localStorage.getItem('case25LoginPassed')==='1';}catch{}
    let previous=sceneHistory.pop();
    while(previous===scenes[4]&&loginPassed)previous=sceneHistory.pop();
    if(!previous)return;
    clearTimers();goingBack=true;reenterScene(previous);
    goingBack=false;$('#backButton').disabled=!sceneHistory.length;
  });
  $('#p3Begin').addEventListener('click',()=>{file03.p3.stage='q1';saveFile03();p3RenderQuestion(0);$('#p3QuestionBody [data-time="0"]')?.focus();});
  $('#p3ViewEvidence').addEventListener('click',p3ShowEvidence);
  $('#p3EvidenceReturn').addEventListener('click',()=>{const stage=file03.p3.evidenceReturnStage||file03.p3.stage||'q1';file03.stage='p3q'+(Number(stage.slice(1))||1);saveFile03();p3RenderQuestion((Number(stage.slice(1))||1)-1);});
  $('#p3Submit').addEventListener('click',()=>{
    const p=file03.p3,stage=p.stage;
    if(stage==='q1'){
      const fields=[...$('#p3QuestionBody').querySelectorAll('[data-time]')];p.q1.times=fields.map(x=>x.value.trim());p.q1.attempts++;const checks=p3TimesCorrect(p.q1.times);
      if(checks.every(Boolean)){p3Award(p.q1,10);saveFile03();p3CorrectFeedback('CLOCK CORRECTION VERIFIED','The access-control clock was seven minutes fast. Subtracting seven minutes from each displayed timestamp gives the corrected sequence. These corrected times establish when the system recorded credential use and door activity. They do not identify the person who used the credential.');}
      else{const labels=['Credential presented','Door opened','Door closed'];fields.forEach((field,i)=>{if(!checks[i])field.setAttribute('aria-invalid','true');});const names=checks.map((ok,i)=>ok?null:labels[i]).filter(Boolean);saveFile03();const box=$('#p3Feedback');box.hidden=false;box.className='f3-feedback';box.innerHTML='<strong>TIME CHECK INCOMPLETE</strong><p>Check '+names.join(', ')+' against the known seven-minute discrepancy. The corrected values remain sealed until you submit the complete sequence.</p>';}
    }else if(stage==='q2'){
      p.q2.order=[...$('#p3QuestionBody').querySelectorAll('[data-order]')].map(x=>x.value);p.q2.reliability=[...$('#p3QuestionBody').querySelectorAll('[data-reliability]')].map(x=>x.value);p.q2.reasoning=$('#p3TimelineReason').value.trim();p.q2.attempts++;const result=p3TimelineResult(p.q2);
      if(result.accepted){p3Award(p.q2,20);saveFile03();p3CorrectFeedback('TIMELINE REVIEWED','You have separated corrected timestamps from estimates and unverified times. The records can be ordered where their timing is supported, but they cannot establish a single, fully synchronized timeline of Thomas’s movements.');}
      else{saveFile03();const hints=[];if(!result.ordered)hints.push('Order the corrected access activity, Peter’s approximate departure, then the two following-morning search records. The camera record cannot be placed precisely in that sequence.');if(!result.labels)hints.push('Classify the access log as Corrected, Peter’s statement as Estimated, the next-morning entries as Search Record, and the separate camera record as Unverified.');if(!result.clock)hints.push('THE CLOCK IS NOT THE EVENT. What independent evidence allows you to correct the parking camera’s clock?');if(!result.align)hints.push('Explain why an unverified camera time cannot be confidently synchronized with the corrected venue time.');const box=$('#p3Feedback');box.hidden=false;box.className='f3-feedback';box.innerHTML='<strong>TIMELINE NEEDS REVIEW</strong><p>'+hints.join('</p><p>')+'</p>';}
    }else if(stage==='q3'){
      const selected=$('#p3QuestionBody input[name="p3-q3"]:checked');if(!selected){const box=$('#p3Feedback');box.hidden=false;box.className='f3-feedback';box.innerHTML='<strong>RECORD A CONCLUSION BEFORE SUBMITTING.</strong>';return;}const answer=Number(selected.value);p.q3.attempts.push(answer);
      if(answer===2){p.q3.answer=answer;p3Award(p.q3,20);saveFile03();p3CorrectFeedback('EVIDENCE INTERPRETED CORRECTLY','Peter’s statement remains uncorroborated, but the supplied records do not conclusively disprove it. The access log establishes credential use, not personal identity. The camera does not identify the driver or passengers. The recovered belongings do not establish when or how Thomas disappeared.');}
      else{saveFile03();const box=$('#p3Feedback');box.hidden=false;box.className='f3-feedback';box.innerHTML='<strong>CONCLUSION REJECTED</strong><p>The evidence does not identify the person who used the credential or the occupants of the vehicle.</p><p>A suspicious sequence is not necessarily proof of a false statement.</p><p>Review T1, T2, and T3. Which conclusion makes the fewest unsupported assumptions?</p>';$('#p3Submit').hidden=true;$('#p3Next').hidden=false;$('#p3Next').textContent='RECONSIDER EVIDENCE →';}
    }else if(stage==='q4'){
      const text=$('#p3Deduction').value.trim();p.q4.draft=$('#p3Deduction').value;p.q4.attempts++;if(text.length<35){const fb=$('#p3Feedback');fb.hidden=false;fb.className='f3-feedback';fb.innerHTML='<strong>DEDUCTION INCOMPLETE</strong><p>Add enough detail to distinguish the records from the reported account and the unknowns.</p>';saveFile03();return;}const result=p3DeductionResult(text);
      if(result.accepted){p3Award(p.q4,30);p.q4.accepted=true;saveFile03();const fb=$('#p3Feedback');fb.hidden=false;fb.className='f3-feedback good';fb.innerHTML='<strong>DEDUCTION ACCEPTED</strong><p>You corrected what could be corrected.</p><p>You questioned what could not be verified.</p><p>And you left the unanswered questions unanswered.</p><p>That distinction matters.</p>';$('#p3Submit').hidden=true;$('#p3Next').hidden=false;$('#p3Next').textContent='RECEIVE FINAL TRANSMISSION →';if(!reducedMotion)laterWait(()=>{if(file03.p3.q4.accepted&&file03.p3.stage==='q4'){file03.p3.stage='finalTransmission';file03.stage='p3FinalTransmission';saveFile03();p3RenderFinalTransmission();}},1150);else{file03.p3.stage='finalTransmission';file03.stage='p3FinalTransmission';saveFile03();p3RenderFinalTransmission();}}
      else{saveFile03();const hints=['The access-clock correction and the fact that the log does not identify its user.','Peter’s approximate, uncorroborated account.','Why the unverified camera clock cannot be aligned with the venue time.','What the next-morning search records establish—and what they do not establish about disappearance.','What remains unknown about Thomas’s route, presence at the lake, or fate.','Independent evidence that could close the gaps, such as calibrated footage, identifiable witnesses, or corroborating travel records.','Avoid stating an unsupported accusation or treating an unknown outcome as established fact.'];const fb=$('#p3Feedback');fb.hidden=false;fb.className='f3-feedback';fb.innerHTML='<strong>DEDUCTION INCOMPLETE</strong><p>You have reconstructed part of the sequence, Detective.</p><p>But a timestamp is not a witness.</p><p>A witness is not proof.</p><p>And the absence of proof is not proof of the opposite.</p><p>Separate what the records establish from what they merely suggest. Identify what remains unknown. Then tell me what evidence would be needed to close the gaps.</p><p>— M</p><p>'+result.missing.map(i=>hints[i]).join('<br>')+'</p>';$('#p3Submit').hidden=true;$('#p3Next').hidden=false;$('#p3Next').textContent='REVISE DEDUCTION →';}
    }
  });
  $('#p3Next').addEventListener('click',()=>{const p=file03.p3,stage=p.stage;if(stage==='q1'){if(!p.q1.accepted)return;p3RenderQuestion(1);}else if(stage==='q2'){if(!p.q2.accepted)return;p3RenderQuestion(2);}else if(stage==='q3'){if(p.q3.accepted)p3RenderQuestion(3);else{p.q3.answer=null;p3RenderQuestion(2);}}else if(stage==='q4'){if(p.q4.accepted){file03.stage='p3FinalTransmission';p.stage='finalTransmission';saveFile03();p3RenderFinalTransmission();}else p3RenderQuestion(3);}});
  $('#p3FinalTransmission').addEventListener('click',event=>{if(file03.p3.finalTransmissionViewed||event.target.closest('button'))return;clearTimers();$('#p3FinalCopy').innerHTML=P3_FINAL_HTML;file03.p3.finalTransmissionViewed=true;saveFile03();$('#p3FinalContinue').hidden=false;$('#p3FinalContinue').focus();});
  $('#p3FinalTransmission').addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target===event.currentTarget&&!file03.p3.finalTransmissionViewed){event.preventDefault();$('#p3FinalTransmission').click();}});
  $('#p3FinalContinue').addEventListener('click',()=>{if(!file03.p3.finalTransmissionViewed||file03.p3.stage==='giftPopup'||$('#p3FinalContinue').disabled)return;$('#p3FinalContinue').disabled=true;file03.p3.giftShown=true;file03.p3.stage='giftPopup';file03.stage='p3GiftPopup';saveFile03();$('#p3FinalTransmission').classList.add('f3-exit');laterWait(p3ShowGift,reducedMotion?0:360);});
  $('#p3GiftContinue').addEventListener('click',()=>{if(!file03.p3.giftShown||file03.p3.complete)return;$('#p3GiftContinue').disabled=true;file03.p3.complete=true;file03.p3.stage='complete';file03.stage='p3Complete';progress.file03PuzzleComplete=true;persistProgress();saveFile03();$('#p3GiftPopup').classList.add('is-closing');laterWait(()=>{closeFile03();showHomeBoard();paintProgress();},reducedMotion?0:420);});
  $('#p3TransmissionCopy').addEventListener('click',()=>{const box=$('#p3TransmissionCopy');if(box.textContent!==P3_TRANSMISSION){clearTimers();box.textContent=P3_TRANSMISSION;file03.p3.transmissionViewed=true;saveFile03();$('#p3TransmissionContinue').hidden=false;}});
  $('#p3TransmissionContinue').addEventListener('click',()=>{if(!file03.p3.transmissionViewed)return;$('#p3Transmission').classList.add('f3-exit');laterWait(()=>{file03.stage='p3Report';file03.p3.stage='report';saveFile03();setF3Panel('p3Report');$('#p3Report').classList.remove('p3-report-ready');laterWait(()=>$('#p3Report').classList.add('p3-report-ready'),reducedMotion?0:80);},reducedMotion?0:520);});
  $('#p3ReturnHome').addEventListener('click',()=>{file03.p3.reportViewed=true;file03.p3.complete=true;file03.p3.stage='complete';file03.stage='p3Complete';progress.file03PuzzleComplete=true;persistProgress();saveFile03();closeFile03();paintProgress();});
  $('#f3TransmissionContinue').addEventListener('click',()=>{
    $('#f3Transmission').classList.add('f3-exit');laterWait(()=>{if(file03.deductionAccepted){file03.stage='p2Intro';file03.p2.stage='intro';saveFile03();setF3Panel('p2Intro');$('#p2ViewEvidence').focus();}else{file03.stage='cover';file03.coverOpened=true;saveFile03();setF3Panel('f3Cover');$('#f3Begin').focus();}$('#f3Transmission').classList.remove('f3-exit');},reducedMotion?0:440);
  });
  $('#p2ViewEvidence').addEventListener('click',()=>{file03.p2.stage='question0';saveFile03();renderP2Question(0);$('#f3Written').focus();});
  $('#p2Docs').addEventListener('click',event=>{const button=event.target.closest('[data-doc]');if(button)showP2Document(Number(button.dataset.doc));});
  $('#p2DocClose').addEventListener('click',()=>renderP2Question(Number((file03.p2.returnStage||'question0').slice(-1))));
  $('#p2DocDone').addEventListener('click',()=>renderP2Question(Number((file03.p2.returnStage||'question0').slice(-1))));
  $('#f3AnswerForm').addEventListener('submit',event=>{
    if(!file03.p2.stage?.startsWith('question'))return;
    event.preventDefault();const index=Number(file03.p2.stage.slice(-1)),text=$('#f3Written').value.trim();if(!text)return;file03.p2.answers[index]=text;file03.p2.attempts[index]=(file03.p2.attempts[index]||0)+1;const result=evaluateP2(text,index),feedback=$('#f3Feedback');feedback.hidden=false;
    if(result.accepted){file03.p2.accepted[index]=true;feedback.className='f3-feedback good';feedback.innerHTML='<strong>'+(index===0?'CORRECT — EVIDENCE VERIFIED':index===1?'CORRECT — SOURCE ANALYSIS ACCEPTED':index===2?'CORRECT — MOTIVE DISTINGUISHED FROM FACT':'CONCLUSION ACCEPTED')+'</strong>'+P2_QUESTIONS[index].explain;$('#f3Submit').hidden=true;$('#f3Next').hidden=false;$('#f3Next').textContent=index===3?'RECEIVE TRANSMISSION →':'CONTINUE →';$('#f3Next').dataset.p2='accepted';}
    else{file03.p2.accepted[index]=false;feedback.className='f3-feedback';if(index===3){const hints=['Compare what the draft contains with what the published version leaves out.','State what the source claims to have seen before replacement pages were filed.','Treat the E signature as a clue, not proof of identity.','Explain why source protection is plausible while Daniel’s exact motive remains unknown.','Consider what the omission prevents readers from evaluating.','Separate Daniel’s editorial choice from proof of responsibility for the disappearance or other wrongdoing.'];feedback.innerHTML='<strong>CONCLUSION INCOMPLETE</strong><p>You have identified part of the story, Detective.</p><p>But a suspicion is not a finding.</p><p>Separate what Daniel did from what you believe he intended. Then decide what these records can actually prove.</p><p>'+result.missing.map(i=>hints[i]).join('<br>')+'</p>';}else{feedback.innerHTML='<strong>'+(index===1?'SOURCE IDENTITY UNCONFIRMED':index===2?'MOTIVE NOT ESTABLISHED':'NOT QUITE — CONCLUSION REJECTED')+'</strong>'+P2_QUESTIONS[index].hint;}$('#f3Submit').hidden=true;$('#f3Next').hidden=false;$('#f3Next').textContent=index===3?'REVISE CONCLUSION →':'REVISE ANSWER →';$('#f3Next').dataset.p2='revise';}
    saveFile03();
  });
  $('#f3Next').addEventListener('click',()=>{
    if(!file03.p2.stage?.startsWith('question'))return;
    const index=Number(file03.p2.stage.slice(-1));if($('#f3Next').dataset.p2==='revise'){renderP2Question(index);$('#f3Written').focus();return;}
    if(index===3&&file03.p2.accepted[3]){file03.p2.finalAccepted=true;file03.p2.stage='p2accepted';file03.stage='p2accepted';saveFile03();setF3Panel('f3Accepted');$('#f3AcceptedTitle').textContent='CONCLUSION ACCEPTED';$('#f3Accepted').querySelectorAll('p')[0].textContent='You found the omission. You identified the source’s fear. And you did not confuse suspicion with proof.';$('#f3Accepted').querySelectorAll('p')[1].textContent='Daniel withheld information. That much the documents establish. Why he withheld it remains another question.';$('#f3Receive').textContent='RECEIVE TRANSMISSION →';return;}
    if(file03.p2.accepted[index]){renderP2Question(index+1);$('#f3Written').focus();}
  });
  $('#f3Accepted').addEventListener('click',event=>{if(event.target.id!=='f3Receive'||file03.p2.stage!=='p2accepted')return;$('#f3Accepted').classList.add('f3-exit');laterWait(()=>{file03.p2.stage='p2final';file03.stage='p2final';saveFile03();setF3Panel('f3FinalMessage');$('#f3Accepted').classList.remove('f3-exit');$('#f3CloseFinal').hidden=true;typeFile03($('#f3FinalCopy'),P2_TRANSMISSION,$('#f3CloseFinal'));},reducedMotion?0:440);});
  $('#f3Begin').addEventListener('click',event=>{
    $('#f3Cover').classList.add('f3-exit');laterWait(()=>{file03.stage='question';file03.coverOpened=true;saveFile03();setF3Panel('f3Question');renderF3Question();$('#f3Cover').classList.remove('f3-exit');},reducedMotion?0:280);
  });
  $('#f3AnswerForm').addEventListener('submit',event=>{
    if(file03.p2.stage?.startsWith('question'))return;
    event.preventDefault();const index=file03.answers[0]===null?0:1,question=F3_QUESTIONS[index];if(!question||f3Selected===null)return;
    file03.attempts[index].push(f3Selected);const feedback=$('#f3Feedback');feedback.hidden=false;
    if(f3Selected===question.answer){
      file03.answers[index]=f3Selected;saveFile03();feedback.className='f3-feedback good';feedback.innerHTML='<strong>CORRECT — EVIDENCE VERIFIED</strong>'+question.explain;$('#f3Submit').hidden=true;$('#f3Next').hidden=false;
    }else{
      saveFile03();feedback.className='f3-feedback';feedback.innerHTML='<strong>NOT QUITE — CONCLUSION REJECTED</strong>'+question.hint+'<br><b>CORRECT ANSWER: '+String.fromCharCode(65+question.answer)+'. '+question.options[question.answer].toUpperCase()+'</b><br>'+question.explain;$('#f3Submit').hidden=true;$('#f3Next').hidden=false;$('#f3Next').textContent='TRY AGAIN →';$('#f3Next').dataset.retry='true';
    }
  });
  $('#f3Next').addEventListener('click',()=>{
    if(file03.p2.stage?.startsWith('question')||['p2accepted','p2final','complete'].includes(file03.p2.stage))return;
    if($('#f3Next').dataset.retry==='true'){$('#f3Next').dataset.retry='';renderF3Question();return;}
    if(file03.question03Accepted){file03.stage='deduction';saveFile03();setF3Panel('f3Deduction');$('#f3DeductionText').value=file03.deductionDraft||'';$('#f3DeductionFeedback').hidden=true;return;}
    if(file03.answers.every(value=>value!==null)){renderF3Question03();return;}renderF3Question();
  });
  $('#f3Question').addEventListener('submit',event=>{
    if(event.target.id!=='f3AnswerForm')return; // Keep the answer form's handler as the sole owner.
  });
  $('#f3AnswerForm').addEventListener('submit',event=>{
    if(file03.p2.stage?.startsWith('question'))return;
    if(!file03.answers.every(value=>value!==null))return;
    event.preventDefault();const text=$('#f3Written').value.trim();if(!text)return;file03.question03Text=text;const result=validateAllocation(text),feedback=$('#f3Feedback');feedback.hidden=false;
    if(result.accepted){file03.question03Accepted=true;file03.stage='question03accepted';saveFile03();feedback.className='f3-feedback good';feedback.innerHTML='<strong>CORRECT — DOCUMENT STATUS VERIFIED</strong>The allocation sheet is a lead, not proof. Its suggested mappings need original approvals and bank confirmations.';$('#f3Submit').hidden=true;$('#f3Next').hidden=false;$('#f3Next').textContent='CONTINUE →';}
    else{saveFile03();feedback.className='f3-feedback';feedback.innerHTML='<strong>CONCLUSION INCOMPLETE</strong>'+result.missing.join(' ');$('#f3Submit').hidden=false;}
  });
  $('#f3DeductionText').addEventListener('input',event=>{file03.deductionDraft=event.target.value;saveFile03();});
  $('#f3DeductionForm').addEventListener('submit',event=>{
    event.preventDefault();const text=$('#f3DeductionText').value.trim();if(!text)return;file03.deductionDraft=text;const result=validateFinalDeduction(text),feedback=$('#f3DeductionFeedback');feedback.hidden=false;
    if(result.accepted){file03.deductionAccepted=true;file03.stage='accepted';saveFile03();feedback.hidden=true;setF3Panel('f3Accepted');}
    else{saveFile03();feedback.className='f3-feedback';feedback.innerHTML='<strong>CONCLUSION INCOMPLETE</strong>Your theory is taking shape, Detective. But a few links in the chain remain unverified. Revisit the records and distinguish what they establish from what they merely suggest.<br><br>'+result.missing.join('<br>');}
  });
  $('#f3Receive').addEventListener('click',()=>{
    if(file03.p2.stage==='p2accepted')return;
    $('#f3FinalTitle').textContent='INCOMING TRANSMISSION';$('#f3FinalMeta').innerHTML='SOURCE: M<br/>ARCHIVE FRAGMENT 001';$('#f3CloseFinal').textContent='CONTINUE →';$('#f3Accepted').classList.add('f3-exit');laterWait(()=>{file03.stage='final';saveFile03();setF3Panel('f3FinalMessage');$('#f3Accepted').classList.remove('f3-exit');$('#f3FinalMessage').classList.add('signal-glitch');laterWait(()=>$('#f3FinalMessage').classList.remove('signal-glitch'),reducedMotion?0:850);$('#f3CloseFinal').hidden=true;typeFile03($('#f3FinalCopy'),F3_ENDING,$('#f3CloseFinal'));},reducedMotion?0:440);
  });
  $('#f3CloseFinal').addEventListener('click',()=>{if(file03.p2.stage==='p2final'){file03.p2.transmissionViewed=true;file03.p2.stage='complete';file03.stage='p3Intro';file03.p3.stage='intro';}else{file03.finalViewed=true;file03.stage='p2Intro';file03.p2.stage='intro';}saveFile03();closeFile03();paintProgress();});
  window.addEventListener('keydown',event=>{
    const target=event.target;
    const editing=target instanceof HTMLElement && (target.matches('input,textarea,select')||target.isContentEditable);
  });
  $('#reviewCase').addEventListener('click',startPhaseTwo);

  // ---------- File 001: ambience, cuts, typing ----------
  // Soft particles over the painted art: fireflies and mist at the lake, warm dust indoors. Each canvas only runs
  // while its scene is on screen, and none of it runs with reduced motion.
  const AMB={};
  function makeAmbience(sel,{kind,z}){
    const host=$(sel);if(!host)return null;
    const cv=document.createElement('canvas');cv.className='amb-canvas';cv.style.zIndex=z;host.append(cv);
    const g=cv.getContext('2d');let W=0,H=0,raf=0,intensity=1,target=1;
    const N=kind==='lake'?30:48,parts=[],puffs=[];
    const rnd=(a,b)=>a+Math.random()*(b-a);
    const size=()=>{W=cv.width=host.clientWidth;H=cv.height=host.clientHeight;};
    const spawn=(p,init)=>{
      p.x=rnd(0,W);p.y=init?rnd(0,H):H+10;p.r=rnd(.6,2.2);p.vx=rnd(-.02,.025);p.vy=-rnd(.008,.04);p.a=rnd(.18,.5);p.ph=rnd(0,6.28);p.sp=rnd(.0006,.0016);
      if(kind==='lake'&&Math.random()<.55){p.fly=true;p.y=rnd(H*.52,H*.9);p.r=rnd(1.4,2.6);p.vy=0;p.vx=0;p.bx=p.x;p.by=p.y;}
      return p;
    };
    const start=()=>{size();if(!parts.length){for(let i=0;i<N;i++)parts.push(spawn({},true));for(let i=0;i<6;i++)puffs.push({x:rnd(-.2,1)*W,y:H*rnd(.5,.66),rx:W*rnd(.22,.4),a:rnd(.035,.07),v:rnd(.006,.014)});}if(!raf)raf=requestAnimationFrame(loop);};
    let last=performance.now();
    const loop=now=>{
      raf=0;if(!host.classList.contains('active')||document.hidden)return;
      const dt=Math.min(50,now-last);last=now;intensity+=(target-intensity)*Math.min(1,dt/500);
      g.clearRect(0,0,W,H);
      if(intensity>.01){
        if(kind==='lake'){
          puffs.forEach(p=>{p.x+=p.v*dt;if(p.x-p.rx>W)p.x=-p.rx;
            g.save();g.translate(p.x,p.y);g.scale(1,.16);const gr=g.createRadialGradient(0,0,0,0,0,p.rx);gr.addColorStop(0,`rgba(190,205,225,${p.a*intensity})`);gr.addColorStop(1,'rgba(190,205,225,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,p.rx,0,6.283);g.fill();g.restore();});
        }
        parts.forEach(p=>{
          if(p.fly){p.ph+=p.sp*dt;p.x=p.bx+Math.sin(p.ph*1.3)*38;p.y=p.by+Math.cos(p.ph)*22;}
          else{p.x+=p.vx*dt+Math.sin(p.ph+now*p.sp)*.06;p.y+=p.vy*dt;p.ph+=0;if(p.y<-10||p.x<-10||p.x>W+10)spawn(p,false);}
          const tw=.5+.5*Math.sin(now*p.sp*3+p.ph);const a=(p.fly?.95:p.a)*(.3+.7*tw)*intensity;
          const rad=p.fly?p.r*7:p.r*3;const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,rad);
          const col=p.fly?'225,255,160':kind==='lake'?'170,190,225':'255,214,150';
          gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y,rad,0,6.283);g.fill();
        });
        if(kind!=='lake'){
          // candle-like breathing at the edges of the frame
          const b=(.1+.055*Math.sin(now*.0011)+.03*Math.sin(now*.0037+1.3))*intensity;
          const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${b})`);g.fillStyle=vg;g.fillRect(0,0,W,H);
        }
      }
      raf=requestAnimationFrame(loop);
    };
    new MutationObserver(()=>{if(host.classList.contains('active')&&!raf){last=performance.now();start();}}).observe(host,{attributes:true,attributeFilter:['class']});
    addEventListener('resize',size);
    if(host.classList.contains('active'))start();
    return {set:v=>{target=v;}};
  }
  function initAmbience(){
    if(reducedMotion)return;
    AMB.lake=makeAmbience('#lakeScene',{kind:'lake',z:32});
    AMB.clue=makeAmbience('#clueScene',{kind:'dust',z:32});
    AMB.case=makeAmbience('#caseScene',{kind:'dust',z:34});
    AMB.records=makeAmbience('#recordsScene',{kind:'dust',z:12});
    AMB.phase=makeAmbience('#phaseTwoScene',{kind:'dust',z:6});
  }
  // dust per story slide: warm rooms get it, the signal and transmission slides stay clean
  const PHASE_DUST=[.9,1,1,1,1,1,0,.35,.3,0,.7,.7];
  // a hooded figure crosses the lamp light between "what remained" and the four faces
  // The mystery figure walks like a person: the supplied SVG (assets/m-figure.png, 520×1443) is cut into body, two thighs and two
  // shins. Hips swing, knees bend and the body bobs once per step. Polygons are art-pixel coordinates of that image.
  function mWalkerHTML(){
    const poly=pts=>pts.map(([x,y])=>`${(x/5.2).toFixed(2)}% ${(y/14.43).toFixed(2)}%`).join(',');
    const seg=(cls,pts)=>`<div class="mseg ${cls}" style="clip-path:polygon(${poly(pts)})"><img src="assets/m-figure.png?v=5" alt="" draggable="false"></div>`;
    const leg=(cls,kx,thigh,shin)=>`<div class="mleg ${cls}" style="--kx:${(kx/5.2).toFixed(2)}%">${seg('thigh',thigh)}${seg('shin',shin)}</div>`;
    const far=leg('leg-far',410,[[335,690],[490,690],[490,1020],[343,1020],[336,860]],[[343,1005],[490,1005],[490,1443],[352,1443],[350,1300],[347,1150]]);
    const near=leg('leg-near',285,[[197,690],[345,690],[345,860],[353,1020],[230,1020],[214,900],[197,830]],[[230,1005],[353,1005],[357,1150],[360,1300],[362,1443],[120,1443],[120,1290],[246,1290],[246,1200]]);
    const torso=seg('torso',[[0,0],[520,0],[520,712],[197,712],[197,840],[0,840]]);
    return `<div class="m-walker"><div class="m-flip"><div class="m-rig">${far}${near}${torso}</div></div></div>`;
  }
  function mSilhouette(){
    const scene=$('#phaseTwoScene');let el=scene.querySelector('.m-pass');
    if(!el){
      el=document.createElement('div');el.className='m-pass';el.setAttribute('aria-hidden','true');
      el.innerHTML='<i class="glow"></i>'+mWalkerHTML();
      scene.append(el);
    }
    el.classList.remove('run');void el.offsetWidth;el.classList.add('run');
    setTimeout(()=>el.classList.remove('run'),4100);
  }
  // ---------- File 001 story screens: transitions and aligned buttons ----------
  // The painted CONTINUE buttons (x, y, w, h as % of each artwork) get real hotspots that move with the art.
  const PSTAGE_BUTTONS={1:[7.33,76.55,22.48,9.17],2:[76.7,80.4,19.9,8.1],3:[30.9,78.7,31.9,8.2],5:[0,0,0,0]};
  // the dossier screen keeps a strip at the bottom free for its hint and button, so they never sit on a dossier's text
  const PSTAGE_RESERVE={5:64};
  // story text is live over the blank art so each line can arrive on its own (art px of the painting; [text, x, y-centre, width, size class])
  const PTEXT={
    1:{w:1677,h:938,lines:[['CASE FILE 25',122,240,251,'eb'],['THOMAS REED',120,315,611,'ti'],['THE LAST KNOWN DAY',122,390,530,'su'],['Thomas Reed was a co-owner of',123,475,475,'bo'],['The Lantern, a live-music venue.',123,521,486,'bo'],['He went to Lake Ash.',123,604,315,'bo'],['He never returned.',123,650,277,'bo']]},
    2:{w:1672,h:941,mono:1,lines:[['The search found',1278,172,232],['a damaged boat.',1278,212,219],['Thomas’s watch',1278,282,215],['and jacket were',1278,322,224],['recovered nearby.',1278,361,255],['But Thomas himself',1278,431,275],['was never found.',1278,470,239],['The authorities',1278,540,219],['eventually presumed',1278,579,286],['him dead.',1278,619,133],['The case was closed.',1278,688,285,'last']]}
  };
  function fitPText(i){
    const cfg=PTEXT[i],tx=phaseSlides[i].querySelector('.ptext');if(!tx||!tx.offsetWidth)return;
    const k=tx.offsetWidth/cfg.w;
    [...tx.children].forEach((l,n)=>{const target=cfg.lines[n][3]*k;l.style.fontSize='20px';const nat=l.offsetWidth;if(nat)l.style.fontSize=(20*target/nat/tx.offsetWidth*100)+'cqw';});
  }
  function playPText(i){
    const ls=[...phaseSlides[i].querySelectorAll('.pl')];
    ls.forEach(l=>l.getAnimations().forEach(a=>a.cancel()));
    if(reducedMotion){ls.forEach(l=>l.style.opacity=1);return;}
    ls.forEach((l,n)=>{
      const step=i===1?420:330;
      if(!l.classList.contains('last'))l.animate([{opacity:0,filter:'blur(8px)',transform:'translateY(-50%) translateY(5px)'},{opacity:1,filter:'blur(0)',transform:'translateY(-50%)'}],{duration:1300,delay:n*step,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
      else l.animate([{opacity:0,filter:'blur(10px)',color:'#ece7da',textShadow:'0 0 0 rgba(255,227,176,0)'},{opacity:1,filter:'blur(0)',color:'#fff3d6',textShadow:'0 0 1.3cqw rgba(255,227,176,.85)',offset:.55},{opacity:1,filter:'blur(0)',color:'#ece7da',textShadow:'0 0 0 rgba(255,227,176,0)'}],{duration:2600,delay:n*step+900,easing:'ease-out',fill:'both'});
    });
  }
  function setupPstages(){
    Object.entries(PSTAGE_BUTTONS).forEach(([i,box])=>{
      const slide=phaseSlides[i];if(!slide||slide.querySelector('.pstage'))return;
      const st=document.createElement('div');st.className='pstage';
      if(Number(i)===5)slide.querySelectorAll('.dossier-hotspot').forEach(b=>st.append(b));
      const btn=slide.querySelector('.phase-hotspot');if(btn){st.append(btn);Object.assign(btn.style,{left:box[0]+'%',top:box[1]+'%',width:box[2]+'%',height:box[3]+'%',right:'auto',bottom:'auto'});}
      if(Number(i)===1){
        const f=document.createElement('div');f.className='far-figure';f.setAttribute('aria-hidden','true');
        f.innerHTML='<svg viewBox="0 0 40 110" xmlns="http://www.w3.org/2000/svg"><path d="M20 3c5 0 8 4 8 9 0 4-2 7-4 9 6 2 10 8 11 17l2 38-8 2-1 30h-6l-2-26-2 26h-6l-1-30-8-2 2-38c1-9 5-15 11-17-2-2-4-5-4-9 0-5 3-9 8-9z" fill="#030406"/></svg>';
        st.append(f);
      }
      if(PTEXT[i]){
        const cfg=PTEXT[i],tx=document.createElement('div');tx.className='ptext'+(cfg.mono?' mono':'');
        cfg.lines.forEach(([t,x,y,,c])=>{const l=document.createElement('span');l.className='pl'+(c?' '+c:'');l.textContent=t;l.style.left=(x/cfg.w*100)+'%';l.style.top=(y/cfg.h*100)+'%';tx.append(l);});
        st.append(tx);
      }
      slide.append(st);
    });
    layoutPstages();
  }
  function layoutPstages(){
    Object.keys(PSTAGE_BUTTONS).forEach(i=>{
      const slide=phaseSlides[i],st=slide&&slide.querySelector('.pstage'),img=slide&&slide.querySelector('img');if(!st||!img)return;
      const nw=img.naturalWidth,nh=img.naturalHeight,sw=slide.clientWidth,sh=slide.clientHeight-(PSTAGE_RESERVE[i]||0);if(!nw||!sw)return;
      const k=Math.min(sw/nw,sh/nh),w=nw*k,hh=nh*k;
      st.style.left=(sw-w)/2+'px';st.style.top=(sh-hh)/2+'px';st.style.width=w+'px';st.style.height=hh+'px';
    });
  }
  addEventListener('resize',layoutPstages);
  // both screens stay on stage while one fades out and the other fades in: opacity and a slow push only, no filters, so it stays smooth
  function phaseCrossfade(prev,next,o){
    const sp=phaseSlides[prev],sn=phaseSlides[next],pimg=sp.querySelector('img'),nimg=sn.querySelector('img');
    sp.classList.add('mc-out');
    if(o.origin){const r=pimg.getBoundingClientRect(),nw=pimg.naturalWidth||1536,nh=pimg.naturalHeight||1024,k=Math.min(r.width/nw,r.height/nh);pimg.style.transformOrigin=`${(r.width-nw*k)/2+o.origin[0]*k}px ${(r.height-nh*k)/2+o.origin[1]*k}px`;}
    const E='cubic-bezier(.45,0,.2,1)';
    pimg.style.willChange=nimg.style.willChange='transform,opacity';
    pimg.animate([{transform:'scale(1.065)'},{transform:`scale(${o.push})`}],{duration:o.D,easing:E,fill:'forwards'});
    // the live layer on each slide (hotspots, typed text, dossier curtains) rides the same push, so nothing drifts off the artwork
    const pst=sp.querySelector('.pstage'),nst=sn.querySelector('.pstage');
    if(pst)pst.animate([{transform:'scale(1.065)'},{transform:`scale(${o.push})`}],{duration:o.D,easing:E,fill:'forwards'});
    if(nst)nst.animate([{transform:`scale(${o.land})`},{transform:'scale(1.065)'}],{duration:o.D+1200,delay:o.lag,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
    sp.animate([{opacity:1},{opacity:1,offset:o.hold??.3},{opacity:0}],{duration:o.D,easing:'ease-in-out',fill:'forwards'});
    const cap=sp.querySelector('.phase-caption');if(cap)cap.animate([{opacity:1},{opacity:0}],{duration:600,fill:'forwards'});
    sn.animate([{opacity:0},{opacity:1}],{duration:o.D,delay:o.lag,easing:'ease-in-out',fill:'backwards'});
    nimg.animate([{transform:`scale(${o.land})`},{transform:'scale(1.065)'}],{duration:o.D+1200,delay:o.lag,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
    setTimeout(()=>{[pimg,sp,pst].forEach(n=>n&&n.getAnimations().forEach(a=>a.cancel()));if(cap)cap.getAnimations().forEach(a=>a.cancel());pimg.style.transformOrigin='';pimg.style.willChange=nimg.style.willChange='';sp.classList.remove('mc-out');},o.D+o.lag+100);
  }
  function phaseMatchCut(prev,next){
    phaseCrossfade(prev,next,{D:1700,lag:400,push:1.1,land:1.1,origin:[95,430]});
    const fig=phaseSlides[next].querySelector('.far-figure');
    if(fig){fig.getAnimations().forEach(a=>a.cancel());fig.animate([{opacity:0},{opacity:0,offset:.5},{opacity:.9}],{duration:6500,fill:'forwards',easing:'ease-in-out'});}
  }
  // the incoming slide starts fading in on the click itself (no lag), over the outgoing one, which keeps its full brightness until the new one is mostly there
  function phaseDissolve(prev,next){phaseCrossfade(prev,next,{D:1100,lag:0,push:1.09,land:1.09,hold:.5});}
  function phaseAmbience(index,prev){
    if(AMB.phase)AMB.phase.set(PHASE_DUST[index]??1);
    if(index===4)peopleStrings();
    if(index>=1&&index<=3)layoutPstages();
    if(!reducedMotion&&prev===0&&index===1)phaseMatchCut(prev,index);
    else if(!reducedMotion&&prev>=1&&prev<=3&&index>=2&&index<=4&&index===prev+1)phaseDissolve(prev,index);
    // people <-> dossiers, and people -> the signal interception
    else if(!reducedMotion&&((prev===4&&index===5)||(prev===5&&index===4)||(prev===4&&index===6)))phaseDissolve(prev,index);
    // every other change of slide gets the same dissolve, so none of them cut or dip through black
    else if(!reducedMotion&&prev>=0&&prev!==index)phaseDissolve(prev,index);
    if(!reducedMotion&&index===4&&prev===3)mSilhouette();
    if(index===1||index===2){fitPText(index);later(()=>playPText(index),reducedMotion?0:(index===1?1500:900));}
  }
  // red string between the four portraits: drawn pin to pin, then pulled taut
  let peopleLoop=0;
  function peopleStrings(){
    const slide=$$('.phase-slide')[4];if(!slide)return;
    let svg=slide.querySelector('.people-strings');const ns='http://www.w3.org/2000/svg';
    if(!svg){
      svg=document.createElementNS(ns,'svg');svg.setAttribute('class','people-strings');svg.setAttribute('aria-hidden','true');
      for(let i=0;i<3;i++){const p=document.createElementNS(ns,'path');p.setAttribute('class','cord');p.setAttribute('pathLength','1');svg.append(p);}
      for(let i=0;i<4;i++){const c=document.createElementNS(ns,'circle');c.setAttribute('class','pin');c.setAttribute('r','7');svg.append(c);}
      slide.append(svg);
    }
    const cords=[...svg.querySelectorAll('.cord')],pins=[...svg.querySelectorAll('.pin')];
    cords.forEach(c=>{c.getAnimations().forEach(a=>a.cancel());c.style.strokeDasharray='1';c.style.strokeDashoffset=reducedMotion?'0':'1';});
    pins.forEach(p=>{p.getAnimations().forEach(a=>a.cancel());p.style.opacity=reducedMotion?'1':'0';});
    const t0=performance.now();
    let sagK=1;
    if(!reducedMotion){
      pins.forEach((p,i)=>p.animate([{opacity:0},{opacity:1}],{duration:240,delay:1000+i*380,fill:'forwards'}));
      cords.forEach((c,i)=>c.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:620,delay:1100+i*380,easing:'cubic-bezier(.5,0,.2,1)',fill:'forwards'}));
    }
    cancelAnimationFrame(peopleLoop);
    const tick=now=>{
      if(!slide.classList.contains('active'))return;
      const sr=slide.getBoundingClientRect(),hs=[...slide.querySelectorAll('.person-hotspot')];
      const pts=hs.map(h=>{const r=h.getBoundingClientRect();return [r.left+r.width/2-sr.left,r.top+r.height*.035-sr.top];});
      // after the strings are drawn they tighten a little, as if pulled taut
      const e=Math.max(0,Math.min(1,(now-t0-2600)/900));sagK=1-.62*(e*e*(3-2*e));
      const sag=sr.height*.055*sagK;
      cords.forEach((c,i)=>{const a=pts[i],b=pts[i+1];if(!a||!b)return;c.setAttribute('d',`M${a[0]} ${a[1]} Q${(a[0]+b[0])/2} ${(a[1]+b[1])/2+sag} ${b[0]} ${b[1]}`);});
      pins.forEach((p,i)=>{if(pts[i]){p.setAttribute('cx',pts[i][0]);p.setAttribute('cy',pts[i][1]);}});
      peopleLoop=requestAnimationFrame(tick);
    };
    peopleLoop=requestAnimationFrame(tick);
  }
  // black redaction bars sweep over the archive login, the wall comes up underneath, then the bars leave
  function file1Bars(swap){
    if(reducedMotion){swap();return;}
    const host=$('#experience');let ov=host.querySelector('.file1-bars');const N=7;
    if(!ov){
      ov=document.createElement('div');ov.className='file1-bars';ov.setAttribute('aria-hidden','true');
      for(let i=0;i<N;i++){const b=document.createElement('i');b.style.top=(i*100/N)+'%';b.style.height=(100/N+.4)+'%';ov.append(b);}
      const lab=document.createElement('i');lab.className='fb-label';lab.innerHTML='<b data-t="ARCHIVE UNSEALED">ARCHIVE UNSEALED</b><u></u><svg viewBox="0 0 600 120" aria-hidden="true"><path class="fb-drip" d="M168 6 v34 q0 8 -3 8 q-3 0 -3 -8 v-34z" fill="#8a0f0a"/><path class="fb-drip fb-d2" d="M332 6 v54 q0 9 -3.5 9 q-3.5 0 -3.5 -9 v-54z" fill="#7a0c08"/><path class="fb-drip fb-d3" d="M452 6 v22 q0 6 -2.5 6 q-2.5 0 -2.5 -6 v-22z" fill="#8a0f0a"/><circle cx="120" cy="64" r="2.2" fill="#6a0a07" opacity=".7"/><circle cx="486" cy="58" r="1.6" fill="#6a0a07" opacity=".6"/><circle cx="498" cy="70" r="1" fill="#6a0a07" opacity=".6"/></svg>';ov.append(lab);host.append(ov);
    }
    const bars=[...ov.querySelectorAll('i:not(.fb-label)')],lab=ov.querySelector('.fb-label');
    ov.classList.add('on');
    bars.forEach((b,i)=>b.animate([{transform:'translateX(-101%)'},{transform:'translateX(0)'}],{duration:430,delay:i*65,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'}));
    setTimeout(()=>{lab.animate([{opacity:0,letterSpacing:'.8em'},{opacity:1,letterSpacing:'.5em'}],{duration:520,fill:'forwards'});},430+N*65);
    setTimeout(()=>{swap();},430+N*65+1100);
    setTimeout(()=>{
      lab.animate([{opacity:1},{opacity:0}],{duration:260,fill:'forwards'});
      bars.forEach((b,i)=>b.animate([{transform:'translateX(0)'},{transform:'translateX(101%)'}],{duration:480,delay:(N-1-i)*60,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'}));
    },430+N*65+1500);
    setTimeout(()=>{ov.classList.remove('on');ov.getAnimations({subtree:true}).forEach(a=>a.cancel());},430+N*65+1500+1100);
  }
  initAmbience();
  function showRecords(){
    clearTimers();
    const scene=$('#recordsScene');
    scene.classList.remove('records-live','records-settled','case-ready');
    $('#recordsStatus').textContent='CONNECTION ESTABLISHED';
    $('#recordsStatus2').textContent='RECOVERING RECORDS…';
    $('#recordsStatus3').textContent='CASE FILE 25 — FOUND';
    show(scene);
    later(()=>scene.classList.add('records-live'), reducedMotion ? 0 : 800);
    later(()=>scene.classList.add('records-settled'), reducedMotion ? 0 : 6000);
    // Continue the case after the recovered folder has had time to land and be read.
    later(startPhaseTwo, reducedMotion ? 0 : 9300);
  }
  const phaseSlides=$$('.phase-slide');
  setupPstages();
  const people=[
    ['THOMAS REED','CO-OWNER','Co-owner of The Lantern. The last confirmed chapter of his life ends at Lake Ash.'],
    ['PETER SHAW','BUSINESS PARTNER',"Business partner. He was among the last people to describe Thomas's movements."],
    ['ELENA','ACCOUNTS MANAGER',"Accounts manager. She handled the records behind The Lantern's business."],
    ['DANIEL CROSS','JOURNALIST','Journalist. He had been asking questions about The Lantern before Thomas disappeared.']
  ];
  let visitedPeople=new Set();
  function setPhase(index){
    clearTimers();
    // File 001 remembers the slide he is on, so a refresh resumes there
    if(!progress.caseAccepted&&progress.phaseAt!==index){progress.phaseAt=index;persistProgress();}
    phaseSlides[4].classList.remove('brief-return');
    const prevSlide=phaseSlides.findIndex(slide=>slide.classList.contains('active'));
    phaseSlides.forEach((slide,i)=>slide.classList.toggle('active',i===index));
    phaseAmbience(index,prevSlide);
    if(index===0) later(()=>setPhase(1),reducedMotion?0:4300);
    sig7Seq++;
    if(index===6) later(()=>setPhase(7),reducedMotion?0:2100);
    if(index===7) playSignalMessage();
    if(index===8){
      const final=phaseSlides[8]; final.classList.remove('message-shown','message-fade','signal-failing');
      later(()=>final.classList.add('message-shown'),reducedMotion?0:1800);
      // Shorten the original message hold by one second, then show M's “Surprise me” transmission.
      laterWait(()=>final.classList.add('signal-failing'),13200);
      laterWait(()=>setPhase(7),18000);
    }
    if(index===9) laterWait(()=>{playTransitionClick();setPhase(10);},1150);
    if(index===10){
      const file=phaseSlides[10]; file.classList.remove('opening-file');
      laterWait(()=>file.classList.add('opening-file'),7050);
      // Lamp reveal, readable hold, then a restrained paper-turn into the open file.
      laterWait(()=>setPhase(11),7950);
    }
    if(index===11){
      const screen=phaseSlides[11]; screen.classList.remove('case-accepted');
      $('#acceptCase').disabled=true;
      const paper=$('#acceptPaper'), lines=$$('.accept-lines p');
      paper.classList.remove('heading-visible','name-visible','status-visible');
      lines.forEach(line=>line.classList.remove('revealed'));
      $('#acceptCase').classList.remove('visible');
      laterWait(()=>paper.classList.add('heading-visible'),500);
      laterWait(()=>paper.classList.add('name-visible'),1500);
      laterWait(()=>paper.classList.add('status-visible'),2300);
      laterWait(()=>lines[0].classList.add('revealed'),3100);
      laterWait(()=>lines[1].classList.add('revealed'),4050);
      laterWait(()=>lines[2].classList.add('revealed'),5150);
      // Three seconds of quiet after the final sentence before the action appears.
      laterWait(()=>{$('#acceptCase').classList.add('visible');$('#acceptCase').disabled=false;},8150);
    }
  }

  // ---------- M's one message: typed live on the clean panel, then a slip as the signal collapses ----------
  // y = line centre in artwork pixels (1672 x 941); the panel is laid out like the painted one was.
  const SIG7_LINES=[
    ['There you are.',299],['I wondered who would get here first.',328],["You've seen the file. You've seen the faces.",357],["And, for now, that's all you have.",385],
    ["A dead man. A closed case. And people who've had a very long time to decide what to say.",414],["I'd be careful about believing any of it.",444],
    ['Memory changes. Stories change. Records disappear.',473],['But people make one mistake.',504],['They assume that because something is buried… it stays buried.',535],
    ['One last thing, Detective.',577],['Try not to confuse opening a file with solving a case.',607],["Though, knowing what I've seen so far… perhaps I should lower my expectations.",637],
    ['Surprise me.',679,'big'],['— M',721,'sign']
  ];
  const SIG7_LEAK=[['…is it still recording?',318,''],['This archive was buried for a reason.',366,'hot'],['I should not have—',414,'cut']];
  let sig7Seq=0;
  function layoutSig7(){
    const slide=$$('.phase-slide')[7],stage=$('#sig7Stage'),img=slide.querySelector('img');
    const nw=img.naturalWidth||1672,nh=img.naturalHeight||941,sw=slide.clientWidth,sh=slide.clientHeight;if(!sw||!sh)return;
    const k=Math.max(sw/nw,sh/nh),w=nw*k,hh=nh*k;
    stage.style.left=(sw-w)/2+'px';stage.style.top=(sh-hh)/2+'px';stage.style.width=w+'px';stage.style.height=hh+'px';
  }
  addEventListener('resize',layoutSig7);
  function sig7Build(host,lines,cls){
    host.replaceChildren();
    return lines.map(([t,y,kind])=>{
      const el=document.createElement('div'),on=document.createElement('i'),off=document.createElement('i');
      el.className='sig7-line '+(cls||'')+' '+(kind||'');on.className='on';off.className='off';off.textContent=t;el.append(on,off);
      el.style.top=(y/941*100).toFixed(3)+'%';el.style.fontSize=(kind==='big'?1.68:1.27)+'cqw';
      host.append(el);return {el,on,off,t,kind};
    });
  }
  function fitSig7(lines){
    // each line is scaled so the longest line on the painted panel spans 964 art-pixels
    const stage=$('#sig7Stage'),cw=stage.getBoundingClientRect().width;if(!cw)return;
    const ref=lines.find(l=>l.t.startsWith('A dead man'));if(!ref)return;
    const r=document.createRange();r.selectNodeContents(ref.el);const nat=r.getBoundingClientRect().width/cw*1672;
    if(nat>0){const f=964/nat;lines.forEach(l=>{if(l.kind!=='big')l.el.style.fontSize=(1.27*f).toFixed(3)+'cqw';else l.el.style.fontSize=(1.68*f).toFixed(3)+'cqw';});}
  }
  function playSignalMessage(){
    const seq=++sig7Seq,slide=$$('.phase-slide')[7];
    slide.classList.remove('sig7-fail','sig7-out');
    slide.getAnimations({subtree:true}).forEach(a=>a.cancel());
    const text=$('#sig7Text'),leak=$('#sig7Leak'),lost=$('#sig7Lost');
    lost.style.opacity=0;leak.replaceChildren();
    $('#sig7Sr').textContent=SIG7_LINES.map(l=>l[0]).join(' ')+' '+SIG7_LEAK.map(l=>l[0]).join(' ');
    const lines=sig7Build(text,SIG7_LINES,''),leakLines=sig7Build(leak,SIG7_LEAK,'leak');
    layoutSig7();fitSig7(lines);leakLines.forEach(l=>{l.el.style.fontSize=lines[4].el.style.fontSize;});
    const alive=()=>seq===sig7Seq,wait=ms=>new Promise(r=>setTimeout(r,ms));
    const finish=()=>lines.forEach(l=>{l.on.textContent=l.t;l.off.textContent='';l.el.classList.remove('typing');});
    if(reducedMotion){finish();leakLines.forEach(l=>{l.on.textContent=l.t;l.off.textContent='';});lost.style.opacity=1;setTimeout(()=>{if(alive())setPhase(9);},4500);return;}
    let skipped=false;const skip=()=>{skipped=true;};slide.addEventListener('click',skip,{once:true});
    const typeLine=(l,ms)=>new Promise(done=>{
      l.el.classList.add('typing');let n=0;
      const tick=()=>{
        if(!alive())return done();
        if(skipped){l.on.textContent=l.t;l.off.textContent='';l.el.classList.remove('typing');return done();}
        n++;keyTick();l.on.textContent=l.t.slice(0,n);l.off.textContent=l.t.slice(n);
        if(n>=l.t.length){l.el.classList.remove('typing');return done();}
        const ch=l.t[n-1];setTimeout(tick,ms+(/[.,;:?!…—]/.test(ch)?ms*6:Math.random()*ms*.7));
      };tick();
    });
    (async()=>{
      await wait(1300);if(!alive())return;
      for(const l of lines){
        if(!alive())return;
        await typeLine(l,l.kind==='big'?78:l.kind==='sign'?95:22);if(!alive())return;
        await wait(skipped?0:l.kind==='big'?1300:l.t.endsWith('buried.')||l.t.endsWith('all you have.')?520:230);
      }
      if(!alive())return;finish();await wait(skipped?900:2800);if(!alive())return;
      // the signal starts to go: the message tears and collapses
      slide.classList.add('sig7-fail');await wait(2500);if(!alive())return;
      text.replaceChildren();
      // and for a moment the line is still open
      for(const l of leakLines){
        if(!alive())return;
        l.el.classList.add('typing');
        await typeLine(l,l.kind==='hot'?32:l.kind==='cut'?60:18);if(!alive())return;
        l.el.classList.remove('typing');
        if(l.kind==='cut'){l.el.animate([{opacity:1},{opacity:.2,offset:.2},{opacity:1,offset:.4},{opacity:0}],{duration:600,fill:'forwards'});}
        await wait(l.kind==='hot'?700:420);
      }
      if(!alive())return;
      lost.animate([{opacity:0},{opacity:1,offset:.2},{opacity:.35,offset:.35},{opacity:1}],{duration:700,fill:'forwards'});
      await wait(1700);if(!alive())return;
      slide.classList.add('sig7-out');await wait(1000);if(!alive())return;
      setPhase(9);
    })();
  }
  // Testing shortcut for File 01: jump to the ACCEPT CASE screen with everything already revealed.
  function skipFile01ToEnd(){
    if(!$('#phaseTwoScene').classList.contains('active'))startPhaseTwo();
    setPhase(11);
    clearTimers();
    const paper=$('#acceptPaper');
    paper.classList.add('heading-visible','name-visible','status-visible');
    $$('.accept-lines p').forEach(line=>line.classList.add('revealed'));
    $('#acceptCase').classList.add('visible');$('#acceptCase').disabled=false;
  }
  function startPhaseTwo(){
    if($('#phaseTwoScene').classList.contains('active'))return;
    clearTimers(); visitedPeople=new Set(); $('#recordsScene').classList.add('case-ready');
    show(scenes[8]); setPhase(progress.caseAccepted?0:Math.max(0,Math.min(11,Number(progress.phaseAt)||0)));
  }
  $$('[data-next-phase]').forEach(button=>button.addEventListener('click',()=>{
    const current=phaseSlides.findIndex(slide=>slide.classList.contains('active'));
    setPhase(Math.min(current+1,5));
  }));
  $$('.person-hotspot').forEach(button=>button.addEventListener('click',()=>{
    setPhase(5); openPerson(Number(button.dataset.person));
  }));
  $('.people-continue').addEventListener('click',()=>{ $('#personDetail').classList.remove('visible'); setPhase(5); });
  $$('.dossier-hotspot').forEach(button=>button.addEventListener('click',()=>openPerson(Number(button.dataset.person))));
  $$('.dossier-arrow').forEach(button=>button.addEventListener('click',()=>openPerson(Number(button.dataset.person))));
  function openPerson(index){
    clearTimers(); const person=people[index]; if(!person)return;
    visitedPeople.add(index); $('#personName').textContent=person[0]; $('#personRole').textContent=person[1]; $('#personDescription').textContent=person[2];
    $('#personDetail').classList.add('visible');
  }
  $('#backToFiles').addEventListener('click',()=>{
    $('#personDetail').classList.remove('visible');
  });
  $('#backToPeople').addEventListener('click',()=>{
    $('#personDetail').classList.remove('visible'); setPhase(4);
    $('.person-hotspot')?.focus();
    laterWait(()=>setPhase(6),reducedMotion?0:2100);
  });
  function playTransitionClick(){
    if(!audioContext||audioContext.state!=='running')return;
    const osc=audioContext.createOscillator(), gain=audioContext.createGain(), t=audioContext.currentTime;
    osc.type='sine';osc.frequency.setValueAtTime(720,t);osc.frequency.exponentialRampToValueAtTime(180,t+.09);
    gain.gain.setValueAtTime(.018,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.11);
    osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.12);
  }
  $$('.phase-critical-image').forEach(image=>{
    const slide=image.closest('.phase-slide'), fallback=slide.querySelector('.frame-loading');
    const ready=()=>{slide.classList.remove('frame-loading','frame-failed');fallback.textContent='';};
    const failed=()=>{
      slide.classList.remove('frame-loading');slide.classList.add('frame-failed');
      fallback.textContent=slide===phaseSlides[10]
        ? 'CASE 25\nINVESTIGATOR: UNASSIGNED\nSUBJECT: THOMAS REED\nSTATUS: OPEN\n\n“Someone has to decide which version of the story survives.”'
        : slide===phaseSlides[9] ? 'SIGNAL LOST · TRANSMISSION FRAME UNAVAILABLE' : 'OFFICIAL CASE IMAGE UNAVAILABLE · TEXT RECORD RETAINED';
    };
    if(image.complete){image.naturalWidth?ready():failed();}
    else{slide.classList.add('frame-loading');image.addEventListener('load',ready,{once:true});image.addEventListener('error',failed,{once:true});}
  });
  $('#acceptCase').addEventListener('click',event=>{
    const button=event.currentTarget;
    if(button.disabled||!phaseSlides[11].classList.contains('active'))return;
    clearTimers();button.disabled=true;progress.caseAccepted=true;progress.chapterOneComplete=true;persistProgress();phaseSlides[11].classList.add('case-accepted');
    showHomeBoard(); if(progress.file02TransitionSeen) playWallIntro();
  });
  function stopSound(){audioNodes.forEach(n=>{try{n.stop?.();n.disconnect?.();}catch{}});audioNodes=[];soundBus=null;if(audioContext){audioContext.close().catch(()=>{});audioContext=null;}$('#soundToggle').innerHTML='◖)) <span>SOUND OFF</span>';$('#soundToggle').setAttribute('aria-label','Turn ambient sound on');}
  // Ambient score, synthesised live (no audio files): a slowly swelling dissonant drone in a reverberant room, held strings, a minor-key
  // pulse, a heartbeat that never stops, and rare events (sub-bass hits, bell clusters, a distant creak) so the room never feels settled.
  function playImpact(power = 1) {
    const ac = audioContext; if (!ac || !soundBus || ac.state !== 'running') return;
    const t = ac.currentTime, osc = ac.createOscillator(), g = ac.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(95, t); osc.frequency.exponentialRampToValueAtTime(30, t + .9);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.7 * power, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + 2.4);
    osc.connect(g); g.connect(soundBus); osc.start(t); osc.stop(t + 2.5);
    if (power > .5) { // a cold dissonant stab over the boom
      [466.16, 493.88, 698.46].forEach(f => { const s = ac.createOscillator(), sg = ac.createGain(); s.type = 'sawtooth'; s.frequency.value = f; sg.gain.setValueAtTime(.0001, t);
        sg.gain.exponentialRampToValueAtTime(.05 * power, t + .02); sg.gain.exponentialRampToValueAtTime(.0001, t + 1.6); s.connect(sg); sg.connect(soundBus); s.start(t); s.stop(t + 1.7); });
    }
    const n = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain();
    n.buffer = soundBus.noise; nf.type = 'lowpass'; nf.frequency.setValueAtTime(900, t); nf.frequency.exponentialRampToValueAtTime(90, t + 1.2);
    ng.gain.setValueAtTime(.0001, t); ng.gain.exponentialRampToValueAtTime(.35 * power, t + .02); ng.gain.exponentialRampToValueAtTime(.0001, t + 1.4);
    n.connect(nf); nf.connect(ng); ng.connect(soundBus); n.start(t); n.stop(t + 1.5);
  }
  // Once the viewer switches sound off it stays off: scene changes call startSound() too, and must not turn it back on.
  let soundMuted = false;
  try { soundMuted = localStorage.getItem('case25SoundMuted') === '1'; } catch {}
  const setSoundMuted = m => { soundMuted = m; try { localStorage.setItem('case25SoundMuted', m ? '1' : '0'); } catch {} };
  function ensureSound(){if(soundMuted)return;if(!audioContext)startSound();else if(audioContext.state==='suspended')audioContext.resume();}
  async function startSound() {
    if (soundMuted) return;
    if (audioContext) { if (audioContext.state === 'suspended') await audioContext.resume(); return; }
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
    const ac = audioContext = new Ctx({ latencyHint: 'playback' }); await ac.resume();
    if (audioContext !== ac) return; // switched off while the browser was still unlocking audio
    const rate = ac.sampleRate, now = ac.currentTime, rand = (a, b) => a + Math.random() * (b - a);
    const master = ac.createGain(), hp = ac.createBiquadFilter(), comp = ac.createDynamicsCompressor();
    hp.type = 'highpass'; hp.frequency.value = 26; // nothing useful below the sub; keeps the low end tight
    master.gain.setValueAtTime(.0001, now); master.gain.exponentialRampToValueAtTime(.7, now + 4);
    master.connect(hp); hp.connect(comp); comp.connect(ac.destination);
    // a cold, long room: decaying noise as the impulse response
    const ir = ac.createBuffer(2, rate * 4, rate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.8); }
    const verb = ac.createConvolver(), wet = ac.createGain(); verb.buffer = ir; wet.gain.value = .55; verb.connect(wet); wet.connect(master);
    const bus = ac.createGain(); bus.connect(master); bus.connect(verb);
    const noise = ac.createBuffer(1, rate * 6, rate), nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    bus.noise = noise; soundBus = bus; bus.gain.value = musicWanted ? 1 : .0001;
    const nodes = [];
    const lfo = (freq, depth, target) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(target); o.start(); nodes.push(o, g); };
    // the drone: detuned low saws, a sub, and a minor second that never resolves, swelling under a sweeping low-pass
    const dlp = ac.createBiquadFilter(), dg = ac.createGain(); dlp.type = 'lowpass'; dlp.frequency.value = 210; dlp.Q.value = 2.5; dg.gain.value = .13;
    lfo(.045, 90, dlp.frequency); lfo(.07, .05, dg.gain);
    [['sawtooth', 55, 0], ['sawtooth', 55, 9], ['sine', 27.5, 0], ['triangle', 58.27, 0], ['sine', 82.4, -6]].forEach(([type, f, cents]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; o.detune.value = cents; g.gain.value = type === 'sawtooth' ? .3 : .45; o.connect(g); g.connect(dlp); o.start(); nodes.push(o, g);
    });
    dlp.connect(dg); dg.connect(bus); nodes.push(dlp, dg);
    // strings: two sawtooths a semitone apart (E and F) behind a soft low-pass, shivering and swelling in and out like a held bow
    const slp = ac.createBiquadFilter(), sg = ac.createGain(); slp.type = 'lowpass'; slp.frequency.value = 1100; slp.Q.value = .7; sg.gain.value = .02;
    lfo(.035, .022, sg.gain); lfo(5.4, 6, slp.frequency);
    [[329.63, -9], [329.63, 11], [349.23, 0], [493.88, 6]].forEach(([f, cents]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = cents; g.gain.value = .5; lfo(5.2 + Math.random(), 7, o.detune); o.connect(g); g.connect(slp); o.start(); nodes.push(o, g);
    });
    slp.connect(sg); sg.connect(bus); nodes.push(slp, sg);
    // pulse: a dark minor-key ostinato (E phrygian, with the flat second leaning on the root) that fades in once the room has settled
    const alp = ac.createBiquadFilter(), ag = ac.createGain(); alp.type = 'lowpass'; alp.frequency.value = 2400; ag.gain.setValueAtTime(.0001, now); ag.gain.exponentialRampToValueAtTime(.11, now + 22);
    alp.connect(ag); ag.connect(bus); nodes.push(alp, ag);
    const SEQ = [0, 7, 12, 7, 0, 7, 12, 8, 0, 7, 12, 7, 0, 7, 13, 12], STEP = 60 / 66 / 2;
    const pluck = (t, semis) => { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 82.41 * Math.pow(2, semis / 12);
      f.type = 'lowpass'; f.Q.value = 5; f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(220, t + .28);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.9, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .34); o.connect(f); f.connect(g); g.connect(alp); o.start(t); o.stop(t + .36); };
    let stepAt = now + 1.5, stepNo = 0;
    // heartbeat: scheduled just ahead of the clock so it can run forever; it tightens a little the longer you stay
    const thump = (t, v) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(36, t + .16);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .035); g.gain.exponentialRampToValueAtTime(.0001, t + .3); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .32); };
    let beatAt = now + 1.5, period = 1.45; const born = now;
    const cold = (t) => { // a bell cluster with a minor second, long decay, mostly reverb
      [[329.6, .05], [349.2, .035], [659.3, .018]].forEach(([f, v]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f * rand(.998, 1.002);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 5); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 5.2); });
    };
    const creak = (t) => { const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); n.buffer = noise; n.loop = true; f.type = 'bandpass'; f.Q.value = 14;
      f.frequency.setValueAtTime(rand(500, 900), t); f.frequency.exponentialRampToValueAtTime(rand(140, 260), t + 1.6);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .4); g.gain.exponentialRampToValueAtTime(.0001, t + 1.7); n.connect(f); f.connect(g); g.connect(bus); n.start(t, rand(0, 4)); n.stop(t + 1.8); };
    let nextEvent = now + rand(8, 14);
    const tick = setInterval(() => {
      if (ac.state !== 'running') return;
      period = Math.max(1.05, 1.45 - (ac.currentTime - born) / 400);
      while (stepAt < ac.currentTime + 1.5) { pluck(stepAt, SEQ[stepNo++ % SEQ.length]); stepAt += STEP; }
      while (beatAt < ac.currentTime + 1.5) { thump(beatAt, .5); thump(beatAt + .19, .32); beatAt += period; }
      if (ac.currentTime > nextEvent) { const r = Math.random(); if (r < .35) cold(ac.currentTime + .1); else if (r < .7) creak(ac.currentTime + .1); else playImpact(.45); nextEvent = ac.currentTime + rand(9, 18); }
    }, 400);
    nodes.push({ stop() { clearInterval(tick); } });
    audioNodes.push(...nodes);
    $('#soundToggle').innerHTML = '◖)) <span>SOUND ON</span>'; $('#soundToggle').setAttribute('aria-label', 'Turn ambient sound off');
  }
  // Sound is on by default. Browsers only allow audio after a gesture, so start now if this one allows it, otherwise on the first
  // click or key press (not on the sound button itself, whose own click decides).
  (async () => {
    if (soundMuted) return;
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
    const probe = new Ctx(), allowed = probe.state === 'running'; probe.close().catch(() => {});
    if (allowed) { startSound(); return; }
    const unlock = e => {
      if (e.target.closest?.('#soundToggle')) return;
      ['pointerdown', 'keydown', 'touchstart'].forEach(t => removeEventListener(t, unlock, true));
      startSound();
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach(t => addEventListener(t, unlock, true));
  })();
  // Fullscreen: hidden where the browser has no Fullscreen API (e.g. iPhone Safari).
  const fsButton = $('#fullscreenButton'), fsRoot = document.documentElement;
  const fsRequest = fsRoot.requestFullscreen || fsRoot.webkitRequestFullscreen;
  const fsActive = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const paintFullscreen = () => { fsButton.textContent = fsActive() ? '⤡ EXIT FULLSCREEN' : '⤢ FULLSCREEN'; fsButton.setAttribute('aria-label', fsActive() ? 'Exit full screen' : 'Enter full screen'); };
  if (!fsRequest) fsButton.hidden = true;
  fsButton.addEventListener('click', () => {
    if (fsActive()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else fsRequest.call(fsRoot).catch?.(() => {});
  });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, paintFullscreen));
  paintFullscreen();
  $('#soundToggle').addEventListener('click',()=>{ if (audioContext) { setSoundMuted(true); stopSound(); } else { setSoundMuted(false); startSound(); } });
  // ---------------------------------------------------------------------------------------------
  // File 03 stage: four puzzles played directly on the supplied artwork (assets/file-003).
  // Every control is laid over the control painted into its screen. Boxes are [x, y, w, h] in that
  // image's own pixels; f3sFit() scales them with the artwork, so they stay aligned at any window size.
  // Wrong answers get a hint first; a second wrong answer reveals the correct answer and moves on.
  const F3S_KEY='case25File003StageV2';
  const f3q=(sel,root)=>[...root.querySelectorAll(sel)];
  const F3S_CHOICE_LETTERS='ABCD';
  const P3_DOCS=[['T1','PETER SHAW’S STATEMENT','Peter reported that Thomas left The Lantern alone at approximately 20:10. The time is an estimate; the supplied file contains no independent witness corroboration.'],['T2','REAR ENTRANCE ACCESS LOG','Displayed: credential 19:52:31; door opened 19:53:02; closed 19:54:18. System clock later found seven minutes fast. Corrected: 19:45:31, 19:46:02, 19:47:18. The log records credential use, not the user’s identity.'],['T3','PARKING CAMERA INDEX','A vehicle enters the frame at displayed 20:16:11 and leaves at 20:19:04. Camera clock is unverified; plate and occupants cannot be identified.'],['T4','LAKE ASH SEARCH SUMMARY','Damaged boat located 07:10 the following morning. Watch and jacket entered into inventory at 08:05. These entries document search and inventory activity, not when Thomas disappeared.']];
  const P3_TIMELINE_CHIPS=[
    {label:'Peter’s reported departure',time:'≈ 20:10',kind:'ESTIMATED',doc:'T1'},
    {label:'Rear entrance credential presented',time:'19:45:31',kind:'CORRECTED',doc:'T2'},
    {label:'Vehicle enters parking camera frame',time:'20:16:11',kind:'UNVERIFIED',doc:'T3'},
    {label:'Damaged boat located',time:'07:10 (+1)',kind:'SEARCH RECORD',doc:'T4'},
    {label:'Watch and jacket entered into inventory',time:'08:05 (+1)',kind:'SEARCH RECORD',doc:'T4'}
  ];
  const P3_DEDUCTION_MISSING=['Correct the access-log times: the clock was seven minutes fast.','Say the credential record does not identify who used it.','Treat Peter’s 20:10 as an uncorroborated estimate.','Note that the camera clock is unverified.','Explain that the next-morning search records do not establish when Thomas disappeared.','Name what remains unknown about his movements or whether he died at Lake Ash.','List the additional evidence needed to reconstruct his movements.','Do not state murder, death at Lake Ash, or a lie as established fact.'];
  const F3S_MODELS={
    'p1-q4':'Three payments left the expansion account: T-17, T-22 and T-31. A fourth row, T-31-R, only repeated the last. One invoice, NQ-104, was reissued as NQ-104-R and never paid separately. The sheet that ties payments to invoices was never signed, and the bank never confirmed it. So ₹2.40 crore moved out of the account with nothing to show where it arrived, and nobody who could say. The statement closes at the end of June. Thomas Reed was last seen in October. Somewhere between those two dates, the story stopped being about the money.',
    'p3-q4':'Established: the rear-entrance clock was seven minutes fast, so the credential and door activity happened at 19:45:31–19:47:18 — but the log records a credential, not who used it. Reported: Peter says Thomas left alone at about 20:10, an uncorroborated estimate. Uncertain: the camera’s 20:16:11 vehicle cannot be placed because its clock is unverified and the plate and occupants are not visible; the boat (07:10) and watch and jacket (08:05) were found the next morning, but those records do not establish when Thomas disappeared or whether he died at Lake Ash. Needed: a calibrated camera clock, identification of the credential user and vehicle, independent witnesses, and phone or travel records.',
    'p4-q4':'Peter is a central suspect because the ₹2.40 crore remains unreconciled with no supporting records, his claim that Thomas left alone at about 20:10 is uncorroborated, an unknown credential opened the rear door at 20:09–20:10 — the same time as his statement — and he never supplied the requested originals despite repeated follow-ups. But the gaps are serious: nothing shows Peter received the money, the access log does not identify who used the unknown card, the camera does not show the plate or driver, and missing originals do not prove he destroyed them. Suspicion is not proof.',
    'p3-q2':'Order: rear-entrance credential at 19:45:31 (Corrected), Peter’s reported departure at about 20:10 (Estimated), the vehicle at displayed 20:16:11 (Unverified), the damaged boat at 07:10 and the watch and jacket at 08:05 the next morning (Search Record). The vehicle cannot be placed precisely: the camera clock is unverified, so its 20:16:11 cannot be aligned with the corrected venue times or Peter’s estimate.'
  };
  const F3S_SCREENS={
    opening:{kind:'transmission',kicker:'INCOMING TRANSMISSION · SOURCE: M',eyebrow:'ARCHIVE FRAGMENT 005',title:'WHAT REMAINS',text:F3_OPENING,next:'p1-cover'},
    'p1-cover':{kind:'cover',chapter:0,begin:[545,676,373,62],next:'p1-read'},
    'p1-read':{kind:'live',next:'p1-q1',puzzle:0,build:screen=>p1BuildRead(screen)},
    'p1-q1':{kind:'choice',puzzle:0,qc:{n:1,label:[428,166,190,28],dots:[998,152,116,30]},opt:[[434,390,656,55],[434,456,656,56],[434,521,656,56]],radio:[470,13],submit:[597,608,329,51],answer:0,options:F3_QUESTIONS[0].options,hint:F3_QUESTIONS[0].hint,explain:F3_QUESTIONS[0].explain,next:'p1-q2'},
    'p1-q2':{kind:'choice',puzzle:0,qc:{n:2,label:[374,180,206,28],dots:[1030,166,100,30]},opt:[[382,387,716,55],[382,452,716,55],[382,517,716,55],[382,582,716,55]],radio:[421,13],submit:[550,664,385,57],answer:1,options:F3_QUESTIONS[1].options,hint:F3_QUESTIONS[1].hint,explain:F3_QUESTIONS[1].explain,next:'p1-q3'},
    'p1-q3':{kind:'choice',puzzle:0,qc:{n:3,label:[376,173,206,28],dots:[1018,160,100,30]},opt:[[382,409,708,55],[382,472,708,55],[382,536,708,54],[382,598,708,54]],radio:[418,13],submit:[547,680,375,54],answer:1,options:['Yes, it’s a verified record.','No, it’s not reliable enough.','Only some of the matches can be trusted.','Not enough information to say.'],hint:'Who verified the allocation sheet? Look for original approvals or signatures, and for bank confirmations behind each match.',explain:'The allocation sheet (PA-07) is an unverified copy. Its invoice matches are suggestions, not independently established facts: there are no original approvals or signatures and no supporting bank confirmations.',next:'p1-q4'},
    'p1-q4':{kind:'written',puzzle:0,qc:{n:4,label:[372,162,430,28],dots:[1096,154,104,30],text:'QUESTION 04 / 04 · FINAL DEDUCTION'},text:[380,582,770,106],submit:[583,708,371,52],grade:()=>({accepted:true,missing:[]}),doneTitle:'WHAT THE FILE SHOWS',hint:'Name the three underlying transfers and their invoices, explain T-31-R and NQ-104-R, describe PA-07 as unverified, and say what the records cannot prove.',model:F3S_MODELS['p1-q4'],next:'p1-end'},
    'p1-end':{kind:'message',cont:[996,825,426,71],next:'p2-cover'},
    'p2-cover':{kind:'cover',chapter:1,begin:[482,637,373,64],review:[[[36,140,300,92],0]],next:'p2-q1'},
    'p2-q1':{kind:'written',puzzle:1,docs:'p2',docBtn:[636,814,400,44],text:[450,543,755,140],submit:[618,704,418,63],grade:t=>evaluateP2(t,0),hint:P2_QUESTIONS[0].hint,model:P2_QUESTIONS[0].explain,next:'p2-q2'},
    'p2-q2':{kind:'written',puzzle:1,docs:'p2',docBtn:[635,806,400,44],text:[478,534,714,139],submit:[630,700,410,63],grade:t=>evaluateP2(t,1),hint:P2_QUESTIONS[1].hint,model:P2_QUESTIONS[1].explain,next:'p2-q3'},
    'p2-q3':{kind:'written',puzzle:1,docs:'p2',docBtn:[639,812,390,44],text:[451,557,760,132],submit:[639,713,390,56],grade:t=>evaluateP2(t,2),hint:P2_QUESTIONS[2].hint,model:P2_QUESTIONS[2].explain,next:'p2-q4'},
    'p2-q4':{kind:'written',puzzle:1,docs:'p2',docBtn:[635,830,400,44],text:[446,578,782,132],submit:[604,730,463,56],grade:t=>evaluateP2(t,3),hint:P2_QUESTIONS[3].hint,model:P2_QUESTIONS[3].explain,next:'p2-end'},
    'p2-end':{kind:'transmission',kicker:'INCOMING TRANSMISSION · SOURCE: M',eyebrow:'SOURCE ANALYSIS COMPLETE',title:'YOU FOUND THE OMISSION.',text:P2_TRANSMISSION,next:'p3-cover'},
    'p3-cover':{kind:'cover',chapter:2,begin:[507,676,485,92],review:[[[36,138,272,66],0],[[36,222,272,64],1]],next:'p3-q1'},
    'p3-q1':{kind:'times',puzzle:2,docs:'p3',focus:[[30,50,272,560],[330,40,670,815],[1015,212,395,515],[1428,392,225,180]],times:[[597,634,210,33],[597,678,210,33],[597,723,210,33]],evidence:[386,795,272,50],submit:[700,795,253,50],hint:'The clock ran seven minutes fast. Subtract seven minutes from each displayed time.',model:'The clock was seven minutes fast, so subtract seven minutes from each displayed time: credential presented 19:45:31, door opened 19:46:02, door closed 19:47:18. These times record credential use and door activity; they do not identify the person.',next:'p3-q2'},
    'p3-q2':{kind:'timeline',puzzle:2,docs:'p3',chips:[[397,341,336,49],[746,341,332,49],[397,398,336,49],[746,398,332,49],[397,455,336,48]],rows:[[447,586,279,22],[447,617,279,22],[447,647,279,22],[447,678,279,22],[447,708,279,22]],timeCol:[748,167],selCol:[943,135],text:[385,815,703,40],evidence:[391,866,303,49],submit:[745,866,341,49],model:F3S_MODELS['p3-q2'],next:'p3-q3'},
    'p3-q3':{kind:'choice',puzzle:2,docs:'p3',faces:true,opt:[[434,489,679,64],[434,563,679,62],[434,636,679,64],[434,712,679,63]],evidence:[436,796,328,60],submit:[803,796,311,60],answer:2,options:['Peter definitely lied because the access log shows someone at the rear entrance earlier.','The vehicle on camera proves Peter followed Thomas.','Peter’s account remains uncorroborated, but the records do not conclusively disprove it.','The recovered watch proves Thomas died at Lake Ash.'],hint:'Which record identifies a person? The access log records a credential, and the camera cannot identify the plate or occupants.',explain:'Peter’s account remains uncorroborated, but the supplied records do not conclusively disprove it. The log records a credential, not a person; the camera cannot identify the vehicle’s occupants; and the search summary does not establish when Thomas disappeared.',next:'p3-q4'},
    'p3-q4':{kind:'written',puzzle:2,docs:'p3',text:[425,582,728,190],counter:[[968,744,176,18],1000,'characters'],evidence:[427,791,323,61],submit:[781,791,372,61],grade:t=>{const r=p3DeductionResult(t);return {accepted:r.accepted,missing:r.missing.map(i=>P3_DEDUCTION_MISSING[i])};},hint:'Separate established facts, reported claims, unknowns, and the evidence you would still need.',model:F3S_MODELS['p3-q4'],next:'p3-end'},
    'p3-end':{kind:'transmission',kicker:'INCOMING TRANSMISSION · SOURCE: M',eyebrow:'TIMELINE REVIEWED',title:'THE CLOCK WAS NEVER THE PROBLEM.',text:`You corrected the clock.\n\nYou separated the record from the witness.\n\nBut you could not establish the moment the story changed.\n\nThat is not a failure of calculation, Detective.\n\nIt is a failure of the evidence.\n\nOne thread is still loose.\nIt runs through every file you have opened.\n\nPull it carefully.\n\n— M`,next:'p4-cover'},
    'p4-cover':{kind:'live',next:'p4-q1',chapter:3,build:screen=>cineStory(screen,P4_STORY,'lakenight',()=>f3sGo('p4-q1'))},
    'p4-q1':{kind:'live',next:'p4-q2',puzzle:3,build:screen=>p4BuildQ(screen,0)},
    'p4-q2':{kind:'live',next:'p4-q3',puzzle:3,build:screen=>p4BuildQ(screen,1)},
    'p4-q3':{kind:'live',next:'p4-q4',puzzle:3,build:screen=>p4BuildQ(screen,2)},
    'p4-q4':{kind:'live',next:'p4-end',puzzle:3,build:p4BuildChain},
    'p4-end':{kind:'transmission',kicker:'INCOMING TRANSMISSION · SOURCE: M',eyebrow:'LAKE ASH · REVIEWED',title:'THE LAKE REMEMBERS.',text:`You counted the minutes.\n\nYou ruled out the one who was already in the air.\n\nA boat in one name. A card in the same name. A message that gave a reason.\n\nEvery piece you chose points the same way.\n\nThere is only one person left to ask.\n\n— M`,next:'p5-cover'},
    'p5-cover':{kind:'live',next:'p5-q1',chapter:4,build:screen=>cineStory(screen,P5_STORY,'interview',()=>f3sGo('p5-q1'))},
    'p5-q1':{kind:'live',next:'p5-q2',puzzle:3,build:p5BuildInterview},
    'p5-q2':{kind:'live',next:'p5-q3',puzzle:3,build:p5BuildConclusion},
    'p5-q3':{kind:'live',next:'final',puzzle:3,build:p5BuildM},
    // M's closing letter (final.png) is taller than 16:9, so it is shown whole rather than cropped.
    final:{kind:'message',fit:'contain',art:'final-blank',arrive:'ink',letter:[412,318,1095,1180],cont:[588,1573,688,115],next:'arrest'},
    // Peter is taken into custody: a night street outside The Lantern, then the morning paper spins in.
    arrest:{kind:'live',next:'gift',arrive:'ink',build:screen=>arrestScene(screen,()=>f3sGo('gift'))},
    // Thank-you card before the physical gift is handed over; its CONTINUE ends File 03.
    gift:{kind:'message',art:'gift-blank',arrive:'closed',giftCard:true,cont:[552,701,431,82],label:'GOOD JOB, DETECTIVE',next:null,finish:true}
  };
  const F3S_CHAPTERS=[['PUZZLE 01','NORTH QUAY'],['PUZZLE 02','THE MISSING STORY'],['PUZZLE 03','THE IMPOSSIBLE TIMELINE'],['PUZZLE 04','THE UNRESOLVED THREAD'],['PUZZLE 05','THE FINAL TRANSMISSION']];
  function readF3S(){const fresh={screen:'opening',done:{},attempts:{},drafts:{},picks:{}};try{return {...fresh,...JSON.parse(localStorage.getItem(F3S_KEY)||'{}')};}catch{return fresh;}}
  let f3s=readF3S(),f3sBusy=false;
  function saveF3S(){try{localStorage.setItem(F3S_KEY,JSON.stringify(f3s));}catch{}}
  const f3sEsc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const f3sBox=([x,y,w,h])=>`--x:${x};--y:${y};--w:${w};--h:${h}`;
  function f3sFit(screen){
    const img=screen.querySelector('.f3s-art'),layer=screen.querySelector('.f3s-layer'),stage=$('#f3Stage');
    if(!img||!img.naturalWidth)return;
    const W=stage.clientWidth,H=stage.clientHeight,nw=img.naturalWidth,nh=img.naturalHeight;
    // fill the screen only when that crops almost nothing; otherwise show the whole artwork over a blurred copy of itself
    const crop=Math.abs((W/H)/(nw/nh)-1);
    const fit=Math.min(W/nw,H/nh),fill=Math.max(W/nw,H/nh);
    const scale=screen.dataset.fit==='contain'?fit:Math.min(fill,fit*1.065);
    Object.assign(layer.style,{width:`${nw*scale}px`,height:`${nh*scale}px`,left:`${(W-nw*scale)/2}px`,top:`${(H-nh*scale)/2}px`});
    layer.style.setProperty('--u',scale);
  }
  addEventListener('resize',()=>$$('#f3Stage .f3s-screen').forEach(f3sFit));

  function openF3Stage(){
    clearTimers();
    const stage=$('#f3Stage');delete stage.dataset.mode;stage.hidden=false;
    $('#backButton').disabled=false;
    requestAnimationFrame(()=>stage.classList.add('visible'));
    f3sGo(f3s.screen||'opening',{resume:true});
  }
  // File 004 has its own score: The Lantern after hours. A slow minor piano under a long reverb, a soft upright bass,
  // brushed hi-hat, vinyl crackle, and underneath it the low roar of a fire that keeps getting closer.
  let f4Audio=null;
  function f4ScoreStart(){
    f4ScoreStop();ensureSound();const c=audioContext;if(!c)return;
    const prev=musicWanted;setMusic(false);
    const out=c.createGain();out.gain.setValueAtTime(.0001,c.currentTime);out.gain.exponentialRampToValueAtTime(.9,c.currentTime+4);out.connect(c.destination);
    const ir=c.createBuffer(2,c.sampleRate*3.2,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);}
    const verb=c.createConvolver(),wet=c.createGain();verb.buffer=ir;wet.gain.value=.6;verb.connect(wet);wet.connect(out);
    const bus=c.createGain();bus.gain.value=1;bus.connect(out);bus.connect(verb);
    const timers=[],nodes=[];
    const piano=(f,t,v=.07,len=3.2)=>{[1,2,3].forEach((h,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=i?'sine':'triangle';o.frequency.value=f*h;o.detune.value=(Math.random()-.5)*6;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v/(h*h*.8+.2),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+len/(h*.7+.3));o.connect(g);g.connect(bus);o.start(t);o.stop(t+len+.1);});};
    const bass=(f,t)=>{const o=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();o.type='triangle';o.frequency.value=f;lp.type='lowpass';lp.frequency.value=320;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.28,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.9);o.connect(lp);lp.connect(g);g.connect(bus);o.start(t);o.stop(t+1);};
    const nbuf=c.createBuffer(1,c.sampleRate*2,c.sampleRate),nd=nbuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    const brush=(t,v=.025)=>{const s=c.createBufferSource(),hp=c.createBiquadFilter(),g=c.createGain();s.buffer=nbuf;hp.type='highpass';hp.frequency.value=6500;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.22);s.connect(hp);hp.connect(g);g.connect(bus);s.start(t,Math.random());s.stop(t+.25);};
    // D minor, slow: Dm9 – Bbmaj7 – Gm7 – A7(b9)
    const N=n=>440*Math.pow(2,(n-69)/12);
    const prog=[{ch:[62,65,69,72,64],b:[38,45,38,41]},{ch:[58,62,65,69],b:[34,41,34,38]},{ch:[55,58,62,65],b:[31,38,31,34]},{ch:[57,61,64,67,70],b:[33,40,33,37]}];
    const beat=60/58;let bar=0,next=c.currentTime+1.2;
    const sched=()=>{while(next<c.currentTime+2.5){const p=prog[bar%4];
        p.ch.forEach((n,i)=>piano(N(n),next+i*.035,.05));
        if(bar%2===1)[0,1,2].forEach(k=>piano(N(p.ch[(k+bar)%p.ch.length]+12),next+beat*(2+k*.5),.03,2.2));
        p.b.forEach((n,k)=>bass(N(n),next+k*beat));
        for(let k=0;k<4;k++){brush(next+k*beat,.02);brush(next+k*beat+beat*.66,.012);}
        next+=beat*4;bar++;}};
    sched();timers.push(setInterval(sched,500));
    // vinyl crackle
    timers.push(setInterval(()=>{const t=c.currentTime,o=c.createBufferSource(),g=c.createGain(),hp=c.createBiquadFilter();o.buffer=nbuf;hp.type='highpass';hp.frequency.value=2500;g.gain.setValueAtTime(.05+Math.random()*.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+.012);o.connect(hp);hp.connect(g);g.connect(out);o.start(t,Math.random());o.stop(t+.02);},90));
    // the fire underneath
    const fire=c.createBufferSource(),flp=c.createBiquadFilter(),fg=c.createGain();fire.buffer=nbuf;fire.loop=true;flp.type='lowpass';flp.frequency.value=260;fg.gain.value=.07;fire.connect(flp);flp.connect(fg);fg.connect(out);fire.start();nodes.push(fire);
    const fl=c.createOscillator(),flg=c.createGain();fl.frequency.value=.11;flg.gain.value=.05;fl.connect(flg);flg.connect(fg.gain);fl.start();nodes.push(fl);
    f4Audio={out,timers,nodes,prev};
  }
  function f4ScoreStop(){
    if(!f4Audio)return;const a=f4Audio;f4Audio=null;a.timers.forEach(clearInterval);
    try{a.out.gain.setTargetAtTime(.0001,audioContext.currentTime,.5);setTimeout(()=>a.nodes.forEach(n=>{try{n.stop();}catch{}}),2500);}catch{}
    setMusic(a.prev);
  }
  function closeF3Stage(){
    f4ScoreStop();
    const stage=$('#f3Stage');stage.classList.remove('visible');f3sCloseModal();
    $('#backButton').disabled=!sceneHistory.length;
    setTimeout(()=>{stage.hidden=true;stage.querySelectorAll('.f3s-screen').forEach(s=>s.remove());},600);
  }
  // Review: replay a finished puzzle from its first question, with a way back to where the player was.
  const F3S_PUZZLE_START=['p1-q1','p2-q1','p3-q1','p4-q1'];
  function f3sReview(n){if(f3sBusy)return;if(!f3s.reviewFrom)f3s.reviewFrom=f3s.screen;f3sGo(F3S_PUZZLE_START[n]);}
  // A HINT button on every question: the player can ask for a nudge before getting anything wrong
  const F3S_EXTRA_HINTS={
    'p3-q2':'Use the corrected access time (19:45:31) first, then Peter’s estimate (≈20:10), then the camera (20:16:11). The two search records from the next morning go last. Label each by how trustworthy its clock is: Corrected, Estimated, Unverified, Search record.',
    'p4-q4':'A case needs three things: means (how he could do it), opportunity (that he was there) and motive (why). Find one document for each: the boat, the road, and what Peter gains.'};
  let f3sHintText='';
  function f3sSetHint(t){f3sHintText=t||'';const b=$('#f3sHint');if(b)b.hidden=!f3sHintText;}
  $('#f3sHint').addEventListener('click',()=>{if(!f3sHintText||f3sBusy)return;f3sModal({tone:'hint',title:'A NOTE FROM THE FILE',body:`<p>${f3sEsc(f3sHintText)}</p>`,actions:[['BACK TO THE QUESTION',f3sCloseModal]]});});
  function f3sGo(id,{resume=false}={}){
    if(/^p1-q\d$/.test(id)&&!(f3s.live&&f3s.live.p1read))id='p1-read';
    const def=F3S_SCREENS[id];if(!def)return;
    ensureSound();
    $('#f3sP1Docs').hidden=!/^p1-q/.test(id);
    f3sSetHint(def.hint||F3S_EXTRA_HINTS[id]||'');
    if(id==='p1-read')$('#f3sList').hidden=true;
    if(id===f3s.reviewFrom)f3s.reviewFrom=null;
    f3s.screen=id;saveF3S();
    $('#f3sList').hidden=!Number.isInteger(def.puzzle)||id==='p1-read';$('#f3sList').dataset.target=['p1-cover','p2-cover','p3-cover','p4-cover'][def.puzzle]||'';
    const back=$('#f3sReturn');back.hidden=!f3s.reviewFrom;if(f3s.reviewFrom)back.textContent=`← RETURN TO ${F3S_CHAPTERS[F3S_SCREENS[f3s.reviewFrom].puzzle??F3S_SCREENS[f3s.reviewFrom].chapter??3][0]}`;
    const chapter=Number.isInteger(def.chapter)&&!resume?def.chapter:null;
    if(chapter!==null)f3sChapterCard(chapter,()=>f3sMount(id,{fromChapter:true}));
    else f3sMount(id);
    [def.next,def.next&&F3S_SCREENS[def.next]?.next].filter(n=>n&&!F3S_SCREENS[n].kind.includes('transmission')&&F3S_SCREENS[n].kind!=='live').forEach(n=>{const i=new Image();i.src=`assets/file-003/${n}.png`;});
  }
  function f3sChapterCard(index,done){
    const card=$('#f3sChapter'),[kicker,title]=F3S_CHAPTERS[index],small=card.querySelector('small'),h=card.querySelector('h2'),rule=card.querySelector('i');
    card.querySelector('.f3s-solved')?.remove();
    const showTitle=()=>{
      // the next puzzle on its own screen: the lamp relights behind it and the title types in
      small.textContent=kicker;h.textContent='';small.style.visibility=rule.style.visibility='';
      card.hidden=false;card.classList.remove('out','solved');void card.offsetWidth;card.classList.add('in');
      if(reducedMotion){h.textContent=title;laterWait(()=>{card.hidden=true;done();},900);return;}
      let i=0;const type=()=>{keyTick();h.textContent=title.slice(0,++i);if(i<title.length)laterWait(type,70);else laterWait(()=>{card.classList.add('out');laterWait(()=>{card.hidden=true;card.classList.remove('in','out');},900);done();},1300);};
      laterWait(type,700);
    };
    if(index<1||index>4){$$('#f3Stage .f3s-screen').forEach(s=>{s.classList.add('leave');setTimeout(()=>s.remove(),900);});showTitle();return;}
    // first, its own screen: the puzzle just finished is stamped SOLVED, then the screen fades to black
    small.textContent='';h.textContent='';small.style.visibility=rule.style.visibility='hidden';
    const st=document.createElement('b');st.className='f3s-solved big';st.textContent=`${F3S_CHAPTERS[index-1][0]} · SOLVED`;card.prepend(st);
    const sub=document.createElement('b');sub.className='f3s-solved-name';sub.textContent=F3S_CHAPTERS[index-1][1];st.after(sub);
    const ink=reducedMotion?0:1500;
    if(!reducedMotion){f3sInk($$('#f3Stage .f3s-screen'));sfx('ink');}
    // the solved stamp surfaces out of the ink, holds, then sinks back into black before the next title
    laterWait(()=>{card.hidden=false;card.classList.remove('out','in');card.classList.add('solved','from-ink');void card.offsetWidth;card.classList.add('in');laterWait(()=>sfx('stamp'),reducedMotion?0:500);},ink);
    laterWait(()=>{card.classList.add('out');laterWait(()=>{st.remove();sub.remove();card.hidden=true;card.classList.remove('in','out','solved','from-ink');laterWait(showTitle,250);},900);},ink+(reducedMotion?600:2400));
  }
  // Puzzle openings, one per puzzle: 1 lamp swing, 2 the lamp catches, 3 lamp swing, 4 a match strike, 5 a film burn.
  const F3S_OPENINGS=['swing','catch','swing','match','burn'];
  function f3sGlow(bg,frames,ms){
    const g=document.createElement('div');g.className='f3s-glow';g.style.background=bg;$('#f3Stage').insertBefore(g,$('#f3sChapter'));
    g.animate(frames,{duration:ms,fill:'forwards'}).finished.catch(()=>{}).then(()=>g.remove());
  }
  function f3sInk(old){
    const stage=$('#f3Stage');
    const ink=document.createElement('div');ink.className='f3s-ink';stage.insertBefore(ink,$('#f3sChapter'));
    const drops=[[50,48,0,1],[30,32,180,.8],[72,64,320,.9],[64,24,440,.7],[24,72,560,.85],[84,40,620,.6],[42,82,700,.7],[12,18,780,.6]];
    const shapes=['47% 53% 41% 59% / 55% 44% 56% 45%','58% 42% 52% 48% / 46% 57% 43% 54%','44% 56% 61% 39% / 52% 41% 59% 48%','53% 47% 45% 55% / 60% 50% 50% 40%'];
    drops.forEach(([x,y,d,k],n)=>{const b=document.createElement('i');b.style.left=x+'%';b.style.top=y+'%';b.style.borderRadius=shapes[n%4];b.style.width=b.style.height=(190*k)+'vmax';ink.append(b);
      b.animate([{transform:'translate(-50%,-50%) scale(0)'},{transform:'translate(-50%,-50%) scale(.18)',offset:.15},{transform:'translate(-50%,-50%) scale(1)'}],{duration:1500,delay:d,easing:'cubic-bezier(.3,0,.2,1)',fill:'both'});});
    old.forEach(s=>{s.style.pointerEvents='none';setTimeout(()=>s.remove(),2100);});
    ink.animate([{opacity:1,filter:'blur(0)'},{opacity:1,offset:.55,filter:'blur(0)'},{opacity:0,filter:'blur(18px)'}],{duration:3800,easing:'ease-in-out',fill:'forwards'}).finished.catch(()=>{}).then(()=>ink.remove());
  }
  function f3sArrive(screen,mode,old){
    const drop=(ms)=>old.forEach(s=>{s.style.pointerEvents='none';setTimeout(()=>s.remove(),ms);});
    if(mode==='swing'){
      drop(400);
      screen.animate([{clipPath:'circle(0% at 92% 8%)',filter:'brightness(1.3)'},{clipPath:'circle(42% at 70% 30%)',filter:'brightness(1.15)',offset:.5},{clipPath:'circle(150% at 50% 50%)',filter:'brightness(1)'}],{duration:2400,easing:'cubic-bezier(.5,0,.2,1)',fill:'backwards'});
      f3sGlow('radial-gradient(circle at 92% 8%,rgba(255,200,120,.5),transparent 42%)',[{opacity:0},{opacity:1,offset:.3},{opacity:0}],2400);
    }else if(mode==='catch'){
      drop(400);
      screen.animate([{opacity:0,filter:'brightness(0)'},{opacity:1,filter:'brightness(.7)',offset:.1},{filter:'brightness(.05)',offset:.18},{filter:'brightness(.8)',offset:.28},{filter:'brightness(.15)',offset:.34},{filter:'brightness(.6)',offset:.5},{opacity:1,filter:'brightness(1)'}],{duration:2600,easing:'ease-out',fill:'backwards'});
    }else if(mode==='match'){
      drop(400);
      f3sGlow('radial-gradient(circle at 50% 62%,#fff1c4 0,#ffb24a 3%,rgba(255,120,30,.35) 9%,transparent 18%)',[{opacity:0},{opacity:1,offset:.08},{opacity:.6,offset:.2},{opacity:.9,offset:.3},{opacity:0}],2600);
      screen.animate([{clipPath:'circle(0% at 50% 62%)',filter:'sepia(.6) brightness(1.4)'},{clipPath:'circle(6% at 50% 62%)',offset:.25},{clipPath:'circle(150% at 50% 62%)',filter:'sepia(0) brightness(1)'}],{duration:2600,delay:200,easing:'cubic-bezier(.55,0,.25,1)',fill:'backwards'});
    }else if(mode==='burn'){
      drop(400);
      f3sGlow('radial-gradient(ellipse at 40% 55%,#ffd79a,#ff8a2a 35%,rgba(120,30,0,.6) 65%,transparent 85%)',[{opacity:0},{opacity:1,offset:.35},{opacity:0}],1500);
      screen.animate([{opacity:0,filter:'brightness(1.8) sepia(.6)'},{opacity:1,filter:'brightness(1) sepia(0)'}],{duration:1400,delay:450,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
    }else if(mode==='ink'){
      // ink drops onto the page and spreads until everything is black; the next page surfaces out of the ink
      f3sInk(old);
    }else if(mode==='closed'){
      // no words: the letter is drawn back into the dark, a thin line of warm light opens across the middle like a door,
      // and the card is revealed outward from it, then settles in with a soft flare
      const D=4600;
      old.forEach(o=>{o.style.pointerEvents='none';o.style.zIndex=4;o.style.transformOrigin='50% 60%';
        o.animate([{transform:'scale(1) rotate(0)',opacity:1,filter:'brightness(1) blur(0)'},{transform:'scale(.94) rotate(-1.2deg)',opacity:.7,filter:'brightness(.35) blur(2px)',offset:.55},{transform:'scale(.88) rotate(-2.4deg) translateY(4%)',opacity:0,filter:'brightness(0) blur(8px)'}],{duration:1900,easing:'cubic-bezier(.5,0,.7,.4)',fill:'forwards'});
        setTimeout(()=>o.remove(),2000);});
      const wrap=document.createElement('div');wrap.className='f3s-closed';
      wrap.innerHTML='<i class="cl-line"></i><i class="cl-flare"></i>';
      $('#f3Stage').insertBefore(wrap,$('#f3sChapter'));
      const line=wrap.querySelector('.cl-line'),flare=wrap.querySelector('.cl-flare');
      screen.animate([{clipPath:'inset(50% 0 50% 0)',filter:'brightness(1.8)'},{clipPath:'inset(50% 0 50% 0)',offset:.42,filter:'brightness(1.8)'},{clipPath:'inset(18% 0 18% 0)',offset:.68,filter:'brightness(1.3)'},{clipPath:'inset(0 0 0 0)',filter:'brightness(1)'}],{duration:D,easing:'cubic-bezier(.45,0,.2,1)',fill:'backwards'});
      line.animate([{opacity:0,transform:'scaleX(0)'},{opacity:1,transform:'scaleX(.35)',offset:.25},{opacity:1,transform:'scaleX(1)',offset:.45},{opacity:1,offset:.7},{opacity:0,transform:'scaleX(1)'}],{duration:D,easing:'ease-in-out',fill:'forwards'});
      flare.animate([{opacity:0},{opacity:0,offset:.4},{opacity:.9,offset:.55},{opacity:0}],{duration:D,fill:'forwards'});
      wrap.animate([{opacity:1},{opacity:1,offset:.9},{opacity:0}],{duration:D+300,fill:'forwards'}).finished.catch(()=>{}).then(()=>wrap.remove());
      sfx('dread');setTimeout(()=>sfx('ink'),1900);
    }else if(mode==='seal'){
      // a red M seal fills the dark, cracks in two, and the letter is waiting behind it
      drop(300);
      const wrap=document.createElement('div');wrap.className='f3s-glow f3s-seal-wrap';$('#f3Stage').insertBefore(wrap,$('#f3sChapter'));
      const seal=document.createElement('div');seal.className='f3s-seal';seal.textContent='M';wrap.append(seal);
      screen.animate([{opacity:0},{opacity:0,offset:.55},{opacity:1}],{duration:2600,fill:'backwards'});
      wrap.animate([{opacity:1},{opacity:1,offset:.75},{opacity:0}],{duration:2600,fill:'forwards'});
      seal.animate([{transform:'scale(.2)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:420,delay:200,easing:'cubic-bezier(.3,1.3,.4,1)',fill:'both'});
      setTimeout(()=>{sfx('stamp');const l=seal.cloneNode(true),r=seal.cloneNode(true);l.style.clipPath='polygon(0 0,54% 0,46% 100%,0 100%)';r.style.clipPath='polygon(54% 0,100% 0,100% 100%,46% 100%)';seal.remove();wrap.append(l,r);
        l.animate([{transform:'none'},{transform:'translate(-55vw,8vh) rotate(-35deg)'}],{duration:1000,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});
        r.animate([{transform:'none'},{transform:'translate(55vw,8vh) rotate(35deg)'}],{duration:1000,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});},1300);
      setTimeout(()=>wrap.remove(),2700);
    }else if(mode==='relight'){
      // the room goes dark, holds, and a single warm light comes up on the card
      drop(700);
      screen.animate([{opacity:0,filter:'brightness(0)'},{opacity:0,offset:.3},{opacity:1,filter:'brightness(.35)',offset:.6},{opacity:1,filter:'brightness(1)'}],{duration:3200,easing:'ease-in-out',fill:'backwards'});
      f3sGlow('radial-gradient(ellipse 40% 35% at 50% 45%,rgba(255,190,110,.35),transparent 70%)',[{opacity:0},{opacity:0,offset:.4},{opacity:1,offset:.7},{opacity:0}],3600);
    }else if(mode==='dive'){
      // from a puzzle's cover into its first page: the camera pushes into the case file, the room falls away,
      // and the first page settles out of the dark
      old.forEach(o=>{o.style.zIndex=5;o.style.pointerEvents='none';
        o.animate([{transform:'scale(1)',filter:'brightness(1) blur(0)',opacity:1},{transform:'scale(1.12)',filter:'brightness(.6) blur(2px)',opacity:.9,offset:.3},{transform:'scale(1.45)',filter:'brightness(.1) blur(10px)',opacity:0,offset:.55},{transform:'scale(1.5)',opacity:0}],{duration:1500,easing:'cubic-bezier(.55,0,.35,1)',fill:'forwards'});
        setTimeout(()=>o.remove(),1550);});
      screen.animate([{opacity:0,transform:'scale(.94)',filter:'brightness(.2) blur(6px)'},{opacity:0,offset:.5},{opacity:1,transform:'scale(1)',filter:'brightness(1) blur(0)'}],{duration:2100,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
      f3sGlow('radial-gradient(ellipse at center,transparent 30%,rgba(110,6,4,.75) 100%)',[{opacity:0},{opacity:1,offset:.4},{opacity:.4,offset:.5},{opacity:.9,offset:.58},{opacity:0}],2000);
      f3sGlow('repeating-linear-gradient(0deg,rgba(0,0,0,.45) 0 2px,transparent 2px 4px)',[{opacity:0},{opacity:.8,offset:.4},{opacity:0}],1700);
      sfx('ink');
    }else if(mode==='sweep'){
      drop(1400);
      screen.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1300,easing:'cubic-bezier(.6,0,.3,1)',fill:'backwards'});
      const band=document.createElement('div');band.className='f3s-glow f3s-band';$('#f3Stage').insertBefore(band,$('#f3sChapter'));
      band.animate([{transform:'translateX(-40%)'},{transform:'translateX(340%)'}],{duration:1300,easing:'cubic-bezier(.6,0,.3,1)',fill:'forwards'}).finished.catch(()=>{}).then(()=>band.remove());
    }else if(mode==='turn'){
      old.forEach(s=>{s.style.zIndex=5;s.style.pointerEvents='none';s.style.transformOrigin='0 50%';
        s.animate([{transform:'perspective(1600px) rotateY(0)',filter:'brightness(1)'},{transform:'perspective(1600px) rotateY(-95deg)',filter:'brightness(.3)'}],{duration:1100,easing:'cubic-bezier(.5,0,.6,1)',fill:'forwards'});
        setTimeout(()=>s.remove(),1150);});
    }
  }
  // A case sidebar on the live puzzle pages, like the painted ones: the five puzzles, the current one marked, and the step.
  // Puzzle 4 has four questions. Puzzle 5 has six: the four interview rounds, the conclusion and Who is M.
  const F3S_STEPS={4:{steps:['THE BOAT','THE ROAD','THE BLOOD','BUILD THE CASE'],names:['THE HIRE SLIP','THE ROAD TO THE LAKE','THE BLOOD ON THE BOAT','BUILD THE CASE']},
    5:{steps:['ROUND 1','ROUND 2','ROUND 3','ROUND 4','THE CONCLUSION','WHO IS M?'],names:['THE INTERVIEW · ROUND 1','THE INTERVIEW · ROUND 2','THE INTERVIEW · ROUND 3','THE INTERVIEW · ROUND 4','THE CONCLUSION','WHO IS M?']}};
  const f3sQIndex=(P,q)=>P===5?({1:1,2:5,3:6})[q]:q;
  function f3sSide(screen,id){
    const m=id.match(/^p([45])-q(\d)$/),desk=screen.querySelector('.f4-desk');if(!m||!desk)return;
    const P=Number(m[1]),{steps}=F3S_STEPS[P];
    desk.classList.add('with-side');
    // header in the same layout as puzzles 1 to 3: a paper tag with the puzzle's name, the question count with its dots,
    // and the question's own title
    const head=desk.querySelector('.f4-head');
    if(head){
      const lead=head.querySelector('p')?.textContent||'';
      head.className='f4-head qh';
      head.innerHTML=`<div class="qh-tag"><span>${f3sEsc(F3S_CHAPTERS[P-1][1])}</span></div><div class="qh-count"></div><h2></h2><p>${f3sEsc(lead)}</p>`;
    }
    const side=document.createElement('aside');side.className='f3s-side';
    side.innerHTML=`<header><b>CASE 25</b><small>THE LAST TRANSMISSION</small></header>`+
      F3S_CHAPTERS.slice(0,5).map(([k,t],i)=>`<div class="${i+1<P?'done':i+1===P?'on':''}"><small>${k.replace('PUZZLE 0','PUZZLE ')}</small>${f3sEsc(t)}</div>`).join('')+`<footer></footer>`;
    desk.prepend(side);
    f3sSetQ(screen,P,f3sQIndex(P,Number(m[2])));
  }
  // the question count, dots and title follow the question actually on screen (the interview moves through four)
  function f3sSetQ(screen,P,q){
    const {steps,names}=F3S_STEPS[P],dots=steps.map((_,i)=>`<i class="${i<q-1?'done':i===q-1?'on':''}"></i>`).join(''),pad=n=>String(n).padStart(2,'0');
    const c=screen.querySelector('.qh-count'),h=screen.querySelector('.f4-head.qh h2'),f=screen.querySelector('.f3s-side footer');
    if(c)c.innerHTML=`QUESTION ${pad(q)} / ${pad(steps.length)}<span>${dots}</span>`;
    if(h)h.textContent=names[q-1];
    if(f)f.innerHTML=`<small>QUESTION ${pad(q)} / ${pad(steps.length)}</small><b>${steps[q-1]}</b><span>${dots}</span>`;
  }
  function f3sMount(id,{fromChapter=false}={}){
    const def=F3S_SCREENS[id],stage=$('#f3Stage'),old=[...stage.querySelectorAll('.f3s-screen')];
    const screen=document.createElement('section');screen.className=`f3s-screen f3s-${def.kind}`+(fromChapter?' from-chapter':'');screen.dataset.screen=id;if(def.fit)screen.dataset.fit=def.fit;
    if(def.kind==='transmission')f3sBuildTransmission(screen,def);
    else if(def.kind==='live'){screen.classList.add('f4-screen');def.build(screen,id);f3sSide(screen,id);}
    else{
      screen.innerHTML=`<img class="f3s-bgblur" alt="" aria-hidden="true" src="assets/file-003/${def.art||id}.png"><div class="f3s-layer"><img class="f3s-art" alt="" src="assets/file-003/${def.art||id}.png"></div>`;
      f3sBuildControls(screen,id,def);
    }
    stage.insertBefore(screen,$('#f3sChapter'));
    const img=screen.querySelector('.f3s-art');
    // how this screen arrives: a puzzle's own lamp-light opening after its title card, a lamp sweep between questions,
    // and a page turn from the last question to M's message. Anything else keeps the plain dissolve.
    const prev=old[old.length-1],prevDef=prev&&F3S_SCREENS[prev.dataset.screen];
    let mode=null;
    if(!reducedMotion){
      if(def.arrive)mode=def.arrive;
      else if(fromChapter)mode=F3S_OPENINGS[def.chapter]||'swing';
      else if(prevDef&&(prevDef.kind==='cover'||/-cover$/.test(prev.dataset.screen)))mode='dive';
      else if(prevDef&&prev.dataset.screen!==id&&Number.isInteger(prevDef.puzzle)&&prevDef.puzzle===def.puzzle)mode='sweep';
      else if(prevDef&&Number.isInteger(prevDef.puzzle)&&!Number.isInteger(def.puzzle)&&(def.kind==='transmission'||def.kind==='message'))mode='turn';
    }
    const reveal=()=>{
      f3sFit(screen);
      if(mode){screen.classList.add('fx-on','enter');f3sArrive(screen,mode,old);}
      else{requestAnimationFrame(()=>screen.classList.add('enter'));old.forEach(s=>{s.classList.add('leave');setTimeout(()=>s.remove(),1100);});}
      if(def.kind==='transmission')f3sTypeTransmission(screen,def);
    };
    if(img&&!img.complete){img.addEventListener('load',reveal,{once:true});img.addEventListener('error',reveal,{once:true});}else reveal();
  }
  function f3sBuildTransmission(screen,def){
    screen.innerHTML=`<div class="f3s-tx-backdrop"></div><article class="f3s-tx" role="dialog" aria-label="${f3sEsc(def.title)}"><header><span class="f3s-tx-mast" aria-hidden="true"></span>${f3sEsc(def.kicker)}</header><small>${f3sEsc(def.eyebrow)}</small><h2>${f3sEsc(def.title)}</h2><div class="f3s-tx-copy" aria-live="polite"></div><button type="button" class="f3s-tx-continue" hidden>${def.finish?'RETURN TO THE WALL':'CONTINUE'} <span>→</span></button></article>`;
    screen.querySelector('.f3s-tx-continue').addEventListener('click',()=>{if(def.finish)f3sFinish();else f3sGo(def.next);});
  }
  function f3sTypeTransmission(screen,def){
    const copy=screen.querySelector('.f3s-tx-copy'),button=screen.querySelector('.f3s-tx-continue');
    const finish=()=>{copy.textContent=def.text;button.hidden=false;button.focus();};
    if(reducedMotion){finish();return;}
    let i=0;const type=()=>{if(!screen.isConnected||!button.hidden)return;keyTick();copy.textContent=def.text.slice(0,i+=2);copy.scrollTop=copy.scrollHeight;if(i<def.text.length)laterWait(type,22);else finish();};
    laterWait(type,900);
    screen.addEventListener('click',e=>{if(button.hidden&&!e.target.closest('button'))finish();});
  }
  function f3sFinish(){
    progress.unlockedChapter=Math.max(3,Number(progress.unlockedChapter)||1);progress.file03Revealed=true;progress.file03PuzzleComplete=true;persistProgress();
    // The older File 03 state is what page load checks for completion, so keep it in step.
    file03.p3.complete=true;saveFile03();
    if(progress.file04WallSeen!==true)progress.file04WallSeen=false;persistProgress();
    progress.arrestNew=false;persistProgress();
    f3s.screen='final';saveF3S();closeF3Stage();paintProgress();
    requestAnimationFrame(placeClipping);
    // the wall waits with File 003 closed; CONTINUE reveals File 004 (see #continueFileFour)
  }
// finds painted text lines inside boxes of an image: returns [[x,y,w,h],...] in image pixels
function f3sFindLines(img,boxes){
  const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;
  const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const out=[];
  for(const [bx,by,bw,bh] of boxes){
    const d=x.getImageData(bx,by,bw,bh).data,L=new Float32Array(bw*bh);
    for(let i=0;i<bw*bh;i++)L[i]=.3*d[i*4]+.59*d[i*4+1]+.11*d[i*4+2];
    const ink=new Uint8Array(bw*bh),rows=new Float32Array(bh);
    for(let y=0;y<bh;y++){const row=Array.from(L.subarray(y*bw,(y+1)*bw)).sort((a,b)=>a-b),med=row[bw>>1];
      for(let c=0;c<bw;c++){if(Math.abs(L[y*bw+c]-med)>58){ink[y*bw+c]=1;rows[y]++;}}}
    const need=Math.max(3,bw*.006);let y=0;
    while(y<bh){if(rows[y]<need){y++;continue;}let y1=y;let gap=0;
      while(y1<bh&&gap<=3){if(rows[y1]>=need)gap=0;else gap++;y1++;}
      const top=y,bot=y1-gap;y=y1;if(bot-top<6)continue;
      const cols=new Uint16Array(bw);for(let r=top;r<bot;r++)for(let c=0;c<bw;c++)cols[c]+=ink[r*bw+c];
      let c0=0,c1=bw-1;while(c0<bw&&cols[c0]<2)c0++;while(c1>0&&cols[c1]<2)c1--;if(c1-c0<12)continue;
      out.push([bx+c0,by+top,c1-c0+1,bot-top]);}
  }
  return out;
}

  // Painted text comes alive: each screen's text block is found line by line on the artwork. The heading lands like a stamp,
  // the other lines are typed in one after another; where the lines cannot be told apart, a reading lamp reveals the block.
  // M's handwritten notes bleed in like ink. Boxes are [x, y, w, h] in the artwork's own pixels.
  const F3S_TEXT={
    'p1-cover':{light:true,box:[400,200,520,460],notes:[[1265,610,270,190]]},
    'p1-q1':{box:[424,160,680,222]},'p1-q2':{box:[372,150,736,230]},'p1-q3':{box:[372,150,728,250],notes:[[1280,575,240,120]]},
    'p1-q4':{box:[370,160,790,415]},'p1-end':{box:[230,225,760,620],letter:true},
    'p2-cover':{box:[420,180,520,450],notes:[[1130,560,300,170]]},
    'p2-q1':{box:[380,150,850,385]},'p2-q2':{box:[400,150,870,380]},'p2-q3':{box:[380,150,900,400]},'p2-q4':{box:[370,150,930,420]},
    'p3-cover':{light:true,box:[420,180,600,490],notes:[[1400,470,240,190]]},
    'p3-q1':{light:true,box:[340,60,650,560],notes:[[1450,410,200,150]]},'p3-q2':{box:[385,150,700,185],notes:[[1480,660,180,170]]},
    'p3-q3':{light:true,box:[424,150,700,330],notes:[[1420,140,200,100]]},'p3-q4':{box:[415,150,750,425]},
  };
  function f3sAnimateText(screen,id){
    const cfg=F3S_TEXT[id],img=screen.querySelector('.f3s-art'),layer=screen.querySelector('.f3s-layer');
    if(!cfg||reducedMotion||f3s.done[id]||!img)return;
    const veil=(box,cls)=>{const v=document.createElement('div');v.className='f3s-veil '+cls+(cfg.light?' on-paper':'');v.setAttribute('style',f3sBox(box));layer.append(v);return v;};
    const go=()=>{
      let lines=[];try{lines=f3sFindLines(img,[cfg.box]);}catch{}
      const start=fromLamp=>{
        if(lines.length>=2&&!fromLamp){
          const tall=lines.reduce((a,b)=>b[3]>a[3]?b:a);
          let t=cfg.letter?250:350;
          lines.forEach(l=>{
            const pad=[l[0]-8,l[1]-5,l[2]+16,l[3]+10],v=veil(pad,'line');
            if(l===tall&&!cfg.letter){v.animate([{opacity:1},{opacity:0}],{duration:160,delay:t,fill:'forwards'});
              layer.animate([{transform:'none'},{transform:'translate(-2px,2px)'},{transform:'translate(2px,-1px)'},{transform:'none'}],{duration:220,delay:t+20});t+=420;return;}
            const ms=Math.min(1500,Math.max(320,l[2]*(cfg.letter?2.6:1.5)));
            v.animate([{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(0 0 0 100%)'}],{duration:ms,delay:t,easing:'linear',fill:'forwards'});
            t+=ms+(cfg.letter?140:70);
          });
          return t;
        }
        const [x,y,w,h]=cfg.box,v=veil(cfg.box,'block'),D=Math.min(4200,1400+h*4);
        v.animate([{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(100% 0 0 0)'}],{duration:D,delay:300,easing:'linear',fill:'forwards'});
        const lamp=veil([x-20,y-20,w+40,40],'lamp');
        lamp.animate([{transform:'translateY(0)',opacity:0},{opacity:1,offset:.06},{opacity:1,offset:.94},{transform:`translateY(calc(${h}px * var(--u)))`,opacity:0}],{duration:D,delay:300,easing:'linear',fill:'forwards'});
        return D+300;
      };
      const end=start(false);
      (cfg.notes||[]).forEach((n,i)=>veil(n,'ink').animate([{opacity:1},{opacity:0}],{duration:1300,delay:Math.min(end,2600)+i*300,easing:'ease-in',fill:'forwards'}));
      // a click anywhere on the artwork shows everything at once
      screen.addEventListener('pointerdown',()=>layer.querySelectorAll('.f3s-veil').forEach(v=>{v.getAnimations().forEach(a=>a.finish());v.remove();}),{once:true,capture:true});
    };
    if(img.complete&&img.naturalWidth)go();else img.addEventListener('load',go,{once:true});
  }
  function f3sBuildControls(screen,id,def){
    const layer=screen.querySelector('.f3s-layer'),add=html=>{layer.insertAdjacentHTML('beforeend',html);return layer.lastElementChild;};
    const done=!!f3s.done[id];
    // Optional focus: softly dim the decorative art outside the boxes the question actually uses.
    if(def.focus){const img=screen.querySelector('.f3s-art'),apply=()=>{const W=img.naturalWidth,H=img.naturalHeight,mid=`f3sFocus-${id}`;
      layer.insertAdjacentHTML('afterbegin',`<svg class="f3s-dim" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="${mid}-b"><feGaussianBlur stdDeviation="14"/></filter><mask id="${mid}"><rect width="${W}" height="${H}" fill="#fff"/><g filter="url(#${mid}-b)">${def.focus.map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#000"/>`).join('')}</g></mask></defs><rect width="${W}" height="${H}" fill="#050302" mask="url(#${mid})"/></svg>`);};
      if(img.complete&&img.naturalWidth)apply();else img.addEventListener('load',apply,{once:true});}
    // Puzzles 1 and 2 have no sidebar in their artwork (3 and 4 do), so draw the same one: every puzzle, done / here / locked.
    if(def.kind!=='cover'&&def.kind!=='message'&&(def.puzzle===0||def.puzzle===1)){
      const last=['p1-q4','p2-q4','p3-q4','p4-q4'],ico={
        doc:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6"/></svg>',
        lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3 M12 15v2"/></svg>',
        tick:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>'};
      const items=[...F3S_CHAPTERS.slice(0,4).map(([,t],i)=>[t,i===def.puzzle?'current':f3s.done[last[i]]?'done':'locked']),['THE FINAL TRANSMISSION',progress.file03PuzzleComplete?'done':'locked']];
      add(`<aside class="f3s-rail" aria-label="Puzzle progress"><header><b>CASE 25</b><span>THE LAST TRANSMISSION</span></header><ol>${items.map(([t,st],i)=>`<li class="${st}"${st==='current'?' aria-current="step"':''}><span class="f3s-rail-icon">${st==='locked'?ico.lock:ico.doc}</span><span class="f3s-rail-text"><small>PUZZLE ${i+1}</small>${t}</span>${st==='done'?`<span class="f3s-rail-tick" aria-label="Completed">${ico.tick}</span>`:''}</li>`).join('')}</ol></aside>`);
    }
    // Puzzle 1 has four questions, but its painted screens count to three: paint over the count and the progress dots
    if(def.qc){const q=def.qc;add(`<span class="f3s-qcount" style="${f3sBox(q.label)}">${q.text||`QUESTION 0${q.n} / 04`}</span>`);
      add(`<span class="f3s-qdots" style="${f3sBox(q.dots)}">${[1,2,3,4].map(i=>`<i class="${i<q.n?'done':i===q.n?'on':''}"></i>`).join('')}</span>`);}
    (def.review||[]).forEach(([box,n])=>add(`<button type="button" class="f3s-hit" style="${f3sBox(box)}" aria-label="Review ${F3S_CHAPTERS[n][0].toLowerCase()}: ${F3S_CHAPTERS[n][1].toLowerCase()}"></button>`).addEventListener('click',()=>f3sReview(n)));
    if(def.kind==='cover')add(`<button type="button" class="f3s-hit f3s-go" style="${f3sBox(def.begin)}" aria-label="Begin investigation"></button>`).addEventListener('click',()=>f3sGo(def.next));
    if(def.kind==='message'){
      const go=add(`<button type="button" class="f3s-hit f3s-go" style="${f3sBox(def.cont)}" aria-label="${def.label?f3sEsc(def.label):'Continue'}">${def.label?`<span class="f3s-go-label">${f3sEsc(def.label)}</span>`:''}</button>`);
      go.addEventListener('click',()=>{if(screen.classList.contains('typing'))return;if(def.finish)f3sFinish();else f3sGo(def.next);});
      if(def.giftCard)f3sGiftCard(screen,add(`<div class="f3s-giftcard" style="${f3sBox([360,190,816,470])}" aria-live="polite"></div>`),go);
      if(def.letter)f3sTypeLetter(screen,add(`<div class="f3s-letter" style="${f3sBox(def.letter)}" aria-live="polite"></div>`));
    }
    if(def.kind==='choice'){
      def.opt.forEach((box,i)=>{
        const face=def.faces?`<span class="f3s-face"><i>${F3S_CHOICE_LETTERS[i]}</i><span>${f3sEsc(def.options[i])}</span></span>`:'';
        const radio=def.radio?`<span class="f3s-dot" style="--rx:${def.radio[0]-box[0]};--rr:${def.radio[1]}"></span>`:'';
        const b=add(`<button type="button" class="f3s-hit f3s-opt${def.faces?' has-face':''}" role="radio" aria-checked="false" style="${f3sBox(box)}" aria-label="${F3S_CHOICE_LETTERS[i]}. ${f3sEsc(def.options[i])}">${face}${radio}</button>`);
        b.addEventListener('click',()=>{if(screen.classList.contains('answered'))return;f3s.picks[id]=i;saveF3S();f3sPaintPick(screen,i);});
      });
      if(Number.isInteger(f3s.picks[id]))f3sPaintPick(screen,f3s.picks[id]);
    }
    if(def.kind==='written'){
      const t=add(`<textarea class="f3s-text" style="${f3sBox(def.text)}" placeholder=" " spellcheck="true" aria-label="Your answer"></textarea>`);
      t.value=f3s.drafts[id]||'';
      if(def.counter){const [box,limit,unit]=def.counter,c=add(`<span class="f3s-counter" style="${f3sBox(box)}"></span>`);const count=()=>{const n=unit==='words'?(t.value.trim()?t.value.trim().split(/\s+/).length:0):t.value.length;c.textContent=`${n} / ${limit} ${unit}`;c.classList.toggle('over',n>limit);};t.addEventListener('input',count);count();}
      t.addEventListener('input',()=>{f3s.drafts[id]=t.value;saveF3S();});
    }
    if(def.kind==='times'){
      def.times.forEach((box,i)=>{const input=add(`<input class="f3s-time" style="${f3sBox(box)}" inputmode="numeric" maxlength="8" placeholder=" " aria-label="${['Credential presented','Door opened','Door closed'][i]} corrected time">`);input.value=(f3s.drafts[id]||[])[i]||'';
        input.addEventListener('input',()=>{const d=input.value.replace(/\D/g,'').slice(0,6);input.value=d.replace(/^(\d{2})(\d)/,'$1:$2').replace(/^(\d{2}:\d{2})(\d)/,'$1:$2');const all=f3q('.f3s-time',screen).map(x=>x.value);f3s.drafts[id]=all;saveF3S();if(d.length===6&&i<2)f3q('.f3s-time',screen)[i+1].focus();});});
    }
    if(def.kind==='timeline')f3sBuildTimeline(screen,layer,add,id,def);
    if(def.evidence)add(`<button type="button" class="f3s-hit" style="${f3sBox(def.evidence)}" aria-label="View evidence"></button>`).addEventListener('click',()=>f3sDocs(def));
    if(def.docBtn)add(`<button type="button" class="f3s-docbtn" style="${f3sBox(def.docBtn)}"><span aria-hidden="true">▤</span> VIEW DOCUMENTS (1–3)</button>`).addEventListener('click',()=>f3sDocs(def));
    [def.tabs,def.thumbs].forEach(boxes=>(boxes||[]).forEach((box,i)=>{const doc=(def.docSet||[])[i];if(doc===undefined)return;add(`<button type="button" class="f3s-hit f3s-soft" style="${f3sBox(box)}" aria-label="Open ${f3sEsc(F2_DOCS[doc][0].toLowerCase())}"></button>`).addEventListener('click',()=>f3sDocs(def,doc));}));
    if(def.hintBtn)add(`<button type="button" class="f3s-hit" style="${f3sBox(def.hintBtn)}" aria-label="Hint"></button>`).addEventListener('click',()=>f3sModal({tone:'hint',title:'A NOTE FROM THE FILE',body:`<p>${f3sEsc(def.hint)}</p>`,actions:[['BACK TO THE QUESTION',f3sCloseModal]]}));
    if(def.submit){
      const s=add(`<button type="button" class="f3s-hit f3s-submit" style="${f3sBox(def.submit)}" aria-label="Submit answer"><span class="f3s-next">CONTINUE <b>→</b></span></button>`);
      s.addEventListener('click',()=>{if(screen.classList.contains('answered'))f3sGo(def.next);else f3sSubmit(screen,id,def);});
    }
    if(done)f3sMarkAnswered(screen,id,def);
    f3sAnimateText(screen,id);
  }
  // M's closing letter, typed onto the blank paper. Paragraphs are blank-line separated; the "THE RECORD IS COMPLETE." line is highlighted.
  const F3S_CLOSING=`Well done, Detective.\n\nYou followed the money.\nYou questioned the accounts.\nYou traced the gaps between what was said and what could be proven.\n\nPiece by piece, the scattered records became a story.\n\nNot every detail was recovered. Not every question found an answer.\nBut you took what remained and made sense of it.\n\nThe numbers have been traced. The statements have been examined.\nThe missing pieces have been weighed against what remains.\n\nPeter Shaw was the last to speak to him. His word stands alone.\nA card no one can name opened the door he says Thomas used.\nThe originals he was asked for never came.\n\nWhere the records fall silent, you've made your judgment.\n\nYour findings have been recorded.\nYour deductions have been preserved.\nThe archive now holds your account of what happened.\n\n[[THE RECORD IS COMPLETE.]]\n\nI've spent a great deal of time putting these pieces together.\nIt seems only fair to know that someone, at last, has seen them through.\n\nA pleasure, Detective.`;
  // M's closing letter develops on the paper like a photograph, paragraph by paragraph. The lines about Peter and
  // THE RECORD IS COMPLETE flare warm as they come up, and M signs by hand at the end. A click shows it all at once.
  function f3sTypeLetter(screen,box){
    // M's closing letter is written in line by line: each line inks in from left to right, a beat after the last.
    // The lines about Peter and THE RECORD IS COMPLETE come up blood-dark, then settle; M signs by hand at the end.
    // CONTINUE waits until the letter is finished; a click shows it all at once.
    const paras=F3S_CLOSING.split('\n\n'),lines=[];
    paras.forEach(t=>{const p=document.createElement('p');p.className='f3s-lp';
      if(t.startsWith('[[')){p.innerHTML=`<span class="f3s-letter-mark">${f3sEsc(t.slice(2,-2))}</span>`;lines.push({el:p.firstChild,key:true,len:t.length});}
      else{const key=/Peter Shaw/.test(t);t.split('\n').forEach((l,i)=>{if(i)p.append(document.createElement('br'));const sp=document.createElement('span');sp.className='f3s-ll';sp.textContent=l;p.append(sp);lines.push({el:sp,key,len:l.length});});}
      box.append(p);});
    const sign=document.createElement('div');sign.className='f3s-letter-sign';sign.textContent='— M';box.append(sign);
    const go=screen.querySelector('.f3s-go');
    screen.classList.add('typing');
    const anims=[];let done=false;
    const finish=()=>{if(done)return;done=true;anims.forEach(a=>a.finish());lines.forEach(l=>l.el.style.opacity=1);sign.classList.add('shown','written');screen.classList.remove('typing');if(go){go.style.opacity='';go.style.pointerEvents='';}};
    if(reducedMotion){finish();return;}
    if(go){go.style.opacity=0;go.style.pointerEvents='none';go.style.transition='opacity 1.2s ease';}
    lines.forEach(l=>{l.el.style.display='inline-block';l.el.style.opacity=0;});
    let t=3200;
    lines.forEach((l,i)=>{
      const dur=Math.min(2200,500+l.len*28);
      anims.push(l.el.animate(l.key?[{opacity:1,clipPath:'inset(0 100% 0 0)',color:'#6b1209',filter:'blur(1px)'},{opacity:1,clipPath:'inset(0 0 0 0)',color:'#6b1209',filter:'blur(0)',offset:.6},{opacity:1,clipPath:'inset(0 0 0 0)',color:'#2a1f15'}]
        :[{opacity:1,clipPath:'inset(0 100% 0 0)',filter:'blur(1.5px)'},{opacity:1,clipPath:'inset(0 0 0 0)',filter:'blur(0)'}],{duration:l.key?dur+1400:dur,delay:t,easing:'ease-out',fill:'forwards'}));
      laterWait(()=>{if(!done&&i%2===0)sfx('ink');},t);
      t+=dur+(lines[i+1]&&lines[i+1].el.parentNode!==l.el.parentNode?650:180);
    });
    laterWait(()=>{if(done)return;sign.classList.add('shown','written');laterWait(()=>{done=true;screen.classList.remove('typing');if(go){go.style.opacity=1;go.style.pointerEvents='';}},1600);},t+300);
    screen.addEventListener('click',e=>{if(screen.classList.contains('typing')&&!e.target.closest('.f3s-skip'))finish();});
  }
  // The thank-you card before the physical gift: written live over the blank card, quietly, one line at a time.
  function f3sGiftCard(screen,box,go){
    box.innerHTML=`<small>CASE 25 · SUPPLEMENTARY ITEM</small><i></i><h2>ONE LAST THING</h2><b></b>
      <p>Before you go, Detective,</p><p>there is one small thing waiting for you.</p><p class="gc-gap">It’s our way of saying thank you</p><p>for seeing the investigation through.</p>`;
    const parts=[...box.children];go.style.opacity=0;go.style.pointerEvents='none';
    if(reducedMotion){go.style.opacity=1;go.style.pointerEvents='';return;}
    parts.forEach(p=>p.style.opacity=0);
    let t=4300;
    parts.forEach((p,i)=>{const h=p.tagName==='H2';
      p.animate([{opacity:0,filter:'blur(6px)',transform:'translateY(6px)'},{opacity:1,filter:'blur(0)',transform:'none'}],{duration:h?1800:1300,delay:t,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
      t+=h?1500:p.tagName==='P'?(i===6?1400:950):350;});
    go.animate([{opacity:0},{opacity:1}],{duration:1200,delay:t+400,fill:'forwards'}).finished.then(()=>{go.style.opacity=1;go.style.pointerEvents='';}).catch(()=>{});
  }
  function f3sPaintPick(screen,i){f3q('.f3s-opt',screen).forEach((b,n)=>{b.classList.toggle('picked',n===i);b.setAttribute('aria-checked',String(n===i));});}
  function f3sMarkAnswered(screen,id,def){
    screen.classList.add('answered');
    if(def.kind==='choice'){f3q('.f3s-opt',screen).forEach((b,n)=>b.classList.toggle('correct',n===def.answer));}
    f3q('.f3s-text,.f3s-time,.f3s-reason',screen).forEach(x=>{x.readOnly=true;});f3q('.f3s-sel',screen).forEach(x=>{x.disabled=true;});
  }
  function f3sBuildTimeline(screen,layer,add,id,def){
    const state=f3s.drafts[id]||{order:[null,null,null,null,null],kinds:['','','','',''],reason:''};f3s.drafts[id]=state;
    let held=null;
    const chips=def.chips.map((box,i)=>{const c=add(`<button type="button" class="f3s-hit f3s-chip" draggable="true" style="${f3sBox(box)}" aria-label="Event: ${f3sEsc(P3_TIMELINE_CHIPS[i].label)}"></button>`);
      c.addEventListener('dragstart',e=>{held=i;e.dataTransfer.setData('text/plain',String(i));c.classList.add('held');});
      c.addEventListener('dragend',()=>c.classList.remove('held'));
      c.addEventListener('click',()=>{held=held===i?null:i;chips.forEach((x,n)=>x.classList.toggle('held',n===held));});return c;});
    const cells=def.rows.map((box,r)=>{
      const cell=add(`<button type="button" class="f3s-cell" style="${f3sBox(box)}" aria-label="Timeline position ${r+1}"></button>`);
      const time=add(`<span class="f3s-cell-time" style="${f3sBox([def.timeCol[0],box[1],def.timeCol[1],box[3]])}"></span>`);
      const sel=add(`<select class="f3s-sel" style="${f3sBox([def.selCol[0],box[1],def.selCol[1],box[3]])}" aria-label="Reliability for position ${r+1}"><option value="">Select…</option>${['CORRECTED','UNVERIFIED','ESTIMATED','SEARCH RECORD'].map(v=>`<option value="${v}">${v[0]+v.slice(1).toLowerCase()}</option>`).join('')}</select>`);
      sel.value=state.kinds[r]||'';sel.addEventListener('change',()=>{state.kinds[r]=sel.value;paint();saveF3S();});
      const place=i=>{if(i===null||screen.classList.contains('answered'))return;const prev=state.order.indexOf(i);if(prev>=0)state.order[prev]=null;state.order[r]=i;held=null;chips.forEach(x=>x.classList.remove('held'));paint();saveF3S();};
      cell.addEventListener('click',()=>{if(held!==null)place(held);else if(state.order[r]!==null&&!screen.classList.contains('answered')){state.order[r]=null;paint();saveF3S();}});
      cell.addEventListener('dragover',e=>{e.preventDefault();cell.classList.add('over');});
      cell.addEventListener('dragleave',()=>cell.classList.remove('over'));
      cell.addEventListener('drop',e=>{e.preventDefault();cell.classList.remove('over');place(Number(e.dataTransfer.getData('text/plain')));});
      return {cell,time,sel};
    });
    const reason=add(`<input class="f3s-reason" style="${f3sBox(def.text)}" placeholder=" " aria-label="Follow-up reasoning">`);
    reason.value=state.reason||'';reason.addEventListener('input',()=>{state.reason=reason.value;saveF3S();});
    function paint(){
      chips.forEach((c,i)=>c.classList.toggle('placed',state.order.includes(i)));
      cells.forEach(({cell,time,sel},r)=>{const i=state.order[r];cell.textContent=i===null?'':`${P3_TIMELINE_CHIPS[i].doc} · ${P3_TIMELINE_CHIPS[i].label}`;cell.classList.toggle('filled',i!==null);time.textContent=i===null?'':P3_TIMELINE_CHIPS[i].time;time.classList.toggle('filled',i!==null);sel.classList.toggle('filled',!!sel.value);sel.dataset.kind=sel.value;});
    }
    paint();
  }
  function f3sTimelineResult(state){
    const order=state.order;if(order.some(v=>v===null))return {accepted:false,missing:['Place all five events on the timeline.']};
    const pos=i=>order.indexOf(i),missing=[];
    if(!(pos(1)<pos(0)&&pos(3)<pos(4)&&pos(3)===3&&pos(4)===4))missing.push('Put the corrected venue activity before Peter’s estimate, and the two next-morning search records last.');
    if(!order.every((chip,r)=>state.kinds[r]===P3_TIMELINE_CHIPS[chip].kind))missing.push('Check each reliability label: corrected clock, an estimate, an unverified camera clock, and search records.');
    const reason=p3Normalize(state.reason);
    if(!(/camera|vehicle|parking/.test(reason)&&/(unverif|unknown|not calibrated|cannot|can't|no|not)/.test(reason)))missing.push('In the follow-up, explain why the camera’s displayed time cannot be aligned precisely.');
    return {accepted:!missing.length,missing};
  }
  function f3sSubmit(screen,id,def){
    if(f3sBusy)return;
    let correct=false,missing=[];
    if(def.kind==='choice'){const pick=f3s.picks[id];if(!Number.isInteger(pick)){f3sNudge(screen,'.f3s-opt','Choose an answer first.');return;}correct=pick===def.answer;}
    // written answers are never marked wrong: whatever the detective submits, the file's own conclusion follows
    if(def.kind==='written'){const text=(f3s.drafts[id]||'').trim();if(!text){f3sNudge(screen,'.f3s-text','Write your answer first.');return;}correct=true;}
    if(def.kind==='times'){const t=f3s.drafts[id]||[];if(t.filter(Boolean).length<3){f3sNudge(screen,'.f3s-time','Enter all three times.');return;}correct=p3TimesCorrect(t).every(Boolean);}
    if(def.kind==='timeline'){const r=f3sTimelineResult(f3s.drafts[id]);correct=r.accepted;missing=r.missing;}
    const tries=(f3s.attempts[id]||0)+1;f3s.attempts[id]=tries;saveF3S();
    const explain=def.explain||def.model;
    if(correct){
      f3s.done[id]=true;saveF3S();f3sMarkAnswered(screen,id,def);f3sStamp(screen,'VERIFIED');
      f3sModal({tone:'good',title:def.doneTitle||(def.kind==='written'?'WHAT THE FILE SHOWS':['EVIDENCE VERIFIED','DEDUCTION ACCEPTED','RECORD CONFIRMED'][tries%3]),body:`<p>${f3sEsc(explain)}</p>`,actions:[['CONTINUE →',()=>{f3sCloseModal();f3sGo(def.next);}]]});
      return;
    }
    if(def.kind==='choice'){const b=f3q('.f3s-opt',screen)[f3s.picks[id]];b.classList.remove('wrong');void b.offsetWidth;b.classList.add('wrong');}
    if(tries<2){
      const list=missing.length?`<ul>${missing.slice(0,3).map(m=>`<li>${f3sEsc(m)}</li>`).join('')}</ul>`:'';
      f3sModal({tone:'bad',title:'NOT SUPPORTED BY THE RECORDS',body:`<p>${f3sEsc(def.hint||'Look at the evidence again.')}</p>${list}<p class="f3s-left">One more attempt before the file shows you the answer.</p>`,actions:[['TRY AGAIN',f3sCloseModal]]});
      return;
    }
    f3s.done[id]=true;saveF3S();f3sMarkAnswered(screen,id,def);
    const answer=def.kind==='choice'?`<p class="f3s-answer"><b>${F3S_CHOICE_LETTERS[def.answer]}.</b> ${f3sEsc(def.options[def.answer])}</p>`:'';
    f3sModal({tone:'reveal',title:def.kind==='choice'?'THE RECORDS SAY OTHERWISE':'CASE NOTES · WHAT THE FILE SUPPORTS',body:`${answer}<p>${f3sEsc(explain)}</p>`,actions:[['CONTINUE →',()=>{f3sCloseModal();f3sGo(def.next);}]]});
  }
  function f3sNudge(screen,selector,message){f3q(selector,screen).forEach(x=>{x.classList.remove('nudge');void x.offsetWidth;x.classList.add('nudge');});f3sToast(message);}
  function f3sToast(message){const t=$('#f3sToast');t.textContent=message;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');}
  function f3sStamp(screen,label){const s=document.createElement('div');s.className='f3s-stamp';s.textContent=label;screen.append(s);setTimeout(()=>s.remove(),2200);}
  function f3sModal({tone,title,body,actions}){
    sfx(({reveal:'sting',good:'right',bad:'wrong'})[tone]);
    const m=$('#f3sModal');f3sBusy=true;
    m.className=`f3s-modal tone-${tone}`;m.querySelector('h3').textContent=title;m.querySelector('.f3s-modal-body').innerHTML=body;
    const row=m.querySelector('.f3s-modal-actions');row.replaceChildren();
    actions.forEach(([label,fn])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);row.append(b);});
    m.hidden=false;requestAnimationFrame(()=>m.classList.add('open'));setTimeout(()=>row.querySelector('button')?.focus({preventScroll:true}),250);
  }
  function f3sCloseModal(){const m=$('#f3sModal');f3sBusy=false;m.classList.remove('open');setTimeout(()=>{if(!m.classList.contains('open'))m.hidden=true;},350);}
  function f3sDocs(def,only){
    let docs=[];
    if(def.docs==='p2')docs=P2_DOCS.map((d,i)=>({tag:`DOCUMENT ${i+1}`,title:d.title,meta:d.byline,paras:d.body}));
    if(def.docs==='p3')docs=P3_DOCS.map(([tag,title,text])=>({tag,title,paras:[text]}));
    if(def.docs==='f2')docs=(only!==undefined?[only]:def.docSet).map(i=>({tag:`DOCUMENT`,title:F2_DOCS[i][0],paras:[F2_DOCS[i][1]]}));
    const body=docs.map(d=>`<section class="f3s-doc"><small>${f3sEsc(d.tag)}${d.meta?` · ${f3sEsc(d.meta)}`:''}</small><h4>${f3sEsc(d.title)}</h4>${d.paras.map(p=>`<p>${f3sEsc(p)}</p>`).join('')}</section>`).join('');
    f3sModal({tone:'docs',title:'EVIDENCE FILES',body,actions:[['BACK TO THE QUESTION',f3sCloseModal]]});
  }
  $('#f3sList').addEventListener('click',()=>{const target=$('#f3sList').dataset.target;if(target&&$('#f3sChapter').hidden){f3sCloseModal();f3sGo(target,{resume:true});}});
  $('#f3sReturn').addEventListener('click',()=>{if(f3s.reviewFrom&&$('#f3sChapter').hidden){f3sCloseModal();f3sGo(f3s.reviewFrom,{resume:true});}});
  // Testing shortcut: jump past the current screen without answering.
  $('#f3sSkip').addEventListener('click',()=>{
    if(f4SkipQ&&f4SkipQ.task.isConnected&&$('#f3sChapter').hidden&&f4SkipQ.go())return;
    if($('#f3Stage').dataset.mode==='f4'){f4Skip();return;}
    if($('#f3Stage').dataset.mode==='f5'){f5Skip();return;}
    if(!$('#f3sChapter').hidden)return;
    const def=F3S_SCREENS[f3s.screen];f3sCloseModal();
    if(f3s.screen==='p1-read'){f3s.live=f3s.live||{};f3s.live.p1read=true;saveF3S();}
    if(def.next)f3sGo(def.next);else f3sFinish();
  });
  $('#f3sModal').addEventListener('keydown',e=>{const m=$('#f3sModal');if(e.key==='Escape'&&(m.classList.contains('tone-docs')||m.classList.contains('tone-hint')))f3sCloseModal();});
  // ---------------------------------------------------------------------------------------------
  // Cinematic story scenes for Files 004–005: slow-moving artwork or a drawn stage with moving figures,
  // letterbox bars, drifting particles, and the story revealed paragraph by paragraph like film subtitles.
  const CINE_STAGE_SVG=(fire)=>`<svg class="cine-stage${fire?' on-fire':''}" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><radialGradient id="cineSpot" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".55"/><stop offset=".6" stop-color="#ffb060" stop-opacity=".12"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
    <linearGradient id="cineFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a10"/><stop offset="1" stop-color="#0a0604"/></linearGradient>
    <radialGradient id="cineFlame" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="#fff1b0"/><stop offset=".35" stop-color="#ffb030"/><stop offset=".75" stop-color="#e0480f"/><stop offset="1" stop-color="#7a1606" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="900" fill="#0b0705"/>
    <g class="cine-backwall"><rect x="250" y="120" width="1100" height="430" fill="#1a110b"/><path d="M250 120h1100v18H250z" fill="#2b1c11"/>${Array.from({length:12},(_,i)=>`<rect x="${270+i*90}" y="150" width="60" height="380" fill="#20150d" opacity=".7"/>`).join('')}</g>
    <g class="cine-rig"><rect x="300" y="96" width="1000" height="10" fill="#120c08"/>${[420,620,800,980,1180].map((x,i)=>`<g class="cine-lamp" style="--i:${i}"><rect x="${x-14}" y="104" width="28" height="22" rx="4" fill="#2a1e14"/><circle cx="${x}" cy="130" r="7" fill="#ffcf8a"/></g>`).join('')}</g>
    <g class="cine-spot"><path d="M770 120 L560 620 L1040 620 L830 120 Z" fill="url(#cineSpot)"/></g>
    <rect x="200" y="540" width="1200" height="40" fill="#24170e"/><rect x="200" y="580" width="1200" height="320" fill="url(#cineFloor)"/>
    <g class="cine-amp"><rect x="330" y="410" width="120" height="132" rx="6" fill="#120c08"/><circle cx="390" cy="476" r="40" fill="#1e140c"/><rect x="1150" y="400" width="130" height="142" rx="6" fill="#120c08"/><circle cx="1215" cy="471" r="44" fill="#1e140c"/></g>
    <g class="cine-mic"><path d="M640 540 L640 360" stroke="#0a0705" stroke-width="5"/><circle cx="640" cy="352" r="9" fill="#0a0705"/></g>
    <g class="cine-player"><g class="cine-sway"><ellipse cx="800" cy="296" rx="30" ry="36" fill="#050302"/><path d="M752 336 Q800 322 848 336 L866 470 Q800 486 734 470 Z" fill="#050302"/><path d="M760 470 L748 542 L780 542 L792 470 Z M808 470 L820 542 L852 542 L840 470Z" fill="#050302"/><g class="cine-guitar"><path d="M712 404 Q700 380 728 372 Q760 368 770 392 Q800 386 806 410 Q812 444 776 452 Q740 458 724 440 Q704 430 712 404Z" fill="#070403"/><rect x="800" y="388" width="140" height="9" rx="3" transform="rotate(-22 800 392)" fill="#070403"/></g></g></g>
    ${fire?`<g class="cine-flames">${[[320,560,180],[430,560,240],[560,560,200],[1080,560,220],[1210,560,260],[1330,560,190]].map(([x,y,h],i)=>`<path class="cine-flame" style="--i:${i}" d="M${x-60} ${y} Q${x-40} ${y-h*.55} ${x} ${y-h} Q${x+40} ${y-h*.55} ${x+60} ${y} Z" fill="url(#cineFlame)"/>`).join('')}</g>`:''}
    <g class="cine-crowd">${Array.from({length:22},(_,i)=>{const x=120+i*68+(i%3)*9,y=760+(i%4)*22,s=.85+(i%5)*.07;return `<g class="cine-head" style="--i:${i}"><ellipse cx="${x}" cy="${y}" rx="${26*s}" ry="${30*s}" fill="#020101"/><path d="M${x-58*s} ${y+120} Q${x-50*s} ${y+30} ${x} ${y+28} Q${x+50*s} ${y+30} ${x+58*s} ${y+120} Z" fill="#020101"/></g>`;}).join('')}</g>
  </svg>`;
  const CINE_SCENES={
    stage:{stage:false,fx:'dust',tone:'warm'},
    fire:{stage:true,fx:'embers',tone:'fire'},
    board:{img:'assets/evidence-board.png',fx:'dust',tone:'warm'},
    signal:{img:'assets/reference/war-room.png',fx:'dust',tone:'cold'},
    interview:{img:'assets/reference/war-room.png',fx:'dust',tone:'cold',prelude:'room'},
    concert:{stage:false,fx:'dust',tone:'warm',prelude:'concert'},
    lake:{img:'assets/lake-ash.png',fx:'mist',tone:'cold'},
    lakenight:{img:'assets/lake-ash.png',fx:'mist',tone:'cold',prelude:true},
    reveal:{img:'assets/lake-ash.png',fx:'mist',tone:'cold',figure:true}
  };
  function cineFx(canvas,kind){
    const ctx=canvas.getContext('2d');let W=0,H=0,parts=[];
    const size=()=>{const r=canvas.getBoundingClientRect();W=canvas.width=Math.max(1,r.width*devicePixelRatio|0);H=canvas.height=Math.max(1,r.height*devicePixelRatio|0);};
    size();
    const N=kind==='embers'?90:kind==='mist'?14:70;
    const spawn=(fresh)=>{const d=devicePixelRatio;
      if(kind==='embers')return {x:Math.random()*W,y:fresh?Math.random()*H:H+10,vx:(Math.random()-.5)*.6*d,vy:-(0.6+Math.random()*1.6)*d,r:(0.8+Math.random()*2.2)*d,life:0,max:200+Math.random()*260};
      if(kind==='mist')return {x:Math.random()*W,y:H*(.55+Math.random()*.45),vx:(0.15+Math.random()*.35)*d,vy:0,r:(160+Math.random()*260)*d,life:0,max:1e9,a:.05+Math.random()*.07};
      return {x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.2*d,vy:(Math.random()-.4)*.15*d,r:(0.5+Math.random()*1.4)*d,life:0,max:600+Math.random()*600};};
    for(let i=0;i<N;i++)parts.push(spawn(true));
    const tick=()=>{
      if(!canvas.isConnected)return;
      if(canvas.width!==Math.round(canvas.getBoundingClientRect().width*devicePixelRatio))size();
      ctx.clearRect(0,0,W,H);
      parts.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;p.life++;
        if(kind==='embers'){p.vx+=(Math.random()-.5)*.08;const t=p.life/p.max;ctx.fillStyle=`rgba(255,${150+Math.random()*60|0},60,${Math.max(0,1-t)*.9})`;ctx.shadowColor='rgba(255,140,40,.9)';ctx.shadowBlur=8*devicePixelRatio;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();if(t>=1||p.y<-10)parts[i]=spawn(false);}
        else if(kind==='mist'){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,`rgba(200,210,225,${p.a})`);g.addColorStop(1,'rgba(200,210,225,0)');ctx.fillStyle=g;ctx.shadowBlur=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();if(p.x-p.r>W)p.x=-p.r;}
        else{const t=p.life/p.max,a=Math.sin(Math.min(1,t)*Math.PI)*.5;ctx.fillStyle=`rgba(255,226,180,${a})`;ctx.shadowBlur=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();if(t>=1)parts[i]=spawn(true);}
      });
      requestAnimationFrame(tick);
    };
    if(!reducedMotion)requestAnimationFrame(tick);
  }
  // Puzzle 4's lake, before M speaks: the camera drifts toward the boat, the lantern gutters, something dark seeps
  // out from under the hull, a figure walks the dock and is gone, another stands on the far shore. Then the words come.
  // Coordinates are pixels of assets/lake-ash.png (1672x941); the layer is sized to that picture as it covers the screen.
  function cineLakePrelude(screen){
    const D=7600,layer=screen.querySelector('.cine-layer');screen.classList.add('prelude');
    const W=1672,H=941,fig='M60 4c10 0 16 8 16 18 0 8-4 14-9 17 13 4 21 15 23 32l6 62-14 3-3 66-10 2-6-52-6 52-10-2-3-66-14-3 6-62c2-17 10-28 23-32-5-3-9-9-9-17 0-10 6-18 16-18z';
    const svg=`<svg class="lk-scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><radialGradient id="lkBlood" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#5a0907" stop-opacity=".8"/><stop offset=".55" stop-color="#330403" stop-opacity=".55"/><stop offset="1" stop-color="#1a0201" stop-opacity="0"/></radialGradient>
      <radialGradient id="lkLamp"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".9"/><stop offset=".4" stop-color="#ff9a3a" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>
      <filter id="lkSoft"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <image href="assets/lake-ash.png" width="${W}" height="${H}"/>
      <ellipse class="lk-pool" cx="610" cy="640" rx="190" ry="34" fill="url(#lkBlood)" filter="url(#lkSoft)"/>
      <ellipse class="lk-pool lk-pool2" cx="700" cy="668" rx="120" ry="20" fill="url(#lkBlood)" filter="url(#lkSoft)"/>
      ${[540,600,668].map((x,i)=>`<rect class="lk-drip" style="--i:${i}" x="${x}" y="600" width="3" height="26" rx="1.5" fill="#4a0704"/>`).join('')}
      <ellipse class="lk-ring" cx="612" cy="636" rx="40" ry="7" fill="none" stroke="rgba(190,200,215,.18)" stroke-width="1.2"/>
      <ellipse class="lk-ring lk-ring2" cx="612" cy="636" rx="40" ry="7" fill="none" stroke="rgba(190,200,215,.14)" stroke-width="1"/>
      <circle class="lk-lamp" cx="408" cy="510" r="70" fill="url(#lkLamp)"/>
      <g class="lk-watcher"><path d="${fig}" transform="translate(1388 352) scale(.24)" fill="#05070a"/></g>
    </svg>`;
    layer.querySelector('.cine-img').insertAdjacentHTML('afterend',svg);
    layer.querySelector('.cine-img').style.visibility='hidden';
    const sc=layer.querySelector('.lk-scene');
    sc.animate([{transform:'scale(1.02)',transformOrigin:'38% 66%'},{transform:'scale(1.16)',transformOrigin:'38% 66%'}],{duration:D+9000,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
    const a=(sel,k,o)=>sc.querySelectorAll(sel).forEach((n,i)=>n.animate(k,{fill:'both',...o,delay:(o.delay||0)+(o.stagger||0)*i}));
    a('.lk-lamp',[{opacity:.9},{opacity:.35},{opacity:.95},{opacity:.2},{opacity:.85},{opacity:.6},{opacity:.9}],{duration:2600,iterations:Infinity});
    a('.lk-pool',[{transform:'scale(.05)',transformOrigin:'610px 636px',opacity:0},{opacity:1,offset:.2},{transform:'scale(1)',transformOrigin:'610px 636px',opacity:1}],{duration:5200,delay:1400,stagger:900,easing:'cubic-bezier(.3,0,.3,1)'});
    a('.lk-drip',[{transform:'translateY(0) scaleY(.2)',opacity:0},{opacity:1,offset:.2},{transform:'translateY(34px) scaleY(1)',opacity:0}],{duration:1800,delay:900,stagger:500,iterations:3});
    a('.lk-ring',[{transform:'scale(.3)',transformOrigin:'612px 636px',opacity:0},{opacity:1,offset:.15},{transform:'scale(3.2)',transformOrigin:'612px 636px',opacity:0}],{duration:3200,delay:1800,stagger:1600,iterations:2});
    a('.lk-watcher',[{opacity:0},{opacity:0,offset:.45},{opacity:.85,offset:.6},{opacity:.85,offset:.82},{opacity:0}],{duration:D+800});
    // the man on the dock: walks away along the planks toward the lantern, shrinking, and is swallowed by the mist
    const man=document.createElement('div');man.className='lk-man';
    man.innerHTML=`<div class="m-walker"><svg viewBox="0 0 120 300" aria-hidden="true">
      <g class="lm-leg lm-l"><path d="M48 168 L44 262 L40 292 L56 292 L58 262 L60 172Z" fill="#030304"/></g>
      <g class="lm-leg lm-r"><path d="M62 168 L66 262 L64 292 L80 292 L76 262 L74 170Z" fill="#030304"/></g>
      <path d="M38 64 Q60 52 84 64 L92 120 L96 196 Q60 206 26 196 L30 120Z" fill="#040405"/>
      <path d="M30 70 Q22 120 24 168 L32 170 Q34 120 40 76Z M90 70 Q98 120 96 168 L88 170 Q86 120 80 76Z" fill="#030304"/>
      <rect x="52" y="44" width="16" height="16" fill="#040405"/>
      <ellipse cx="60" cy="34" rx="15" ry="17" fill="#040405"/>
      <path d="M38 22 L82 22 L78 14 Q60 4 42 14Z" fill="#020203"/><rect x="34" y="20" width="52" height="5" rx="2" fill="#020203"/>
    </svg></div>`;
    layer.querySelector('.lk-scene').after(man);
    const w=man.querySelector('.m-walker');
    w.animate([{left:'0%',bottom:'-10%',height:'62%',opacity:0,filter:'blur(0)'},{opacity:.95,offset:.12},{left:'11%',bottom:'6%',height:'40%',offset:.55,opacity:.92,filter:'blur(.4px)'},{left:'19%',bottom:'24%',height:'22%',opacity:.55,offset:.85,filter:'blur(2px)'},{left:'22%',bottom:'29%',height:'17%',opacity:0,filter:'blur(7px)'}],{duration:7200,delay:300,easing:'linear',fill:'both'});
    laterWait(()=>screen.classList.remove('prelude'),reducedMotion?0:D);
    return D;
  }
  // Interview room: a bare lamp swings on over an empty chair, a tape recorder wakes with a red REC light and a running clock.
  function cineRoomPrelude(screen){
    const D=5600,layer=screen.querySelector('.cine-layer');screen.classList.add('prelude');
    const reel=`<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="27" fill="#0b0a09" stroke="#5a5247" stroke-width="2"/><g stroke="#8a7f6e" stroke-width="3"><path d="M30 30V8M30 30L49 41M30 30L11 41"/></g><circle cx="30" cy="30" r="6" fill="#1a1612" stroke="#6d6354" stroke-width="2"/></svg>`;
    layer.querySelector('.cine-img').style.visibility='hidden';
    layer.querySelector('.cine-img').insertAdjacentHTML('afterend',`<div class="iv-scene" aria-hidden="true">
      <div class="iv-room"><i class="iv-cone"></i><i class="iv-wire"></i><i class="iv-shade"></i><i class="iv-pool"></i>
      <svg class="iv-chair" viewBox="0 0 120 170"><path d="M30 6h60l6 88H24zM20 98h80l4 14H16zM28 112h8l-6 54h-8zM84 112h8l6 54h-8z" fill="#050505"/></svg>
      <svg class="iv-peter" viewBox="0 0 120 170"><g fill="#010101" stroke="rgba(255,205,130,.28)" stroke-width="1"><ellipse cx="58" cy="30" rx="11" ry="13"/><path d="M52 40h14v8H52z"/><path d="M32 54Q58 40 86 54L90 100H30Z"/><path d="M30 98H98L102 112H28Z"/><path d="M94 104l8 52h-10l-6-40z"/></g></svg>
      <svg class="iv-asker" viewBox="0 0 120 300"><g fill="#010101" stroke="rgba(255,205,130,.22)" stroke-width="1"><ellipse cx="60" cy="38" rx="14" ry="16"/><path d="M36 26h48l-4-9Q60 6 40 17z"/><rect x="32" y="25" width="56" height="5" rx="2"/><path d="M38 64Q60 52 82 64L92 120 96 200Q60 210 26 200L30 120Z"/><path d="M42 198L38 292H56L60 202ZM62 202L66 292H84L80 198Z"/></g></svg>
      <div class="iv-rec"><div class="iv-reels"><span>${reel}</span><span>${reel}</span></div><b class="iv-led"></b><em class="iv-clock">REC 00:00:00</em></div></div></div>`);
    const sc=layer.querySelector('.iv-scene'),room=sc.querySelector('.iv-room');
    room.animate([{opacity:0},{opacity:.15,offset:.1},{opacity:0,offset:.16},{opacity:.7,offset:.28},{opacity:.2,offset:.34},{opacity:1,offset:.5},{opacity:1}],{duration:D*.7,fill:'both'});
    sc.querySelector('.iv-cone').animate([{transform:'rotate(-5deg)'},{transform:'rotate(4deg)'},{transform:'rotate(-2deg)'},{transform:'rotate(1deg)'},{transform:'rotate(0)'}],{duration:D*1.4,easing:'ease-out',fill:'forwards'});
    sc.querySelector('.iv-asker').animate([{opacity:0,transform:'translateX(-40px)'},{opacity:0,offset:.55},{opacity:1,transform:'none'}],{duration:D+1800,easing:'ease-out',fill:'both'});
    sc.querySelector('.iv-peter').animate([{opacity:0},{opacity:0,offset:.7},{opacity:1}],{duration:D+2600,fill:'both'});
    sc.querySelector('.iv-rec').animate([{opacity:0,transform:'translateY(14px)'},{opacity:0,offset:.5},{opacity:1,transform:'none'}],{duration:D,fill:'both'});
    sc.querySelector('.iv-led').animate([{opacity:0},{opacity:0,offset:.7},{opacity:1}],{duration:D,fill:'both'});
    const clock=sc.querySelector('.iv-clock'),t0=performance.now()+D*.7;
    let seen=false;const tick=()=>{if(clock.isConnected)seen=true;else if(seen)return;const e=Math.max(0,performance.now()-t0)/1000|0;clock.textContent='REC 00:'+String(e/60|0).padStart(2,'0')+':'+String(e%60).padStart(2,'0');setTimeout(tick,500);};tick();
    laterWait(()=>{if(screen.isConnected)sfx('dread');},reducedMotion?0:900);
    laterWait(()=>screen.classList.remove('prelude'),reducedMotion?0:D);
    return D;
  }
  // File 004 opening: The Lantern on a good night. The neon sign buzzes on, the stage lights click on one by one and sweep
  // through the haze, a singer stands in the follow spot and the crowd sways. The story then turns the room against itself.
  function cineConcertPrelude(screen){
    const INTRO=13500,SONG=29000,D=5600+INTRO+SONG,layer=screen.querySelector('.cine-layer');screen.classList.add('prelude');
    const COL=['#ffb347','#ff5d7d','#5f8dff','#ffd27a','#ff7a3d','#9a6bff','#ffc56b'];
    const LX=[150,380,610,840,1070,1300,1500];
    const beams=LX.map((x,i)=>`<g class="cc-light" style="--i:${i};--sd:${(-i*1.3).toFixed(1)}s"><path class="cc-beam" d="M${x} 92 L${x-170} 860 L${x+170} 860 Z" fill="url(#ccB${i})" style="transform-origin:${x}px 92px"/><rect x="${x-16}" y="70" width="32" height="24" rx="4" fill="#0c0a09"/><circle class="cc-lamp" cx="${x}" cy="92" r="9" fill="#1a1512"/></g>`).join('');
    const grads=LX.map((_,i)=>`<linearGradient id="ccB${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COL[i]}" stop-opacity=".75"/><stop offset=".55" stop-color="${COL[i]}" stop-opacity=".16"/><stop offset="1" stop-color="${COL[i]}" stop-opacity="0"/></linearGradient>`).join('');
    let crowd='';for(let i=0;i<26;i++){const x=10+i*63+(i%3)*9,y=812+(i%4)*14,r=27+(i%5)*3,up=i%4===1||i%7===3;
      crowd+=`<g class="cc-fan" style="--d:${(i*0.137%1.1).toFixed(2)}s"><ellipse cx="${x}" cy="${y+60}" rx="${r*1.9}" ry="${r*1.2}"/><circle cx="${x}" cy="${y}" r="${r}"/>${up?`<path d="M${x+r*.8} ${y+30} L${x+r*1.5} ${y-70} L${x+r*1.5+12} ${y-74} L${x+r*1.2+10} ${y+34}Z"/>`:''}</g>`;}
    layer.firstElementChild.style.visibility='hidden';
    layer.firstElementChild.insertAdjacentHTML('afterend',`<svg class="cc-scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>${grads}<radialGradient id="ccPool"><stop offset="0" stop-color="#ffe2b0" stop-opacity=".55"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
      <linearGradient id="ccFollow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2d6" stop-opacity=".5"/><stop offset="1" stop-color="#fff2d6" stop-opacity=".04"/></linearGradient>
      <filter id="ccGlow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="ccSoft"><feGaussianBlur stdDeviation="10"/></filter></defs>
      <rect width="1600" height="900" fill="#070504"/>
      <g opacity=".5" stroke="#140d09" stroke-width="2">${Array.from({length:14},(_,i)=>`<path d="M0 ${150+i*36}H1600"/>`).join('')}</g>
      <text class="cc-neon" x="1575" y="330" text-anchor="end" filter="url(#ccGlow)">THE L<tspan class="cc-a">A</tspan>NTERN</text>
      <rect x="0" y="62" width="1600" height="10" fill="#0d0a08"/>
      <rect class="cc-stage" x="760" y="640" width="840" height="34" fill="#1c130d"/>
      <ellipse class="cc-pool" cx="1180" cy="660" rx="260" ry="40" fill="url(#ccPool)" filter="url(#ccSoft)"/>
      <path class="cc-follow" d="M1150 0 L1050 660 L1310 660 L1210 0 Z" fill="url(#ccFollow)"/>
      <g class="cc-singer" fill="#030202"><line x1="1128" y1="470" x2="1128" y2="655" stroke="#030202" stroke-width="5"/><rect x="1118" y="462" width="18" height="10" rx="4"/>
        <circle cx="1182" cy="468" r="24"/><path d="M1152 500 Q1182 488 1214 500 L1226 600 L1138 600 Z"/><path d="M1150 600 L1146 656 L1166 656 L1176 604Z M1192 604 L1200 656 L1220 656 L1214 600Z"/>
        <path d="M1150 560 Q1190 520 1236 548 Q1252 572 1226 590 Q1186 600 1150 580Z"/><path d="M1144 520 L1132 470 L1140 468 L1156 516Z"/></g>
      <g class="cc-amp" fill="#0c0807"><rect x="1400" y="540" width="120" height="100" rx="6"/><circle cx="1460" cy="590" r="32" fill="#140e0b"/><rect x="800" y="560" width="96" height="80" rx="6"/></g>
      ${beams}
      <g class="cc-couple-wrap" transform="translate(0 -70)"><path class="cc-cspot" d="M470 0 L360 790 L640 790 L530 0 Z" fill="url(#ccFollow)"/><ellipse class="cc-cpool" cx="500" cy="790" rx="170" ry="26" fill="url(#ccPool)" filter="url(#ccSoft)"/>
        <g class="cc-couple" fill="#050303" stroke="rgba(255,225,180,.35)" stroke-width="1.5">
          <g class="cc-man"><circle cx="460" cy="618" r="17"/><path d="M440 640 Q460 630 480 640 L486 712 L436 712Z"/><path d="M440 712 L436 790 L452 790 L460 724 L468 790 L484 790 L480 712Z"/><path d="M478 646 L512 612 L518 618 L486 656Z"/></g>
          <g class="cc-woman"><circle cx="530" cy="612" r="15"/><path d="M522 600 Q530 588 544 598 L546 616 Q540 606 524 610Z"/><path d="M516 632 Q530 624 544 632 L548 680 L578 784 L482 784 L512 680Z"/><path d="M520 638 L512 600 L518 596 L528 634Z"/></g>
        </g></g>
      <g class="cc-crowd" fill="#020101">${crowd}</g>
    </svg>`);
    const sc=layer.querySelector('.cc-scene'),lights=[...sc.querySelectorAll('.cc-light')];
    sc.querySelector('.cc-neon').animate([{opacity:0},{opacity:0,offset:.15},{opacity:.9,offset:.2},{opacity:.1,offset:.26},{opacity:.95,offset:.34},{opacity:.3,offset:.4},{opacity:1}],{duration:2200,fill:'both'});
    lights.forEach((l,i)=>laterWait(()=>{if(!sc.isConnected)return;l.classList.add('on');if(i%3===0)sfx('key');},reducedMotion?0:1700+i*330));
    sc.querySelectorAll('.cc-follow,.cc-pool,.cc-singer').forEach(n=>n.animate([{opacity:0},{opacity:0,offset:.6},{opacity:1}],{duration:5600,fill:'both'}));
    sc.querySelector('.cc-crowd').animate([{opacity:0,transform:'translateY(40px)'},{opacity:0,offset:.55},{opacity:1,transform:'none'}],{duration:5600,easing:'ease-out',fill:'both'});
    // the song: the singer steps up to the mic, the crowd raises lights, the room sways. The track is the file at
    // assets/file-004/song.mp3 (from 0:00 unless SONG_START is set); without it a soft piano-and-hum melody plays instead.
    // before the song, the narrator introduces the room, one line at a time over the lights
    const CAP=[[600,'Before the money. Before Lake Ash.'],[4200,'There was The Lantern.'],[7600,'A small room with a big sound. Live music, every single night.'],[11400,'And tonight, the room was full.']];
    const cap=document.createElement('div');cap.className='cc-cap';sc.after(cap);
    CAP.forEach(([at,t])=>laterWait(()=>{if(!screen.isConnected||reducedMotion)return;cap.textContent=t;cap.classList.remove('show');void cap.offsetWidth;cap.classList.add('show');narrate(t);},5600+at));
    laterWait(()=>cap.classList.add('gone'),5600+INTRO);
    const songStart=5600+INTRO,stopSong=[],SONG_START=0; // seconds into the track where the singing begins
    laterWait(()=>{if(!screen.isConnected||reducedMotion)return;
      sc.classList.add('singing');
      const sparkle=document.createElement('div');sparkle.className='cc-sparkle';sc.after(sparkle);const notes=document.createElement('div');notes.className='cc-notes';sc.after(notes);
      const spawn=setInterval(()=>{if(!notes.isConnected)return clearInterval(spawn);const n=document.createElement('i');n.textContent=['♪','♫','♩'][Math.random()*3|0];n.style.left=(62+Math.random()*16)+'%';n.style.animationDuration=(3+Math.random()*2)+'s';notes.append(n);setTimeout(()=>n.remove(),5200);},420);
      stopSong.push(()=>{clearInterval(spawn);notes.remove();sparkle.remove();sc.classList.remove('singing');});
      try{if(f4Audio)f4Audio.out.gain.setTargetAtTime(.0001,audioContext.currentTime,.6);}catch{}
      const a=new Audio('assets/file-004/song.mp3');a.volume=0;let real=false;a.currentTime=SONG_START;a.addEventListener('loadedmetadata',()=>{try{a.currentTime=SONG_START;}catch{}},{once:true});
      a.addEventListener('playing',()=>{real=true;});
      a.play().then(()=>{const up=setInterval(()=>{a.volume=Math.min(.9,a.volume+.06);if(a.volume>=.9)clearInterval(up);},120);}).catch(()=>{});
      setTimeout(()=>{if(!real&&screen.isConnected)stopSong.push(f4Hum());},1200);
      stopSong.push(()=>{const dn=setInterval(()=>{a.volume=Math.max(0,a.volume-.05);if(a.volume<=0){clearInterval(dn);a.pause();}},120);});
    },songStart);
    const endSong=()=>{stopSong.splice(0).forEach(f=>{try{f();}catch{}});try{if(f4Audio)f4Audio.out.gain.setTargetAtTime(.9,audioContext.currentTime,1.2);}catch{}sfx('dread');};
    laterWait(endSong,reducedMotion?0:songStart+SONG-1200);
    screen.addEventListener('click',()=>{if(screen.classList.contains('prelude')){endSong();cap.remove();try{speechSynthesis.cancel();}catch{}}},{once:true});
    laterWait(()=>screen.classList.remove('prelude'),reducedMotion?0:D);
    return D;
  }
  // fallback when no song file is present: a slow piano with a wordless hummed line over it
  function f4Hum(){
    ensureSound();const c=audioContext;if(!c)return()=>{};const out=c.createGain();out.gain.value=.9;out.connect(c.destination);
    const N=n=>440*Math.pow(2,(n-69)/12);const mel=[69,72,74,72,69,67,69,null,65,67,69,67,65,64,62,null];let k=0,t=c.currentTime+.2;
    const tm=setInterval(()=>{while(t<c.currentTime+1.5){const n=mel[k%mel.length];k++;
      if(n){const o=c.createOscillator(),v=c.createOscillator(),vg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=N(n);v.frequency.value=5.5;vg.gain.value=4;v.connect(vg);vg.connect(o.frequency);f.type='bandpass';f.frequency.value=900;f.Q.value=1.2;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.06,t+.15);g.gain.exponentialRampToValueAtTime(.0001,t+.85);o.connect(f);f.connect(g);g.connect(out);o.start(t);v.start(t);o.stop(t+.9);v.stop(t+.9);}
      if(k%4===1)[N(50),N(57),N(62)].forEach(f=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+2.4);o.connect(g);g.connect(out);o.start(t);o.stop(t+2.5);});
      t+=.6;}},250);
    return()=>{clearInterval(tm);out.gain.setTargetAtTime(.0001,c.currentTime,.5);};
  }
  // File 004, "nine years later": the story plays out beside the words. The Lantern relights, Peter's secret file fans
  // out across the screen and is stamped as his, the lake and the drifting boat, the slip and the toll, and last the cell:
  // bars slam down in front of Peter Shaw and the charge is stamped across them.
  const S4_FILES=[['APPROVAL MEMO · 19 APR 2016','Maintenance deferred to cut costs.','Approved — T. Reed'],['DEFERRED REPAIRS','Stage circuit B · panel warm · inspection pending','Signed — T. Reed'],['MR-114 · ORIGINAL COPY','12 Sep — Electrical inspection — SCHEDULED',''],['PRIVATE FILE · P. SHAW','“If anyone asks, it was his call.”','']];
  function s4AddFile(L,i){const box=L.querySelector('.s4-files');if(!box||box.querySelector(`[data-f="${i}"]`))return;const [tag,body,sig]=S4_FILES[i],n=box.children.length;
    box.insertAdjacentHTML('beforeend',`<article class="s4-file" data-f="${i}" style="--i:${n}"><small>${tag}</small><p>${body}</p>${sig?`<i>${sig}</i>`:''}</article>`);sfx('paper');}
  function s4Cue(screen,t){
    let L=screen.querySelector('.s4fx');
    if(!L){L=document.createElement('div');L.className='s4fx';L.setAttribute('aria-hidden','true');screen.querySelector('.cine-layer').append(L);}
    const shake=(px=8)=>screen.animate([{transform:'none'},{transform:`translate(${-px}px,${px/2}px)`},{transform:`translate(${px*.7}px,${-px/3}px)`},{transform:'none'}],{duration:340});
    const clear=()=>[...L.children].forEach(n=>{n.classList.add('out');setTimeout(()=>n.remove(),900);});
    const add=html=>{L.insertAdjacentHTML('beforeend',html);return L.lastElementChild;};
    if(/reopened/.test(t)){clear();add(`<div class="s4-neon"><b>THE LANTERN</b><small>REOPENED · MAY 2017</small></div>`);sfx('ink');}
    else if(/second file/.test(t)){clear();add('<div class="s4-files"></div>');s4AddFile(L,3);}
    else if(/April memo/.test(t)){s4AddFile(L,0);setTimeout(()=>s4AddFile(L,1),900);}
    else if(/every page that could put/.test(t)){s4AddFile(L,2);}
    else if(/anyone ever asked/.test(t)){const f=L.querySelector('.s4-files');if(f){f.insertAdjacentHTML('beforeend','<b class="s4-stamp">KEPT BY P. SHAW</b>');sfx('stamp');shake(6);}}
    else if(/went to the water/.test(t)){clear();setTimeout(()=>{add(`<div class="s4-lake"><svg viewBox="0 0 400 260"><defs><linearGradient id="s4w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1420"/><stop offset="1" stop-color="#020407"/></linearGradient></defs><rect width="400" height="260" fill="url(#s4w)"/><path d="M0 120 Q60 96 120 112 T240 104 T400 110 V130 H0Z" fill="#05080d"/><g class="s4-rip" fill="none" stroke="rgba(180,200,230,.25)"><ellipse cx="210" cy="190" rx="60" ry="8"/><ellipse cx="210" cy="190" rx="100" ry="14"/></g><g class="s4-boat"><path d="M150 180 L270 180 L250 198 L170 198Z" fill="#020202" stroke="rgba(200,215,240,.35)"/><g fill="#020202" stroke="rgba(200,215,240,.3)"><circle cx="206" cy="146" r="8"/><path d="M196 156 Q206 151 216 156 L218 180 L194 180Z"/></g></g><g class="s4-mist"><rect y="150" width="400" height="40" fill="rgba(200,210,225,.08)"/></g></svg><small>LAKE ASH · 14 OCTOBER</small></div>`);sfx('dread');},400);
    }
    else if(/name on the boat/.test(t)){if(L.querySelector('.s4-slips'))return;add('<div class="s4-slips"><span class="a">BOAT No. 6<br><b>HIRER: P. SHAW</b></span><span class="b">TOLL · 21:00<br><b>CARD 4417 · P. SHAW</b></span></div>');sfx('stamp');}    else if(/in a cell/.test(t)){clear();setTimeout(()=>{
      add(`<div class="s4-cell"><svg viewBox="0 0 400 300"><rect width="400" height="300" fill="#07080a"/><rect x="0" y="230" width="400" height="70" fill="#0d0d0f"/><path d="M250 30 h50 v26 h-50z" fill="#1a1d22"/><g stroke="#2a2e35" stroke-width="2"><path d="M258 30v26M268 30v26M278 30v26M288 30v26"/></g><path d="M200 60 L120 300 H330 L240 60Z" fill="rgba(200,215,240,.07)"/><g class="s4-peter" fill="#020203" stroke="rgba(190,205,235,.3)"><rect x="150" y="196" width="110" height="18" rx="3"/><circle cx="205" cy="150" r="17"/><path d="M180 168 Q205 160 230 168 L236 210 L174 210Z"/><path d="M178 196 L190 246 H204 L200 210Z M232 196 L220 246 H206 L210 210Z"/><path d="M182 172 L196 194 L214 194 L228 172" fill="none"/></g></svg><div class="s4-bars"></div><small>LAKE ASH POLICE · CELL 3</small></div>`);
      sfx('dread');setTimeout(()=>{sfx('stamp');sfx('stamp');shake(12);},1150);},400);}
    else if(/never looked stronger/.test(t)){const c=L.querySelector('.s4-cell');if(c){c.insertAdjacentHTML('beforeend','<b class="s4-stamp red">CHARGED · MURDER</b>');sfx('stamp');shake(8);}}
  }
  // Story-telling text: each word surfaces from a soft blur, one after another; names glow gold, a line starting
  // with "!" is the warning and comes in red.
  function cineTell(screen){
    screen.classList.add('tell');
    screen.querySelectorAll('.cine-lines p').forEach(p=>{
      let w=0;
      p.innerHTML=p.innerHTML.split('<br>').map(line=>{const warn=line.startsWith('!');if(warn)line=line.slice(1);
        line=line.replace(/The Lantern|Thomas Reed|Peter Shaw/g,m=>m.replace(/ /g,' '));
        return `<span class="tl${warn?' warn':''}">`+line.split(' ').map(word=>`<span class="tw${/ /.test(word)?' name':''}" style="--w:${w++}">${word}</span>`).join(' ')+'</span>';}).join('<br>');
    });
  }
  // Handwritten version of a story screen: each line is written out by a pen in ink, left to right, one after another.
  // A line that starts with "!" is written in blood and drips; "— M" becomes a signature. Blood flecks mark the page.
  function cineHand(screen){
    screen.classList.add('hand');
    screen.querySelector('.cine-layer').insertAdjacentHTML('beforeend','<div class="cine-blood-flash" aria-hidden="true"></div>');
    screen.querySelectorAll('.cine-lines p').forEach(p=>{
      const parts=p.innerHTML.split('<br>');
      p.innerHTML=parts.map((t,k)=>{const blood=t.startsWith('!'),sign=/^— M$/.test(t.trim());
        return `<span class="hl${blood?' blood':''}${sign?' sign':''}" style="--k:${k};--n:${Math.max(4,(blood?t.slice(1):t).length)}">${blood?t.slice(1):t}${blood?'<i class="drip"></i><i class="drip d2"></i>':''}</span>`;}).join('');
    });
    const t=screen.querySelector('.cine-text');
    t.insertAdjacentHTML('afterbegin',`<svg class="hand-blood" viewBox="0 0 400 300" aria-hidden="true">
      <path d="M318 40c10-6 26-4 30 8 4 14-12 22-26 20-12-2-16-20-4-28z" fill="#5a0b07" opacity=".55"/>
      <circle cx="356" cy="72" r="4" fill="#5a0b07" opacity=".6"/><circle cx="300" cy="80" r="2.5" fill="#5a0b07" opacity=".5"/>
      <circle cx="372" cy="54" r="2" fill="#5a0b07" opacity=".5"/></svg>`);
  }
  // Each handwritten line arrives like a signal being decoded: the letters churn as random marks, then lock into place
  // from left to right, flickering. A low pulse lands with every line; the blood line hits harder and the frame jolts.
  function cineHandLine(screen,p){
    const GLYPHS='▓▒░#%&@$/\\|<>?!*=+-_ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    [...p.querySelectorAll('.hl')].forEach((h,k)=>{
      if(h.classList.contains('sign')){h.classList.add('sign-wait');laterWait(()=>{h.classList.remove('sign-wait');h.classList.add('sign-write');},k*900+600);return;}
      const node=[...h.childNodes].find(n=>n.nodeType===3);if(!node)return;
      const text=node.textContent;node.textContent=text.replace(/\S/g,' ');
      const start=k*900,len=text.length,dur=Math.max(500,len*38);
      laterWait(()=>{
        if(!h.isConnected)return;
        const blood=h.classList.contains('blood');
        sfx(blood?'sting':'ink');
        if(blood){screen.animate([{transform:'translate(0,0)'},{transform:'translate(-5px,3px)'},{transform:'translate(4px,-2px)'},{transform:'translate(-2px,1px)'},{transform:'none'}],{duration:380});
          screen.querySelector('.cine-blood-flash')?.animate([{opacity:0},{opacity:.55,offset:.15},{opacity:0}],{duration:1400});}
        const t0=performance.now();
        const tick=()=>{if(!h.isConnected)return;const e=Math.min(1,(performance.now()-t0)/dur),fixed=Math.floor(e*len);
          let out='';for(let i=0;i<len;i++){const ch=text[i];out+=i<fixed||ch===' '?ch:(i<fixed+6?GLYPHS[Math.random()*GLYPHS.length|0]:' ');}
          node.textContent=out;h.style.opacity=e<1?(.55+Math.random()*.45):1;
          if(e<1)requestAnimationFrame(tick);else{node.textContent=text;h.classList.add('locked');}};
        tick();
      },start);
    });
  }
  // The narrator: a calm, clear storyteller's voice for File 004's story screens, different from M's.
  let narratorPick=null;
  function narrate(text){
    return new Promise(res=>{
      const words=text.split(/\s+/).length,est=Math.max(1200,words*380);let done=false,started=false;const fin=()=>{if(!done){done=true;res();}};
      try{
        if(soundMuted||!('speechSynthesis' in window)||!speechSynthesis.getVoices().length)throw 0;
        if(!narratorPick){const vs=speechSynthesis.getVoices();narratorPick=['Samantha','Karen','Moira','Serena','Tessa','Google UK English Female','Microsoft Libby','Microsoft Sonia','Microsoft Aria','Veena'].map(n=>vs.find(v=>v.name.includes(n))).find(Boolean)||vs.find(v=>/^en/i.test(v.lang)&&!/Daniel|Arthur|Fred|Alex|Male/i.test(v.name))||null;}
        const u=new SpeechSynthesisUtterance(text.replace(/…/g,'...'));if(narratorPick)u.voice=narratorPick;u.pitch=1;u.rate=.9;u.volume=1;
        u.onstart=()=>{started=true;};u.onend=()=>setTimeout(fin,250);u.onerror=()=>setTimeout(fin,est);
        speechSynthesis.speak(u);setTimeout(()=>{if(!started)fin();},est+1500);setTimeout(fin,est*2.5+3000);
      }catch{setTimeout(fin,est);}
    });
  }
  function cineStory(screen,d,scene,onDone){
    const sc=CINE_SCENES[scene]||CINE_SCENES.board;
    screen.classList.add('cine',`cine-${scene}`,`tone-${sc.tone}`);
    const paras=d.text.split('\n\n');
    screen.innerHTML=`<div class="cine-layer">${sc.img?`<div class="cine-img" style="background-image:url('${sc.img}')"></div>`:CINE_STAGE_SVG(sc.stage)}${sc.figure?'<svg class="cine-figure" viewBox="0 0 120 300" aria-hidden="true"><ellipse cx="60" cy="34" rx="17" ry="20" fill="#05070a"/><path d="M30 60 Q60 48 90 60 L104 200 Q60 214 16 200 Z" fill="#05070a"/><path d="M34 198 L30 296 L54 296 L58 204Z M66 204 L70 296 L94 296 L88 198Z" fill="#05070a"/></svg>':''}<canvas class="cine-fx"></canvas><div class="cine-grade"></div></div>
      <div class="cine-bar top"></div><div class="cine-bar bottom"></div>
      <div class="cine-text"><header><small>${f3sEsc(d.kicker)}</small><span>${f3sEsc(d.eyebrow)}</span><h2>${f3sEsc(d.title)}</h2></header><div class="cine-lines" aria-live="polite">${paras.map(p=>`<p>${f3sEsc(p).replace(/\n/g,'<br>')}</p>`).join('')}</div>
      <button type="button" class="f3s-tx-continue cine-go" hidden>${f3sEsc(d.button)} <span>→</span></button></div>`;
    cineFx(screen.querySelector('.cine-fx'),sc.fx);
    const preludeMs=sc.prelude&&!reducedMotion?(sc.prelude==='room'?cineRoomPrelude(screen):sc.prelude==='concert'?cineConcertPrelude(screen):cineLakePrelude(screen)):0;
    if(d.hand)cineHand(screen);
    if(d.tell)cineTell(screen);
    const lines=[...screen.querySelectorAll('.cine-lines p')],box=screen.querySelector('.cine-lines'),go=screen.querySelector('.cine-go');
    go.addEventListener('click',()=>{try{speechSynthesis.cancel();}catch{}onDone();});
    let n=0,finished=false;
    // paragraphs fill the panel like pages: when the next one would not fit, the page clears and it starts a new one
    const fits=()=>box.scrollHeight<=box.clientHeight+2;
    const show=i=>{lines[i].classList.add('on');if(d.cue&&!(d.tell&&!reducedMotion))d.cue(screen,lines[i].textContent);if(d.hand&&!reducedMotion)cineHandLine(screen,lines[i]);if(!fits()){lines.slice(0,i).forEach(p=>p.classList.add('gone'));}};
    const finish=()=>{if(finished)return;finished=true;lines.forEach(p=>{p.classList.add('on');p.classList.remove('gone');});
      let start=lines.length-1;while(start>0){lines.slice(0,start).forEach(p=>p.classList.add('gone'));lines.slice(start-1).forEach(p=>p.classList.remove('gone'));if(!fits()){lines[start-1].classList.add('gone');break;}start--;}
      go.hidden=false;go.focus({preventScroll:true});};
    const next=()=>{if(finished||!screen.isConnected)return;if(n>=lines.length){laterWait(finish,500);return;}
      if(d.tell&&!reducedMotion){const i=n;show(i);n++;
        const parts=[...lines[i].querySelectorAll('.tl')].map(x=>x.textContent.trim()).filter(Boolean);
        (async()=>{for(const part of parts){if(finished||!screen.isConnected)return;if(d.cue)d.cue(screen,part);await narrate(part);}if(!finished&&screen.isConnected)laterWait(next,500);})();return;}
      show(n);const len=d.hand?lines[n].textContent.length*1.5+lines[n].querySelectorAll('.hl').length*20:lines[n].textContent.length;n++;laterWait(next,reducedMotion?0:Math.min(5200,1100+len*38));};
    laterWait(next,700+preludeMs);
    screen.addEventListener('click',e=>{if(!finished&&!e.target.closest('button')){try{if(d.tell)speechSynthesis.cancel();}catch{}screen.classList.remove('prelude');finish();}});
  }
  // ---------------------------------------------------------------------------------------------
  // File 004 — The Lantern Fire. Runs inside the File 03 stage (#f3Stage, data-mode="f4") and reuses its
  // transmissions, chapter cards and case-note modal. Story → Puzzle 1 → story → Puzzle 2 → verdict → story → M.
  // Wrong answers get a hint first; a second wrong answer shows the answer, like File 03.
  // ---------------------------------------------------------------------------------------------
  // File 003, puzzles 4 and 5. Built live on the same desk as File 004: the lake evidence, then the interview.
  // Soft sound cues share the ambient sound switch: nothing plays while sound is off.
  // a soft typewriter key: used by every typed message, throttled so fast typing stays a murmur
  let lastKey=0;
  function keyTick(){}
  function sfx(kind){
    ensureSound();
    if(!audioContext||audioContext.state!=='running')return;
    const c=audioContext,t0=c.currentTime;
    const tone=(f,d,type='sine',v=.08,f2=0,delay=0)=>{const o=c.createOscillator(),g=c.createGain(),t=t0+delay;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(Math.min(v*7,.9),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05);};
    const swell=(f,d,v,delay=0)=>{const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter(),t=t0+delay;o.type='triangle';o.frequency.value=f;lp.type='lowpass';lp.frequency.value=900;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.35);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(lp);lp.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05);};
    const knock=(v,delay=0)=>{const n=c.sampleRate*.18|0,b=c.createBuffer(1,n,c.sampleRate),dd=b.getChannelData(0);for(let i=0;i<n;i++)dd[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=b;f.type='lowpass';f.frequency.value=320;g.gain.value=v;src.connect(f);f.connect(g);g.connect(c.destination);src.start(t0+delay);};
    ({heart:()=>{knock(1.1);knock(.75,.22);},right:()=>{knock(.9);swell(146.83,1.8,.07,.05);swell(220,1.8,.05,.12);swell(293.66,2,.035,.2);},wrong:()=>{knock(.8);knock(.5,.16);swell(92.5,.9,.05,.02);},ink:()=>{knock(.35);swell(61.7,2.6,.08,.1);},dread:()=>{[[55,.09],[58.27,.06],[82.41,.05],[116.54,.03],[123.47,.025]].forEach(([f,v],i)=>{const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter(),t=t0+i*.6;o.type=i<2?'sawtooth':'triangle';o.frequency.value=f;o.detune.setValueAtTime(-30,t);o.detune.linearRampToValueAtTime(18,t+7);lp.type='lowpass';lp.frequency.setValueAtTime(180,t);lp.frequency.linearRampToValueAtTime(900,t+6);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+4.5);g.gain.exponentialRampToValueAtTime(.0001,t+9);o.connect(lp);lp.connect(g);g.connect(c.destination);o.start(t);o.stop(t+9.2);});knock(.7,4.2);swell(41.2,3,.12,4.2);},key:()=>{const n=c.sampleRate*.03|0,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=b;f.type='bandpass';f.frequency.value=1100;f.Q.value=.8;g.gain.value=.3;src.connect(f);f.connect(g);g.connect(c.destination);src.start(t0);},stamp:()=>{tone(95,.3,'sine',.3,40);tone(240,.07,'square',.04,90);},sting:()=>{tone(58,1.8,'sine',.16,44);tone(311,1.2,'triangle',.02,0,.1);},paper:()=>{const n=c.sampleRate*.45|0,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=b;f.type='bandpass';f.frequency.value=1700;g.gain.value=.4;src.connect(f);f.connect(g);g.connect(c.destination);src.start(t0);}})[kind]?.();
  }
  // ---------------------------------------------------------------------------------------------
  // File 003, puzzle 1: the five documents are read first, then stay one click away during the questions.
  const P1_DOCS=[['DOCUMENT 1','Statement of Account'],['DOCUMENT 2','Invoice Register'],['DOCUMENT 3','Bank Export'],['DOCUMENT 4','Payment Allocation Sheet'],['DOCUMENT 5','Internal Memo']];
  function p1Viewer(host,start,onOpen){
    host.innerHTML=`<div class="p1v-tabs">${P1_DOCS.map(([a,b],i)=>`<button type="button" class="p1v-tab" data-i="${i}"><small>${a}</small>${b}</button>`).join('')}</div><div class="p1v-frame"><img alt=""></div>`;
    const img=host.querySelector('img'),tabs=[...host.querySelectorAll('.p1v-tab')];
    const show=i=>{img.src=`assets/file-003/docs/p1-doc-${i+1}.jpg?v=3`;img.alt=P1_DOCS[i][1];tabs.forEach((t,n)=>{t.classList.toggle('on',n===i);if(n===i)t.classList.add('seen');});if(onOpen)onOpen(i);};
    tabs.forEach((t,i)=>t.addEventListener('click',()=>{sfx('click');show(i);}));
    show(start);
  }
  function p1BuildRead(screen){
    screen.classList.add('f4-screen');
    const {docs,task}=f4Desk(screen,{file:'FILE 003 · PUZZLE 01',step:'READ THE RECORDS',title:'PROJECT NORTH QUAY',lead:'Five documents from the expansion account. Open them here or use the physical copies. You can reopen them during the questions.'});
    docs.classList.add('p1v-docs');
    task.innerHTML=`<p class="f4-step">DOCUMENTS OPENED <b class="p1v-count">0 / 5</b></p><p class="f4-q">Not every entry represents a separate event.</p><p class="f4-sub">Read them here or on the physical copies. Begin when you are ready.</p><div class="f4-actions"><button type="button" class="f4-btn f4-submit">BEGIN THE QUESTIONS →</button></div>`;
    const btn=task.querySelector('.f4-submit'),count=task.querySelector('.p1v-count'),seen=new Set();
    p1Viewer(docs,0,i=>{seen.add(i);count.textContent=`${seen.size} / 5`;});
    btn.addEventListener('click',()=>{f3s.live=f3s.live||{};f3s.live.p1read=true;saveF3S();f3sGo('p1-q1');});
  }
  function p1OpenDocs(){
    if(!$('#f3sChapter').hidden)return;
    f3sModal({tone:'p1docs',title:'EVIDENCE FILES',body:'<div class="p1v-modal"></div>',actions:[['BACK TO THE QUESTION',f3sCloseModal]]});
    p1Viewer(document.querySelector('#f3sModal .p1v-modal'),0);
  }
  $('#f3sP1Docs').addEventListener('click',p1OpenDocs);
  // Puzzle 1's final question asks for the paid invoices, the unconfirmed one, and the evidence — and grades exactly that.
  function p1Deduction(text){
    const t=String(text||'').toLowerCase();
    const paid=[/nq\s*[-–]?104(?!\s*[-–]?r)/,/nq\s*[-–]?118/,/nq\s*[-–]?123/,/t\s*[-–]?17/,/t\s*[-–]?22/,/t\s*[-–]?31(?!\s*[-–]?r)/].filter(re=>re.test(t)).length;
    const unconfirmed=/nq\s*[-–]?104\s*[-–]?r/.test(t)&&/(unconfirm|not.{0,25}(paid|payment|confirm)|no.{0,25}(payment|confirm)|revis|replac|duplicate)/.test(t);
    const replay=/t\s*[-–]?31\s*[-–]?r/.test(t)&&/(replay|duplicate|repeat|not.{0,20}(separate|additional|new))/.test(t);
    const support=/(bank export|bank statement|statement of account|memo|register|allocation|pa-07|approval|signature|unverified|discrepan|2[.]4)/.test(t);
    const missing=[];
    if(paid<3)missing.push('Name which invoices were paid, using the references: T-17 / NQ-104, T-22 / NQ-118, T-31 / NQ-123.');
    if(!unconfirmed)missing.push('Say which invoice did not receive a confirmed payment (NQ-104-R) and why.');
    if(!(replay||support))missing.push('Point to evidence in the documents, such as the replay row T-31-R or the unverified allocation sheet.');
    return {accepted:!missing.length,missing};
  }
  const P4_STORY={kicker:'FILE 003 · PUZZLE 04',eyebrow:'LAKE ASH · OCTOBER 14',title:'THE UNRESOLVED THREAD',button:'EXAMINE THE EVIDENCE',hand:true,text:`He went to the water.
Someone followed.
!Only one of them came back.

At 17:40, a name was signed at the dock.
At 19:58, a message was read.
At 21:00, a road was paid for.
At 23:47, a watch stopped.

Until now, I have let you doubt.
Doubt is safe. It never accuses anyone.

Somewhere in these seven pages, doubt runs out.
When it does, you will know a name.

Do not look away from it.

— M`};
  const P5_STORY={kicker:'FILE 003 · PUZZLE 05',eyebrow:'OCTOBER 16 · INTERVIEW ROOM 2',title:'THE FINAL TRANSMISSION',button:'BEGIN THE INTERVIEW',hand:true,text:`Peter Shaw agreed to be interviewed.\nHe came alone. He declined a lawyer.\n\nThe tape is running.\n\nFour questions.\nFour answers, each one certain.\n\n!Every answer has a paper that says otherwise.`};
  const P4_DOCS=[
    {kind:'receipt',head:'LAKE ASH BOAT HIRE',sub:'EAST DOCK · SELF-SERVICE KIOSK 02',tag:'BOAT HIRE SLIP',date:'Tue 14 Oct · 17:40',title:'Lake Ash Boat Hire — east dock',body:'Hirer: P. Shaw (signed)\nBoat: No. 6, rowing skiff with outboard\nPaid: card ending 4417 — The Lantern company account\nID: not checked (self-service kiosk)\nDue back: 21:00\nStatus: NOT RETURNED'},
    {kind:'receipt',head:'LAKE ASH ROAD',sub:'TOLL GATE 1 · NORTHBOUND',tag:'TOLL RECEIPT',date:'14 Oct · 21:00 · verified gate clock',title:'Lake Ash Road — toll gate',body:'Vehicle: car, towards the lake\nPaid: card ending 4417\nCardholder: P. Shaw, The Lantern'},
    {kind:'memo',tag:'POLICE ROUTE NOTE',date:'16 Oct',title:'Drive time, The Lantern to the toll gate',body:'Measured at normal speed: 41 minutes.\nThe Lantern exit camera: a vehicle enters the frame at displayed 20:16:11 and leaves the exit at 20:19:04.\nThe camera clock has not been independently checked.'},
    {kind:'lab',tag:'LABORATORY NOTE',date:'15 Oct',title:'Blood on the boat gunwale',body:'Blood type A positive — consistent with Thomas Reed’s medical file.\nSample degraded. DNA inconclusive.\nLake Ash at the east dock: 38 m deep, cold. Remains rarely surface.'},
    {kind:'legal',tag:'BUY–SELL AGREEMENT',date:'Signed 2019',title:'The Lantern — partners’ agreement',body:'If either partner dies, the surviving partner acquires 100% of the business.\nEstimated value: ₹5 crore.'},
    {kind:'chat',tag:'MESSAGE LOG',date:'14 Oct · 19:58',title:'Thomas Reed → Peter Shaw',body:'“Tomorrow I tell the board about the 2.40 crore. Don’t make this harder than it is.”\nStatus: delivered, read 19:59.'},
    {kind:'flight',tag:'TRAVEL RECORD',date:'14 Oct',title:'Elena Ward — flight record',body:'Boarded 19:15. Departure 19:40.\nOutbound international flight.\nReturn: not booked.'}
  ];
  const P4_QS=[
    {q:'What does the hire slip establish?',options:['Peter was seen rowing the boat that night.','A boat was hired in Peter’s name, on his company card, hours before Thomas disappeared — and it was never returned.','Thomas hired the boat for himself.','The hire was routine and means nothing.'],answer:1,hint:'Read the hirer, the card and the time. The slip shows whose name the boat was hired under — not who was in it.',explain:'The slip puts Peter’s name and company card on a boat hired at 17:40, before Thomas left The Lantern, and the boat never came back. It does not prove who was aboard, but it is the first link in the chain.'},
    {q:'The exit camera shows a vehicle leaving The Lantern at displayed 20:19. The toll gate — a verified clock — logs card 4417 at 21:00. Police measured the drive at 41 minutes. What does that establish?',options:['Nothing: the camera clock is unverified, so the two cannot be linked.','The car that left at 20:19 is the car that reached the toll at 21:00. The camera clock is sound, and card 4417 was in a car that left minutes after Thomas.','Thomas drove himself to the lake.','Peter was at home all evening.'],answer:1,hint:'Add 41 minutes to 20:19. What do you get, and what does that say about the camera clock?',explain:'20:19 plus 41 minutes is 21:00 — exactly the toll time. The journey fits, the camera clock is reliable, and the car carrying card 4417 left The Lantern about nine minutes after Thomas did.'},
    {q:'The lab found Thomas’s blood type on the boat. No body has been recovered. Where does that leave Thomas?',options:['Alive and hiding: no body means no death.','Most likely hurt on that boat the night he vanished. The lake is deep and cold, so a missing body is what you would expect.','Drowned by accident; the blood means nothing.','Nothing can be said about him at all.'],answer:1,hint:'Think about what the lab note says about the lake as well as the blood.',explain:'The blood is consistent with Thomas, but the sample is too degraded for DNA, so it is not proof. Taken with the hired boat and 38 m of cold water, a missing body is what you would expect — it does not mean he is alive.'}
  ];
  function p4BuildQ(screen,n){
    const {docs,task}=f4Desk(screen,{file:'FILE 003 · PUZZLE 04',step:`QUESTION ${n+1} / 4`,title:'THE UNRESOLVED THREAD',lead:'Seven documents from the night of October 14. Read them all before you answer.'});
    docs.innerHTML=P4_DOCS.map(d=>f4Doc(d)).join('');
    task.insertAdjacentHTML('afterbegin','');
    f4Ask(task,'p4-'+n,P4_QS[n],()=>f3sGo('p4-q'+(n+2)),f3s,saveF3S);
  }
  function p4BuildChain(screen){
    const {docs,task}=f4Desk(screen,{file:'FILE 003 · PUZZLE 04',step:'QUESTION 4 / 4',title:'BUILD THE CASE',lead:'A case needs a means, an opportunity and a motive. They are scattered across these documents.'});
    docs.innerHTML=P4_DOCS.map((d,i)=>f4Doc(d,`data-i="${i}" role="button" tabindex="0"`)).join('');docs.classList.add('f4-orderable');
    const cards=[...docs.querySelectorAll('.f4-doc')];let picks=[];
    const paint=()=>{cards.forEach((c,i)=>{const n=picks.indexOf(i);c.dataset.pos=n<0?'':String(n+1);c.classList.toggle('placed',n>=0);});submit.disabled=picks.length!==3;};
    task.innerHTML=`<p class="f4-q">Choose the three documents that, together, make the strongest case against one person.</p><p class="f4-sub">Click a document to select it. Click it again to remove it.</p><div class="f4-actions"><button type="button" class="f4-btn f4-submit" disabled>THIS IS MY CASE →</button></div>`;
    const submit=task.querySelector('.f4-submit');
    const toggle=c=>{if(task.classList.contains('settled'))return;const i=Number(c.dataset.i),n=picks.indexOf(i);if(n>=0)picks.splice(n,1);else if(picks.length<3)picks.push(i);sfx('click');paint();};
    cards.forEach(c=>{c.addEventListener('click',()=>toggle(c));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle(c);}});});
    const finish=()=>{f3sCloseModal();f3sGo('p4-end');};
    const settle=()=>{task.classList.add('settled');picks=[0,1,4];paint();cards.forEach((c,i)=>c.classList.toggle('right',picks.includes(i)));};
    submit.addEventListener('click',()=>{
      if(f3sBusy||picks.length!==3)return;
      const tries=(f3s.attempts['p4-chain']||0)+1;f3s.attempts['p4-chain']=tries;saveF3S();
      const hasMeans=picks.includes(0),hasOpp=picks.includes(1),hasMotive=picks.includes(4)||picks.includes(5);
      if(hasMeans&&hasOpp&&hasMotive){cards.forEach((c,i)=>c.classList.toggle('right',picks.includes(i)));task.classList.add('settled');f3sModal({tone:'good',title:'A CHAIN THAT HOLDS',body:'<p>A boat hired in Peter’s name. A car carrying his card, minutes behind Thomas. And a reason for wanting him gone. Means, opportunity and motive — each one stands on its own document.</p>',actions:[['CONTINUE →',finish]]});return;}
      const why=picks.includes(6)?'Elena Ward boarded a flight at 19:15. She was in the air when the car passed the toll gate at 21:00, so she cannot be the one at the lake.':!hasMotive?'You have placed someone at the lake, but nothing says why. A case needs a motive.':'Without the hired boat and the toll receipt, nobody is placed at the lake at all.';
      if(tries<2){f3sModal({tone:'bad',title:'THE CHAIN HAS A GAP',body:`<p>${why}</p><p class="f3s-left">One more attempt before the file shows you the chain.</p>`,actions:[['TRY AGAIN',()=>{f3sCloseModal();picks=[];paint();}]]});return;}
      settle();f3sModal({tone:'reveal',title:'THE STRONGEST CHAIN',body:'<p class="f3s-answer"><b>Means:</b> the boat hire slip. <b>Opportunity:</b> the toll receipt. <b>Motive:</b> the buy–sell agreement (or Thomas’s last message).</p><p>'+f3sEsc(why)+'</p>',actions:[['CONTINUE →',finish]]});
    });
    paint();
  }
  const P5_EV={SL:'Boat hire slip — Peter’s name and card, 17:40',TL:'Toll receipt — card 4417, 21:00',CL:'Police call log — 06:12 next morning, Peter: “check the east dock”',AG:'Buy–sell agreement — the survivor gets 100%',MS:'Message log — Thomas to Peter, 19:58',TR:'Travel record — Elena Ward, 19:15 flight',LB:'Laboratory note — blood on the boat',RN:'Route note — the 41-minute drive'};
  const P5_ROUNDS=[
    {ask:'When were you last at Lake Ash?',say:'I haven’t been to Lake Ash since the summer.',opts:['TR','SL','LB','RN'],answer:1,hint:'Which document puts Peter’s name at the lake on the night of the 14th?',explain:'A boat was hired at Lake Ash at 17:40 on the 14th, in his name, on his card.',label:'BOAT HIRE SLIP',react:'Anyone can write a name on a slip.'},
    {ask:'Where were you after Thomas left?',say:'I stayed in the office after he left at ten past eight. I never left The Lantern.',opts:['AG','LB','TL','TR'],answer:2,hint:'Which document shows his card moving away from The Lantern that night?',explain:'His card was used at the Lake Ash toll gate at 21:00 — a 41-minute drive from the car that left The Lantern at 20:19.',label:'TOLL RECEIPT',react:'…That card was in my wallet. It was always in my wallet.'},
    {ask:'How did you learn Thomas was missing?',say:'I found out the next morning, like everyone else. Nobody told me where to look.',opts:['CL','SL','TL','MS'],answer:0,hint:'Look for something Peter said to the police before the boat was found.',explain:'At 06:12 Peter told the police to check the east dock. The boat was found there at 07:10.',label:'POLICE CALL LOG',react:'[a long silence]'},
    {ask:'Did you have any reason to want Thomas gone?',say:'We were partners for twenty years. I had no reason to want him gone.',opts:['RN','AG','LB','TR'],answer:1,hint:'Which document shows what Peter would gain if Thomas were no longer there?',explain:'If either partner dies, the survivor takes 100% of The Lantern — about ₹5 crore. And Thomas had just promised to tell the board about the missing 2.40 crore.',label:'BUY–SELL AGREEMENT',react:'I want a lawyer.'}
  ];
  function p5Type(el,text,done){
    if(reducedMotion){el.textContent=text;done&&done();return;}
    let i=0;const tick=()=>{if(!el.isConnected)return;keyTick();el.textContent=text.slice(0,++i);if(i<text.length)laterWait(tick,26);else done&&done();};tick();
  }
  function p5BuildInterview(screen){
    const {docs,task}=f4Desk(screen,{file:'FILE 003 · PUZZLE 05',step:'THE CONFRONTATION',title:'FOUR ANSWERS. FOUR DOCUMENTS.',lead:'For each answer Peter gives, choose the document that says otherwise.'});
    docs.classList.add('p5-docs');
    docs.innerHTML='<div class="p5-tape"><div class="p5-rec"><i></i><b>REC</b><span>INTERVIEW ROOM 2 · 16 OCT</span></div><div class="p5-log" aria-live="polite"></div></div>';
    const tape=docs.querySelector('.p5-tape'),log=tape.querySelector('.p5-log');
    f3s.live=f3s.live||{};
    const line=(cls,who,text,type)=>{const p=document.createElement('p');p.className=cls;p.innerHTML=`<b>${who}</b><span></span>`;log.append(p);const s=p.querySelector('span');if(type)p5Type(s,text,type===true?null:type);else s.textContent=text;p.scrollIntoView({block:'nearest',behavior:reducedMotion?'auto':'smooth'});return s;};
    const end=()=>{tape.classList.add('off');tape.querySelector('.p5-rec b').textContent='STOPPED';task.classList.remove('settled');task.innerHTML=`<p class="f4-step">INTERVIEW ENDED</p><p class="f4-q">Peter Shaw has asked for a lawyer.</p><p class="f4-sub">Four answers, four documents. Now decide what it all means.</p><div class="f4-actions"><button type="button" class="f4-btn f4-submit">MY CONCLUSION →</button></div>`;task.querySelector('.f4-submit').addEventListener('click',()=>f3sGo('p5-q2'));};
    const round=i=>{
      const r=P5_ROUNDS[i];f3sSetQ(screen,5,i+1);
      line('q','INTERVIEWER',r.ask);
      line('a','PETER SHAW','“'+r.say+'”',()=>{
        task.classList.remove('settled');
        f4Ask(task,'p5-'+i,{q:'Which document contradicts this answer?',options:r.opts.map(k=>P5_EV[k]),answer:r.answer,hint:r.hint,explain:r.explain},()=>{
          sfx('stamp');line('x','','CONTRADICTION ON RECORD — '+r.label);
          f3s.live.round=i+1;saveF3S();
          laterWait(()=>{line('r','PETER SHAW',r.react,()=>{if(i<3)laterWait(()=>round(i+1),1300);else{sfx('sting');laterWait(end,1400);}});},900);
        },f3s,saveF3S);
      });
    };
    const done=Math.min(4,f3s.live.round||0);
    for(let i=0;i<done;i++){const r=P5_ROUNDS[i];line('q','INTERVIEWER',r.ask);line('a','PETER SHAW','“'+r.say+'”');line('x','','CONTRADICTION ON RECORD — '+r.label);line('r','PETER SHAW',r.react);}
    if(done>=4)end();else laterWait(()=>round(done),700);
  }
  function p5BuildConclusion(screen){
    const {docs,task}=f4Desk(screen,{file:'FILE 003 · PUZZLE 05',step:'YOUR CONCLUSION',title:'WHAT HAPPENED TO THOMAS REED?',lead:'The interview is over. Everything on record is in front of you.'});
    docs.classList.add('f4-four');
    docs.innerHTML=P5_ROUNDS.map(r=>f4Doc({tag:'CAUGHT',date:r.label,title:'“'+r.say+'”',body:r.explain})).join('');
    f4Ask(task,'p5-conclusion',{q:'Based on everything on record: what happened to Thomas Reed?',options:['He vanished on his own and is alive somewhere.','He died in an accident at the lake. Peter’s lies are unrelated.','Peter Shaw followed Thomas to Lake Ash on the night of 14 October. Thomas did not come back, and the lake kept the body.','Nothing can be concluded from this file.'],answer:2,hint:'Four of Peter’s answers were contradicted by documents. Which explanation accounts for all of them?',explain:'The hired boat, the toll, the call to the east dock and the agreement all lead to the same night, the same lake and the same man. No body was recovered — but the lake is deep, cold and silent.'},()=>f3sGo('p5-q3'),f3s,saveF3S);
  }
  function p5BuildM(screen){
    const {docs,task}=f4Desk(screen,{file:'FILE 003 · PUZZLE 05',step:'ONE LAST QUESTION',title:'WHO IS M?',lead:'Someone has been sending you these transmissions since the first file. You have read every one.'});
    docs.classList.add('f4-four');
    docs.innerHTML=[['FILE 003 · PUZZLE 01','“Find the person who knew what the published story left out.”'],['FILE 003 · PUZZLE 02','“A truth can survive without ever being printed.”'],['ARCHIVE METADATA','Source classification: PRESS / PRIVATE\nOriginal archive reference: D.C.\nVerification: WITHHELD'],['M’S CLOSING LETTER','“I’ve spent a great deal of time putting these pieces together.”']].map(([t,b])=>f4Doc({tag:'TRANSMISSION',date:t,title:'On the record',body:b})).join('');
    const names=['Peter Shaw','Elena Ward','Daniel Cross','Someone not yet named'];
    task.innerHTML=`<p class="f4-q">Who sent the transmissions?</p><p class="f4-sub">There is no right or wrong here. Put your answer on the record.</p><div class="f4-options" role="radiogroup">${names.map((n,i)=>`<button type="button" class="f4-opt" role="radio" aria-checked="false" data-i="${i}"><i>${'ABCD'[i]}</i><span>${n}</span></button>`).join('')}</div><div class="f4-actions"><button type="button" class="f4-btn f4-submit">PUT IT ON THE RECORD →</button></div>`;
    let pick=null;const opts=[...task.querySelectorAll('.f4-opt')];
    opts.forEach(b=>b.addEventListener('click',()=>{pick=Number(b.dataset.i);sfx('click');opts.forEach(o=>{o.classList.toggle('picked',o===b);o.setAttribute('aria-checked',String(o===b));});}));
    task.querySelector('.f4-submit').addEventListener('click',()=>{
      if(f3sBusy)return;if(pick===null){f3sToast('Choose an answer first.');return;}
      f3s.live=f3s.live||{};f3s.live.mPick=names[pick];saveF3S();
      f3sGo('final');
    });
  }
  const F4_KEY='case25File004V1';
  F3S_CHAPTERS.push(['PUZZLE 01','RECONSTRUCT THE NIGHT'],['PUZZLE 02','THE MISSING PIECE'],['PUZZLE 03','THE SECOND CARD']);
  const F4_CH1=F3S_CHAPTERS.length-3,F4_CH2=F3S_CHAPTERS.length-2,F4_CH3=F3S_CHAPTERS.length-1;
  // Puzzle 1 documents, shown out of order. `order` is their true chronological position.
  const F4_P1_DOCS=[
    {id:'witness',order:4,tag:'WITNESS STATEMENT',date:'22 Sep 2016',title:'Statement of R. Okafor, bar staff',body:'“The stage lights flickered twice during the second set. Then there was smoke coming from behind the panel at the back of the stage. People started shouting and we got everyone out through the side door.” Taken the morning after the fire.'},
    {id:'log',order:1,tag:'MAINTENANCE LOG',date:'03/03/2016',title:'The Lantern — quarterly safety checks',body:'Fire extinguishers — checked ✓ (signed J.M.)\nEmergency lighting — checked ✓ (signed J.M.)\nStage circuit B tripping; wiring behind panel warm to the touch. Full electrical inspection of stage circuits — SCHEDULED. No completion signature.'},
    {id:'report',order:5,tag:'INCIDENT REPORT',date:'30 September 2016',title:'Fire at The Lantern — IR-0921',body:'Fire broke out at The Lantern during a live performance on the night of 21 September. Origin: rear of the stage. Investigation ongoing; venue maintenance and inspection records have been requested.'},
    {id:'costs',order:2,tag:'APPROVAL MEMO',date:'19 April 2016',title:'Operating budget — cost reductions',body:'Non-essential maintenance and contractor work deferred to Q3 to cover rising costs. Approved — T. Reed.',note:'Every place has a story it tells the public. Ours will not be this one. — T.'},
    {id:'email',order:3,tag:'EMAIL',date:'Thu 02.06.2016',title:'From: Peter Shaw  To: Thomas Reed',body:'“The electrician flagged the stage wiring again today. We can’t keep pushing this to next quarter, Tom. If something happens on a full night, it’s on us.”'}
  ];
  const F4_P1_CHECKS=['Fire extinguishers','Emergency lighting','Electrical inspection of the stage circuits','Fire exit signage'];
  // Puzzle 2 documents and its three linked questions.
  const F4_P2_DOCS=[
    {tag:'MAINTENANCE RECORD MR-114 · VERSION A',date:'As released to investigators',title:'Stage circuits — September 2016',body:'05 Sep — Fire alarm test — COMPLETED\n09 Sep — Extinguisher check — COMPLETED\n12 Sep — Electrical inspection, stage circuits — COMPLETED · ref INS-0417 (attached)\n16 Sep — Emergency lighting — COMPLETED\n\nFile history: last edited 23 Sep 2016, 01:12 · user: pshaw'},
    {tag:'MAINTENANCE RECORD MR-114 · VERSION B',date:'Original working copy',title:'Stage circuits — September 2016',body:'05 Sep — Fire alarm test — COMPLETED\n09 Sep — Extinguisher check — COMPLETED\n12 Sep — Electrical inspection, stage circuits — SCHEDULED · awaiting contractor\n16 Sep — Emergency lighting — COMPLETED'},
    {tag:'CONTRACTOR INSPECTION REGISTER',date:'September 2016',title:'Halden Electrical Ltd — job register',body:'INS-0415 — 05 Sep — Fire alarm system — signed\nINS-0416 — 09 Sep — Extinguishers — signed\nINS-0418 — 16 Sep — Emergency lighting — signed'},
    {tag:'ARCHIVE INDEX',date:'Released file IR-0921',title:'Attachments to the incident file',body:'Attachment 1 — Incident report IR-0921 — IN FILE\nAttachment 2 — Maintenance record MR-114 — IN FILE\nAttachment 3 — INS-0417 Electrical inspection certificate — NOT IN FILE'}
  ];
  const F4_P2_QUESTIONS=[
    {q:'Which entry differs between the two versions of the maintenance record?',options:['05 Sep — Fire alarm test','09 Sep — Extinguisher check','12 Sep — Electrical inspection, stage circuits','16 Sep — Emergency lighting'],answer:2,hint:'Read Version A and Version B line by line. Only one status changes.',explain:'The 12 September electrical inspection reads COMPLETED in the version released to investigators, but SCHEDULED — awaiting contractor — in the original working copy.'},
    {q:'Which inspection reference is missing from the released file?',options:['INS-0415','INS-0416','INS-0417','INS-0418'],answer:2,hint:'Compare the reference Version A cites with the contractor register and the archive index.',explain:'INS-0417 is cited as the electrical inspection certificate, but it is not in the contractor register and the archive index marks it NOT IN FILE.'},
    {q:'Which conclusion does the evidence support?',options:['The fire was started deliberately to hide something.','The inspection was done; the certificate was simply misfiled.','Two days after the fire, the record was rewritten under Peter Shaw’s login to say the inspection was done, citing a certificate that was never issued.','Thomas Reed rewrote the record to protect the venue.'],answer:2,hint:'Version A has a file history at the bottom. Whose login, and when?',explain:'Version A was last edited at 01:12 on 23 September, two days after the fire, under the login pshaw. That edit turns SCHEDULED into COMPLETED and cites INS-0417, a certificate the contractor never issued. The man who warned about the wiring is the man who rewrote the record after a musician died.'}
  ];
  const F4_STORY={
    s1:{kicker:'FILE 004 · THE LANTERN FIRE',eyebrow:'A NIGHT AT THE LANTERN',title:'EVERY PLACE HAS A STORY.',button:'EXAMINE THE RECORDS',tell:true,
      cue:(screen,t)=>{const sc=screen.querySelector('.cc-scene');if(!sc)return;
        if(/kept running/.test(t)){sc.classList.add('flicker');sfx('dread');laterWait(()=>sc.classList.remove('flicker'),2600);}
        if(/Someone warned/.test(t)){const l=sc.querySelectorAll('.cc-light.on')[3];if(l){l.classList.add('pop');sfx('sting');}}
        if(/Whether anyone/.test(t))sc.classList.add('hush');},
      text:`Two friends. One stage.\nThomas Reed and Peter Shaw built it from nothing: a small room with a big sound, live music every night, and a crowd that always came back.\n\nFor a while, it was everything they wanted.\n\nBut success is expensive.\nCosts rose. Repairs waited.\nWiring that needed attention was kept running a little longer…\nand then a little longer again.\n\n!Someone warned them. It was written down.\n\nWhether anyone listened is another matter.\n\nEvery place has a story it tells the public.\nThis is the story its records left behind.`},
    s2:{kicker:'FILE 004 · THE LANTERN FIRE',eyebrow:'THE OFFICIAL VERSION',title:'THE NIGHT OF 21 SEPTEMBER.',button:'CROSS-EXAMINE THE REPORT',tell:true,text:`You found the warnings, Detective.\nNow here is what followed.\n\n21 September. A full room. The second set.\nThe stage lights flickered twice.\nThen the smoke came from behind the panel.\n\nThe room was cleared in four minutes.\n!One person did not make it out.\n\nA musician died on the stage that Thomas and Peter built.\n\nThe investigators called it an accident. Faulty equipment.\nNo one was charged. The file was closed.\n\nBut nothing in the records confirms the wiring was ever inspected.\nAnd someone made sure the record said it was.`},
    s4:{kicker:'FILE 004 · THE LANTERN FIRE',eyebrow:'NINE YEARS LATER',title:'THE FIRE WAS ONLY THE BEGINNING.',button:'CONTINUE',tell:true,cue:s4Cue,text:`Your findings are on record.\n\nThe Lantern reopened eight months after the fire.\nNew wiring. The same two names over the door.\nNobody ever saw the edit Peter made.\n\nBut Peter remembered it.\nAnd for nine years he kept a second file:\nthe April memo with Thomas’s signature, the deferred repairs, every page that could put the fire on Thomas alone.\n\nIn case anyone ever asked.\n\nThen Thomas went to the water at Lake Ash.\nPeter’s name on the boat. Peter’s card on the road.\n\n!Tonight Peter Shaw is in a cell.\n\nThe case against him has never looked stronger.`},
    final:{kicker:'INCOMING TRANSMISSION · SOURCE: M',eyebrow:'FILE 004 · CLOSED',title:'ONE FILE REMAINS.',button:'RETURN TO THE CASE',hand:true,text:`Detective.\n\nYou found the warning.\nYou found the edit.\nYou found the man who made it.\n\nHe kept a file on his oldest friend for nine years.\nHe was waiting for the day he would need it.\n\nI told you once that every place has a story it tells the public.\n!Some people do too.\n\nTonight the last file opens.\nRead it the way you read today:\nnot for what it says, but for who could have written it.\n\n— M`}
  };
  const F4_FLOW=['s1','p1','s2','p2','verdict','s4','final'];
  function readF4(){const fresh={screen:'s1',attempts:{},done:{},order:[],check:null,p2:[null,null,null],p2step:0,p3step:0,p3text:'',verdict:'',verdictSaved:false};try{return {...fresh,...JSON.parse(localStorage.getItem(F4_KEY)||'{}')};}catch{return fresh;}}
  let f4=readF4();
  const saveF4=()=>{try{localStorage.setItem(F4_KEY,JSON.stringify(f4));}catch{}};
  const f4Next=id=>F4_FLOW[F4_FLOW.indexOf(id)+1];
  function openF4Stage(){
    setTimeout(f4ScoreStart,300);
    clearTimers();
    const stage=$('#f3Stage');stage.dataset.mode='f4';stage.hidden=false;
    $('#f3sList').hidden=true;$('#f3sReturn').hidden=true;$('#backButton').disabled=false;
    requestAnimationFrame(()=>stage.classList.add('visible'));
    // A missing or stale saved position (from an older version, or a finished file) starts the file from its opening.
    if(!F4_FLOW.includes(f4.screen)||progress.file04Complete)f4.screen='s1';
    f4Go(f4.screen,{resume:true});
  }
  function f4Go(id,{resume=false}={}){
    f3sSetHint('');
    f4.screen=id;saveF4();
    const chapter=id==='p1'?F4_CH1:id==='p2'?F4_CH2:id==='p3'?F4_CH3:null;
    if(chapter!==null&&!resume)f3sChapterCard(chapter,()=>f4Mount(id,true));else f4Mount(id,false);
  }
  function f4Mount(id,fromChapter){
    const stage=$('#f3Stage'),old=[...stage.querySelectorAll('.f3s-screen')];
    const screen=document.createElement('section');screen.className='f3s-screen f4-screen'+(fromChapter?' from-chapter':'');screen.dataset.screen=id;
    if(F4_STORY[id])f4BuildStory(screen,id);else if(id==='p1')f4BuildP1(screen);else if(id==='p2')f4BuildP2(screen);else if(id==='p3')f4BuildP3(screen);else f4BuildVerdict(screen);
    if(!F4_STORY[id])f4DeskEnter(screen);
    stage.insertBefore(screen,$('#f3sChapter'));
    // each kind of screen has its own way in: story screens bleed up out of ink, a puzzle's desk is lit by its lamp,
    // the verdict arrives as a page turned over
    const mode=reducedMotion||!old.length?null:F4_STORY[id]?'ink':fromChapter?{p1:'swing',p2:'catch',p3:'match'}[id]:id==='verdict'?'turn':'sweep';
    if(mode){screen.classList.add('fx-on','enter');f3sArrive(screen,mode,old);}
    else{requestAnimationFrame(()=>screen.classList.add('enter'));old.forEach(s=>{s.classList.add('leave');setTimeout(()=>s.remove(),1100);});}
  }
  function f4BuildStory(screen,id){
    cineStory(screen,F4_STORY[id],{s1:'concert',s2:'fire',s4:'lake',final:'signal'}[id],()=>{const next=f4Next(id);if(next)f4Go(next);else f4Finish();});
  }
  // Evidence documents. Each kind of record looks like the real thing: a thermal kiosk slip, a police memo, a lab report,
  // a signed agreement, a phone chat, a flight record. Anything else is a typed case card with a clip and a stamp.
  const f4Rows=body=>body.split('\n').map(l=>{const m=l.match(/^([^:]{2,22}):\s*(.+)$/);return m?`<div class="dr"><span>${f3sEsc(m[1])}</span><b>${f3sEsc(m[2])}</b></div>`:`<div class="dl">${f3sEsc(l)}</div>`;}).join('');
  const f4Doc=(d,extra='')=>{
    const e=f3sEsc,note=d.note?`<p class="f4-hand">${e(d.note)}</p>`:'',lines=d.body.split('\n');
    if(d.kind==='receipt')return `<article class="f4-doc dk-receipt" ${extra}><header><b>${e(d.head)}</b><small>${e(d.sub)}</small></header><div class="dr"><span>DATE / TIME</span><b>${e(d.date)}</b></div><hr>${f4Rows(d.body)}<hr><footer>${e(d.tag)} · KEEP THIS SLIP</footer></article>`;
    if(d.kind==='memo')return `<article class="f4-doc dk-memo" ${extra}><header><b>LAKE ASH POLICE</b><small>CID · CASE LA-1014 · INTERNAL NOTE</small><time>${e(d.date)}</time></header><h4>RE: ${e(d.title)}</h4><p>${e(d.body)}</p><i class="dk-stamp">FILED</i></article>`;
    if(d.kind==='lab')return `<article class="f4-doc dk-lab" ${extra}><header><i>FSL</i><div><b>STATE FORENSIC LABORATORY</b><small>BIOLOGY &amp; SEROLOGY · REPORT ${e(d.date)}</small></div></header><h4>${e(d.title)}</h4>${lines.map(l=>`<p>${e(l)}</p>`).join('')}<footer>ANALYST: DR. S. IYER</footer></article>`;
    if(d.kind==='legal')return `<article class="f4-doc dk-legal" ${extra}><h4>${e(d.tag)}</h4><small>${e(d.title)} · ${e(d.date)}</small>${lines.map((l,i)=>`<p class="cl"><b>${i?'Schedule A.':'Clause 7.'}</b> ${e(l)}</p>`).join('')}<div class="sigs"><span><em>Thomas Reed</em>T. REED</span><span><em>P. Shaw</em>P. SHAW</span></div><i class="dk-stamp">NOTARISED</i></article>`;
    if(d.kind==='chat'){const [who,to]=d.title.split(/\s*→\s*/),q=lines[0].replace(/^“|”$/g,''),st=lines.slice(1).join(' ');
      return `<article class="f4-doc dk-chat" ${extra}><header>← ${e(to||who)}</header><div class="chat"><small>${e(d.date.split('·')[0].trim())}</small><p>${e(q)}<span>${e(st.replace(/^Status:\s*/,''))}</span></p></div><footer>${e(d.tag)} · FROM ${e((who||'').toUpperCase())}’S PHONE</footer></article>`;}
    if(d.kind==='flight')return `<article class="f4-doc dk-flight" ${extra}><header><b>✈ PASSENGER RECORD</b><span>${e(d.date)}</span></header><h4>${e(d.title.replace(/\s*—.*$/,'').toUpperCase())}</h4>${f4Rows(lines.map(l=>l.replace(/^Boarded /,'Boarded: ').replace(/\. Departure /,'\nDeparture: ').replace(/^Return: /,'Return: ')).join('\n'))}<i class="dk-stamp">VERIFIED</i></article>`;
    return `<article class="f4-doc dk-card" ${extra}><i class="dk-clip"></i><small>${e(d.tag)}</small><time>${e(d.date)}</time><h4>${e(d.title)}</h4><p>${e(d.body)}</p>${note}</article>`;
  };
  function f4Desk(screen,{step,title,lead,file='FILE 004 · THE LANTERN FIRE'}){
    screen.classList.add('f4-desk-screen');
    screen.innerHTML=`<div class="f4-desk-bg"></div><div class="f4-desk"><header class="f4-head"><small>${f3sEsc(file)} · ${f3sEsc(step)}</small><h2>${f3sEsc(title)}</h2><p>${f3sEsc(lead)}</p></header><div class="f4-docs"></div><section class="f4-task" aria-live="polite"></section></div>`;
    return {docs:screen.querySelector('.f4-docs'),task:screen.querySelector('.f4-task')};
  }
  // A two-try question: hint first, then the answer. Calls done() once settled.
  // Text decodes like a signal locking in: the letters churn as random marks, then settle from left to right.
  function f4Decode(el,ms=900){
    if(reducedMotion||!el)return;const text=el.textContent,G='▓▒░#%&@/\\|<>?*=+ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';const t0=performance.now();
    const tick=()=>{if(!el.isConnected)return;const e=Math.min(1,(performance.now()-t0)/ms),n=Math.floor(e*text.length);
      el.textContent=text.split('').map((ch,i)=>i<n||ch===' '?ch:G[Math.random()*G.length|0]).join('');if(e<1)requestAnimationFrame(tick);else el.textContent=text;};tick();
  }
  // A puzzle desk comes alive: the documents are dropped onto the desk one by one, the title decodes, and the question
  // panel is drawn down like a blind with a line of lamp light on its edge.
  function f4DeskEnter(screen){
    if(reducedMotion)return;
    const head=screen.querySelector('.f4-head h2');if(head){head.style.opacity=0;laterWait(()=>{head.style.opacity='';f4Decode(head,1100);sfx('ink');},700);}
    screen.querySelectorAll('.f4-head small,.f4-head p').forEach((n,i)=>n.animate([{opacity:0,letterSpacing:'.5em'},{opacity:1,letterSpacing:''}],{duration:1200,delay:500+i*400,easing:'ease-out',fill:'backwards'}));
    screen.querySelectorAll('.f4-doc').forEach((d,i)=>{const r=(i%2?1:-1)*(6+i*3);
      d.animate([{opacity:0,transform:`translateY(-70vh) rotate(${r*2}deg) scale(1.1)`,filter:'blur(3px)'},{opacity:1,transform:`translateY(8px) rotate(${r/4}deg) scale(1)`,filter:'blur(0)',offset:.78},{transform:'none'}],{duration:900,delay:1100+i*260,easing:'cubic-bezier(.3,.1,.3,1)',fill:'backwards'});
      laterWait(()=>{if(screen.isConnected)sfx('paper');},1100+i*260+700);});
    const task=screen.querySelector('.f4-task');
    if(task)task.animate([{clipPath:'inset(0 0 100% 0)',boxShadow:'0 -2px 30px 4px rgba(255,190,110,.9)'},{clipPath:'inset(0 0 0 0)',boxShadow:'0 20px 50px rgba(0,0,0,.6)'}],{duration:1100,delay:1300,easing:'cubic-bezier(.6,0,.2,1)',fill:'backwards'});
  }
  // Question to question: the answered panel is stamped, then burns down to black; the next question decodes in and
  // its options are dealt onto the panel like cards.
  function f4Swap(box,build){
    if(reducedMotion||!box.childElementCount){build();f4DealIn(box,false);return;}
    const stamp=document.createElement('b');stamp.className='f4-stamp';stamp.textContent='VERIFIED';box.append(stamp);
    stamp.animate([{opacity:0,transform:'translate(-50%,-50%) rotate(-12deg) scale(2.6)'},{opacity:1,transform:'translate(-50%,-50%) rotate(-12deg) scale(.95)',offset:.7},{opacity:1,transform:'translate(-50%,-50%) rotate(-12deg) scale(1)'}],{duration:320,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
    sfx('stamp');box.animate([{transform:'none'},{transform:'translate(-4px,3px)'},{transform:'translate(3px,-2px)'},{transform:'none'}],{duration:240,delay:180});
    const out=box.animate([{filter:'brightness(1) sepia(0)',opacity:1,clipPath:'inset(0 0 0 0)'},{filter:'brightness(1.6) sepia(.9) saturate(2)',opacity:1,clipPath:'inset(0 0 0 0)',offset:.35},{filter:'brightness(.2) sepia(1)',opacity:0,clipPath:'inset(100% 0 0 0)'}],{duration:900,delay:750,easing:'ease-in',fill:'forwards'});
    out.finished.catch(()=>{}).then(()=>{stamp.remove();build();out.cancel();f4DealIn(box,true);});
  }
  function f4DealIn(box,swap){
    if(reducedMotion)return;
    if(swap){sfx('ink');box.animate([{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:800,easing:'cubic-bezier(.6,0,.2,1)'});}
    const d=swap?250:2200;
    box.querySelectorAll('.f4-step').forEach(n=>n.animate([{opacity:0,transform:'translateX(-12px)'},{opacity:1,transform:'none'}],{duration:600,delay:d,fill:'backwards'}));
    const q=box.querySelector('.f4-q');if(q){q.style.visibility='hidden';laterWait(()=>{q.style.visibility='';f4Decode(q,Math.min(1600,300+q.textContent.length*9));},d+150);}
    box.querySelectorAll('.f4-opt,.f4-verdict-text').forEach((o,i)=>o.animate([{opacity:0,transform:'translateX(40px) rotate(3deg)'},{opacity:1,transform:'none'}],{duration:650,delay:d+700+i*140,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
    box.querySelectorAll('.f4-actions').forEach(n=>n.animate([{opacity:0},{opacity:1}],{duration:600,delay:d+1400,fill:'backwards'}));
  }
  let f4SkipQ=null;
  function f4Ask(task,key,q,done,store=f4,save=saveF4){
    f3sSetHint(q.hint);
    task.innerHTML=`<p class="f4-q">${f3sEsc(q.q)}</p><div class="f4-options" role="radiogroup">${q.options.map((o,i)=>`<button type="button" class="f4-opt" role="radio" aria-checked="false" data-i="${i}"><i>${'ABCD'[i]}</i><span>${f3sEsc(o)}</span></button>`).join('')}</div><div class="f4-actions"><button type="button" class="f4-btn f4-submit">SUBMIT →</button></div>`;
    let pick=null;const opts=[...task.querySelectorAll('.f4-opt')];
    opts.forEach(b=>b.addEventListener('click',()=>{if(task.classList.contains('settled'))return;pick=Number(b.dataset.i);opts.forEach(o=>{o.classList.toggle('picked',o===b);o.setAttribute('aria-checked',String(o===b));});}));
    const settle=()=>{task.classList.add('settled');opts.forEach((o,i)=>o.classList.toggle('correct',i===q.answer));};
    f4SkipQ={task,go:()=>{if(task.classList.contains('settled'))return false;settle();f3sCloseModal();done();return true;}};
    task.querySelector('.f4-submit').addEventListener('click',()=>{
      if(f3sBusy)return;
      if(pick===null){f3sToast('Choose an answer first.');return;}
      const tries=(store.attempts[key]||0)+1;store.attempts[key]=tries;save();
      if(pick===q.answer){settle();f3sModal({tone:'good',title:'EVIDENCE VERIFIED',body:`<p>${f3sEsc(q.explain)}</p>`,actions:[['CONTINUE →',()=>{f3sCloseModal();done();}]]});return;}
      const b=opts[pick];b.classList.remove('wrong');void b.offsetWidth;b.classList.add('wrong');
      if(tries<2){f3sModal({tone:'bad',title:'NOT SUPPORTED BY THE RECORDS',body:`<p>${f3sEsc(q.hint)}</p><p class="f3s-left">One more attempt before the file shows you the answer.</p>`,actions:[['TRY AGAIN',f3sCloseModal]]});return;}
      settle();f3sModal({tone:'reveal',title:'THE RECORDS SAY OTHERWISE',body:`<p class="f3s-answer"><b>${'ABCD'[q.answer]}.</b> ${f3sEsc(q.options[q.answer])}</p><p>${f3sEsc(q.explain)}</p>`,actions:[['CONTINUE →',()=>{f3sCloseModal();done();}]]});
    });
  }
  function f4BuildP1(screen){
    const {docs,task}=f4Desk(screen,{step:'PUZZLE 01',title:'RECONSTRUCT THE NIGHT',lead:'Five documents survived from the months before the fire. Put them in the order they happened — click each one in sequence, earliest first.'});
    docs.innerHTML=F4_P1_DOCS.map((d,i)=>f4Doc(d,`data-i="${i}" role="button" tabindex="0"`)).join('');
    docs.classList.add('f4-orderable');
    const cards=[...docs.querySelectorAll('.f4-doc')];let order=[];
    const paint=()=>cards.forEach((c,i)=>{const n=order.indexOf(i);c.dataset.pos=n<0?'':String(n+1);c.classList.toggle('placed',n>=0);});
    const pick=c=>{if(task.classList.contains('locked'))return;const i=Number(c.dataset.i),n=order.indexOf(i);if(n>=0)order=order.slice(0,n);else if(order.length<5)order.push(i);paint();sync();};
    cards.forEach(c=>{c.addEventListener('click',()=>pick(c));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(c);}});});
    task.innerHTML=`<p class="f4-q">Order the documents chronologically.</p><p class="f4-sub">Click a numbered document again to undo from that point.</p><div class="f4-actions"><button type="button" class="f4-btn f4-ghost f4-reset">RESET ORDER</button><button type="button" class="f4-btn f4-submit" disabled>CHECK THE TIMELINE →</button></div>`;
    const submit=task.querySelector('.f4-submit');const sync=()=>{submit.disabled=order.length<5;};
    task.querySelector('.f4-reset').addEventListener('click',()=>{if(task.classList.contains('locked'))return;order=[];paint();sync();});
    const toCheck=()=>{task.classList.add('locked');docs.classList.add('ordered');
      f4Swap(task,()=>{task.classList.remove('locked');f4Ask(task,'p1-check',{q:'One safety check has no verified completion record. Which one?',options:F4_P1_CHECKS,answer:2,hint:'Look at the maintenance log. Which line has no signature against it?',explain:'The extinguishers and emergency lighting were signed off. The electrical inspection of the stage circuits was only ever SCHEDULED — there is no completion record. The concerns existed before the fire, Thomas approved deferring maintenance, and Peter knew about the wiring.'},()=>{f4.done.p1=true;saveF4();f4Go(f4Next('p1'));});});};
    const showCorrect=()=>{order=F4_P1_DOCS.map((d,i)=>[d.order,i]).sort((a,b)=>a[0]-b[0]).map(p=>p[1]);paint();cards.forEach(c=>c.classList.add('right'));};
    submit.addEventListener('click',()=>{
      if(f3sBusy||order.length<5)return;
      const ok=order.every((i,n)=>F4_P1_DOCS[i].order===n+1);
      const tries=(f4.attempts.p1order||0)+1;f4.attempts.p1order=tries;saveF4();
      if(ok){cards.forEach(c=>c.classList.add('right'));f3sModal({tone:'good',title:'TIMELINE RECONSTRUCTED',body:'<p>March: the wiring is flagged and the inspection is scheduled. April: maintenance is deferred to cut costs. June: Peter warns Thomas again. September: the fire, the witness, the report.</p>',actions:[['CONTINUE →',()=>{f3sCloseModal();toCheck();}]]});return;}
      const wrong=order.map((i,n)=>F4_P1_DOCS[i].order===n+1?null:n+1).filter(Boolean);
      if(tries<2){f3sModal({tone:'bad',title:'THE DATES DON’T LINE UP',body:`<p>Positions ${wrong.join(', ')} are out of place. Read each date carefully — they are not all written the same way.</p><p class="f3s-left">One more attempt before the file shows you the order.</p>`,actions:[['TRY AGAIN',()=>{f3sCloseModal();order=[];paint();sync();}]]});return;}
      showCorrect();f3sModal({tone:'reveal',title:'THE CORRECT ORDER',body:'<p>1. Maintenance log — 3 March<br>2. Cost-cutting approval — 19 April<br>3. Peter’s email — 2 June<br>4. Witness statement — 22 September<br>5. Incident report — 30 September</p>',actions:[['CONTINUE →',()=>{f3sCloseModal();toCheck();}]]});
    });
  }
  function f4BuildP2(screen){
    const {docs,task}=f4Desk(screen,{step:'PUZZLE 02',title:'THE MISSING PIECE',lead:'Two versions of the same maintenance record, the contractor’s own register, and the index of what was actually released. Something does not match.'});
    docs.innerHTML=F4_P2_DOCS.map(d=>f4Doc(d)).join('');docs.classList.add('f4-four');
    const ask=n=>{const box=task.closest('.f4-desk').querySelector('.f4-task');
      f4Swap(box,()=>{box.classList.remove('settled');f4Ask(box,'p2-'+n,F4_P2_QUESTIONS[n],()=>{if(n<2){f4.p2step=n+1;saveF4();ask(n+1);}else{f4.done.p2=true;saveF4();f4Go(f4Next('p2'));}});
        const step=document.createElement('p');step.className='f4-step';step.textContent=`QUESTION ${n+1} / 3`;box.prepend(step);});};
    ask(Math.min(f4.p2step||0,2));
  }
  // Puzzle 03, The Second Card: the card that put "Peter" at Lake Ash had a twin. Nothing here says Thomas is alive;
  // it only takes away the proof that Peter was the one holding the card.
  const F4_P3_DOCS=[
    {tag:'BANK CARD REGISTER',date:'The Lantern Ltd · company account',title:'Cards issued on the account',body:'Card ending 4417 · issued 2019 · cardholder P. Shaw · ACTIVE\nReplacement card ending 4417 · requested Mon 29 Sep (reason: “card damaged”) · ACTIVE\nOriginal card: not cancelled'},
    {tag:'BRANCH COLLECTION SLIP',date:'Thu 02 Oct · 11:20',title:'Replacement card collected in branch',body:'Card ending 4417 (replacement)\nCollected by: T. Reed, director, with company letter of authority\nID shown: driving licence, T. Reed\nSigned for: T. R.'},
    {tag:'INTERVIEW EXTRACT',date:'16 Oct · Interview Room 2',title:'Peter Shaw, on the card',body:'“I never asked for a new card. Mine was never damaged and it never left my wallet. Check it, it’s right here.”'},
    {tag:'BOAT HIRE SLIP',date:'Tue 14 Oct · 17:40',title:'Lake Ash Boat Hire, east dock',body:'Hirer: P. Shaw (signed)\nPaid: card ending 4417, The Lantern company account\nID: not checked (self-service kiosk)'}
  ];
  const F4_P3_QUESTIONS=[
    {q:'How many working cards ending 4417 existed on the night of 14 October?',options:['One, Peter’s','Two','None, it had been cancelled','Three'],answer:1,hint:'Read the register line by line. Was the original card cancelled when the replacement was issued?',explain:'Two. The replacement was issued and the original was never cancelled, so two cards with the same number were both active on 14 October.'},
    {q:'Who held them?',options:['Peter Shaw, both of them','Peter Shaw and Thomas Reed','Thomas Reed, both of them','The bank kept the replacement'],answer:1,hint:'Peter says his card never left his wallet. Who signed for the replacement at the branch?',explain:'Peter kept the original. The replacement was collected on 2 October by Thomas Reed, twelve days before Lake Ash, and Peter says he never asked for it.'}
  ];
  function f4BuildP3(screen){
    const {docs,task}=f4Desk(screen,{step:'PUZZLE 03',title:'THE SECOND CARD',lead:'Four records about one card. The card that put Peter Shaw’s name at Lake Ash.'});
    docs.innerHTML=F4_P3_DOCS.map(d=>f4Doc(d)).join('');docs.classList.add('f4-four');
    const box=task;
    const written=()=>f4Swap(box,()=>{box.classList.remove('settled');
      box.innerHTML=`<p class="f4-step">QUESTION 3 / 3</p><p class="f4-q">Look again at the boat hire slip. With two cards in two pockets, what does it prove about who was at Lake Ash, and what does it no longer prove?</p><textarea class="f4-verdict-text" placeholder="Write it in your own words, Detective…" spellcheck="true"></textarea><div class="f4-actions"><button type="button" class="f4-btn f4-submit">RECORD IT →</button></div>`;
      const t=box.querySelector('textarea');t.value=f4.p3text||'';t.addEventListener('input',()=>{f4.p3text=t.value;saveF4();});
      box.querySelector('.f4-submit').addEventListener('click',()=>{
        if(f3sBusy)return;if(!t.value.trim()){f3sToast('Write a few words first, Detective.');t.focus();return;}
        f4.done.p3=true;saveF4();
        f3sModal({tone:'good',title:'ON RECORD',body:'<p>The slip proves that a card ending 4417 paid for Boat No. 6 at 17:40, and that whoever typed the name typed <b>P. Shaw</b>. Nobody checked a face.</p><p class="f3s-left">It no longer proves that Peter was the one at the dock. There were two cards. One was in Peter’s wallet. The other was signed for by Thomas Reed, twelve days before he went to the water.</p>',actions:[['CONTINUE →',()=>{f3sCloseModal();f4Go(f4Next('p3'));}]]});
      });});
    const ask=n=>f4Swap(box,()=>{box.classList.remove('settled');f4Ask(box,'p3-'+n,F4_P3_QUESTIONS[n],()=>{if(n<1){f4.p3step=1;saveF4();ask(1);}else{f4.p3step=2;saveF4();written();}});
      const step=document.createElement('p');step.className='f4-step';step.textContent=`QUESTION ${n+1} / 3`;box.prepend(step);});
    if((f4.p3step||0)>=2)written();else ask(f4.p3step||0);
  }
  function f4BuildVerdict(screen){
    const {docs,task}=f4Desk(screen,{step:'YOUR PROVISIONAL VERDICT',title:'THE LANTERN FIRE — INVESTIGATOR’S FINDINGS',lead:'Before the file tells you anything more, put your own assessment on record.'});
    docs.remove();screen.classList.add('f4-verdict');
    task.innerHTML=`<p class="f4-q">What do you believe happened at The Lantern? Which facts are established, which claims remain unverified, and what evidence would you need before accusing anyone?</p><textarea class="f4-verdict-text" placeholder="Write your findings, Detective…" spellcheck="true"></textarea><div class="f4-actions"><span class="f4-count"></span><button type="button" class="f4-btn f4-submit">RECORD MY FINDINGS →</button></div>`;
    const t=task.querySelector('textarea'),count=task.querySelector('.f4-count');t.value=f4.verdict||'';
    const words=()=>t.value.trim()?t.value.trim().split(/\s+/).length:0;
    const upd=()=>{count.textContent=`${words()} words`;f4.verdict=t.value;saveF4();};t.addEventListener('input',upd);upd();
    task.querySelector('.f4-submit').addEventListener('click',()=>{
      if(f3sBusy)return;
      if(!t.value.trim()){f3sToast('Write a few words first, Detective.');t.focus();return;}
      // Not graded: acknowledge the reasoning habits we can see, and note the ones worth adding.
      const v=t.value.toLowerCase(),seen=[],missing=[];
      (/inspect|maintenance|record|log|ins-?0417|certificate|attachment/.test(v)?seen:missing).push('the documents themselves');
      (/unverif|not (been )?verified|cannot|can't|not proven|no evidence|unclear|unknown|uncertain|not establish/.test(v)?seen:missing).push('what the records cannot prove');
      (/need|would want|require|interview|original|forensic|contractor|witness|more evidence/.test(v)?seen:missing).push('the evidence you would still need');
      f4.verdictSaved=true;saveF4();
      f3sModal({tone:'good',title:'FINDINGS RECORDED',body:`<p>Your assessment is now part of the case file.</p>${seen.length?`<p>You grounded it in ${seen.join(', ')}.</p>`:''}<p class="f3s-left"><b>The file’s own reading:</b> the wiring was flagged in March, maintenance was deferred in April on Thomas’s approval, and Peter warned him again in June. The inspection was never carried out. Two days after a musician died, the record handed to investigators was rewritten under Peter Shaw’s login to say it was, citing a certificate that does not exist.</p>`,actions:[['CONTINUE →',()=>{f3sCloseModal();f4Go(f4Next('verdict'));}]]});
    });
  }
  function f4Finish(){
    progress.file04Complete=true;if(progress.file05WallSeen!==true)progress.file05WallSeen=false;persistProgress();
    f4.screen='final';saveF4();closeF3Stage();paintProgress();
    // the wall waits with File 004 closed; CONTINUE reveals File 005 (see #continueFileFive)
  }
  function f4Skip(){if(!$('#f3sChapter').hidden)return;f3sCloseModal();const next=f4Next(f4.screen);if(next)f4Go(next);else f4Finish();}
  function f4Retry(){if(!$('#f3sChapter').hidden)return;f4={screen:'s1',attempts:{},done:{},order:[],check:null,p2:[null,null,null],p2step:0,p3step:0,p3text:'',verdict:'',verdictSaved:false};saveF4();progress.file04Complete=false;persistProgress();paintProgress();f3sCloseModal();f4Go('s1');}
  // ---------------------------------------------------------------------------------------------
  // File 005 — The Last Transmission. Runs inside #f3Stage (data-mode="f5") with the same parts as File 004.
  // Opening → physical evidence envelope → the one final deduction → Thomas's transmission → case closed → Why Case 25?
  const F5_KEY='case25File005V1';
  // File 005 is told in three puzzles. Each one takes back one piece of the Lake Ash night: the card, the blood, the voice.
  // Nothing says Thomas is alive until the player has put it together.
  F3S_CHAPTERS.push(['PUZZLE 01','THE SECOND CARD'],['PUZZLE 02','THE OLD BLOOD'],['PUZZLE 03','THE VOICE IN THE ARCHIVE']);
  const F5_CH=[F3S_CHAPTERS.length-3,F3S_CHAPTERS.length-2,F3S_CHAPTERS.length-1];
  const F5_P1_DOCS=[
    {tag:'BANK CARD REGISTER',date:'The Lantern Ltd · company account',title:'Cards issued on the account',body:'Card ending 4417 · issued 2019 · cardholder P. Shaw · ACTIVE\nReplacement card ending 4417 · requested Mon 29 Sep (reason: “card damaged”) · ACTIVE\nOriginal card: not cancelled'},
    {tag:'BRANCH COLLECTION SLIP',date:'Thu 02 Oct · 11:20',title:'Replacement card collected in branch',body:'Card ending 4417 (replacement)\nCollected by: T. Reed, director, with company letter of authority\nID shown: driving licence, T. Reed\nSigned for: T. R.'},
    {tag:'INTERVIEW EXTRACT',date:'16 Oct · Interview Room 2',title:'Peter Shaw, on the card',body:'“I never asked for a new card. Mine was never damaged and it never left my wallet. Check it, it’s right here.”'},
    {tag:'BOAT HIRE SLIP',date:'Tue 14 Oct · 17:40',title:'Lake Ash Boat Hire, east dock',body:'Hirer: P. Shaw (signed)\nPaid: card ending 4417, The Lantern company account\nID: not checked (self-service kiosk)'}
  ];
  const F5_P1_QS=[
    {q:'How many working cards ending 4417 existed on the night of 14 October?',options:['One, Peter’s','Two','None, it had been cancelled','Three'],answer:1,hint:'Read the register line by line. Was the original card cancelled when the replacement was issued?',explain:'Two. The replacement was issued and the original was never cancelled, so two cards with the same number were both active on 14 October.'},
    {q:'Who held them?',options:['Peter Shaw, both of them','Peter Shaw and Thomas Reed','Thomas Reed, both of them','The bank kept the replacement'],answer:1,hint:'Peter says his card never left his wallet. Who signed for the replacement at the branch?',explain:'Peter kept the original. The replacement was collected on 2 October by Thomas Reed, twelve days before Lake Ash. Peter says he never asked for it.'}
  ];
  const F5_P2_DOCS=[
    {tag:'LABORATORY NOTE',date:'15 Oct',title:'Blood on the boat gunwale',body:'Blood type A positive, consistent with Thomas Reed’s medical file.\nSample degraded: cells broken down, as in blood several days old.\nDNA inconclusive.'},
    {tag:'HOSPITAL RECORD',date:'St. Agnes Hospital · blood bank',title:'Autologous donation: patient’s own blood',body:'Patient: Thomas Reed · Type A positive\n12 Sep: two units donated and stored for planned knee surgery\n10 Oct, 09:40: both units withdrawn at the patient’s own request. Surgery cancelled.'},
    {tag:'BLOOD BANK GUIDANCE',date:'Storage notice',title:'Stored blood out of the refrigerator',body:'Once removed from cold storage, stored blood begins to break down within hours and is visibly degraded within days.'},
    {tag:'SEARCH SUMMARY',date:'Lake Ash · 15–18 Oct',title:'Items recovered',body:'Boat No. 6, drifting, east shore.\nJacket: folded, under the stern seat. Watch: in the jacket pocket, stopped at 23:47.\nNo body recovered.'}
  ];
  const F5_P2_QS=[
    {q:'Whose blood was on the boat, and when had it left the hospital?',options:['Thomas’s, from a wound that night','Peter’s, his type matched','Thomas’s own stored blood, withdrawn on 10 October, four days earlier','Someone else’s; the type was common'],answer:2,hint:'The lab says the blood was already days old. Which record shows Thomas’s blood leaving a refrigerator before the 14th?',explain:'The blood was Thomas’s, but it was not spilled that night. Two units of his own stored blood left the hospital at his request on 10 October, and by the 14th they had broken down exactly as the lab found.'},
    {q:'A drowning man does not fold his jacket. What explains every record at Lake Ash?',options:['Peter killed Thomas and hid the body in the lake.','Thomas fell overboard by accident.','Thomas staged his own death: his stored blood, a copy of Peter’s card, Peter’s name on the slip.','A stranger robbed and killed Thomas.'],answer:2,hint:'Put the card, the blood and the folded jacket together. Who could have arranged all three?',explain:'Every piece of Lake Ash was placed: blood he had stored himself, a card he had collected himself, a name typed into a kiosk nobody watched, and a jacket folded neatly by a man who was not in a hurry.'}
  ];
  const F5_P3_DOCS=[
    {tag:'APPROVAL MEMO · FILE 004',date:'19 April 2016',title:'Margin note, in Thomas’s hand',body:'“Every place has a story it tells the public. Ours will not be this one. — T.”'},
    {tag:'TRANSMISSION · FILE 004',date:'From M',title:'The opening of the Lantern file',body:'“Every place has a story it tells the public.\nThis is the story its records left behind.”'},
    {tag:'OFFICE SAFE LOG',date:'The Lantern · Tue 30 Sep',title:'Safe opened outside hours',body:'23:05 · code entered: T. REED\nContents on record: one file, “PROJECT NORTH QUAY / FIRE”, kept by P. Shaw.'},
    {tag:'PHYSICAL EVIDENCE',date:'If you were given handwritten notes',title:'Compare the hands',body:'Lay M’s handwritten note beside Thomas’s margin note.\nLook at the S. Look at the way the line runs uphill.'}
  ];
  const F5_P3_Q={q:'Who has been sending the transmissions?',options:['Peter Shaw','Daniel Cross','Elena Ward','Thomas Reed'],answer:3,hint:'Whose words did M use? Whose hand? And who opened Peter’s safe two weeks before Lake Ash?',explain:'M uses Thomas’s own private line, writes in Thomas’s hand, and knew what was in Peter’s safe because Thomas opened it on 30 September. M is Thomas Reed.'};
  const F5_STORY={
    s1:{kicker:'CASE 25 · RESTRICTED ARCHIVE',eyebrow:'FILE 005 · FINAL REVIEW',title:'THE LAST TRANSMISSION',button:'OPEN THE LAST FILE',tell:true,text:`Peter Shaw has been in a cell for two nights.\nThe charge is murder.\n\nThe papers say the case is closed.\nThe police say the evidence speaks for itself.\n\nIt does.\nIt says exactly what it was built to say.\n\n!Three records were never read side by side.\n\nA bank slip. A hospital form. A note in the margin of an old memo.\n\nRead them together, Detective.\nThen tell me who walked away from Lake Ash.`},
    s4:{kicker:'INCOMING TRANSMISSION · SOURCE IDENTIFIED',eyebrow:'THOMAS REED · ALIVE',title:'YOU FOUND ME.',button:'CLOSE CASE 25',hand:true,text:`Hello, Detective.\nYes. It’s me.\n!I am M.\n\nNine years ago a musician died on my stage.\nPeter rewrote the record that night, and I let him.\nThat is the part of this I will carry.\n\nThen I opened his safe.\nHe had kept a file on me for nine years.\nThe memo with my signature. The repairs I deferred.\nEverything he needed to bury me with the fire, the day anyone asked.\n\nSo I gave him a different story to be buried in.\n\nMy blood, from a hospital fridge.\nHis card, from a bank counter.\nHis name, typed into a machine no one was watching.\nA jacket, folded the way I fold it.\n\nI did not lie to you once.\nEvery record you read was real.\nI only chose the order you read them in.\n\nPeter is in a cell for a murder that never happened.\nHe is not innocent. He is just not guilty of this.\n\nAnd I am nowhere.\n\n!Thank you, Detective.\n!I couldn’t have put him there without you.\n\n— T.`}
  };
  const F5_FLOW=['s1','p1','p2','p3','s4','closed','why'];
  const F5_FILES=[['FILE 001','THE DISAPPEARANCE'],['FILE 002','THE UNEXPECTED SIGNAL'],['FILE 003','THE FINANCIAL TRAIL'],['FILE 004','THE LANTERN FIRE'],['FILE 005','THE LAST TRANSMISSION']];
  const F5_FINDINGS=[['Thomas Reed','Alive. Staged his death at Lake Ash with his own stored blood and a copy of Peter’s card. He is M.'],['Peter Shaw','Rewrote the fire record in 2016 and kept a file to blame Thomas. Now in custody for a murder that never happened.'],['The Lantern fire','The wiring was never inspected. A musician died. The record was falsified afterwards.'],['Lake Ash','No body. The blood was days old. The jacket was folded.'],['Daniel Cross','A journalist who knew too much. Never M.'],['Case 25','Every record was real. Only the order was chosen.']];
  function readF5(){const fresh={screen:'s1',attempts:{},p1step:0,p2step:0,p1text:'',p3text:'',p3step:0};try{return {...fresh,...JSON.parse(localStorage.getItem(F5_KEY)||'{}')};}catch{return fresh;}}
  let f5=readF5();
  const saveF5=()=>{try{localStorage.setItem(F5_KEY,JSON.stringify(f5));}catch{}};
  const f5Next=id=>F5_FLOW[F5_FLOW.indexOf(id)+1];
  function openF5Stage(){
    clearTimers();
    const stage=$('#f3Stage');stage.dataset.mode='f5';stage.hidden=false;
    $('#f3sList').hidden=true;$('#f3sReturn').hidden=true;$('#backButton').disabled=false;
    requestAnimationFrame(()=>stage.classList.add('visible'));
    if(!F5_FLOW.includes(f5.screen)||progress.file05Complete)f5.screen='s1';
    f5Go(f5.screen,{resume:true});
  }
  function f5Go(id,{resume=false}={}){
    f3sSetHint('');
    f5.screen=id;saveF5();
    const n=['p1','p2','p3'].indexOf(id);
    if(n>=0&&!resume)f3sChapterCard(F5_CH[n],()=>f5Mount(id,true));else f5Mount(id,false);
  }
  function f5Mount(id,fromChapter){
    const stage=$('#f3Stage'),old=[...stage.querySelectorAll('.f3s-screen')];
    const screen=document.createElement('section');screen.className='f3s-screen f4-screen f5-screen';screen.dataset.screen=id;
    if(F5_STORY[id])f5BuildStory(screen,id);else if(id==='p1')f5BuildP1(screen);else if(id==='p2')f5BuildP2(screen);else if(id==='p3')f5BuildP3(screen);else if(id==='closed')f5BuildClosed(screen);else f5BuildWhy(screen);
    stage.insertBefore(screen,$('#f3sChapter'));
    if(/^p\d$/.test(id))f4DeskEnter(screen);
    const mode=reducedMotion||!old.length?null:F5_STORY[id]?'ink':fromChapter?{p1:'swing',p2:'match',p3:'catch'}[id]:id==='closed'?'turn':id==='why'?'relight':'sweep';
    if(mode){screen.classList.add('fx-on','enter');f3sArrive(screen,mode,old);}
    else{requestAnimationFrame(()=>screen.classList.add('enter'));old.forEach(s=>{s.classList.add('leave');setTimeout(()=>s.remove(),1100);});}
  }
  const f5Continue=id=>{const next=f5Next(id);if(next)f5Go(next);else f5Finish();};
  function f5BuildStory(screen,id){
    cineStory(screen,F5_STORY[id],id==='s4'?'reveal':'lakenight',()=>f5Continue(id));
  }
  // two choice questions, then a written one that is always accepted and answered with the file's own reading
  function f5Puzzle(screen,key,{title,lead,docs:list,qs,written,reading}){
    const {docs,task}=f4Desk(screen,{file:'FILE 005 · THE LAST TRANSMISSION',step:key.toUpperCase().replace('P','PUZZLE 0'),title,lead});
    docs.innerHTML=list.map(d=>f4Doc(d)).join('');docs.classList.add('f4-four');
    const total=qs.length+(written?1:0),stepKey=key+'step';
    const done=()=>{f5.done=f5.done||{};f5.done[key]=true;saveF5();f5Continue(key);};
    const writeQ=()=>f4Swap(task,()=>{task.classList.remove('settled');
      task.innerHTML=`<p class="f4-step">QUESTION ${total} / ${total}</p><p class="f4-q">${f3sEsc(written)}</p><textarea class="f4-verdict-text" placeholder="Write it in your own words, Detective…" spellcheck="true"></textarea><div class="f4-actions"><button type="button" class="f4-btn f4-submit">RECORD IT →</button></div>`;
      const t=task.querySelector('textarea');t.value=f5[key+'text']||'';t.addEventListener('input',()=>{f5[key+'text']=t.value;saveF5();});
      task.querySelector('.f4-submit').addEventListener('click',()=>{if(!t.value.trim()){f3sToast('Write a few words first, Detective.');t.focus();return;}
        f3sModal({tone:'good',title:'ON RECORD',body:reading,actions:[['CONTINUE →',()=>{f3sCloseModal();done();}]]});});});
    const ask=n=>f4Swap(task,()=>{task.classList.remove('settled');f4Ask(task,key+'-'+n,qs[n],()=>{f5[stepKey]=n+1;saveF5();if(n+1<qs.length)ask(n+1);else if(written)writeQ();else done();},f5,saveF5);
      const st=document.createElement('p');st.className='f4-step';st.textContent=`QUESTION ${n+1} / ${total}`;task.prepend(st);});
    const at=f5[stepKey]||0;if(at>=qs.length&&written)writeQ();else ask(Math.min(at,qs.length-1));
  }
  function f5BuildP1(screen){
    f5Puzzle(screen,'p1',{title:'THE SECOND CARD',lead:'Four records about one card: the card that put Peter Shaw’s name at Lake Ash.',docs:F5_P1_DOCS,qs:F5_P1_QS,
      written:'Look again at the boat hire slip. With two cards in two pockets, what does it prove about who was at Lake Ash, and what does it no longer prove?',
      reading:'<p>The slip proves that a card ending 4417 paid for Boat No. 6 at 17:40, and that whoever stood at the kiosk typed <b>P. Shaw</b>. Nobody checked a face.</p><p class="f3s-left">It no longer proves Peter was at the dock. One card was in Peter’s wallet. The other was signed for by Thomas Reed, twelve days before he went to the water.</p>'});
  }
  function f5BuildP2(screen){
    f5Puzzle(screen,'p2',{title:'THE OLD BLOOD',lead:'The lab note from the boat, and three records nobody filed beside it.',docs:F5_P2_DOCS,qs:F5_P2_QS});
  }
  function f5BuildP3(screen){
    f5Puzzle(screen,'p3',{title:'THE VOICE IN THE ARCHIVE',lead:'M has written to you since the first file. Listen to how M writes.',docs:F5_P3_DOCS,qs:[F5_P3_Q],
      written:'Thomas found Peter’s file on 30 September and walked away from Lake Ash on 14 October. In your own words: why did he do it this way?',
      reading:'<p>Peter had spent nine years building a file to bury Thomas with the fire. Thomas found it, and turned it around.</p><p class="f3s-left">He could not prove what Peter did in 2016 without confessing what he had done himself. So he gave Peter a crime he could be convicted of: a murder, built from Peter’s own name and Peter’s own card. Then he disappeared, and sent a detective to find it.</p>'});
  }
  function f5BuildClosed(screen){
    screen.classList.add('f5-closed');
    screen.innerHTML=`<div class="f4-desk-bg"></div><div class="f5-closed-wrap"><div class="f5-files">${F5_FILES.map(([n,t],i)=>`<article class="f5-file" style="--d:${.5+i*.55}s"><span>${n}</span><b>${t}</b><i class="f5-stamp${i===4?' final':''}">${i===4?'CASE CLOSED':'REVIEWED'}</i></article>`).join('')}</div><section class="f5-determination"><h2>FINAL CASE DETERMINATION</h2><ul>${F5_FINDINGS.map(([who,what])=>`<li><b>${f3sEsc(who)}</b><span>${f3sEsc(what)}</span></li>`).join('')}</ul><p class="f5-line">The truth was never hidden in a single document. It was hidden in the space between them.</p><div class="f4-actions"><button type="button" class="f4-btn f4-submit">CONTINUE →</button></div></section></div>`;
    screen.querySelector('.f4-submit').addEventListener('click',()=>f5Continue('closed'));
  }
  function f5BuildWhy(screen){
    screen.classList.add('f5-why');
    screen.innerHTML=`<div class="f5-why-dark"></div><article class="f5-parchment"><small>CASE 25 · SUPPLEMENTARY ITEM</small><h2>ONE LAST THING, DETECTIVE.</h2><div class="f5-why-copy"><p>Before you go, there is one small thing waiting for you.</p><p>You followed every lead, questioned every assumption, and saw the investigation through to its end.</p><p>But there was one detail you never questioned.</p><p class="f5-big">Why Case 25?</p><p>Because this case was made for someone turning twenty-five.</p><p>Twenty-five years. Countless memories. And a whole lot of stories still waiting to happen.</p><p>The fictional case is closed.</p><p class="f5-big">The real celebration is just beginning.</p></div><button type="button" class="f4-btn f4-submit">END TRANSMISSION →</button></article>`;
    const lines=[...screen.querySelectorAll('.f5-why-copy p')];lines.forEach((p,i)=>p.style.setProperty('--d',`${.8+i*1.1}s`));
    screen.querySelector('.f4-submit').style.setProperty('--d',`${.8+lines.length*1.1+.4}s`);
    screen.querySelector('.f4-submit').addEventListener('click',()=>f5Continue('why'));
  }
  function f5Finish(){
    progress.file05Complete=true;persistProgress();
    f5.screen='why';saveF5();closeF3Stage();paintProgress();
  }
  function f5Skip(){f3sCloseModal();f5Continue(f5.screen);}
  function f5Retry(){f5={screen:'s1',attempts:{},p1step:0,p2step:0,p3step:0,p1text:'',p3text:''};saveF5();progress.file05Complete=false;persistProgress();paintProgress();f3sCloseModal();f5Go('s1');}
})();
