import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useFamily } from './data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { House, Heart, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

type Answers = { name: string; parent: string; mode: string; child: string; code: string; allergy: string; emergency: string };

export function Onboarding() {
  const { user, profile, refresh } = useFamily();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<Answers>({ name: profile?.display_name ?? '', parent: '', mode: '', child: '', code: '', allergy: '', emergency: '' });
  const set = (k: keyof Answers, v: string) => setA(o => ({ ...o, [k]: v }));
  const steps = a.mode === 'join' ? ['name', 'parent', 'mode', 'code'] : ['name', 'parent', 'mode', 'child', 'allergy', 'emergency'];
  const current = steps[step];
  const canNext = current === 'name' ? a.name.trim() : current === 'parent' ? a.parent : current === 'mode' ? a.mode : current === 'child' ? a.child.trim() : current === 'code' ? a.code.trim() : true;
  const last = step === steps.length - 1;

  async function finish() {
    if (!user) return;
    setBusy(true);
    try {
      await supabase.from('profiles').update({ display_name: a.name.trim() }).eq('id', user.id);
      if (a.mode === 'join') {
        const r = await supabase.rpc('join_family', { code: a.code.trim(), parent: a.parent });
        if (r.error) { toast.error('Davet kodu geçersiz veya aile alanı dolu.'); return; }
      } else {
        const r = await supabase.rpc('create_family', { child: a.child.trim(), parent: a.parent });
        if (r.error || !r.data) { toast.error(r.error?.message ?? 'Aile alanı oluşturulamadı.'); return; }
        const extra = [
          a.allergy.trim() && { title: 'Alerjiler', note: a.allergy.trim() },
          a.emergency.trim() && { title: 'Acil durum kişisi', note: a.emergency.trim() },
        ].filter(Boolean) as Record<string, string>[];
        if (extra.length) await supabase.from('family_records').insert(extra.map(p => ({ family_id: r.data as string, kind: 'health', payload: p as Json, author_id: user.id })));
      }
      toast.success('Aile alanınız hazır');
      refresh();
    } finally { setBusy(false); }
  }

  const choice = (k: keyof Answers, v: string, label: string, hint: string) => (
    <button type="button" className={`onb-choice ${a[k] === v ? 'selected' : ''}`} onClick={() => set(k, v)}>
      <b>{label}</b><small>{hint}</small>{a[k] === v && <Check size={16} />}
    </button>
  );

  return (
    <div className="auth-page">
      <span className="brand"><span className="brand-icon"><House /><Heart size={10} /></span>OrtakYuva.</span>
      <section className="surface auth-form onb">
        <div className="onb-progress"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <span className="eyebrow">ADIM {step + 1} / {steps.length}</span>
        <form className="form-stack" onSubmit={e => { e.preventDefault(); if (!canNext) return; last ? finish() : setStep(step + 1); }}>
          {current === 'name' && <><h2>Size nasıl hitap edelim?</h2><Input autoFocus required value={a.name} onChange={e => set('name', e.target.value)} placeholder="Adınız" /></>}
          {current === 'parent' && <><h2>Çocuğunuzun nesi oluyorsunuz?</h2>{choice('parent', 'anne', 'Anne', 'Anne profiliyle devam et')}{choice('parent', 'baba', 'Baba', 'Baba profiliyle devam et')}</>}
          {current === 'mode' && <><h2>Aile alanınız var mı?</h2>{choice('mode', 'create', 'Yeni aile alanı oluştur', 'İlk kez başlıyorum')}{choice('mode', 'join', 'Davet koduyla katıl', 'Diğer ebeveyn bir kod paylaştı')}</>}
          {current === 'child' && <><h2>Çocuğunuzun adı ne?</h2><Input autoFocus required value={a.child} onChange={e => set('child', e.target.value)} placeholder="Çocuğunuzun adı" /></>}
          {current === 'code' && <><h2>Davet kodunu girin</h2><p className="text-muted-foreground">Kodu diğer ebeveyn Ayarlar sayfasından paylaşabilir.</p><Input autoFocus required value={a.code} onChange={e => set('code', e.target.value)} placeholder="Davet kodu" /></>}
          {current === 'allergy' && <><h2>{a.child} için bilinen bir alerji var mı?</h2><p className="text-muted-foreground">İsterseniz boş bırakıp sonra ekleyebilirsiniz.</p><Input autoFocus value={a.allergy} onChange={e => set('allergy', e.target.value)} placeholder="Örn. fıstık" /></>}
          {current === 'emergency' && <><h2>Acil durumda kime ulaşılsın?</h2><p className="text-muted-foreground">İsim ve telefon. İsteğe bağlı.</p><Input autoFocus value={a.emergency} onChange={e => set('emergency', e.target.value)} placeholder="Ad · telefon" /></>}
          <div className="flex justify-between gap-3">
            {step > 0 ? <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}><ArrowLeft />Geri</Button> : <span />}
            <Button type="submit" disabled={!canNext || busy}>{busy ? 'Hazırlanıyor…' : last ? 'Tamamla' : 'Devam'}{!busy && <ArrowRight />}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
