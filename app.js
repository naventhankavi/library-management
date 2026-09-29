const FINE=2,DAYS=14,KEY="lms_multi_v1",day=86400000;
let S={books:[],members:[],loans:[]},q="";
try{const r=localStorage.getItem(KEY);if(r)S=JSON.parse(r)}catch(e){}
if(!S.books.length&&!S.members.length){
 S.books=[["The Alchemist","Paulo Coelho","Fiction",3],["Wings of Fire","A.P.J. Abdul Kalam","Biography",2],["Ponniyin Selvan","Kalki Krishnamurthy","History",2],["Clean Code","Robert C. Martin","Technology",1]].map((b,i)=>({id:"B"+(i+1),title:b[0],author:b[1],cat:b[2],copies:b[3]}));
 S.members=[["Arun Kumar","arun@example.com"],["Priya S","priya@example.com"]].map((m,i)=>({id:"M"+(i+1),name:m[0],email:m[1]}));
}
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const toast=t=>{const m=$("#msg");m.textContent=t;m.style.display="block";setTimeout(()=>m.style.display="none",2200)};
const today=()=>new Date().toISOString().slice(0,10);
const due=l=>new Date(new Date(l.out).getTime()+DAYS*day);
const fine=l=>{const e=l.back?new Date(l.back):new Date();const d=Math.floor((e-due(l))/day);return d>0?d*FINE:0};
const avail=b=>b.copies-S.loans.filter(l=>l.book===b.id&&!l.back).length;
const nid=(p,a)=>p+(a.reduce((m,x)=>Math.max(m,+x.id.slice(p.length)||0),0)+1);
const bk=id=>S.books.find(b=>b.id===id),mb=id=>S.members.find(m=>m.id===id);
const table=(h,rows,empty)=>rows.length?`<div class="tw"><table><tr>${h.map(x=>`<th>${x}</th>`).join("")}</tr>${rows.join("")}</table></div>`:`<div class="empty">${empty}</div>`;
const P=[["index.html","Dashboard"],["books.html","Books"],["members.html","Members"],["circulation.html","Issue / Return"],["history.html","History"]];
const cur=document.body.dataset.page.replace(".html","").replace("index","dashboard");
document.body.insertAdjacentHTML("afterbegin",`<header><h1>Library Management System</h1><p>Smart library dashboard · Fine ₹${FINE} per day after ${DAYS} days.</p></header><nav>${P.map(p=>`<a href="${p[0]}" class="${p[0].replace(".html","").replace("index","dashboard")===cur?"on":""}">${p[1]}</a>`).join("")}</nav><main id="main"></main><div id="msg" role="status"></div>`);

function addBook(){const t=$("#t").value.trim(),a=$("#a").value.trim();if(!t||!a)return toast("Enter title and author");
 S.books.push({id:nid("B",S.books),title:t,author:a,cat:$("#c").value.trim()||"General",copies:Math.max(1,+$("#n").value||1)});save();render();toast("Book added")}
function delBook(id){if(S.loans.some(l=>l.book===id&&!l.back))return toast("Book is currently issued");S.books=S.books.filter(b=>b.id!==id);save();render()}
function addMember(){const n=$("#mn").value.trim();if(!n)return toast("Enter member name");
 S.members.push({id:nid("M",S.members),name:n,email:$("#me").value.trim()});save();render();toast("Member added")}
function delMember(id){if(S.loans.some(l=>l.member===id&&!l.back))return toast("Member has books to return");S.members=S.members.filter(m=>m.id!==id);save();render()}
function issue(){const b=$("#ib").value,m=$("#im").value;if(!b||!m)return toast("Pick a book and a member");
 if(avail(bk(b))<1)return toast("No copies available");
 if(S.loans.filter(l=>l.member===m&&!l.back).length>=3)return toast("Member already has 3 books");
 S.loans.push({id:nid("L",S.loans),book:b,member:m,out:today(),back:null});save();render();toast("Book issued")}
function ret(id){const l=S.loans.find(x=>x.id===id);l.back=today();save();render();const f=fine(l);toast(f?"Returned. Fine ₹"+f:"Returned")}

