import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon as ArrowRightIcon,
} from "@hugeicons/core-free-icons";

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface DatePickerCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

/**
 * DatePickerCalendar — Componente de calendário mensal para seleção de data.
 */
export function DatePickerCalendar({ selectedDate, onSelectDate }: DatePickerCalendarProps) {
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(selectedDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(selectedDate.getFullYear());

  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else setCalendarMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else setCalendarMonth((m) => m + 1);
  };

  const isSelectedDay = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === calendarMonth &&
      selectedDate.getFullYear() === calendarYear
    );
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === calendarMonth &&
      today.getFullYear() === calendarYear
    );
  };

  return (
    <div className="w-full">
      {/* Calendar header */}
      <div className="my-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground capitalize">
          {MONTHS[calendarMonth]} de {calendarYear}
        </span>
        <div className="flex items-center gap-1">
          <HugeiconsIcon
            icon={Calendar01Icon}
            size={16}
            strokeWidth={1.5}
            className="mr-1 text-muted-foreground"
          />
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted"
          >
            <HugeiconsIcon icon={ArrowRightIcon} size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."].map((d) => (
          <span key={d} className="text-[10px] text-muted-foreground">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {calendarCells.map((day, i) => (
          <div key={i}>
            {day ? (
              <button
                type="button"
                onClick={() => onSelectDate(new Date(calendarYear, calendarMonth, day))}
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                  isSelectedDay(day)
                    ? "bg-primary font-bold text-primary-foreground"
                    : isToday(day)
                      ? "font-semibold text-primary"
                      : "text-foreground hover:bg-muted"
                }`}
              >
                {day}
              </button>
            ) : (
              <div className="h-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
