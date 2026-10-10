import { createFileRoute } from '@tanstack/react-router';
import { SettingsView } from '@/components/ortakyuva/account';
import { AppShell } from '@/components/ortakyuva/shell';
export const Route=createFileRoute('/ayarlar')({
head:()=>({meta:[{title:'Aile ayarları — OrtakYuva'},{name:'description',content:'Ebeveyn profilleri, aile davetleri ve düzenleme izinleri.'},{property:'og:title',content:'Aile ayarları — OrtakYuva'},{property:'og:description',content:'Ebeveyn profilleri, aile davetleri ve düzenleme izinleri.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
component:Page
});
function Page(){return <AppShell><SettingsView/></AppShell>;}
