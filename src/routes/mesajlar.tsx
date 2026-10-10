import { createFileRoute } from '@tanstack/react-router';
import { MessagesView } from '@/components/ortakyuva/views';
import { AppShell } from '@/components/ortakyuva/shell';
export const Route=createFileRoute('/mesajlar')({
head:()=>({meta:[{title:'Mesajlar ve notlar — OrtakYuva'},{name:'description',content:'Ailenize özel mesajlar ve ortak duyuru panosu.'},{property:'og:title',content:'Mesajlar ve notlar — OrtakYuva'},{property:'og:description',content:'Ailenize özel mesajlar ve ortak duyuru panosu.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
component:Page
});
function Page(){return <AppShell><MessagesView/></AppShell>;}
