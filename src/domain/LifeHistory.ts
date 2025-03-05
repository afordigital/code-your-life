export type MonthlyLifeHistory = LifeHistoryDecade[];

export type LifeHistoryDecade = {
  id: string;
  decade: number;
  years: LifeHistoryYear[];
  setOpenUploadForm: (openUplaodForm: boolean) => void;
};

export type LifeHistoryYear = {
  id: string;
  year: number;
  months: LifeHistoryMonth[];
  setOpenUploadForm: (openUplaodForm: boolean) => void;
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
  setOpenUploadForm: (openUplaodForm: boolean) => void;
};

export type LifeHistoryTextEvent = {
  id: string;
  event_date: string;
  event_text: string;
  updated_at: string;
  user_id: string;
};

export type LifeHistoryImageEvent = {
  id: string;
  event_date: string;
  event_image: string;
  updated_at: string;
  user_id: string;
};

export const isLifeHistoryTextEvent = (
  event: LifeHistoryEvent
): event is LifeHistoryTextEvent => {
  return "event_text" in event && Boolean(event.event_text);
};

export const isLifeHistoryImageEvent = (
  event: LifeHistoryEvent
): event is LifeHistoryImageEvent => {
  return "event_image" in event && Boolean(event.event_image);
};

export type LifeHistoryEvent = LifeHistoryTextEvent | LifeHistoryImageEvent;

export const LifeHistory = {
  initiate: () =>
    Array.from({ length: 10 }, (_, decadeIndex) => {
      return {
        id: String(decadeIndex),
        decade: decadeIndex + 1,
        years: Array.from({ length: 10 }, (_, yearIndex) => {
          const year = decadeIndex * 10 + yearIndex;
          return {
            id: String(year),
            year: year + 1,
            months: Array.from({ length: 12 }, (_, monthIndex) => {
              const month = (monthIndex + 1) as LifeHistoryMonthNumber;
              return {
                id: String(year * 12 + monthIndex),
                month,
                events: [
                  {
                    id: String(year * 12 + monthIndex),
                    event_date: "string",
                    event_image: "string",
                    event_text: String(year * 12 + monthIndex),
                    updated_at: "string",
                    user_id: "string",
                  },
                ] as const satisfies LifeHistoryEvent[],
              } as const satisfies LifeHistoryMonth;
            }),
          } as const satisfies LifeHistoryYear;
        }),
      } as const satisfies LifeHistoryDecade;
    }),
  moveEvent: ({
    event,
    lifeHistory,
    sourceMonth,
    targetMonth,
  }: {
    event: LifeHistoryEvent;
    lifeHistory: MonthlyLifeHistory;
    sourceMonth: LifeHistoryMonth;
    targetMonth: LifeHistoryMonth;
  }) => {
    const { id: eventId } = event;
    const { id: idMonthSource } = sourceMonth;
    const { id: idMonthTarget } = targetMonth;

    const sourceDecade = Math.floor(Number(idMonthSource) / 12 / 10) + 1;
    const sourceYear = Math.floor(Number(idMonthSource) / 12) + 1;

    const targetDecade = Math.floor(Number(idMonthTarget) / 12 / 10) + 1;
    const targetYear = Math.floor(Number(idMonthTarget) / 12) + 1;

    return lifeHistory
      .map((lifeHistoryDecade) => {
        if (lifeHistoryDecade.decade !== sourceDecade) return lifeHistoryDecade;
        return {
          ...lifeHistoryDecade,
          years: lifeHistoryDecade.years.map((lifeHistoryYear) => {
            if (lifeHistoryYear.year !== sourceYear) return lifeHistoryYear;
            return {
              ...lifeHistoryYear,
              months: lifeHistoryYear.months.map((lifeHistoryMonth) => {
                if (lifeHistoryMonth.id !== idMonthSource)
                  return lifeHistoryMonth;
                return {
                  ...lifeHistoryMonth,
                  events: lifeHistoryMonth.events.filter(
                    (event) => event.id !== eventId
                  ),
                };
              }),
            };
          }),
        };
      })
      .map((lifeHistoryDecade) => {
        if (lifeHistoryDecade.decade !== targetDecade) return lifeHistoryDecade;
        return {
          ...lifeHistoryDecade,
          years: lifeHistoryDecade.years.map((year) => {
            if (year.year !== targetYear) return year;
            return {
              ...year,
              months: year.months.map((month) => {
                if (month.id !== idMonthTarget) return month;
                return {
                  ...month,
                  events: [...month.events, event],
                };
              }),
            };
          }),
        };
      });
  },
};
