import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
export type Payload=Partial<Record<'title'|'date'|'time'|'end'|'location'|'parent'|'repeat'|'status'|'reminder'|'note'|'done'|'text'|'minutes',any>>;
export type RecordItem={id:string;kind:string;payload:Payload;author_id:string;created_at:string};
const today=new Date(); const date=(offset:number)=>{const d=new Date(today);d.setDate(d.getDate()+offset);return d.toLocaleDateString('sv-SE');};
export const demoRecords:RecordItem[]=[
{id:'e1',kind:'event',author_id:'baba',created_at:date(0)+"T12:00:00.000Z",payload:{title:'Babayla hafta sonu',date:date(0),time:'17:00',end:'19:00',location:'Maçka Parkı, ana giriş',parent:'baba',repeat:'weekly',status:'confirmed',reminder:'30'}},
{id:'e2',kind:'event',author_id:'anne',created_at:date(0)+"T12:00:00.000Z",payload:{title:'Piyano dersi',date:date(2),time:'16:00',end:'17:00',location:'Müzik Atölyesi',parent:'anne',repeat:'weekly',status:'confirmed',reminder:'30'}},
{id:'e3',kind:'event',author_id:'baba',created_at:date(0)+"T12:00:00.000Z",payload:{title:'Birlikte sinema',date:date(3),time:'14:00',end:'16:00',location:'Cevahir AVM',parent:'baba',repeat:'none',status:'pending',reminder:'60'}},
{id:'t1',kind:'task',author_id:'anne',created_at:date(0)+"T12:00:00.000Z",payload:{title:'Matematik ödevi',note:'Sayfa 24–25 · 10 soru',time:'18:00',done:false}},
{id:'t2',kind:'task',author_id:'anne',created_at:date(0)+"T12:00:00.000Z",payload:{title:'D vitamini',note:'1 damla · Yemekten sonra',time:'19:30',done:false}},
{id:'t3',kind:'task',author_id:'anne',created_at:date(0)+"T12:00:00.000Z",payload:{title:'20 dakika kitap okuma',note:'Küçük Prens · Bölüm 4',time:'20:00',done:true}},
{id:'h1',kind:'health',author_id:'anne',created_at:date(0)+"T12:00:00.000Z",payload:{title:'Alerjiler',note:'Fındık ve fıstık alerjisi. Paketli gıdaların içeriğini kontrol edelim.'}},
{id:'h2',kind:'health',author_id:'anne',created_at:date(0)+"T12:00:00.000Z",payload:{title:'İlaç & vitamin',note:'D vitamini · Her gün 19:30 · 1 damla'}},
{id:'n1',kind:'note',author_id:'anne',created_at:date(0)+"T12:00:00.000Z",payload:{title:'Pazartesi okul gezisi',note:'Deniz’in çantasına su matarası ve şapkasını koymayı unutmayalım.',parent:'anne'}},
{id:'m1',kind:'message',author_id:'baba',created_at:date(0)+"T12:00:00.000Z",payload:{text:'Deniz’i bugün 17:00’de parkın ana girişinden alabilirim. Senin için de uygun mu?',parent:'baba'}},
{id:'m2',kind:'message',author_id:'anne',created_at:date(0)+"T12:00:00.000Z",payload:{text:'Evet, uygun. Mavi montunu da çantasına koydum 🙂',parent:'anne'}}];
type State={user:User|null;family:any;members:any[];records:RecordItem[];history:any[];profile:any;loading:boolean;demo:boolean;parent:string;access:string;setParent:(p:string)=>void;save:(kind:string,payload:Record<string,any>,id?:string)=>Promise<void>;remove:(id:string)=>Promise<void>;refresh:()=>void};
const Context=createContext<State|null>(null);
export function FamilyProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null); const [ready,setReady]=useState(false);const [parent,setParent]=useState('anne');const [demoData,setDemoData]=useState(demoRecords);const [demoHistory,setDemoHistory]=useState<any[]>([]);const qc=useQueryClient();
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{setUser(data.user);setReady(true);});const {data}=supabase.auth.onAuthStateChange((event,session)=>{if(['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)){setUser(session?.user??null);if(event==='SIGNED_OUT')qc.clear();else qc.invalidateQueries();}});return()=>data.subscription.unsubscribe();},[qc]);
 const query=useQuery({queryKey:['family',user?.id],enabled:!!user,queryFn:async()=>{
 const p=await supabase.from('profiles').select('*').eq('id',user?.id??'').single(); const roles=await supabase.from('user_roles').select('*').eq('user_id',user?.id??'');if(roles.error)throw roles.error;
 const fid=roles.data?.[0]?.family_id;if(!fid)return {profile:p.data,family:null,members:[],records:[],history:[]};
 const [f,m,r,h]=await Promise.all([supabase.from('families').select('*').eq('id',fid).single(),supabase.from('user_roles').select('*').eq('family_id',fid),supabase.from('family_records').select('*').eq('family_id',fid).order('created_at'),supabase.from('event_history').select('*').eq('family_id',fid).order('created_at',{ascending:false})]);if(r.error)throw r.error;return {profile:p.data,family:f.data,members:m.data??[],records:(r.data??[]) as RecordItem[],history:h.data??[]};}});
 const family=query.data?.family;const self=query.data?.members.find(m=>m.user_id===user?.id);const demo=!user;
 useEffect(()=>{if(!family)return;const channel=supabase.channel(`family-${family.id}`).on('postgres_changes',{event:'*',schema:'public',table:'family_records',filter:`family_id=eq.${family.id}`},()=>qc.invalidateQueries({queryKey:['family']})).subscribe();return()=>{supabase.removeChannel(channel);};},[family?.id,qc]);
 const refresh=()=>{qc.invalidateQueries({queryKey:['family']});};
 async function save(kind:string,payload:Record<string,any>,id?:string){
 if(!demo && !family){toast.error('Önce aile alanınızı oluşturun.');return;}if(!demo && self?.access!=='editor' && !['message','status'].includes(kind)){toast.error('Bu işlem için düzenleme izni gerekli.');return;}
 if(demo){const item={id:id??crypto.randomUUID(),kind,payload,author_id:parent,created_at:new Date().toISOString()};setDemoData(old=>id?old.map(r=>r.id===id?item:r):[...old,item]);if(kind==='event')setDemoHistory(old=>[{id:crypto.randomUUID(),actor_name:parent==='anne'?'Elif':'Emre',action:id?'düzenlendi':'eklendi',snapshot:payload,created_at:new Date().toISOString()},...old]);}
 else {if(!family||!user)return;const result=id?await supabase.from('family_records').update({payload:payload as Json}).eq('id',id):await supabase.from('family_records').insert({family_id:family.id,kind,payload:payload as Json,author_id:user.id});if(result.error){toast.error(result.error.message);throw result.error;}refresh();}
 }
 async function remove(id:string){if(demo)setDemoData(old=>old.filter(r=>r.id!==id));else{const {error}=await supabase.from('family_records').delete().eq('id',id);if(error){toast.error(error.message);return;}refresh();}}
 return <Context.Provider value={{user,family:demo?{child_name:'Deniz',id:'demo'}:family,members:demo?[{user_id:'anne',parent_role:'anne',display_name:'Elif',access:'editor'},{user_id:'baba',parent_role:'baba',display_name:'Emre',access:'editor'}]:query.data?.members??[],profile:query.data?.profile,records:demo?demoData:query.data?.records??[],history:demo?demoHistory:query.data?.history??[],loading:!ready||!!user&&query.isLoading,demo,parent:demo?parent:self?.parent_role??'anne',access:demo?'editor':self?.access??'viewer',setParent,save,remove,refresh}}>{children}</Context.Provider>;
}
export function useFamily(){const value=useContext(Context);if(!value)throw new Error('FamilyProvider required');return value;}
