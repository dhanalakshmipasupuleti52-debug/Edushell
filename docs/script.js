(function(){
var $=function(s){return document.querySelector(s)};
var fs={'notes.txt':'Welcome to EduShell OS!','schedule.txt':'Mon: OS Lab\nTue: Data Structures\nWed: Networks','readme.md':'EduShell - a mini OS shell written in C.'};
var z=100,hist=[],hi=0,tout=$('#tout'),tin=$('#tin');
function clock(){$('#clock').textContent=new Date().toLocaleString([], {weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
clock();setInterval(clock,30000);
function front(w){w.style.zIndex=++z}
function openW(id){
if(id==='gh'){window.open('https://github.com/dhanalakshmipasupuleti52-debug/Edushell','_blank');return}
var w=$('#w-'+id);w.classList.add('show');front(w);
if(id==='files')renderFiles();
if(id==='term')tin.focus();
mark();
}
function mark(){document.querySelectorAll('.ico').forEach(function(b){b.classList.toggle('on',$('#w-'+b.dataset.w).classList.contains('show'))})}
document.querySelectorAll('[data-w]').forEach(function(e){e.addEventListener('click',function(){openW(e.dataset.w)})});
document.querySelectorAll('.win').forEach(function(w){
w.addEventListener('pointerdown',function(){front(w)});
var tb=w.querySelector('.tb'),sx,sy,ox,oy,drag=false;
tb.addEventListener('pointerdown',function(e){if(e.target.closest('i'))return;drag=true;sx=e.clientX;sy=e.clientY;ox=w.offsetLeft;oy=w.offsetTop;tb.setPointerCapture(e.pointerId)});
tb.addEventListener('pointermove',function(e){if(!drag)return;w.style.left=Math.max(62,ox+e.clientX-sx)+'px';w.style.top=Math.max(30,oy+e.clientY-sy)+'px'});
tb.addEventListener('pointerup',function(){drag=false});
w.querySelectorAll('[data-close],[data-min]').forEach(function(b){b.addEventListener('click',function(){w.classList.remove('show');mark()})});
});
function renderFiles(){
var f=$('#fl');f.innerHTML='';
Object.keys(fs).forEach(function(n){var d=document.createElement('div');d.innerHTML='<b>'+(n.slice(-3)==='.md'?'📝':'📄')+'</b>';d.appendChild(document.createTextNode(n));
d.onclick=function(){openW('term');say('student@edushell:~$ cat '+n);say(fs[n])};f.appendChild(d)});
}
function say(t){tout.appendChild(document.createTextNode(t+'\n'));var b=$('#term');b.scrollTop=b.scrollHeight}
var C={
help:function(){return 'EduShell built-ins:\n  help  ls  cat  touch  rm  echo  pwd  whoami  date  uname  neofetch  history  clear  exit\nJob control:\n  sleep N / count N   run a timed job (add & to run in background)\n  jobs  fg [%n]  bg [%n]  kill %n  ps\n  Ctrl+Z stops the foreground job, Ctrl+C kills it'},
ls:function(){return Object.keys(fs).join('  ')},
cat:function(a){if(!a[0])return 'usage: cat <file>';return fs[a[0]]!==undefined?fs[a[0]]:'cat: '+a[0]+': No such file or directory'},
touch:function(a){if(!a[0])return 'usage: touch <file>';if(fs[a[0]]===undefined)fs[a[0]]='';return ''},
rm:function(a){if(!a[0])return 'usage: rm <file>';if(fs[a[0]]===undefined)return 'rm: cannot remove \''+a[0]+'\': No such file';delete fs[a[0]];return ''},
echo:function(a){return a.join(' ')},
pwd:function(){return '/home/student'},
whoami:function(){return 'student'},
date:function(){return new Date().toString()},
uname:function(){return 'EduShell 1.0 mini-os x86_64'},
neofetch:function(){return '  student@edushell\n  ----------------\n  OS: EduShell OS 1.0\n  Shell: EduShell (C)\n  Kernel: mini-os\n  Uptime: '+Math.floor(performance.now()/60000)+' mins\n  Packages: 0 (built from scratch)'},
history:function(){return hist.map(function(h,i){return ' '+(i+1)+'  '+h}).join('\n')},
clear:function(){tout.textContent='';return ''},
exit:function(){$('#w-term').classList.remove('show');mark();return ''}
};
var jobs=[],nextId=1,pidc=1000,fgJob=null,bgFlag=false,tline=$('#tline');
function lastJob(){return jobs.length?jobs[jobs.length-1].id:0}
function jobStr(j){return '['+j.id+']'+(j.id===lastJob()?'+':' ')+'  '+j.state.padEnd(9)+j.cmd+(j.state==='Running'&&!j.fg?' &':'')}
function setFg(j){j.fg=true;j.state='Running';fgJob=j;tline.style.opacity=0}
function endFg(){fgJob=null;tline.style.opacity=1;tin.focus()}
function startJob(cmd,type,secs,bg){if(!jobs.length)nextId=1;var j={id:nextId++,pid:++pidc,cmd:cmd,type:type,left:secs,n:0,state:'Running',fg:!bg};jobs.push(j);if(bg)say('['+j.id+'] '+j.pid);else setFg(j)}
function finish(j){jobs.splice(jobs.indexOf(j),1);if(j.fg)endFg();else say('['+j.id+']+  Done       '+j.cmd)}
setInterval(function(){jobs.slice().forEach(function(j){if(j.state!=='Running')return;j.left--;if(j.type==='count'){j.n++;say('count: '+j.n)}if(j.left<=0)finish(j)})},1000);
function target(a){var t=a[0]?parseInt(a[0].replace('%',''),10):lastJob();return jobs.filter(function(j){return j.id===t||j.pid===t})[0]}
C.sleep=function(a){var n=parseInt(a[0],10);if(!n)return 'usage: sleep <seconds>';startJob('sleep '+n,'sleep',n,bgFlag);return ''};
C.count=function(a){var n=parseInt(a[0],10)||10;startJob('count '+n,'count',n,bgFlag);return ''};
C.jobs=function(){return jobs.map(jobStr).join('\n')};
C.fg=function(a){var j=target(a);if(!j)return 'fg: no such job';say(j.cmd);setFg(j);return ''};
C.bg=function(a){var j=target(a);if(!j)return 'bg: no such job';if(j.state!=='Stopped')return 'bg: job '+j.id+' already running in background';j.state='Running';j.fg=false;return '['+j.id+']+ '+j.cmd+' &'};
C.kill=function(a){var j=target(a);if(!j)return 'kill: usage: kill %job | pid';jobs.splice(jobs.indexOf(j),1);return '['+j.id+']+  Terminated  '+j.cmd};
C.ps=function(){return '  PID TTY      STAT CMD\n 1000 pts/0    S    edushell\n'+jobs.map(function(j){return ' '+j.pid+' pts/0    '+(j.state==='Stopped'?'T':'S')+'    '+j.cmd}).join('\n')};
function ctrl(k){if(!fgJob){say('^'+k.toUpperCase());return}var j=fgJob;if(k==='c'){say('^C');jobs.splice(jobs.indexOf(j),1);endFg()}else{say('^Z');j.state='Stopped';j.fg=false;say('['+j.id+']+  Stopped    '+j.cmd);endFg()}}
document.querySelectorAll('[data-key]').forEach(function(b){b.addEventListener('click',function(){ctrl(b.dataset.key);tin.focus()})});
tin.addEventListener('keydown',function(e){if(e.ctrlKey&&(e.key==='c'||e.key==='z')){e.preventDefault();ctrl(e.key);return}
if(e.key==='Enter'){
if(fgJob)return;var l=tin.value;tin.value='';say('student@edushell:~$ '+l);var bgRun=/&\s*$/.test(l);if(bgRun)l=l.replace(/\s*&\s*$/,'');bgFlag=bgRun;
var p=l.trim().split(/\s+/);if(!p[0])return;
hist.push(l);hi=hist.length;
var f=Object.prototype.hasOwnProperty.call(C,p[0])?C[p[0]]:null;
var r=f?f(p.slice(1)):'edushell: command not found: '+p[0];
if(r)say(r);
}else if(e.key==='ArrowUp'&&hi>0){hi--;tin.value=hist[hi]}
else if(e.key==='ArrowDown'){hi=Math.min(hi+1,hist.length);tin.value=hist[hi]||''}
});
$('#term').addEventListener('click',function(){tin.focus()});
say('EduShell OS 1.0 — type "help" for commands.\n');
$('#es').onclick=function(){var n=$('#ef').value.trim();if(!n)return;fs[n]=$('#ea').value;$('#em').textContent='Saved '+n+'. Open the Terminal and type: cat '+n};
var bp=$('#bp'),bt=$('#bt'),pct=0,msgs=['Loading kernel…','Mounting file system…','Starting Edushell services…','Welcome to Edushell'];
var bi=setInterval(function(){pct+=4;bp.style.width=pct+'%';bt.textContent=msgs[Math.min(3,Math.floor(pct/26))];if(pct>=100){clearInterval(bi);setTimeout(function(){$('#bootscr').style.display='none';$('#login').style.display='flex';$('#un').focus()},400)}},100);
function login(){var u=$('#un').value.trim(),p=$('#pw').value;if(u!=='student'||p!=='edushell123'){$('#lerr').textContent='Authentication failure. Try again.';var lg=$('#login');lg.classList.remove('shake');void lg.offsetWidth;lg.classList.add('shake');$('#pw').value='';return}var b=$('#boot');b.style.opacity=0;setTimeout(function(){b.style.display='none';openW('term');openW('about')},600)}
$('#lbtn').onclick=login;$('#un').addEventListener('keydown',function(e){if(e.key==='Enter')$('#pw').focus()});$('#pw').addEventListener('keydown',function(e){if(e.key==='Enter')login()});
setInterval(function(){if(!$('#w-monitor').classList.contains('show'))return;var busy=jobs.some(function(j){return j.state==='Running'}),h='<h2>System Monitor</h2>';
for(var i=1;i<=4;i++){var v=Math.round(8+Math.random()*35+(busy?30:0));h+='<div class="mrow">CPU'+i+'<div class="mbar"><div style="width:'+v+'%"></div></div>'+v+'%</div>'}
var m=Math.round(34+Math.random()*8);h+='<div class="mrow">MEM<div class="mbar"><div style="width:'+m+'%"></div></div>'+m+'%</div><p><b>Processes</b></p><pre class="plist">PID    STATE     NAME\n1000   Running   edushell\n'+jobs.map(function(j){return j.pid+'   '+j.state.padEnd(9)+' '+j.cmd}).join('\n')+'</pre>';
$('#mon').innerHTML=h},1000);
})();
