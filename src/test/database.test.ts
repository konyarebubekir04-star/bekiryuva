import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
const file=process.env['TEST_ACCOUNT_FILE'];
const suite=file?describe:describe.skip;
suite('Cloud family permissions',()=>{
 let token='',familyId='',recordId='';
 const base=process.env['SUPABASE_URL']??'';
 const key=process.env['SUPABASE_PUBLISHABLE_KEY']??'';
 const request=async(path:string,method='GET',body?:object)=>{const r=await fetch(base+path,{method,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};};
 beforeAll(async()=>{if(!file)return;const creds=JSON.parse(readFileSync(file,'utf8'));const r=await fetch(base+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email:creds.users[1].email,password:creds.password})});const auth=await r.json();token=auth.access_token;const roles=await request('/rest/v1/user_roles?select=*');familyId=roles.data[0].family_id;const records=await request('/rest/v1/family_records?kind=eq.event&select=*');recordId=records.data[0].id;});
 it('viewer cannot insert calendar events',async()=>{const r=await request('/rest/v1/family_records','POST',{family_id:familyId,kind:'event',payload:{title:'Blocked'}});expect(r.status).toBe(403);});
 it('viewer cannot edit calendar events',async()=>{const r=await request('/rest/v1/family_records?id=eq.'+recordId,'PATCH',{payload:{title:'Blocked'}});expect(r.data).toEqual([]);});
 it('non-owner cannot grant themselves editor permission',async()=>{if(!file)return;const creds=JSON.parse(readFileSync(file,'utf8'));const r=await request('/rest/v1/rpc/set_family_access','POST',{fid:familyId,member:creds.users[1].id,permission:'editor'});expect(r.status).toBeGreaterThanOrEqual(400);});
 it('records actor and updated appointment in immutable history',async()=>{const r=await request('/rest/v1/event_history?record_id=eq.'+recordId+'&select=*');expect(r.data.some((h:any)=>h.actor_name==='Baba Test'&&h.action==='düzenlendi'&&h.snapshot.title==='Baba tarafından düzenlendi')).toBe(true);});
});
