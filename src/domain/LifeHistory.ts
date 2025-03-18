import dayjs from "dayjs";
import { ListLifeHistories } from "../types";

export type MonthlyLifeHistory = LifeHistoryDecade[];

export type LifeHistoryDecade = {
  id: string;
  decade: number;
  years: LifeHistoryYear[];
};

export type LifeHistoryYear = {
  id: string;
  year: number;
  months: LifeHistoryMonth[];
};

export type LifeHistoryMonthNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;
export type LifeHistoryMonth = {
  id: string;
  month: LifeHistoryMonthNumber;
  events: LifeHistoryEvent[];
};

export type LifeHistoryEvent = {
  id: number;
  created_at: string;
  event_date: string;
  event_text: string;
  imagesUrls: Images[];
  updated_at: string;
  user_id: string;
};

export type Images = {
  name: string;
  url: string;
};

export const isLifeHistoryTextEvent = (
  event: LifeHistoryEvent
): event is LifeHistoryEvent => {
  return "event_text" in event && Boolean(event.event_text);
};

export const isLifeHistoryImageEvent = (
  event: LifeHistoryEvent
): event is LifeHistoryEvent => {
  return event.imagesUrls.length > 0;
};

export const LifeHistory = {
  initiate: (
    birthDate: string,
    lifeHistories: ListLifeHistories[]
  ): MonthlyLifeHistory => {
    if (!birthDate) return [];

    const lifeHistoriesByDate = lifeHistories.reduce(
      (lifeHistoriesByDate, lifeHistory) => {
        return {
          ...lifeHistoriesByDate,
          [lifeHistory.event_date]: [
            ...(lifeHistoriesByDate[lifeHistory.event_date] || []),
            lifeHistory,
          ],
        };
      },
      {} as Record<string, ListLifeHistories[]>
    );

    const birthDateDayjs = dayjs(birthDate);
    const birthYear = birthDateDayjs.year();
    const birthMonth = birthDateDayjs.month() + 1; // dayjs months are 0-indexed

    const maxAge = 100;
    const maxYear = birthYear + maxAge;

    const startDecade = Math.floor(birthYear / 10);
    const endDecade = Math.floor(maxYear / 10);
    const decadeCount = endDecade - startDecade + 1;

    return Array.from({ length: decadeCount }, (_, decadeIndex) => {
      const decade = startDecade + decadeIndex;
      const decadeStartYear = decade * 10;
      const decadeEndYear = decadeStartYear + 9;

      // Calculate year range in this decade
      const startYearInDecade = Math.max(birthYear, decadeStartYear);
      const endYearInDecade = Math.min(maxYear, decadeEndYear);

      return {
        id: `decade-${decade}`,
        decade: decadeIndex + 1,
        years: Array.from(
          { length: endYearInDecade - startYearInDecade + 1 },
          (_, yearIndex) => {
            const year = startYearInDecade + yearIndex;

            let startMonth = 1;
            let endMonth = 12;

            if (year === birthYear) startMonth = birthMonth;
            if (year === birthYear + maxAge) endMonth = birthMonth - 1 || 12;

            return {
              id: `year-${year}`,
              year,
              months: Array.from(
                { length: endMonth - startMonth + 1 },
                (_, monthIndex) => {
                  const month = (startMonth +
                    monthIndex) as LifeHistoryMonthNumber;
                  const events =
                    lifeHistoriesByDate[
                      dayjs(`${year}-${month}-01`).format("YYYY-MM-DD")
                    ] ?? [];
                  return {
                    id: dayjs(`${year}-${month}-01`).format("YYYY-MM"),
                    month,
                    events: events as LifeHistoryEvent[],
                  } as const as LifeHistoryMonth;
                }
              ),
            } as const satisfies LifeHistoryYear;
          }
        ),
      } as const satisfies LifeHistoryDecade;
    });
  },
  moveEvent: ({
    event,
    lifeHistory,
    sourceMonth,
    targetMonth,
  }: {
    event: Pick<LifeHistoryEvent, "id">;
    lifeHistory: MonthlyLifeHistory;
    sourceMonth: LifeHistoryMonth;
    targetMonth: LifeHistoryMonth;
  }) => {
    const { id: eventId } = event;
    const { id: idMonthSource } = sourceMonth;
    const { id: idMonthTarget } = targetMonth;

    const findEntities = (id: string) => {
      for (const decade of lifeHistory) {
        for (const year of decade.years) {
          for (const month of year.months) {
            if (month.id === id) {
              return { decade, year, month };
            }
          }
        }
      }
      return null;
    };

    const sourceEntities = findEntities(idMonthSource);
    const targetEntities = findEntities(idMonthTarget);

    if (!sourceEntities || !targetEntities) {
      console.error("Source or target entities not found");
      return lifeHistory;
    }

    const eventToMove = sourceEntities.month.events.find(
      (e) => e.id === eventId
    );
    if (!eventToMove) {
      console.error("Event not found in source month");
      return lifeHistory;
    }

    // Create a copy of the event with updated date that matches target month
    const targetDate = dayjs(`${targetEntities.month.id}-15`);
    const updatedEvent: LifeHistoryEvent = {
      ...eventToMove,
      event_date: targetDate.format("YYYY-MM-DD"),
      updated_at: dayjs().format(),
    };

    // First, remove event from source
    const updatedLifeHistory = lifeHistory.map((decade) => {
      if (decade.id !== sourceEntities.decade.id) return decade;

      return {
        ...decade,
        years: decade.years.map((year) => {
          if (year.id !== sourceEntities.year.id) return year;
          return {
            ...year,
            months: year.months.map((month) => {
              if (month.id !== idMonthSource) return month;
              return {
                ...month,
                events: month.events.filter((event) => event.id !== eventId),
              };
            }),
          };
        }),
      };
    });
    // Then, add updated event to target
    return updatedLifeHistory.map((decade) => {
      if (decade.id !== targetEntities.decade.id) return decade;
      return {
        ...decade,
        years: decade.years.map((year) => {
          if (year.id !== targetEntities.year.id) return year;
          return {
            ...year,
            months: year.months.map((month) => {
              if (month.id !== idMonthTarget) return month;
              return {
                ...month,
                events: [...month.events, updatedEvent],
              };
            }),
          };
        }),
      };
    });
  },
};
