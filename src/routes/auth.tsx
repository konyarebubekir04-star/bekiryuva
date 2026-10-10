import { createFileRoute } from '@tanstack/react-router';
import { AuthView } from '@/components/ortakyuva/account';
export const Route=createFileRoute('/auth')({
head:()=>({meta:[{title:'Giriş ve kayıt — OrtakYuva'},{name:'description',content:'OrtakYuva hesabınıza giriş yapın ve güvenli aile alanınızı oluşturun.'},{property:'og:title',content:'Giriş ve kayıt — OrtakYuva'},{property:'og:description',content:'OrtakYuva hesabınıza giriş yapın ve güvenli aile alanınızı oluşturun.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
component:Page
});
function Page(){return <AuthView/>;}
