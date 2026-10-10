import { createFileRoute } from '@tanstack/react-router';
import { Overview } from '@/components/ortakyuva/views';
import { AppShell } from '@/components/ortakyuva/shell';
export const Route=createFileRoute('/')({
head:()=>({meta:[{title:'Genel bakış — OrtakYuva'},{name:'description',content:'Ailenizin ortak planları, yaklaşan buluşmalar ve günlük hatırlatmalar.'},{property:'og:title',content:'Genel bakış — OrtakYuva'},{property:'og:description',content:'Ailenizin ortak planları, yaklaşan buluşmalar ve günlük hatırlatmalar.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
component:Page
});
function Page(){return <AppShell><Overview/></AppShell>;}
