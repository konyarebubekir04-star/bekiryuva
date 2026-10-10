import { describe,it,expect } from 'vitest';
import { occurrences,mayEdit,type EventData } from './calendar';
const event:EventData={title:'Ziyaret',date:'2026-10-10',time:'17:00',end:'18:00',location:'Park',parent:'anne',repeat:'weekly',status:'pending',reminder:'30'};
describe('Shared calendar rules',()=>{it('repeats weekly',()=>expect(occurrences(event,'2026-10-01','2026-10-31')).toEqual(['2026-10-10','2026-10-17','2026-10-24','2026-10-31']));it('repeats monthly',()=>expect(occurrences({...event,repeat:'monthly'},'2026-10-01','2026-12-31')).toEqual(['2026-10-10','2026-11-10','2026-12-10']));it('allows editors to edit',()=>expect(mayEdit('editor')).toBe(true));it('denies viewers editing',()=>expect(mayEdit('viewer')).toBe(false));});
