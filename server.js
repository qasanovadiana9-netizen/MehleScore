const express=require('express');
const session=require('express-session');
const fs=require('fs');
const path=require('path');
const app=express();
const PORT=process.env.PORT||3000;
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD;
const SESSION_SECRET=process.env.SESSION_SECRET;
if(!ADMIN_PASSWORD||!SESSION_SECRET){console.error('Set ADMIN_PASSWORD and SESSION_SECRET in Render Environment Variables.');process.exit(1)}
const DB=path.join(__dirname,'data.json');
const initial={matches:[
{id:1,h:'MSN FK',a:'Xirdalan United',scoreH:3,scoreA:0,date:'',time:'',status:'Başa çatıb'},
{id:2,h:'Lotu Pişiklər',a:'MSN FK',scoreH:4,scoreA:1,date:'',time:'',status:'Başa çatıb'},
{id:3,h:'Xirdalan Wolves',a:'Lotu Pişiklər',scoreH:5,scoreA:5,date:'',time:'',status:'Başa çatıb'},
{id:4,h:'Neweli FK',a:'MSN FK',scoreH:10,scoreA:8,date:'',time:'',status:'Başa çatıb'},
{id:5,h:'Xirdalan United',a:'Xirdalan Wolves',scoreH:3,scoreA:0,date:'',time:'',status:'Başa çatıb'},
{id:6,h:'Xirdalan United',a:'Lotu Pişiklər',scoreH:1,scoreA:0,date:'',time:'',status:'Başa çatıb'},
{id:7,h:'MSN FK',a:'Xirdalan Wolves',scoreH:9,scoreA:9,date:'',time:'',status:'Başa çatıb'},
{id:8,h:'Neweli FK',a:'Xirdalan United',scoreH:3,scoreA:5,date:'',time:'',status:'Başa çatıb'}],
teams:[
{id:1,name:'Xirdalan Wolves',logo:'🐺'},{id:2,name:'MSN FK',logo:'⚽'},{id:3,name:'Xirdalan United',logo:'⚽'},{id:4,name:'Lotu Pişiklər',logo:'🐱'},{id:5,name:'Neweli FK',logo:'⚽'}],
players:[
{id:101,name:'Ali',num:'',team:1,goals:0,assists:0,saves:0,points:0},{id:102,name:'Emin',num:'',team:1,goals:0,assists:0,saves:0,points:0},{id:103,name:'Raul',num:'',team:1,goals:0,assists:0,saves:0,points:0},{id:104,name:'Huseyin (2 blok)',num:'',team:1,goals:0,assists:0,saves:0,points:0},
{id:105,name:'Fuad',num:'',team:2,goals:0,assists:0,saves:0,points:0},{id:106,name:'Murad',num:'',team:2,goals:0,assists:0,saves:0,points:0},{id:107,name:'Minə',num:'',team:2,goals:0,assists:0,saves:0,points:0},{id:108,name:'Şamxal',num:'',team:2,goals:0,assists:0,saves:0,points:0},
{id:109,name:'Amil',num:'',team:3,goals:0,assists:0,saves:0,points:0},{id:110,name:'Elmir',num:'',team:3,goals:0,assists:0,saves:0,points:0},{id:111,name:'Huseyin',num:'',team:3,goals:0,assists:0,saves:0,points:0},{id:112,name:'İsa',num:'',team:3,goals:0,assists:0,saves:0,points:0},{id:113,name:'Ümüd',num:'',team:3,goals:0,assists:0,saves:0,points:0},
{id:114,name:'Kamran',num:'',team:4,goals:0,assists:0,saves:0,points:0},{id:115,name:'Ayxan',num:'',team:4,goals:0,assists:0,saves:0,points:0},{id:116,name:'Ramil',num:'',team:4,goals:0,assists:0,saves:0,points:0},
{id:117,name:'Tofik',num:'',team:5,goals:0,assists:0,saves:0,points:0},{id:118,name:'Arda',num:'',team:5,goals:0,assists:0,saves:0,points:0},{id:119,name:'Emil',num:'',team:5,goals:0,assists:0,saves:0,points:0},{id:120,name:'Vəli',num:'',team:5,goals:0,assists:0,saves:0,points:0}],
leagues:[{id:1,name:'Mehle League',season:'2026/27',teams:[1,2,3,4,5]}]};
function read(){try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return JSON.parse(JSON.stringify(initial))}}
function write(d){fs.writeFileSync(DB,JSON.stringify(d,null,2))}
if(!fs.existsSync(DB))write(initial);
app.use(express.json({limit:'1mb'}));
app.use(session({secret:SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:8*60*60*1000}}));
function admin(req,res,next){if(!req.session.admin)return res.status(401).json({error:'Admin girişi tələb olunur'});next()}
app.post('/api/login',(req,res)=>{if(req.body?.password!==ADMIN_PASSWORD)return res.status(401).json({error:'Şifrə yanlışdır'});req.session.admin=true;res.json({ok:true})});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/data',(req,res)=>res.json({data:read(),isAdmin:!!req.session.admin}));
app.put('/api/data',admin,(req,res)=>{const d=req.body;if(!d||!Array.isArray(d.matches)||!Array.isArray(d.teams)||!Array.isArray(d.players)||!Array.isArray(d.leagues))return res.status(400).json({error:'Məlumat formatı yanlışdır'});write(d);res.json({ok:true,data:d})});
app.use(express.static(path.join(__dirname,'public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log('AliScore running on '+PORT));
