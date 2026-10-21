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
  const later = (fn, ms) => { const t = setTimeout(fn, reducedMotion ? 0 : ms); timers.push(t); return t; };
  const laterWait = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  function show(scene) {
    scenes.forEach(s => s.classList.toggle('active', s === scene));
    const acceptedCaseOnly = scene === scenes[6] && scene.classList.contains('closure-revealed');
    document.body.classList.toggle('file-one-closed', acceptedCaseOnly);
    const archive = scene === scenes[4];
    // Keep the intro skip available through every opening/story scene, including timed reveals.
    $('#skipIntro').classList.toggle('is-hidden', archive || scene === scenes[6] || scene === scenes[7] || scene === scenes[10] || scene === scenes[11]);
    $('#soundToggle').classList.toggle('is-hidden', acceptedCaseOnly || archive || scene === scenes[9] || scene === scenes[10] || scene === scenes[11]);
  }
  function paintProgress() {
    const complete = !!progress.chapterOneComplete || !!progress.caseAccepted || previewHome;
    const secondUnlocked = !!progress.file02TransitionSeen;
    const secondComplete = !!progress.fileTwoComplete || !!progress.file02Complete;
    $('#fileOneStatus').textContent = complete ? 'COMPLETED' : progress.chapterOneStarted ? 'IN PROGRESS' : 'ACTIVE';
    $('#fileOne').classList.toggle('completed', complete);
    $('#fileTwo').classList.toggle('unlocked', secondUnlocked);
    $('#fileTwo').classList.toggle('completed', secondComplete);
    if ($('#fileTwoStatus')) $('#fileTwoStatus').textContent = secondComplete ? 'COMPLETED' : 'ACTIVE';
    if (secondComplete) {
      $('#fileTwoBegin').textContent = 'COMPLETED';
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
    const thirdUnlocked=Number(progress.unlockedChapter)>=3;$('#fileThree').disabled=!thirdUnlocked;$('#fileThree').classList.toggle('unlocked',thirdUnlocked);$('#fileThreeStatus').textContent=progress.file03PuzzleComplete?'COMPLETED':thirdUnlocked?'AVAILABLE':'LOCKED';$('#fileThree').setAttribute('aria-label',thirdUnlocked?'Open Project North Quay':'File 03 locked');
    $('#homeScene').classList.toggle('file-two-lit', secondUnlocked);
    $('#homeScene').classList.toggle('file-two-completed', secondComplete);
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
    home.classList.remove('closure-revealed','closure-sequence','closure-continue-ready','file-one-dimming','file-two-signal','file-two-paper','file-two-number-visible','file-two-title-visible','file-two-copy-visible','file-two-begin-visible');
    const showFileOneClosure=!!progress.caseAccepted&&!progress.file02TransitionSeen;
    if(showFileOneClosure) home.classList.add('closure-revealed');
    if(progress.file02TransitionSeen) home.classList.add('file-two-available','file-two-number-visible','file-two-title-visible','file-two-copy-visible','file-two-begin-visible');
    home.classList.add('board-mode','document-lit','wall-reveal');
    $('#fileClosedNotice').classList.remove('visible');
    $('#homeCaption').hidden=true; $('#wallHotspot').hidden=true;
    $('#messageDossier').setAttribute('aria-hidden','true');
    paintProgress(); show(home);
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
    later(() => showClue(1), 3200); later(() => showClue(2), 6400);
    later(() => show(scenes[3]), 9600);
    later(() => openArchive(), 15000);
  }
  function openArchive() { startSound(); clearTimers(); $('#archiveScene').classList.add('opening'); show(scenes[4]); later(() => $('#digit-1').focus(), 800); }
  function resetLogin() {
    $('#archiveScene').classList.remove('decrypting','unsealed','opening');
    $('#loginError').textContent = ''; $$('.digit').forEach(d => d.value = '');
    $('#archivePanel').classList.remove('pin-error');
    if(typeof syncCodeState==='function')syncCodeState();
    $('#archivePanel').style.opacity = ''; $('#archivePanel').style.transform = '';
  }
  function startStory() {
    clearTimers(); stopSound(); resetLogin(); show(scenes[0]);
    later(() => show(scenes[1]), 7000);
  }
  // Requested flow: title (2), Lake Ash opening (1), clues (3), case file (4), login (5), decryption, transmission, homepage.
  const previewHome = new URLSearchParams(location.search).get('screen') === 'home';
  if(previewHome || progress.caseAccepted) showHomeBoard(); else later(() => show(scenes[1]), 7000);
  $('#playIntro').addEventListener('click', () => { clearTimers(); startSound(); runClues(); });
  $('#skipIntro').addEventListener('click', openArchive);
  $('#nextEvidence').addEventListener('click', () => showClue(clueIndex + 1));
  $('#prevEvidence').addEventListener('click', () => showClue(clueIndex - 1));
  $('#reopenCase').addEventListener('click', openArchive);
  $('#replayIntro').addEventListener('click', startStory);

  const digits = $$('.digit');
  const accessButton = $('#accessButton');
  const syncCodeState = () => {
    accessButton.disabled = !digits.every(d => /^\d$/.test(d.value));
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
    progress.unlockedChapter = 1;
    persistProgress();
    selectRound(1);
    round = readRound(1);
    showHomeBoard();
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
  function continueFileTwoFlow(){
    const home=$('#homeScene');
    if(progress.file02TransitionSeen)return;
    progress.caseAccepted=true;
    progress.file02TransitionSeen=true;
    persistProgress();
    home.classList.remove('closure-continue-ready');
    home.classList.add('file-one-dimming','file-two-signal');
    paintProgress();
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
    persistProgress();
    showHomeBoard();
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
        persistProgress();
        paintProgress();
        openFile03();
      }, 700);
    }, reducedMotion ? 100 : 800);
  });
  $('#fileThree').addEventListener('click',()=>{if(!$('#fileThree').disabled)openFile03();});
  $('[data-f3-close]').addEventListener('click',closeFile03);
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
    showHomeBoard();
  });
  function stopSound(){audioNodes.forEach(n=>{try{n.stop?.();n.disconnect?.();}catch{}});audioNodes=[];if(audioContext){audioContext.close().catch(()=>{});audioContext=null;}$('#soundToggle').innerHTML='◖)) <span>SOUND OFF</span>';$('#soundToggle').setAttribute('aria-label','Turn ambient sound on');}
  async function startSound(){if(audioContext){if(audioContext.state==='suspended')await audioContext.resume();return;}const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;audioContext=new Ctx();await audioContext.resume();const master=audioContext.createGain();master.gain.value=.4;master.connect(audioContext.destination);const b=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate);const a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*.24;const src=audioContext.createBufferSource();src.buffer=b;src.loop=true;const lp=audioContext.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;const ng=audioContext.createGain();ng.gain.value=.38;src.connect(lp);lp.connect(ng);ng.connect(master);src.start();const wind=audioContext.createOscillator(),wg=audioContext.createGain();wind.type='sine';wind.frequency.value=86;wg.gain.value=.03;wind.connect(wg);wg.connect(master);wind.start();const droneA=audioContext.createOscillator(),droneB=audioContext.createOscillator(),dg=audioContext.createGain();droneA.type='sine';droneB.type='triangle';droneA.frequency.value=55;droneB.frequency.value=82.4;dg.gain.value=.035;droneA.connect(dg);droneB.connect(dg);dg.connect(master);droneA.start();droneB.start();const heart=audioContext.createOscillator(),hg=audioContext.createGain();heart.frequency.value=48;hg.gain.value=.0001;heart.connect(hg);hg.connect(master);heart.start();const t=audioContext.currentTime+.5;for(let beat=0;beat<80;beat++)for(const off of [0,.17]){const x=t+beat*1.2+off;hg.gain.setValueAtTime(.0001,x);hg.gain.exponentialRampToValueAtTime(off?.07:.11,x+.045);hg.gain.exponentialRampToValueAtTime(.0001,x+.22);}audioNodes.push(src,wind,droneA,droneB,heart,lp,ng,wg,dg,hg);$('#soundToggle').innerHTML='◖)) <span>SOUND ON</span>';$('#soundToggle').setAttribute('aria-label','Turn ambient sound off');}
  $('#soundToggle').addEventListener('click',()=>audioContext?stopSound():startSound());
})();
