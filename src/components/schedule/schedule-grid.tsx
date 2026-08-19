const DAYS: { key: string; label: string }[] = [
  { key: "MONDAY", label: "Lun" },
  { key: "TUESDAY", label: "Mar" },
  { key: "WEDNESDAY", label: "Mer" },
  { key: "THURSDAY", label: "Jeu" },
  { key: "FRIDAY", label: "Ven" },
  { key: "SATURDAY", label: "Sam" },
];

const HOURS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

type Slot = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  subjectName: string;
  teacherName?: string | null;
  className?: string;
};

type ScheduleGridProps = {
  slots: Slot[];
};

export function ScheduleGrid({ slots }: ScheduleGridProps) {
  function slotFor(day: string, hour: string) {
    return slots.find((s) => s.dayOfWeek === day && s.startTime === hour);
  }

  return (
    <div className="border border-border rounded-md overflow-hidden overflow-x-auto">
      <table className="w-full border-collapse text-xs min-w-[500px]">
        <thead>
          <tr>
            <th className="bg-bark-700 text-white p-1.5 w-12"></th>
            {DAYS.map((d) => (
              <th key={d.key} className="bg-bark-700 text-white p-1.5 font-semibold">
                {d.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour) => (
            <tr key={hour}>
              <td className="border-t border-border bg-background text-foreground-muted font-bold text-center p-1">
                {hour}
              </td>
              {DAYS.map((d) => {
                const slot = slotFor(d.key, hour);
                return (
                  <td key={d.key} className="border-t border-l border-border p-1 h-12 align-top">
                    {slot ? (
                      <div className="bg-foliage-100 border-l-2 border-foliage-500 rounded px-1 py-0.5 text-[10px] leading-tight">
                        <p className="font-bold text-foliage-700 truncate">{slot.subjectName}</p>
                        {slot.className ? <p className="text-foreground-muted truncate">{slot.className}</p> : null}
                        {slot.teacherName ? <p className="text-foreground-muted truncate">{slot.teacherName}</p> : null}
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}