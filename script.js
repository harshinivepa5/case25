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
  let timers = [], clueIndex = 0, audioContext = null, audioNodes = [];
  let soundBus = null; // must exist before the first showHomeBoard() -> stopSound() on page load
  let musicWanted = true;
  // File 003's puzzles play without the score: it fades out while the stage is open and comes back after.
  function setMusic(on){musicWanted=on;if(audioContext&&soundBus)soundBus.gain.setTargetAtTime(on?1:.0001,audioContext.currentTime,.5);}
  // Wall intro state and artwork points; showHomeBoard() reads them on page load, so they live up here.
  let wallIntroRun = 0;
  const WALL_FOUR_CLASSES = ['wall-four-intro','wall-four-card','wall-four-string','wall-four-rest'];
  let wallFourRun = 0;
  const WALL_FIVE_CLASSES = ['wall-five-intro','wall-five-card','wall-five-string','wall-five-rest'];
  let wallFiveRun = 0;
  const F5C = [['.file05-art-number', 'FILE 005', 60], ['.file05-art-title', 'THE LAST TRANSMISSION', 40]];
  const F4C = [['.file04-art-number', 'FILE 004', 60], ['.file04-art-title', 'THE LANTERN FIRE', 42]];
  const F3C = [['.file03-art-number', 'FILE 003', 60], ['.file03-art-title', 'THE FINANCIAL TRAIL', 42]];
  const F2C = { num: 'FILE 002', title: 'THE UNEXPECTED SIGNAL', copy: 'Something else is buried\nwithin this archive.' };
  const WALL_THREE_CLASSES = ['wall-three-intro','wall-three-dot','wall-three-card','wall-three-type','wall-three-string','wall-three-rest'];
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
    requestAnimationFrame(wallGeometry);
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
  if(previewHome || progress.caseAccepted) showHomeBoard(); else later(pushIntoLake, 4500);
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
    const interval=setInterval(()=>{pct=Math.min(100,pct+2);fill.style.width=pct+'%';$('#decryptPercent').textContent=String(pct).padStart(2,'0');const current=statuses.reduce((a,s)=>pct>=s[0]?s:a,statuses[0]);$('#archiveProgress small').textContent=current[1];if(pct===100){clearInterval(interval);$('#archiveProgress small').textContent='ARCHIVE RECOVERED';setTimeout(()=>{$('#archiveScene').classList.remove('decrypting');$('#archiveScene').classList.add('unsealed');later(()=>file1Bars(showTransmission),500);},700);}},reducedMotion?20:120);
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
    later(() => home.classList.add('document-lit'), reducedMotion ? 0 : 3000);
    later(() => home.classList.add('wall-reveal'), reducedMotion ? 0 : 7200);
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
    step(4300, 'wall-three-string'); step(5300, 'wall-three-rest');
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
    step(4200, 'wall-four-string'); step(5200, 'wall-four-rest');
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
    step(4200, 'wall-five-string'); step(5200, 'wall-five-rest');
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

  $('#continueFileFour')?.addEventListener('click', () => {
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
      const lab=document.createElement('i');lab.className='fb-label';lab.textContent='ARCHIVE UNSEALED';ov.append(lab);host.append(ov);
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
    show(scenes[8]); setPhase(0);
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
    'p1-q1':{kind:'choice',puzzle:0,opt:[[434,390,656,55],[434,456,656,56],[434,521,656,56]],radio:[470,13],submit:[597,608,329,51],answer:0,options:F3_QUESTIONS[0].options,hint:F3_QUESTIONS[0].hint,explain:F3_QUESTIONS[0].explain,next:'p1-q2'},
    'p1-q2':{kind:'choice',puzzle:0,opt:[[382,387,716,55],[382,452,716,55],[382,517,716,55],[382,582,716,55]],radio:[421,13],submit:[550,664,385,57],answer:1,options:F3_QUESTIONS[1].options,hint:F3_QUESTIONS[1].hint,explain:F3_QUESTIONS[1].explain,next:'p1-q3'},
    'p1-q3':{kind:'choice',puzzle:0,opt:[[382,409,708,55],[382,472,708,55],[382,536,708,54],[382,598,708,54]],radio:[418,13],submit:[547,680,375,54],answer:1,options:['Yes, it’s a verified record.','No, it’s not reliable enough.','Only some of the matches can be trusted.','Not enough information to say.'],hint:'Who verified the allocation sheet? Look for original approvals or signatures, and for bank confirmations behind each match.',explain:'The allocation sheet (PA-07) is an unverified copy. Its invoice matches are suggestions, not independently established facts: there are no original approvals or signatures and no supporting bank confirmations.',next:'p1-q4'},
    'p1-q4':{kind:'written',puzzle:0,text:[380,582,770,106],submit:[583,708,371,52],grade:()=>({accepted:true,missing:[]}),doneTitle:'WHAT THE FILE SHOWS',hint:'Name the three underlying transfers and their invoices, explain T-31-R and NQ-104-R, describe PA-07 as unverified, and say what the records cannot prove.',model:F3S_MODELS['p1-q4'],next:'p1-end'},
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
    'p4-cover':{kind:'live',next:'p4-q1',chapter:3,build:screen=>cineStory(screen,P4_STORY,'lake',()=>f3sGo('p4-q1'))},
    'p4-q1':{kind:'live',next:'p4-q2',puzzle:3,build:screen=>p4BuildQ(screen,0)},
    'p4-q2':{kind:'live',next:'p4-q3',puzzle:3,build:screen=>p4BuildQ(screen,1)},
    'p4-q3':{kind:'live',next:'p4-q4',puzzle:3,build:screen=>p4BuildQ(screen,2)},
    'p4-q4':{kind:'live',next:'p4-end',puzzle:3,build:p4BuildChain},
    'p4-end':{kind:'transmission',kicker:'INCOMING TRANSMISSION · SOURCE: M',eyebrow:'LAKE ASH · REVIEWED',title:'THE LAKE REMEMBERS.',text:`You counted the minutes.\n\nYou ruled out the one who was already in the air.\n\nA boat in one name. A card in the same name. A message that gave a reason.\n\nEvery piece you chose points the same way.\n\nThere is only one person left to ask.\n\n— M`,next:'p5-cover'},
    'p5-cover':{kind:'live',next:'p5-q1',chapter:4,build:screen=>cineStory(screen,P5_STORY,'signal',()=>f3sGo('p5-q1'))},
    'p5-q1':{kind:'live',next:'p5-q2',puzzle:3,build:p5BuildInterview},
    'p5-q2':{kind:'live',next:'p5-q3',puzzle:3,build:p5BuildConclusion},
    'p5-q3':{kind:'live',next:'final',puzzle:3,build:p5BuildM},
    // M's closing letter (final.png) is taller than 16:9, so it is shown whole rather than cropped.
    final:{kind:'message',fit:'contain',art:'final-blank',arrive:'ink',letter:[412,318,1095,1180],cont:[588,1573,688,115],next:'gift'},
    // Thank-you card before the physical gift is handed over; its CONTINUE ends File 03.
    gift:{kind:'message',art:'gift-blank',arrive:'ink',giftCard:true,cont:[552,701,431,82],label:'I FOUND IT',next:null,finish:true}
  };
  const F3S_CHAPTERS=[['PUZZLE 01','NORTH QUAY'],['PUZZLE 02','THE MISSING STORY'],['PUZZLE 03','THE IMPOSSIBLE TIMELINE'],['PUZZLE 04','THE UNRESOLVED THREAD'],['PUZZLE 05','THE CONFRONTATION']];
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
  function closeF3Stage(){
    const stage=$('#f3Stage');stage.classList.remove('visible');f3sCloseModal();
    $('#backButton').disabled=!sceneHistory.length;
    setTimeout(()=>{stage.hidden=true;stage.querySelectorAll('.f3s-screen').forEach(s=>s.remove());},600);
  }
  // Review: replay a finished puzzle from its first question, with a way back to where the player was.
  const F3S_PUZZLE_START=['p1-q1','p2-q1','p3-q1','p4-q1'];
  function f3sReview(n){if(f3sBusy)return;if(!f3s.reviewFrom)f3s.reviewFrom=f3s.screen;f3sGo(F3S_PUZZLE_START[n]);}
  function f3sGo(id,{resume=false}={}){
    if(/^p1-q\d$/.test(id)&&!(f3s.live&&f3s.live.p1read))id='p1-read';
    const def=F3S_SCREENS[id];if(!def)return;
    ensureSound();
    $('#f3sP1Docs').hidden=!/^p1-q/.test(id);
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
    $$('#f3Stage .f3s-screen').forEach(s=>s.classList.add('leave'));
    const showTitle=()=>{
      // the next puzzle on its own screen: the lamp relights behind it and the title types in
      small.textContent=kicker;h.textContent='';small.style.visibility=rule.style.visibility='';
      card.hidden=false;card.classList.remove('out','solved');void card.offsetWidth;card.classList.add('in');
      if(reducedMotion){h.textContent=title;laterWait(()=>{card.hidden=true;done();},900);return;}
      let i=0;const type=()=>{keyTick();h.textContent=title.slice(0,++i);if(i<title.length)laterWait(type,70);else laterWait(()=>{card.classList.add('out');laterWait(()=>{card.hidden=true;card.classList.remove('in','out');},900);done();},1300);};
      laterWait(type,700);
    };
    if(index<1||index>4){showTitle();return;}
    // first, its own screen: the puzzle just finished is stamped SOLVED, then the screen fades to black
    small.textContent='';h.textContent='';small.style.visibility=rule.style.visibility='hidden';
    const st=document.createElement('b');st.className='f3s-solved big';st.textContent=`${F3S_CHAPTERS[index-1][0]} · SOLVED`;card.prepend(st);
    const sub=document.createElement('b');sub.className='f3s-solved-name';sub.textContent=F3S_CHAPTERS[index-1][1];st.after(sub);
    card.hidden=false;card.classList.remove('out','in');card.classList.add('solved');void card.offsetWidth;card.classList.add('in');
    laterWait(()=>sfx('stamp'),reducedMotion?0:450);
    laterWait(()=>{card.classList.add('out');laterWait(()=>{st.remove();sub.remove();card.hidden=true;card.classList.remove('in','out','solved');laterWait(showTitle,250);},900);},reducedMotion?600:2300);
  }
  // Puzzle openings, one per puzzle: 1 lamp swing, 2 the lamp catches, 3 lamp swing, 4 a match strike, 5 a film burn.
  const F3S_OPENINGS=['swing','catch','swing','match','burn'];
  function f3sGlow(bg,frames,ms){
    const g=document.createElement('div');g.className='f3s-glow';g.style.background=bg;$('#f3Stage').insertBefore(g,$('#f3sChapter'));
    g.animate(frames,{duration:ms,fill:'forwards'}).finished.catch(()=>{}).then(()=>g.remove());
  }
  function f3sInk(old){
    const stage=$('#f3Stage');
    if(!$('#f3sInkDefs')){stage.insertAdjacentHTML('beforeend','<svg id="f3sInkDefs" width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="f3sInkEdge" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="7"/><feDisplacementMap in="SourceGraphic" scale="70"/></filter></svg>');}
    const ink=document.createElement('div');ink.className='f3s-ink';stage.insertBefore(ink,$('#f3sChapter'));
    const drops=[[50,48,0],[28,30,260],[74,66,420],[66,22,560],[22,74,700]];
    drops.forEach(([x,y,d])=>{const b=document.createElement('i');b.style.left=x+'%';b.style.top=y+'%';ink.append(b);
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
  function f3sMount(id,{fromChapter=false}={}){
    const def=F3S_SCREENS[id],stage=$('#f3Stage'),old=[...stage.querySelectorAll('.f3s-screen')];
    const screen=document.createElement('section');screen.className=`f3s-screen f3s-${def.kind}`+(fromChapter?' from-chapter':'');screen.dataset.screen=id;if(def.fit)screen.dataset.fit=def.fit;
    if(def.kind==='transmission')f3sBuildTransmission(screen,def);
    else if(def.kind==='live'){screen.classList.add('f4-screen');def.build(screen,id);}
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
    f3s.screen='final';saveF3S();closeF3Stage();paintProgress();
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
    const paras=F3S_CLOSING.split('\n\n');
    const nodes=paras.map(t=>{const p=document.createElement('p');p.className='f3s-lp';
      if(t.startsWith('[['))p.innerHTML=`<span class="f3s-letter-mark">${f3sEsc(t.slice(2,-2))}</span>`;else p.textContent=t;box.append(p);return p;});
    const sign=document.createElement('div');sign.className='f3s-letter-sign';sign.textContent='— M';box.append(sign);
    screen.classList.add('typing');
    const anims=[];
    const finish=()=>{anims.forEach(a=>a.finish());nodes.forEach(p=>p.style.opacity=1);sign.classList.add('shown','written');screen.classList.remove('typing');};
    if(reducedMotion){finish();return;}
    nodes.forEach(p=>p.style.opacity=0);
    let t=3400;
    nodes.forEach((p,i)=>{const key=/Peter Shaw|\[\[/.test(paras[i]);
      anims.push(p.animate(key?[{opacity:0,filter:'blur(7px)',color:'#5a0f08'},{opacity:.9,filter:'blur(1.5px)',color:'#5a0f08',offset:.45},{opacity:1,filter:'blur(0)',color:'#2a1f15'}]
        :[{opacity:0,filter:'blur(6px)'},{opacity:.85,filter:'blur(1.2px)',offset:.5},{opacity:1,filter:'blur(0)'}],{duration:key?2600:1700,delay:t,easing:'ease-out',fill:'forwards'}));
      t+=key?1700:900;});
    laterWait(()=>{if(!screen.classList.contains('typing'))return;sign.classList.add('shown','written');laterWait(()=>screen.classList.remove('typing'),1500);},t+300);
    screen.addEventListener('click',e=>{if(screen.classList.contains('typing')&&!e.target.closest('.f3s-skip'))finish();});
  }
  // The thank-you card before the physical gift: written live over the blank card, quietly, one line at a time.
  function f3sGiftCard(screen,box,go){
    box.innerHTML=`<small>CASE 25 · AN ITEM NOT IN THE ARCHIVE</small><i></i><h2>SOMETHING WAS LEFT FOR YOU</h2><b></b>
      <p>Every file in this archive was meant for the record.</p><p>This one was not.</p><p class="gc-gap">Look up from the screen, Detective.</p><p>It is closer than you think.</p>`;
    const parts=[...box.children];go.style.opacity=0;go.style.pointerEvents='none';
    if(reducedMotion){go.style.opacity=1;go.style.pointerEvents='';return;}
    parts.forEach(p=>p.style.opacity=0);
    let t=3400;
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
    sfx(({reveal:'sting'})[tone]);
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
    lake:{img:'assets/lake-ash.png',fx:'mist',tone:'cold'},
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
  function cineStory(screen,d,scene,onDone){
    const sc=CINE_SCENES[scene]||CINE_SCENES.board;
    screen.classList.add('cine',`cine-${scene}`,`tone-${sc.tone}`);
    const paras=d.text.split('\n\n');
    screen.innerHTML=`<div class="cine-layer">${sc.img?`<div class="cine-img" style="background-image:url('${sc.img}')"></div>`:CINE_STAGE_SVG(sc.stage)}${sc.figure?'<svg class="cine-figure" viewBox="0 0 120 300" aria-hidden="true"><ellipse cx="60" cy="34" rx="17" ry="20" fill="#05070a"/><path d="M30 60 Q60 48 90 60 L104 200 Q60 214 16 200 Z" fill="#05070a"/><path d="M34 198 L30 296 L54 296 L58 204Z M66 204 L70 296 L94 296 L88 198Z" fill="#05070a"/></svg>':''}<canvas class="cine-fx"></canvas><div class="cine-grade"></div></div>
      <div class="cine-bar top"></div><div class="cine-bar bottom"></div>
      <div class="cine-text"><header><small>${f3sEsc(d.kicker)}</small><span>${f3sEsc(d.eyebrow)}</span><h2>${f3sEsc(d.title)}</h2></header><div class="cine-lines" aria-live="polite">${paras.map(p=>`<p>${f3sEsc(p).replace(/\n/g,'<br>')}</p>`).join('')}</div>
      <button type="button" class="f3s-tx-continue cine-go" hidden>${f3sEsc(d.button)} <span>→</span></button></div>`;
    cineFx(screen.querySelector('.cine-fx'),sc.fx);
    const lines=[...screen.querySelectorAll('.cine-lines p')],box=screen.querySelector('.cine-lines'),go=screen.querySelector('.cine-go');
    go.addEventListener('click',onDone);
    let n=0,finished=false;
    // paragraphs fill the panel like pages: when the next one would not fit, the page clears and it starts a new one
    const fits=()=>box.scrollHeight<=box.clientHeight+2;
    const show=i=>{lines[i].classList.add('on');if(!fits()){lines.slice(0,i).forEach(p=>p.classList.add('gone'));}};
    const finish=()=>{if(finished)return;finished=true;lines.forEach(p=>{p.classList.add('on');p.classList.remove('gone');});
      let start=lines.length-1;while(start>0){lines.slice(0,start).forEach(p=>p.classList.add('gone'));lines.slice(start-1).forEach(p=>p.classList.remove('gone'));if(!fits()){lines[start-1].classList.add('gone');break;}start--;}
      go.hidden=false;go.focus({preventScroll:true});};
    const next=()=>{if(finished||!screen.isConnected)return;if(n>=lines.length){laterWait(finish,500);return;}show(n);const len=lines[n].textContent.length;n++;laterWait(next,reducedMotion?0:Math.min(5200,1100+len*38));};
    laterWait(next,700);
    screen.addEventListener('click',e=>{if(!finished&&!e.target.closest('button'))finish();});
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
    ({key:()=>{const n=c.sampleRate*.03|0,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=b;f.type='bandpass';f.frequency.value=1100;f.Q.value=.8;g.gain.value=.3;src.connect(f);f.connect(g);g.connect(c.destination);src.start(t0);},stamp:()=>{tone(95,.3,'sine',.3,40);tone(240,.07,'square',.04,90);},sting:()=>{tone(58,1.8,'sine',.16,44);tone(311,1.2,'triangle',.02,0,.1);},paper:()=>{const n=c.sampleRate*.45|0,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=b;f.type='bandpass';f.frequency.value=1700;g.gain.value=.4;src.connect(f);f.connect(g);g.connect(c.destination);src.start(t0);}})[kind]?.();
  }
  // ---------------------------------------------------------------------------------------------
  // File 003, puzzle 1: the five documents are read first, then stay one click away during the questions.
  const P1_DOCS=[['DOCUMENT 1','Statement of Account'],['DOCUMENT 2','Invoice Register'],['DOCUMENT 3','Bank Export'],['DOCUMENT 4','Payment Allocation Sheet'],['DOCUMENT 5','Internal Memo']];
  function p1Viewer(host,start,onOpen){
    host.innerHTML=`<div class="p1v-tabs">${P1_DOCS.map(([a,b],i)=>`<button type="button" class="p1v-tab" data-i="${i}"><small>${a}</small>${b}</button>`).join('')}</div><div class="p1v-frame"><img alt=""></div>`;
    const img=host.querySelector('img'),tabs=[...host.querySelectorAll('.p1v-tab')];
    const show=i=>{img.src=`assets/file-003/docs/p1-doc-${i+1}.jpg`;img.alt=P1_DOCS[i][1];tabs.forEach((t,n)=>{t.classList.toggle('on',n===i);if(n===i)t.classList.add('seen');});if(onOpen)onOpen(i);};
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
  const P4_STORY={kicker:'FILE 003 · PUZZLE 04',eyebrow:'LAKE ASH · OCTOBER 14',title:'THE UNRESOLVED THREAD',button:'EXAMINE THE EVIDENCE',text:`Until now, you have read what the records could not prove.\n\nThe police have since reopened the lake evidence.\n\nA boat. A toll receipt. A laboratory note. And the last message Thomas Reed ever sent.\n\nSeven documents. One night.\n\nDecide what they mean.`};
  const P5_STORY={kicker:'FILE 003 · PUZZLE 05',eyebrow:'OCTOBER 16 · INTERVIEW ROOM 2',title:'THE CONFRONTATION',button:'BEGIN THE INTERVIEW',text:`Peter Shaw agreed to be interviewed.\n\nHe came alone. He declined a lawyer.\n\nThe recording starts now.\n\nHe will answer four questions.\n\nFor each answer, find the document that says otherwise.`};
  const P4_DOCS=[
    {tag:'BOAT HIRE SLIP',date:'Tue 14 Oct · 17:40',title:'Lake Ash Boat Hire — east dock',body:'Hirer: P. Shaw (signed)\nBoat: No. 6, rowing skiff with outboard\nPaid: card ending 4417 — The Lantern company account\nID: not checked (self-service kiosk)\nDue back: 21:00\nStatus: NOT RETURNED'},
    {tag:'TOLL RECEIPT',date:'14 Oct · 21:00 · verified gate clock',title:'Lake Ash Road — toll gate',body:'Vehicle: car, towards the lake\nPaid: card ending 4417\nCardholder: P. Shaw, The Lantern'},
    {tag:'POLICE ROUTE NOTE',date:'16 Oct',title:'Drive time, The Lantern to the toll gate',body:'Measured at normal speed: 41 minutes.\nThe Lantern exit camera: a vehicle enters the frame at displayed 20:16:11 and leaves the exit at 20:19:04.\nThe camera clock has not been independently checked.'},
    {tag:'LABORATORY NOTE',date:'15 Oct',title:'Blood on the boat gunwale',body:'Blood type A positive — consistent with Thomas Reed’s medical file.\nSample degraded. DNA inconclusive.\nLake Ash at the east dock: 38 m deep, cold. Remains rarely surface.'},
    {tag:'BUY–SELL AGREEMENT',date:'Signed 2019',title:'The Lantern — partners’ agreement',body:'If either partner dies, the surviving partner acquires 100% of the business.\nEstimated value: ₹5 crore.'},
    {tag:'MESSAGE LOG',date:'14 Oct · 19:58',title:'Thomas Reed → Peter Shaw',body:'“Tomorrow I tell the board about the 2.40 crore. Don’t make this harder than it is.”\nStatus: delivered, read 19:59.'},
    {tag:'TRAVEL RECORD',date:'14 Oct',title:'Elena Ward — flight record',body:'Boarded 19:15. Departure 19:40.\nOutbound international flight.\nReturn: not booked.'}
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
  const P5_EV={SL:'Boat hire slip — Peter’s name and card, 17:40',TL:'Toll receipt — card 4417, 21:00',CL:'Police call log — 06:12, the morning after',AG:'Buy–sell agreement — the survivor gets 100%',MS:'Message log — Thomas to Peter, 19:58',TR:'Travel record — Elena Ward, 19:15 flight',LB:'Laboratory note — blood on the boat',RN:'Route note — the 41-minute drive'};
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
      const r=P5_ROUNDS[i];
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
  F3S_CHAPTERS.push(['PUZZLE 01','RECONSTRUCT THE NIGHT'],['PUZZLE 02','THE MISSING PIECE']);
  const F4_CH1=F3S_CHAPTERS.length-2,F4_CH2=F3S_CHAPTERS.length-1;
  // Puzzle 1 documents, shown out of order. `order` is their true chronological position.
  const F4_P1_DOCS=[
    {id:'witness',order:4,tag:'WITNESS STATEMENT',date:'22 Sep 2016',title:'Statement of R. Okafor, bar staff',body:'“The stage lights flickered twice during the second set. Then there was smoke coming from behind the panel at the back of the stage. People started shouting and we got everyone out through the side door.” Taken the morning after the fire.'},
    {id:'log',order:1,tag:'MAINTENANCE LOG',date:'03/03/2016',title:'The Lantern — quarterly safety checks',body:'Fire extinguishers — checked ✓ (signed J.M.)\nEmergency lighting — checked ✓ (signed J.M.)\nStage circuit B tripping; wiring behind panel warm to the touch. Full electrical inspection of stage circuits — SCHEDULED. No completion signature.'},
    {id:'report',order:5,tag:'INCIDENT REPORT',date:'30 September 2016',title:'Fire at The Lantern — IR-0921',body:'Fire broke out at The Lantern during a live performance on the night of 21 September. Origin: rear of the stage. Investigation ongoing; venue maintenance and inspection records have been requested.'},
    {id:'costs',order:2,tag:'APPROVAL MEMO',date:'19 April 2016',title:'Operating budget — cost reductions',body:'Non-essential maintenance and contractor work deferred to Q3 to cover rising costs. Approved — T. Reed.'},
    {id:'email',order:3,tag:'EMAIL',date:'Thu 02.06.2016',title:'From: Peter Shaw  To: Thomas Reed',body:'“The electrician flagged the stage wiring again today. We can’t keep pushing this to next quarter, Tom. If something happens on a full night, it’s on us.”'}
  ];
  const F4_P1_CHECKS=['Fire extinguishers','Emergency lighting','Electrical inspection of the stage circuits','Fire exit signage'];
  // Puzzle 2 documents and its three linked questions.
  const F4_P2_DOCS=[
    {tag:'MAINTENANCE RECORD MR-114 · VERSION A',date:'As released to investigators',title:'Stage circuits — September 2016',body:'05 Sep — Fire alarm test — COMPLETED\n09 Sep — Extinguisher check — COMPLETED\n12 Sep — Electrical inspection, stage circuits — COMPLETED · ref INS-0417 (attached)\n16 Sep — Emergency lighting — COMPLETED'},
    {tag:'MAINTENANCE RECORD MR-114 · VERSION B',date:'Original working copy',title:'Stage circuits — September 2016',body:'05 Sep — Fire alarm test — COMPLETED\n09 Sep — Extinguisher check — COMPLETED\n12 Sep — Electrical inspection, stage circuits — SCHEDULED · awaiting contractor\n16 Sep — Emergency lighting — COMPLETED'},
    {tag:'CONTRACTOR INSPECTION REGISTER',date:'September 2016',title:'Halden Electrical Ltd — job register',body:'INS-0415 — 05 Sep — Fire alarm system — signed\nINS-0416 — 09 Sep — Extinguishers — signed\nINS-0418 — 16 Sep — Emergency lighting — signed'},
    {tag:'ARCHIVE INDEX',date:'Released file IR-0921',title:'Attachments to the incident file',body:'Attachment 1 — Incident report IR-0921 — IN FILE\nAttachment 2 — Maintenance record MR-114 — IN FILE\nAttachment 3 — INS-0417 Electrical inspection certificate — NOT IN FILE'}
  ];
  const F4_P2_QUESTIONS=[
    {q:'Which entry differs between the two versions of the maintenance record?',options:['05 Sep — Fire alarm test','09 Sep — Extinguisher check','12 Sep — Electrical inspection, stage circuits','16 Sep — Emergency lighting'],answer:2,hint:'Read Version A and Version B line by line. Only one status changes.',explain:'The 12 September electrical inspection reads COMPLETED in the version released to investigators, but SCHEDULED — awaiting contractor — in the original working copy.'},
    {q:'Which inspection reference is missing from the released file?',options:['INS-0415','INS-0416','INS-0417','INS-0418'],answer:2,hint:'Compare the reference Version A cites with the contractor register and the archive index.',explain:'INS-0417 is cited as the electrical inspection certificate, but it is not in the contractor register and the archive index marks it NOT IN FILE.'},
    {q:'Which conclusion does the evidence support?',options:['The fire was deliberately started to cover something up.','Peter Shaw altered the maintenance record.','The inspection’s completion is not supported by any source record and the referenced certificate is missing — but who changed the record, and why, cannot be established.','The inspection was done; the certificate was simply misfiled.'],answer:2,hint:'Separate what the documents show from what they would need to show to blame a person or prove intent.',explain:'The records show a gap: a completed inspection that no source record supports, and a missing certificate. They do not show who changed the record, why, or that the fire was deliberate.'}
  ];
  const F4_STORY={
    s1:{kicker:'FILE 004 · THE LANTERN FIRE',eyebrow:'A NIGHT AT THE LANTERN',title:'EVERY PLACE HAS A STORY.',button:'EXAMINE THE RECORDS',text:`Before the money. Before Lake Ash.\nThere was The Lantern.\n\nThomas Reed and Peter Shaw built it together — a small venue with a big stage, live music every night, and a crowd that kept coming back.\n\nIt worked. For a while, it worked very well.\n\nBut success is expensive. Costs rose. Repairs were postponed. Electrical equipment that needed attention was kept running a little longer, and then a little longer again.\n\nSafety concerns were raised. They were written down.\n\nWhether anyone acted on them is another matter.\n\nEvery place has a story it tells the public.\nThis is the story its records left behind.`},
    s2:{kicker:'FILE 004 · THE LANTERN FIRE',eyebrow:'THE OFFICIAL VERSION',title:'THE NIGHT OF 21 SEPTEMBER.',button:'CROSS-EXAMINE THE REPORT',text:`You found the warnings, Detective. Now here is what followed.\n\nOn the night of 21 September, fire broke out behind the stage during a live set.\n\nThe room was cleared. One person did not make it out.\nA musician died in the fire.\n\nInvestigators classified it as accidental — caused by faulty electrical equipment.\n\nCase closed.\n\nExcept the maintenance records are incomplete.\nAnd nothing in them confirms that the electrical inspection was ever carried out.\n\nThe official conclusion was an accident.\nThe evidence still has a gap.`},
    s4:{kicker:'FILE 004 · THE LANTERN FIRE',eyebrow:'THE STORY WIDENS',title:'THE FIRE WAS ONLY THE BEGINNING.',button:'CONTINUE',text:`Your findings are on record. Now the rest of it.\n\nYears after the fire, irregularities surfaced in The Lantern’s accounts. Money had been diverted into a failed private investment, then hidden behind falsified accounts and supplier invoices.\n\nElena, the accounts manager, found the discrepancy — and helped conceal it.\n\nPeter began quietly collecting records. Records that could place the blame on Thomas, and keep his own name out of it.\n\nThen Thomas disappeared near Lake Ash. His damaged boat, his watch and his jacket were recovered. His body was never found. The authorities presumed he had drowned.\n\nAnd Daniel Cross — the journalist investigating both the fire and the money — knew things he never published.\n\nThe fire was not the end of the story.\nIt was the first part of a much larger case.`},
    final:{kicker:'INCOMING TRANSMISSION · SOURCE: M',eyebrow:'FILE 004 · CLOSED',title:'ONE FILE REMAINS.',button:'RETURN TO THE CASE',text:`Detective,\n\nYou have examined what happened at The Lantern and questioned the records that supposedly explain it.\n\nYou have also seen how easily an unanswered question becomes an accusation.\n\nThe fire, the missing money and the disappearance are now part of the same investigation. Whether they are part of the same deception remains for you to determine.\n\nYour findings have been recorded.\n\nOne file remains.\n\n— M`}
  };
  const F4_FLOW=['s1','p1','s2','p2','verdict','s4','final'];
  function readF4(){const fresh={screen:'s1',attempts:{},done:{},order:[],check:null,p2:[null,null,null],p2step:0,verdict:'',verdictSaved:false};try{return {...fresh,...JSON.parse(localStorage.getItem(F4_KEY)||'{}')};}catch{return fresh;}}
  let f4=readF4();
  const saveF4=()=>{try{localStorage.setItem(F4_KEY,JSON.stringify(f4));}catch{}};
  const f4Next=id=>F4_FLOW[F4_FLOW.indexOf(id)+1];
  function openF4Stage(){
    clearTimers();
    const stage=$('#f3Stage');stage.dataset.mode='f4';stage.hidden=false;
    $('#f3sList').hidden=true;$('#f3sReturn').hidden=true;$('#backButton').disabled=false;
    requestAnimationFrame(()=>stage.classList.add('visible'));
    // A missing or stale saved position (from an older version, or a finished file) starts the file from its opening.
    if(!F4_FLOW.includes(f4.screen)||progress.file04Complete)f4.screen='s1';
    f4Go(f4.screen,{resume:true});
  }
  function f4Go(id,{resume=false}={}){
    f4.screen=id;saveF4();
    const chapter=id==='p1'?F4_CH1:id==='p2'?F4_CH2:null;
    if(chapter!==null&&!resume)f3sChapterCard(chapter,()=>f4Mount(id,true));else f4Mount(id,false);
  }
  function f4Mount(id,fromChapter){
    const stage=$('#f3Stage'),old=[...stage.querySelectorAll('.f3s-screen')];
    const screen=document.createElement('section');screen.className='f3s-screen f4-screen'+(fromChapter?' from-chapter':'');screen.dataset.screen=id;
    if(F4_STORY[id])f4BuildStory(screen,id);else if(id==='p1')f4BuildP1(screen);else if(id==='p2')f4BuildP2(screen);else f4BuildVerdict(screen);
    stage.insertBefore(screen,$('#f3sChapter'));
    requestAnimationFrame(()=>screen.classList.add('enter'));
    old.forEach(s=>{s.classList.add('leave');setTimeout(()=>s.remove(),1100);});
  }
  function f4BuildStory(screen,id){
    cineStory(screen,F4_STORY[id],{s1:'stage',s2:'fire',s4:'board',final:'signal'}[id],()=>{const next=f4Next(id);if(next)f4Go(next);else f4Finish();});
  }
  const f4Doc=(d,extra='')=>`<article class="f4-doc" ${extra}><small>${f3sEsc(d.tag)}</small><time>${f3sEsc(d.date)}</time><h4>${f3sEsc(d.title)}</h4><p>${f3sEsc(d.body)}</p></article>`;
  function f4Desk(screen,{step,title,lead,file='FILE 004 · THE LANTERN FIRE'}){
    screen.classList.add('f4-desk-screen');
    screen.innerHTML=`<div class="f4-desk-bg"></div><div class="f4-desk"><header class="f4-head"><small>${f3sEsc(file)} · ${f3sEsc(step)}</small><h2>${f3sEsc(title)}</h2><p>${f3sEsc(lead)}</p></header><div class="f4-docs"></div><section class="f4-task" aria-live="polite"></section></div>`;
    return {docs:screen.querySelector('.f4-docs'),task:screen.querySelector('.f4-task')};
  }
  // A two-try question: hint first, then the answer. Calls done() once settled.
  function f4Ask(task,key,q,done,store=f4,save=saveF4){
    task.innerHTML=`<p class="f4-q">${f3sEsc(q.q)}</p><div class="f4-options" role="radiogroup">${q.options.map((o,i)=>`<button type="button" class="f4-opt" role="radio" aria-checked="false" data-i="${i}"><i>${'ABCD'[i]}</i><span>${f3sEsc(o)}</span></button>`).join('')}</div><div class="f4-actions"><button type="button" class="f4-btn f4-submit">SUBMIT →</button></div>`;
    let pick=null;const opts=[...task.querySelectorAll('.f4-opt')];
    opts.forEach(b=>b.addEventListener('click',()=>{if(task.classList.contains('settled'))return;pick=Number(b.dataset.i);opts.forEach(o=>{o.classList.toggle('picked',o===b);o.setAttribute('aria-checked',String(o===b));});}));
    const settle=()=>{task.classList.add('settled');opts.forEach((o,i)=>o.classList.toggle('correct',i===q.answer));};
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
      const box=document.createElement('section');box.className='f4-task';task.after(box);task.remove();
      f4Ask(box,'p1-check',{q:'One safety check has no verified completion record. Which one?',options:F4_P1_CHECKS,answer:2,hint:'Look at the maintenance log. Which line has no signature against it?',explain:'The extinguishers and emergency lighting were signed off. The electrical inspection of the stage circuits was only ever SCHEDULED — there is no completion record. The concerns existed before the fire, Thomas approved deferring maintenance, and Peter knew about the wiring.'},()=>{f4.done.p1=true;saveF4();f4Go(f4Next('p1'));});};
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
    const ask=n=>{const box=task.closest('.f4-desk').querySelector('.f4-task');const step=document.createElement('p');step.className='f4-step';step.textContent=`QUESTION ${n+1} / 3`;
      f4Ask(box,'p2-'+n,F4_P2_QUESTIONS[n],()=>{if(n<2){f4.p2step=n+1;saveF4();ask(n+1);}else{f4.done.p2=true;saveF4();f4Go(f4Next('p2'));}});
      box.classList.remove('settled');box.prepend(step);};
    ask(Math.min(f4.p2step||0,2));
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
      if(words()<15){f3sToast('Write a few sentences first — at least 15 words.');t.focus();return;}
      // Not graded: acknowledge the reasoning habits we can see, and note the ones worth adding.
      const v=t.value.toLowerCase(),seen=[],missing=[];
      (/inspect|maintenance|record|log|ins-?0417|certificate|attachment/.test(v)?seen:missing).push('the documents themselves');
      (/unverif|not (been )?verified|cannot|can't|not proven|no evidence|unclear|unknown|uncertain|not establish/.test(v)?seen:missing).push('what the records cannot prove');
      (/need|would want|require|interview|original|forensic|contractor|witness|more evidence/.test(v)?seen:missing).push('the evidence you would still need');
      f4.verdictSaved=true;saveF4();
      f3sModal({tone:'good',title:'FINDINGS RECORDED',body:`<p>Your assessment is now part of the case file.</p>${seen.length?`<p>You grounded it in ${seen.join(', ')}.</p>`:''}${missing.length?`<p class="f3s-left">Worth keeping in mind as the case widens: ${missing.join(', ')}.</p>`:''}`,actions:[['CONTINUE →',()=>{f3sCloseModal();f4Go(f4Next('verdict'));}]]});
    });
  }
  function f4Finish(){
    progress.file04Complete=true;if(progress.file05WallSeen!==true)progress.file05WallSeen=false;persistProgress();
    f4.screen='final';saveF4();closeF3Stage();paintProgress();
    if(progress.file05WallSeen===false)setTimeout(()=>{if($('#f3Stage').hidden)playFile05Reveal();},700);
  }
  function f4Skip(){if(!$('#f3sChapter').hidden)return;f3sCloseModal();const next=f4Next(f4.screen);if(next)f4Go(next);else f4Finish();}
  function f4Retry(){if(!$('#f3sChapter').hidden)return;f4={screen:'s1',attempts:{},done:{},order:[],check:null,p2:[null,null,null],p2step:0,verdict:'',verdictSaved:false};saveF4();progress.file04Complete=false;persistProgress();paintProgress();f3sCloseModal();f4Go('s1');}
  // ---------------------------------------------------------------------------------------------
  // File 005 — The Last Transmission. Runs inside #f3Stage (data-mode="f5") with the same parts as File 004.
  // Opening → physical evidence envelope → the one final deduction → Thomas's transmission → case closed → Why Case 25?
  const F5_KEY='case25File005V1';
  const F5_EXHIBITS=[
    {tag:'EXHIBIT A',date:'Physical envelope',title:'Thomas’s private note',body:'A handwritten note containing the phrase “Count the silence, not the sound.”\n\nIt suggests Thomas had considered an absence and was worried about Peter’s intentions. It does not, on its own, prove Thomas survived.'},
    {tag:'EXHIBIT B',date:'Physical envelope',title:'M’s original transmission',body:'An earlier message that repeats the same unusual phrase — and shows M knows private circumstances surrounding The Lantern.\n\nThe repeated phrase is a clue to compare, not proof by itself.'},
    {tag:'EXHIBIT C',date:'Physical envelope',title:'Lake Ash search summary',body:'The damaged boat, the recovered watch and jacket — and no body.\n\nThe authorities presumed drowning. The record does not conclusively establish Thomas’s death.'},
    {tag:'EXHIBIT D',date:'Physical envelope',title:'Archive cross-reference',body:'A short record showing M has access to details linking the private note, the disappearance and the earlier case files.\n\nCompare the records before deciding who created the archive.'}
  ];
  const F5_QUESTION={q:'One exhibit contains a private phrase. Another repeats it. A third leaves Thomas’s fate unresolved. The fourth connects the archive to information from the earlier files. Which conclusion best explains the evidence as a whole?',
    options:['Peter Shaw created the archive to frame Thomas.','Daniel Cross created it to protect his investigation.','Thomas Reed created the archive after secretly staging his disappearance.','Elena Ward created it to conceal the financial discrepancy.'],answer:2,
    hint:'Who could have known the phrase in Thomas’s private note? And whose death was never actually proven?',
    explain:'Only someone with Thomas’s private phrase could repeat it. Thomas’s death was presumed, never established. And M knows what links every file. The evidence points to Thomas.'};
  const F5_STORY={
    s1:{kicker:'CASE 25 · RESTRICTED ARCHIVE',eyebrow:'FILE 005 · CLASSIFICATION: FINAL REVIEW',title:'THE LAST TRANSMISSION',button:'OPEN FINAL FILE',text:`You have followed the money.\n\nYou have questioned the accounts.\n\nYou have examined the fire and reconstructed the events surrounding Thomas Reed’s disappearance.\n\nYet one question remains unanswered.\n\nIf Thomas drowned at Lake Ash, why was no body ever recovered? And who has been sending you messages containing information that was never meant to become public?\n\nOne file remains.\n\n— M`},
    s4:{kicker:'INCOMING TRANSMISSION · ARCHIVE FRAGMENT 005',eyebrow:'SOURCE IDENTIFIED: THOMAS REED',title:'YOU FOUND ME.',button:'CLOSE CASE 25',text:`Well done, Detective.\n\nYou found me.\n\nThough I suspect you were looking for a different answer.\n\nYou began with a disappearance and a story that seemed to point towards Peter. You followed the money, examined the old fire, and questioned the records.\n\nThe evidence did not tell you everything. It told you where the accepted story stopped making sense.\n\nI never told Peter I was leaving. I could not risk giving him the chance to prepare for my disappearance.\n\nI staged the apparent drowning because I needed time and distance. I knew that if I remained at The Lantern, Peter’s version of events would become the only version anyone heard.\n\nSo I created Case 25.\n\nI wanted you to see the records, to question what was missing, and to discover the difference between what could be proved and what people wanted you to believe.\n\nBut I did not create this archive because I was innocent.\n\nI diverted the money. I concealed the loss. I helped create the circumstances that brought us here.\n\nPeter betrayed me, but that does not erase what I did.\n\nI wanted the truth about The Lantern to be known before my own wrongdoing became the entire story.\n\nYou have found the source of the transmissions. You have followed the evidence back to me.\n\nThe case is yours now, Detective.\n\nTHE RECORD IS COMPLETE.\n\n— Thomas Reed`}
  };
  const F5_FLOW=['s1','envelope','deduction','s4','closed','why'];
  const F5_FILES=[['FILE 001','THE DISAPPEARANCE'],['FILE 002','THE UNEXPECTED SIGNAL'],['FILE 003','THE FINANCIAL TRAIL'],['FILE 004','THE LANTERN FIRE'],['FILE 005','THE LAST TRANSMISSION']];
  const F5_FINDINGS=[['Thomas Reed','Staged his disappearance and created Case 25 as M.'],['Peter Shaw','Tried to control the narrative surrounding Thomas’s absence.'],['Elena Ward','Helped conceal the financial shortfall.'],['Daniel Cross','Investigated the scandal, but is not established as M.'],['The Lantern fire','Officially ruled accidental; deliberate arson remains unproven.'],['The disappearance','Thomas survived; the original evidence never conclusively established his death.']];
  function readF5(){const fresh={screen:'s1',attempts:{}};try{return {...fresh,...JSON.parse(localStorage.getItem(F5_KEY)||'{}')};}catch{return fresh;}}
  let f5=readF5();
  const saveF5=()=>{try{localStorage.setItem(F5_KEY,JSON.stringify(f5));}catch{}};
  const f5Next=id=>F5_FLOW[F5_FLOW.indexOf(id)+1];
  function openF5Stage(){
    clearTimers();
    const stage=$('#f3Stage');stage.dataset.mode='f5';stage.hidden=false;
    $('#f3sList').hidden=true;$('#f3sReturn').hidden=true;$('#backButton').disabled=false;
    requestAnimationFrame(()=>stage.classList.add('visible'));
    if(!F5_FLOW.includes(f5.screen)||progress.file05Complete)f5.screen='s1';
    f5Go(f5.screen);
  }
  function f5Go(id){
    f5.screen=id;saveF5();
    const stage=$('#f3Stage'),old=[...stage.querySelectorAll('.f3s-screen')];
    const screen=document.createElement('section');screen.className='f3s-screen f4-screen f5-screen';screen.dataset.screen=id;
    if(F5_STORY[id])f5BuildStory(screen,id);else if(id==='envelope')f5BuildEnvelope(screen);else if(id==='deduction')f5BuildDeduction(screen);else if(id==='closed')f5BuildClosed(screen);else f5BuildWhy(screen);
    stage.insertBefore(screen,$('#f3sChapter'));
    requestAnimationFrame(()=>screen.classList.add('enter'));
    old.forEach(s=>{s.classList.add('leave');setTimeout(()=>s.remove(),1100);});
  }
  const f5Continue=id=>{const next=f5Next(id);if(next)f5Go(next);else f5Finish();};
  function f5BuildStory(screen,id){
    cineStory(screen,F5_STORY[id],id==='s4'?'reveal':'lake',()=>f5Continue(id));
  }
  function f5BuildEnvelope(screen){
    const {docs,task}=f4Desk(screen,{file:'FILE 005 · THE LAST TRANSMISSION',step:'FINAL EVIDENCE',title:'FOUR EXHIBITS. ONE DEDUCTION.',lead:'Open the physical envelope marked CASE 25 — FINAL EVIDENCE and lay the exhibits out in this order. Do not read them as separate stories. Their meaning lies in what connects them. — M'});
    docs.innerHTML=F5_EXHIBITS.map(d=>f4Doc(d)).join('');docs.classList.add('f4-four');
    task.innerHTML=`<p class="f4-step">CASE 25 — FINAL EVIDENCE</p><p class="f4-q">File 005 · The Last Transmission<br>Classification: Restricted</p><p class="f4-sub">When all four exhibits are on the table in front of you, continue.</p><div class="f4-actions"><button type="button" class="f4-btn f4-submit">I HAVE THE EXHIBITS →</button></div>`;
    task.querySelector('.f4-submit').addEventListener('click',()=>f5Continue('envelope'));
  }
  function f5BuildDeduction(screen){
    const {docs,task}=f4Desk(screen,{file:'FILE 005 · THE LAST TRANSMISSION',step:'FINAL DEDUCTION',title:'WHO IS M?',lead:'You have four exhibits. Decide what they mean together.'});
    docs.innerHTML=F5_EXHIBITS.map(d=>f4Doc({...d,body:d.body.split('\n\n')[0]})).join('');docs.classList.add('f4-four');
    f4Ask(task,'deduction',F5_QUESTION,()=>f5Continue('deduction'),f5,saveF5);
    task.querySelector('.f4-submit').textContent='SUBMIT FINAL DEDUCTION →';
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
  function f5Retry(){f5={screen:'s1',attempts:{}};saveF5();progress.file05Complete=false;persistProgress();paintProgress();f3sCloseModal();f5Go('s1');}
})();
