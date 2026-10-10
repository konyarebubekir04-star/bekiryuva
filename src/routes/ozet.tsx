import { createFileRoute } from '@tanstack/react-router';
import { SummaryView } from '@/components/ortakyuva/views';
import { AppShell } from '@/components/ortakyuva/shell';
export const Route=createFileRoute('/ozet')({
head:()=>({meta:[{title:'Haftalık özet — OrtakYuva'},{name:'description',content:'Ekran süresi, tamamlanan ödevler ve gerçekleşen buluşmaların haftalık özeti.'},{property:'og:title',content:'Haftalık özet — OrtakYuva'},{property:'og:description',content:'Ekran süresi, tamamlanan ödevler ve gerçekleşen buluşmaların haftalık özeti.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
component:Page
});
function Page(){return <AppShell><SummaryView/></AppShell>;}