const loanRow=l=>`<td>${esc(bk(l.book)?.title||"")}</td><td>${esc(mb(l.member)?.name||"")}</td><td>${l.out}</td>`;
const V={
dashboard(){const out=S.loans.filter(l=>!l.back),od=out.filter(l=>fine(l)>0);
 return `<div class="stats"><div class="stat"><b>${S.books.reduce((s,b)=>s+b.copies,0)}</b><span>Total copies</span></div><div class="stat"><b>${S.members.length}</b><span>Members</span></div><div class="stat"><b>${out.length}</b><span>Issued now</span></div><div class="stat"><b>${od.length}</b><span>Overdue</span></div></div>
 <div class="panel"><h2>Overdue books</h2>${table(["Book","Member","Issued","Fine"],od.map(l=>`<tr>${loanRow(l)}<td><span class="tag o">₹${fine(l)}</span></td></tr>`),"No overdue books.")}</div>
 <div class="panel"><h2>Recent activity</h2>${table(["Book","Member","Issued","Returned"],[...S.loans].reverse().slice(0,5).map(l=>`<tr>${loanRow(l)}<td>${l.back||"Out"}</td></tr>`),"No transactions yet. Issue a book from the Issue / Return page.")}</div>`},
books(){const r=S.books.filter(b=>(b.title+b.author+b.cat).toLowerCase().includes(q));
 return `<div class="panel"><h2>Add a book</h2><div class="row"><input id="t" placeholder="Title"><input id="a" placeholder="Author"><input id="c" placeholder="Category"><input id="n" type="number" min="1" value="1"><button class="p" onclick="addBook()">Add book</button></div></div>
 <div class="panel"><div class="row"><input id="sq" placeholder="Search by title, author or category" value="${esc(q)}" oninput="q=this.value.toLowerCase();render(1)"></div>
 ${table(["ID","Title","Author","Category","Available",""],r.map(b=>`<tr><td>${b.id}</td><td>${esc(b.title)}</td><td>${esc(b.author)}</td><td>${esc(b.cat)}</td><td><span class="tag ${avail(b)?"":"o"}">${avail(b)} of ${b.copies}</span></td><td><button class="s d" onclick="delBook('${b.id}')">Delete</button></td></tr>`),"No books match.")}</div>`},
members(){return `<div class="panel"><h2>Add a member</h2><div class="row"><input id="mn" placeholder="Full name"><input id="me" placeholder="Email"><button class="p" onclick="addMember()">Add member</button></div></div>
 <div class="panel">${table(["ID","Name","Email","Books held",""],S.members.map(m=>`<tr><td>${m.id}</td><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${S.loans.filter(l=>l.member===m.id&&!l.back).length}</td><td><button class="s d" onclick="delMember('${m.id}')">Delete</button></td></tr>`),"No members yet.")}</div>`},
circulation(){const out=S.loans.filter(l=>!l.back);
 return `<div class="panel"><h2>Issue a book</h2><div class="row"><select id="ib"><option value="">Select book</option>${S.books.filter(b=>avail(b)>0).map(b=>`<option value="${b.id}">${esc(b.title)} (${avail(b)} left)</option>`).join("")}</select><select id="im"><option value="">Select member</option>${S.members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join("")}</select><button class="p" onclick="issue()">Issue book</button></div></div>
 <div class="panel"><h2>Return a book</h2>${table(["Book","Member","Issued","Due","Fine",""],out.map(l=>`<tr>${loanRow(l)}<td>${due(l).toISOString().slice(0,10)}</td><td>${fine(l)?`<span class="tag o">₹${fine(l)}</span>`:"-"}</td><td><button class="s" onclick="ret('${l.id}')">Return</button></td></tr>`),"Nothing is issued right now.")}</div>`},
history(){return `<div class="panel">${table(["Book","Member","Issued","Returned","Fine"],[...S.loans].reverse().map(l=>`<tr>${loanRow(l)}<td>${l.back||"Out"}</td><td>${fine(l)?"₹"+fine(l):"-"}</td></tr>`),"No transactions yet.")}
 <div class="row" style="margin-top:12px"><button class="s d" onclick="if(confirm('Reset all data?')){localStorage.removeItem(KEY);location.reload()}">Reset all data</button></div></div>`}};
function render(keep){$("#main").innerHTML=V[cur]();if(keep){const i=$("#sq");if(i){i.focus();i.setSelectionRange(q.length,q.length)}}}
render();
