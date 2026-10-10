import { addMonths, addWeeks, format } from 'date-fns';
export type EventData = { title: string; date: string; time: string; end: string; location: string; parent: string; repeat: string; status: string; reminder: string };
export function occurrences(event: EventData, start: string, end: string) {
  const result: string[] = []; let date = new Date(`${event.date}T12:00:00`);
  for (let i=0;i<120 && format(date,'yyyy-MM-dd')<=end;i++) {
    const key=format(date,'yyyy-MM-dd'); if(key>=start) result.push(key);
    if(event.repeat==='weekly') date=addWeeks(date,1); else if(event.repeat==='monthly') date=addMonths(date,1); else break;
  } return result;
}
export function mayEdit(access: string) { return access==='editor'; }
