(() => {
  // A clean test link lets the player restart the complete story in the same browser.
  // Clear only this game's saved progress, then remove the flag so refreshes keep the new run.
  if (new URLSearchParams(location.search).has('restart')) {
    [
      'case25ChapterProgressV1', 'case25RoundOneResultsV1', 'case25RoundTwoResultsV1',
      'case25RoundThreeResultsV1', 'case25RoundThreeResultsV2', 'case25SecretLevelStateV1', 'case25File03NorthQuayV1',
      'case25FinancialCaseV1', 'case25HomeSeen', 'case25Chapter01Started'
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
    pinOne: { x: 642, y: 322 }, pinTwo: { x: 1220, y: 245 }, completed: { x: 650, y: 408 }, twoDone: { x: 1216, y: 386 },
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
    $('#backButton').disabled = !sceneHistory.length;
    $('#f1Skip').hidden = !(scene === scenes[7] || scene === scenes[8]);
    scenes.forEach(s => s.classList.toggle('active', s === scene));
    const acceptedCaseOnly = scene === scenes[6] && scene.classList.contains('closure-revealed');
    document.body.classList.toggle('file-one-closed', acceptedCaseOnly);
    const archive = scene === scenes[4];
    // Skip intro only belongs to the opening: title, lake, clues and case file. Elsewhere it would jump back to the archive login.
    $('#skipIntro').classList.toggle('is-hidden', scenes.indexOf(scene) > 3);
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
  function setReferenceFeedback(message,kind=''){const feedback=$('#secretRefFeedback');feedback.textContent=message;feedback.classList.toggle('is-error',kind==='error');feedback.classList.toggle('is-success',kind==='success');feedback.hidden=!message;}
  function setSecretReference(kind){const scene=$('#secretLevelScene'),art=$('#secretReferenceArt'),active=kind!=='none',intro=kind==='unexpected'||kind==='round-intro'||kind==='round-two-intro'||kind==='round-three-intro',quiz=/^q0[1-9]$/.test(kind);scene.dataset.reference=kind;scene.classList.toggle('reference-intro',intro);scene.classList.toggle('reference-quiz',quiz);art.hidden=!active;setReferenceFeedback('');const n=kind.startsWith('q0')?Number(kind.slice(1)):0;if(active)art.src=kind==='unexpected'?'assets/secret-level/unexpected-transmission.png':kind==='round-intro'?'assets/secret-level/round-one-intro.png':kind==='round-two-intro'?'assets/secret-level/round-two-intro.png':kind==='round-three-intro'?'assets/secret-level/round-three-intro.png':n<=3?`assets/secret-level/round-one-${kind}.png`:n<=6?`assets/secret-level/round-two-${kind}.png`:`assets/secret-level/round-three-${kind}.png`;$('#secretRefEnter').hidden=kind!=='unexpected';$('#secretRefRound').hidden=!intro||kind==='unexpected';$('#secretRefRound').setAttribute('aria-label',kind==='round-two-intro'?'Begin Round II':kind==='round-three-intro'?'Begin Round III':'Begin Round I');$('#secretRefSubmit').hidden=!quiz;$('#secretRefContinue').hidden=true;$('#secretRefSkip').hidden=!quiz;$('#secretRefAnswers').replaceChildren();if(quiz){const count=kind==='q03'?3:4;for(let i=0;i<count;i++){const b=document.createElement('button');b.type='button';b.className='secret-reference-answer';b.dataset.index=String(i);b.setAttribute('aria-label',`Answer ${String.fromCharCode(65+i)}`);b.addEventListener('click',()=>{const radio=$$('#answerOptions input[name="roundAnswer"]')[i];if(radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));$('#secretRefAnswers').querySelectorAll('.secret-reference-answer').forEach((answer,index)=>answer.classList.toggle('selected',index===i));}else if(kind==='q02'){$('#answerText').value='Itachi';}});$('#secretRefAnswers').append(b);}}}
  function openSecretLevel({testMode=false}={}){clearTimers();secretTestMode=testMode;if(testMode)secretTestRounds={1:emptyRound(roundOneQuestions),2:emptyRound(roundTwoQuestions),3:emptyRound(roundThreeQuestions)};setSecretReference('unexpected');$('#secretIntro').hidden=false;$('#secretDashboard').hidden=true;$('#roundIntro').hidden=true;$('#roundTwoIntro').hidden=true;$('#roundThreeIntro').hidden=true;$('#quizInterface').hidden=true;$('#dossierInterface').hidden=true;show($('#secretLevelScene'));}
  function openSecretDashboard(){clearTimers();setSecretReference('none');renderSecretDashboard();$('#secretIntro').hidden=true;$('#secretDashboard').hidden=false;$('#roundIntro').hidden=true;$('#roundTwoIntro').hidden=true;$('#roundThreeIntro').hidden=true;$('#quizInterface').hidden=true;$('#dossierInterface').hidden=true;}
  function renderSecretDashboard(){const records=[1,2,3].map(n=>readRound(n));const done=records.reduce((sum,r)=>sum+r.questions.filter(q=>q.complete).length,0);$('#secretQuestionsComplete').textContent=`${done} / 9 QUESTIONS`;$('#secretXpTotal').textContent=`${earnedXp()} XP`;$('#secretDashboardProgress').style.setProperty('--secret-progress',`${done/9*100}%`);$('#secretDashboardRounds').querySelectorAll('[data-round]').forEach((card,i)=>{const complete=records[i].questions.every(q=>q.complete);card.classList.toggle('complete',complete);card.querySelector('small').textContent=complete?'CLEARED':`ROUND 0${i+1}`;});}
  function startSecretReward(){
    clearTimers();
    const scene=$('#secretRewardScene');
    const xp=earnedXp();
    const completed=[1,2,3].reduce((sum,n)=>sum+readRound(n).questions.filter(q=>q.complete&&q.answer!=='SKIPPED').length,0);
    $('#finalXpValue').textContent=String(xp);
    $('#finalTrialsValue').textContent=String(completed);
    if($('#finalCaseStatusValue')) $('#finalCaseStatusValue').textContent='CLOSED';
    if($('#finalDetectiveStatusValue')) $('#finalDetectiveStatusValue').textContent='STILL SUSPICIOUS';
    $('#completionStage').hidden=false;
    $('#chocolateRewardStage').hidden=true;
    show(scene);
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
    if(correct&&!record.complete){record.answer=selected;record.complete=true;record.xpAwarded=q.xp;persistRound();renderSecretDashboard();$('#answerFeedback').textContent='EVIDENCE VERIFIED · XP RECORDED.';setReferenceFeedback(`Evidence verified · +${q.xp} XP recorded. Click Continue to proceed.`,'success');$('#answerFeedback').classList.remove('rejected');$('#answerForm').querySelector('.submit-answer').disabled=true;$('#quizScore').textContent=`SCORE: ${earnedXp()}`;
      $('#answerExplanation').textContent=q.explanation||'The answer matches the evidence in this trial.';$('#answerExplanation').hidden=false;$('#answerForm .submit-answer').hidden=true;$('#secretRefSubmit').hidden=true;$('#questionSkip').hidden=true;$('#secretRefSkip').hidden=true;$('#questionContinue').textContent='CONTINUE →';$('#questionContinue').hidden=false;$('#secretRefContinue').hidden=false;}
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
  function p3DeductionResult(text){const t=p3Normalize(text);const groups=[/seven minutes|7 minutes|subtract.{0,20}7|clock.{0,35}(fast|correct|seven|7)/,/credential.{0,80}(not|does not|cannot|unknown|identify|identity)|does not identify|not identify.{0,30}(person|user)|identity.{0,30}(unknown|not established)/,/peter.{0,70}(approx|estimate|uncorroborat|not proven|not confirmed)|uncorroborat.{0,40}peter|estimate.{0,40}peter/,/camera.{0,80}(unverif|unknown|not calibrated)|unverif.{0,40}camera/,/following morning|next morning|07:10|08:05|search records?.{0,70}(not|does not|only|when)|records?.{0,80}(not establish|do not establish).{0,50}(disappear|when)/,/(unknown|uncertain|not establish|cannot establish|not proven).{0,70}(lake|die|disappear|movement|route)|whether.{0,50}(lake|die|disappear)|exact (time|sequence|movement)/,/(calibrat|identif|witness|travel record|independent evidence|additional evidence|corroborat).{0,90}(footage|camera|timestamp|witness|record|evidence|movement|time)?/];const missing=groups.map((re,i)=>re.test(t)?null:i).filter(i=>i!==null);const unsupported=/(peter.{0,25}(murder|kill|killed)|thomas.{0,55}(murdered|died).{0,30}(lake|ash)|definitely lied)/.test(t)&&!/(not|cannot|does not|no evidence|unknown whether).{0,45}(murder|kill|killed|died|lie)/.test(t);if(unsupported)missing.push(7);return {accepted:missing.length===0,missing};}
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
  function evaluateP2(text,index){const value=text.toLowerCase().replace(/[’]/g,"'").replace(/doesn't/g,'does not').replace(/isn't/g,'is not').replace(/can't/g,'cannot').replace(/won't/g,'will not').replace(/\s+/g,' ');const q=P2_QUESTIONS[index],missing=q.groups.map((re,i)=>re.test(value)?null:i).filter(i=>i!==null);return {accepted:missing.length===0,missing};}
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
  function f2DeductionAccepted(text){const t=String(text||'').toLowerCase();const groups=[/peter/,/(2\s*[.]\s*40|2[.]4|unreconcil|unexplained).{0,80}(crore|fund|amount|balance|money)?|(?:crore|fund|amount|balance|money).{0,80}(2\s*[.]\s*40|2[.]4|unreconcil|unexplained)/,/original.{0,60}(missing|not provided|unavailable|not supplied)|missing.{0,60}(original|record)|not provided.{0,60}(original|document)/,/(unknown|unidentified).{0,50}(card|credential|person|user)|card.{0,50}(unknown|unidentified)|access log/,/(not prove|does not prove|cannot prove|cannot establish|not establish|unproven|unverified|no direct evidence|not enough evidence|remains unknown|not conclusive)/];return groups.every(re=>re.test(t));}
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
    title.classList.add('leaving');
    later(() => {
      show(scenes[1]);
      setTimeout(() => title.classList.remove('leaving'), 1400);
    }, 1200);
  }
  // Requested flow: title (2), Lake Ash opening (1), clues (3), case file (4), login (5), decryption, transmission, homepage.
  const previewHome = new URLSearchParams(location.search).get('screen') === 'home';
  if(previewHome || progress.caseAccepted) showHomeBoard(); else later(pushIntoLake, 4500);
  $('#playIntro').addEventListener('click', () => { clearTimers(); startSound(); runClues(); });
  $('#skipIntro').addEventListener('click', openArchive);
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
    $('#loginError').textContent='';$('#archiveScene').classList.add('decrypting');let pct=0;
    const statuses=[[0,'VERIFYING CREDENTIALS...'],[18,'LOCATING ARCHIVE FRAGMENTS...'],[36,'RESTORING DAMAGED TRANSMISSION...'],[58,'RECONSTRUCTING CASE FILE...'],[79,'VERIFYING RECORD INTEGRITY...'],[100,'ARCHIVE RECOVERED']];
    const fill=$('#archiveProgress .progress-track i'); fill.style.width='0%';
    const interval=setInterval(()=>{pct=Math.min(100,pct+2);fill.style.width=pct+'%';$('#decryptPercent').textContent=String(pct).padStart(2,'0');const current=statuses.reduce((a,s)=>pct>=s[0]?s:a,statuses[0]);$('#archiveProgress small').textContent=current[1];if(pct===100){clearInterval(interval);$('#archiveProgress small').textContent='ARCHIVE RECOVERED';setTimeout(()=>{$('#archiveScene').classList.remove('decrypting');$('#archiveScene').classList.add('unsealed');later(showTransmission,500);},700);}},reducedMotion?20:120);
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
  $('#devFile02Button').addEventListener('click',()=>{
    ['case25RoundOneResultsV1', 'case25RoundTwoResultsV1', 'case25RoundThreeResultsV2', 'case25SecretLevelStateV1'].forEach(k => localStorage.removeItem(k));
    secretTestMode = false;
    progress.caseAccepted = true;
    progress.file02TransitionSeen = true;
    progress.fileTwoComplete = false;
    progress.file02Complete = false;
    progress.file03WallSeen = false;
    progress.unlockedChapter = 1;
    persistProgress();
    selectRound(1);
    round = readRound(1);
    showHomeBoard(); playWallIntro();
  });
  $('#beginChapter')?.addEventListener('click',()=>{ localStorage.setItem('case25Chapter01Started','1'); $('#beginChapter').textContent='CHAPTER 01 READY ✓'; });
  $('#wallHotspot').addEventListener('click',()=>{ if($('#homeScene').classList.contains('archive-transitioning'))return; $('#homeScene').classList.add('dossier-open'); $('#messageDossier').setAttribute('aria-hidden','false'); later(()=>$('#dossierOpen').focus(),500); });
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
  let chocolateTimer = null;
  function finishChocolateReward() {
    if (chocolateTimer) {
      clearTimeout(chocolateTimer);
      chocolateTimer = null;
    }
    progress.caseAccepted = true;
    progress.file02TransitionSeen = true;
    progress.file02Complete = true;
    progress.fileTwoComplete = true;
    if (progress.file03WallSeen !== true) progress.file03WallSeen = false;
    persistProgress();
    showHomeBoard();
    if (progress.file03WallSeen === false) playFile03Reveal();
  }

  $('#finalClaimButton')?.addEventListener('click',()=>{
    $('#completionStage').hidden = true;
    $('#chocolateRewardStage').hidden = false;
    if (chocolateTimer) clearTimeout(chocolateTimer);
    chocolateTimer = setTimeout(finishChocolateReward, reducedMotion ? 2000 : 8000);
  });
  $('#finalClaimHit')?.addEventListener('click',()=>{
    $('#finalClaimButton').click();
  });
  $('#chocolateRewardStage')?.addEventListener('click', finishChocolateReward);
  $('#continueToCase')?.addEventListener('click', finishChocolateReward);
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

  $('#continueFileThree')?.addEventListener('click', () => {
    startFile03CinematicReveal();
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
    const previous=sceneHistory.pop();if(!previous)return;
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
    phaseSlides.forEach((slide,i)=>slide.classList.toggle('active',i===index));
    if(index===0) later(()=>setPhase(1),reducedMotion?0:4300);
    if(index===6) later(()=>setPhase(8),reducedMotion?0:2100);
    if(index===7) laterWait(()=>setPhase(9),reducedMotion?0:5500);
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
  $('#f1Skip').addEventListener('click',()=>{
    const onAccept=$('#phaseTwoScene').classList.contains('active')&&phaseSlides[11].classList.contains('active');
    if(onAccept)$('#acceptCase').click();else skipFile01ToEnd();
  });
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
    laterWait(()=>setPhase(6),reducedMotion?0:1000);
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
  function stopSound(){audioNodes.forEach(n=>{try{n.stop?.();n.disconnect?.();}catch{}});audioNodes=[];if(audioContext){audioContext.close().catch(()=>{});audioContext=null;}$('#soundToggle').innerHTML='◖)) <span>SOUND OFF</span>';$('#soundToggle').setAttribute('aria-label','Turn ambient sound on');}
  async function startSound(){if(audioContext){if(audioContext.state==='suspended')await audioContext.resume();return;}const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;audioContext=new Ctx();await audioContext.resume();const master=audioContext.createGain();master.gain.value=.4;master.connect(audioContext.destination);const b=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate);const a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*.24;const src=audioContext.createBufferSource();src.buffer=b;src.loop=true;const lp=audioContext.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;const ng=audioContext.createGain();ng.gain.value=.38;src.connect(lp);lp.connect(ng);ng.connect(master);src.start();const wind=audioContext.createOscillator(),wg=audioContext.createGain();wind.type='sine';wind.frequency.value=86;wg.gain.value=.03;wind.connect(wg);wg.connect(master);wind.start();const droneA=audioContext.createOscillator(),droneB=audioContext.createOscillator(),dg=audioContext.createGain();droneA.type='sine';droneB.type='triangle';droneA.frequency.value=55;droneB.frequency.value=82.4;dg.gain.value=.035;droneA.connect(dg);droneB.connect(dg);dg.connect(master);droneA.start();droneB.start();const heart=audioContext.createOscillator(),hg=audioContext.createGain();heart.frequency.value=48;hg.gain.value=.0001;heart.connect(hg);hg.connect(master);heart.start();const t=audioContext.currentTime+.5;for(let beat=0;beat<80;beat++)for(const off of [0,.17]){const x=t+beat*1.2+off;hg.gain.setValueAtTime(.0001,x);hg.gain.exponentialRampToValueAtTime(off?.07:.11,x+.045);hg.gain.exponentialRampToValueAtTime(.0001,x+.22);}audioNodes.push(src,wind,droneA,droneB,heart,lp,ng,wg,dg,hg);$('#soundToggle').innerHTML='◖)) <span>SOUND ON</span>';$('#soundToggle').setAttribute('aria-label','Turn ambient sound off');}
  $('#soundToggle').addEventListener('click',()=>audioContext?stopSound():startSound());
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
    'p1-q4':'The bank export supports three underlying transfers — T-17, T-22 and T-31 — tentatively matched to invoices NQ-104, NQ-118 and NQ-123. T-31-R is a replay of T-31, not a separate payment. NQ-104-R did not receive a separately confirmed payment; its revision or replacement status still needs supplier confirmation. The PA-07 allocation sheet is an unverified copy, so its matches are suggestions rather than established facts, and the original approvals/signatures and bank confirmations are missing. The ₹2.40 crore balance remains unreconciled. The records do not prove delivery, account ownership, personal benefit or anyone’s culpability.',
    'p3-q4':'Established: the rear-entrance clock was seven minutes fast, so the credential and door activity happened at 19:45:31–19:47:18 — but the log records a credential, not who used it. Reported: Peter says Thomas left alone at about 20:10, an uncorroborated estimate. Uncertain: the camera’s 20:16:11 vehicle cannot be placed because its clock is unverified and the plate and occupants are not visible; the boat (07:10) and watch and jacket (08:05) were found the next morning, but those records do not establish when Thomas disappeared or whether he died at Lake Ash. Needed: a calibrated camera clock, identification of the credential user and vehicle, independent witnesses, and phone or travel records.',
    'p4-q4':'Peter is a central suspect because the ₹2.40 crore remains unreconciled with no supporting records, his claim that Thomas left alone at about 20:10 is uncorroborated, an unknown credential opened the rear door at 20:09–20:10 — the same time as his statement — and he never supplied the requested originals despite repeated follow-ups. But the gaps are serious: nothing shows Peter received the money, the access log does not identify who used the unknown card, the camera does not show the plate or driver, and missing originals do not prove he destroyed them. Suspicion is not proof.',
    'p3-q2':'Order: rear-entrance credential at 19:45:31 (Corrected), Peter’s reported departure at about 20:10 (Estimated), the vehicle at displayed 20:16:11 (Unverified), the damaged boat at 07:10 and the watch and jacket at 08:05 the next morning (Search Record). The vehicle cannot be placed precisely: the camera clock is unverified, so its 20:16:11 cannot be aligned with the corrected venue times or Peter’s estimate.'
  };
  const F3S_SCREENS={
    opening:{kind:'transmission',kicker:'INCOMING TRANSMISSION · SOURCE: M',eyebrow:'ARCHIVE FRAGMENT 005',title:'WHAT REMAINS',text:F3_OPENING,next:'p1-cover'},
    'p1-cover':{kind:'cover',chapter:0,begin:[545,676,373,62],next:'p1-q1'},
    'p1-q1':{kind:'choice',puzzle:0,opt:[[434,390,656,55],[434,456,656,56],[434,521,656,56]],radio:[470,13],submit:[597,608,329,51],answer:0,options:F3_QUESTIONS[0].options,hint:F3_QUESTIONS[0].hint,explain:F3_QUESTIONS[0].explain,next:'p1-q2'},
    'p1-q2':{kind:'choice',puzzle:0,opt:[[382,387,716,55],[382,452,716,55],[382,517,716,55],[382,582,716,55]],radio:[421,13],submit:[550,664,385,57],answer:1,options:F3_QUESTIONS[1].options,hint:F3_QUESTIONS[1].hint,explain:F3_QUESTIONS[1].explain,next:'p1-q3'},
    'p1-q3':{kind:'choice',puzzle:0,opt:[[382,409,708,55],[382,472,708,55],[382,536,708,54],[382,598,708,54]],radio:[418,13],submit:[547,680,375,54],answer:1,options:['Yes, it’s a verified record.','No, it’s not reliable enough.','Only some of the matches can be trusted.','Not enough information to say.'],hint:'Who verified the allocation sheet? Look for original approvals or signatures, and for bank confirmations behind each match.',explain:'The allocation sheet (PA-07) is an unverified copy. Its invoice matches are suggestions, not independently established facts: there are no original approvals or signatures and no supporting bank confirmations.',next:'p1-q4'},
    'p1-q4':{kind:'written',puzzle:0,text:[380,582,770,106],submit:[583,708,371,52],grade:t=>validateFinalDeduction(t),hint:'Name the three underlying transfers and their invoices, explain T-31-R and NQ-104-R, describe PA-07 as unverified, and say what the records cannot prove.',model:F3S_MODELS['p1-q4'],next:'p1-end'},
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
    'p4-cover':{kind:'cover',chapter:3,begin:[470,773,500,75],review:[[[48,232,262,62],0],[[48,296,262,80],1],[[48,378,262,80],2]],next:'p4-q1'},
    'p4-q1':{kind:'choice',puzzle:3,docs:'f2',docSet:[0,1,2,3],opt:[[1114,432,507,74],[1114,517,507,88],[1114,616,507,74],[1114,702,507,77]],radio:[1152,18],hintBtn:[1114,803,160,54],submit:[1300,803,321,54],tabs:[[338,110,150,42],[505,110,150,42],[673,110,150,42],[841,110,152,42]],thumbs:[[383,785,125,75],[536,785,125,75],[698,785,122,75],[853,785,135,75]],answer:1,options:F2_QUESTIONS[0].options,hint:F2_QUESTIONS[0].hint,explain:'The ₹2.40 crore remains unreconciled against verified expenditure, and the supporting records have not been provided. Nothing in the account records names who received it.',next:'p4-q2'},
    'p4-q2':{kind:'choice',puzzle:3,docs:'f2',docSet:[4,5,6,7],opt:[[1075,409,516,72],[1075,492,516,73],[1075,578,516,94],[1075,684,516,76]],radio:[1112,17],hintBtn:[1077,793,156,56],submit:[1285,793,297,56],tabs:[[290,160,177,55],[476,160,174,55],[657,160,173,55],[838,160,174,55]],thumbs:[[343,748,135,112],[500,748,132,112],[654,748,136,112],[813,748,137,112]],answer:2,options:F2_QUESTIONS[1].options,hint:F2_QUESTIONS[1].hint,explain:'Peter’s account is not independently corroborated. The access log records an unknown card, not a person, and the camera does not show the plate or who was driving.',next:'p4-q3'},
    'p4-q3':{kind:'choice',puzzle:3,review:[[[48,232,248,62],0],[[48,298,248,80],1],[[48,382,248,78],2]],docs:'f2',docSet:[8,9,10,11],opt:[[1140,410,470,80],[1140,505,470,80],[1140,600,470,93],[1140,708,470,87]],radio:[1177,18],hintBtn:[1138,818,130,55],submit:[1294,818,316,55],tabs:[[375,95,171,52],[553,95,172,52],[731,95,172,52],[910,95,170,52]],thumbs:[[412,756,124,104],[560,756,132,104],[716,756,134,104],[878,756,146,104]],answer:2,options:F2_QUESTIONS[2].options,hint:F2_QUESTIONS[2].hint,explain:'It establishes that the original records remain unavailable, which prevents verification. It does not prove who removed them or why.',next:'p4-q4'},
    'p4-q4':{kind:'written',puzzle:3,docs:'f2',docSet:[0,4,5,6,8,9],text:[1176,465,452,273],counter:[[1500,746,130,20],500,'words'],hintBtn:[1176,792,140,55],submit:[1338,792,293,55],thumbs:[[334,792,110,72],[465,792,98,72],[590,792,98,72],[710,792,98,72],[836,792,100,72],[960,792,105,72]],grade:t=>{const ok=f2DeductionAccepted(t);return {accepted:!!(ok&&ok.accepted!==false),missing:[]};},hint:F2_QUESTIONS[3].hint,model:F3S_MODELS['p4-q4'],next:'final'},
    // M's closing letter (final.png) is taller than 16:9, so it is shown whole rather than cropped.
    final:{kind:'message',fit:'contain',art:'final-blank',letter:[412,318,1095,1180],cont:[588,1573,688,115],next:'gift'},
    // Thank-you card before the physical gift is handed over; its CONTINUE ends File 03.
    gift:{kind:'message',cont:[552,701,431,82],label:'GOOD JOB, DETECTIVE',next:null,finish:true}
  };
  const F3S_CHAPTERS=[['PUZZLE 01','NORTH QUAY'],['PUZZLE 02','THE MISSING STORY'],['PUZZLE 03','THE IMPOSSIBLE TIMELINE'],['PUZZLE 04','THE UNRESOLVED THREAD']];
  function readF3S(){const fresh={screen:'opening',done:{},attempts:{},drafts:{},picks:{}};try{return {...fresh,...JSON.parse(localStorage.getItem(F3S_KEY)||'{}')};}catch{return fresh;}}
  let f3s=readF3S(),f3sBusy=false;
  function saveF3S(){try{localStorage.setItem(F3S_KEY,JSON.stringify(f3s));}catch{}}
  const f3sEsc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const f3sBox=([x,y,w,h])=>`--x:${x};--y:${y};--w:${w};--h:${h}`;
  function f3sFit(screen){
    const img=screen.querySelector('.f3s-art'),layer=screen.querySelector('.f3s-layer'),stage=$('#f3Stage');
    if(!img||!img.naturalWidth)return;
    const W=stage.clientWidth,H=stage.clientHeight,nw=img.naturalWidth,nh=img.naturalHeight;
    const scale=W/H<1.3||screen.dataset.fit==='contain'?Math.min(W/nw,H/nh):Math.max(W/nw,H/nh);
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
    const def=F3S_SCREENS[id];if(!def)return;
    if(id===f3s.reviewFrom)f3s.reviewFrom=null;
    f3s.screen=id;saveF3S();
    $('#f3sList').hidden=!Number.isInteger(def.puzzle);$('#f3sList').dataset.target=['p1-cover','p2-cover','p3-cover','p4-cover'][def.puzzle]||'';
    const back=$('#f3sReturn');back.hidden=!f3s.reviewFrom;if(f3s.reviewFrom)back.textContent=`← RETURN TO ${F3S_CHAPTERS[F3S_SCREENS[f3s.reviewFrom].puzzle??F3S_SCREENS[f3s.reviewFrom].chapter??3][0]}`;
    const chapter=Number.isInteger(def.chapter)&&!resume?def.chapter:null;
    if(chapter!==null)f3sChapterCard(chapter,()=>f3sMount(id,{fromChapter:true}));
    else f3sMount(id);
    [def.next,def.next&&F3S_SCREENS[def.next]?.next].filter(n=>n&&!F3S_SCREENS[n].kind.includes('transmission')).forEach(n=>{const i=new Image();i.src=`assets/file-003/${n}.png`;});
  }
  function f3sChapterCard(index,done){
    const card=$('#f3sChapter'),[kicker,title]=F3S_CHAPTERS[index];
    card.querySelector('small').textContent=kicker;const h=card.querySelector('h2');h.textContent='';
    card.hidden=false;card.classList.remove('out');void card.offsetWidth;card.classList.add('in');
    $$('#f3Stage .f3s-screen').forEach(s=>s.classList.add('leave'));
    if(reducedMotion){h.textContent=title;laterWait(()=>{card.hidden=true;done();},900);return;}
    let i=0;const type=()=>{h.textContent=title.slice(0,++i);if(i<title.length)laterWait(type,70);else laterWait(()=>{card.classList.add('out');laterWait(()=>{card.hidden=true;card.classList.remove('in','out');},900);done();},1300);};
    laterWait(type,700);
  }
  function f3sMount(id,{fromChapter=false}={}){
    const def=F3S_SCREENS[id],stage=$('#f3Stage'),old=[...stage.querySelectorAll('.f3s-screen')];
    const screen=document.createElement('section');screen.className=`f3s-screen f3s-${def.kind}`+(fromChapter?' from-chapter':'');screen.dataset.screen=id;if(def.fit)screen.dataset.fit=def.fit;
    if(def.kind==='transmission')f3sBuildTransmission(screen,def);
    else{
      screen.innerHTML=`<div class="f3s-layer"><img class="f3s-art" alt="" src="assets/file-003/${def.art||id}.png"></div>`;
      f3sBuildControls(screen,id,def);
    }
    stage.insertBefore(screen,$('#f3sChapter'));
    const img=screen.querySelector('.f3s-art');
    const reveal=()=>{f3sFit(screen);requestAnimationFrame(()=>screen.classList.add('enter'));old.forEach(s=>{s.classList.add('leave');setTimeout(()=>s.remove(),1100);});if(def.kind==='transmission')f3sTypeTransmission(screen,def);};
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
    let i=0;const type=()=>{if(!screen.isConnected||!button.hidden)return;copy.textContent=def.text.slice(0,i+=2);copy.scrollTop=copy.scrollHeight;if(i<def.text.length)laterWait(type,22);else finish();};
    laterWait(type,900);
    screen.addEventListener('click',e=>{if(button.hidden&&!e.target.closest('button'))finish();});
  }
  function f3sFinish(){
    progress.unlockedChapter=Math.max(3,Number(progress.unlockedChapter)||1);progress.file03Revealed=true;progress.file03PuzzleComplete=true;persistProgress();
    // The older File 03 state is what page load checks for completion, so keep it in step.
    file03.p3.complete=true;saveFile03();
    if(progress.file04WallSeen!==true)progress.file04WallSeen=false;persistProgress();
    f3s.screen='final';saveF3S();closeF3Stage();paintProgress();
    if(progress.file04WallSeen===false)setTimeout(()=>{if($('#f3Stage').hidden)playFile04Reveal();},700);
  }
  function f3sBuildControls(screen,id,def){
    const layer=screen.querySelector('.f3s-layer'),add=html=>{layer.insertAdjacentHTML('beforeend',html);return layer.lastElementChild;};
    const done=!!f3s.done[id];
    // Optional focus: softly dim the decorative art outside the boxes the question actually uses.
    if(def.focus){const img=screen.querySelector('.f3s-art'),apply=()=>{const W=img.naturalWidth,H=img.naturalHeight,mid=`f3sFocus-${id}`;
      layer.insertAdjacentHTML('afterbegin',`<svg class="f3s-dim" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="${mid}-b"><feGaussianBlur stdDeviation="14"/></filter><mask id="${mid}"><rect width="${W}" height="${H}" fill="#fff"/><g filter="url(#${mid}-b)">${def.focus.map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#000"/>`).join('')}</g></mask></defs><rect width="${W}" height="${H}" fill="#050302" mask="url(#${mid})"/></svg>`);};
      if(img.complete&&img.naturalWidth)apply();else img.addEventListener('load',apply,{once:true});}
    (def.review||[]).forEach(([box,n])=>add(`<button type="button" class="f3s-hit" style="${f3sBox(box)}" aria-label="Review ${F3S_CHAPTERS[n][0].toLowerCase()}: ${F3S_CHAPTERS[n][1].toLowerCase()}"></button>`).addEventListener('click',()=>f3sReview(n)));
    if(def.kind==='cover')add(`<button type="button" class="f3s-hit f3s-go" style="${f3sBox(def.begin)}" aria-label="Begin investigation"></button>`).addEventListener('click',()=>f3sGo(def.next));
    if(def.kind==='message'){
      const go=add(`<button type="button" class="f3s-hit f3s-go" style="${f3sBox(def.cont)}" aria-label="${def.label?f3sEsc(def.label):'Continue'}">${def.label?`<span class="f3s-go-label">${f3sEsc(def.label)}</span>`:''}</button>`);
      go.addEventListener('click',()=>{if(screen.classList.contains('typing'))return;if(def.finish)f3sFinish();else f3sGo(def.next);});
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
  }
  // M's closing letter, typed onto the blank paper. Paragraphs are blank-line separated; the "THE RECORD IS COMPLETE." line is highlighted.
  const F3S_CLOSING=`Well done, Detective.\n\nYou followed the money.\nYou questioned the accounts.\nYou traced the gaps between what was said and what could be proven.\n\nPiece by piece, the scattered records became a story.\n\nNot every detail was recovered. Not every question found an answer.\nBut you took what remained and made sense of it.\n\nThe numbers have been traced. The statements have been examined.\nThe missing pieces have been weighed against what remains.\n\nAnd where the records fall silent, you've made your judgment.\n\nPerhaps that is inevitable. An investigation cannot remain a\ncollection of questions forever.\n\nYour findings have been recorded.\nYour deductions have been preserved.\nThe archive now holds your account of what happened.\n\n[[THE RECORD IS COMPLETE.]]\n\nI've spent a great deal of time putting these pieces together.\nIt seems only fair to know that someone, at last, has seen them through.\n\nA pleasure, Detective.`;
  function f3sTypeLetter(screen,box){
    const parts=F3S_CLOSING.split(/(\[\[.*?\]\])/).map(t=>t.startsWith('[[')?{text:t.slice(2,-2),cls:'f3s-letter-mark'}:{text:t});
    const sign=document.createElement('div');sign.className='f3s-letter-sign';sign.textContent='— M';
    const nodes=parts.map(p=>{const n=document.createElement('span');if(p.cls)n.className=p.cls;box.append(n);return n;});box.append(sign);
    screen.classList.add('typing');
    const finish=()=>{parts.forEach((p,i)=>nodes[i].textContent=p.text);nodes.forEach(n=>n.classList.add('shown'));sign.classList.add('shown');screen.classList.remove('typing');};
    if(reducedMotion){finish();return;}
    let part=0,ch=0;
    const step=()=>{if(!screen.isConnected||!screen.classList.contains('typing'))return;const p=parts[part];if(!p){sign.classList.add('shown');laterWait(()=>screen.classList.remove('typing'),900);return;}
      nodes[part].classList.add('shown');ch=Math.min(p.text.length,ch+2);nodes[part].textContent=p.text.slice(0,ch);
      if(ch>=p.text.length){part++;ch=0;laterWait(step,p.cls?500:30);}else laterWait(step,p.text[ch-1]==='\n'?140:26);};
    laterWait(step,1300);
    screen.addEventListener('click',e=>{if(screen.classList.contains('typing')&&!e.target.closest('.f3s-skip,.f3s-retry'))finish();});
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
    if(def.kind==='written'){const text=(f3s.drafts[id]||'').trim();if(text.split(/\s+/).length<4){f3sNudge(screen,'.f3s-text','Write your answer first.');return;}const r=def.grade(text);correct=r.accepted;missing=(r.missing||[]).filter(m=>typeof m==='string');}
    if(def.kind==='times'){const t=f3s.drafts[id]||[];if(t.filter(Boolean).length<3){f3sNudge(screen,'.f3s-time','Enter all three times.');return;}correct=p3TimesCorrect(t).every(Boolean);}
    if(def.kind==='timeline'){const r=f3sTimelineResult(f3s.drafts[id]);correct=r.accepted;missing=r.missing;}
    const tries=(f3s.attempts[id]||0)+1;f3s.attempts[id]=tries;saveF3S();
    const explain=def.explain||def.model;
    if(correct){
      f3s.done[id]=true;saveF3S();f3sMarkAnswered(screen,id,def);f3sStamp(screen,'VERIFIED');
      f3sModal({tone:'good',title:['EVIDENCE VERIFIED','DEDUCTION ACCEPTED','RECORD CONFIRMED'][tries%3],body:`<p>${f3sEsc(explain)}</p>`,actions:[['CONTINUE →',()=>{f3sCloseModal();f3sGo(def.next);}]]});
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
  // Testing shortcut: wipe File 03 answers and attempts and start again from M's opening message.
  $('#f3sRetry').addEventListener('click',()=>{
    if($('#f3Stage').dataset.mode==='f4'){f4Retry();return;}
    if($('#f3Stage').dataset.mode==='f5'){f5Retry();return;}
    if(!$('#f3sChapter').hidden)return;
    f3s={screen:'opening',done:{},attempts:{},drafts:{},picks:{}};saveF3S();
    progress.file03PuzzleComplete=false;persistProgress();file03.p3.complete=false;saveFile03();paintProgress();
    f3sCloseModal();f3sGo('opening');
  });
  // Testing shortcut: jump past the current File 03 screen without answering.
  $('#f3sSkip').addEventListener('click',()=>{
    if($('#f3Stage').dataset.mode==='f4'){f4Skip();return;}
    if($('#f3Stage').dataset.mode==='f5'){f5Skip();return;}
    if(!$('#f3sChapter').hidden)return;
    const def=F3S_SCREENS[f3s.screen];f3sCloseModal();
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
    const show=i=>{lines[i].classList.add('on');box.scrollTo({top:box.scrollHeight,behavior:reducedMotion?'auto':'smooth'});};
    const finish=()=>{if(finished)return;finished=true;lines.forEach(p=>p.classList.add('on'));box.scrollTop=box.scrollHeight;go.hidden=false;go.focus({preventScroll:true});};
    const next=()=>{if(finished||!screen.isConnected)return;if(n>=lines.length){laterWait(finish,500);return;}show(n);const len=lines[n].textContent.length;n++;laterWait(next,reducedMotion?0:Math.min(5200,1100+len*38));};
    laterWait(next,700);
    screen.addEventListener('click',e=>{if(!finished&&!e.target.closest('button'))finish();});
  }
  // ---------------------------------------------------------------------------------------------
  // File 004 — The Lantern Fire. Runs inside the File 03 stage (#f3Stage, data-mode="f4") and reuses its
  // transmissions, chapter cards and case-note modal. Story → Puzzle 1 → story → Puzzle 2 → verdict → story → M.
  // Wrong answers get a hint first; a second wrong answer shows the answer, like File 03.
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
