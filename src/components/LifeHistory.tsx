import { useState, useCallback } from "react";
import dayjs from "dayjs";
import {
	DndContext,
	DragOverlay,
	closestCorners,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragStartEvent,
	type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import {
	isLifeHistoryImageEvent,
	isLifeHistoryTextEvent,
	type LifeHistoryImageEvent,
	type LifeHistoryTextEvent,
	type LifeHistoryDecade,
	type LifeHistoryEvent,
	type LifeHistoryMonth,
	type LifeHistoryMonthNumber,
	type LifeHistoryYear,
	type MonthlyLifeHistory,
	LifeHistory as LifeHistoryDomain,
} from "../domain/LifeHistory";

import { Draggable } from "./drag-and-drop/Draggable";
import { Droppable } from "./drag-and-drop/Droppable";
import { useGetUserLifeHistories } from "../services/lifeHistory";

type LifeHistoryEventWithMonth = {
	event: LifeHistoryEvent;
	month: LifeHistoryMonth;
};

export const LifeHistory = ({
	birthDate,
	setOpenUploadForm,
}: {
	birthDate: string | null;
	setOpenUploadForm: (openUploadForm: boolean, selectedDate?: Date) => void;
}) => {
	const [lifeHistory, setLifeHistory] = useState<MonthlyLifeHistory>(() =>
		LifeHistoryDomain.initiate(birthDate),
	);
	const [draggedEventWithMonth, setDraggedEventWithMonth] =
		useState<LifeHistoryEventWithMonth | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;

		if (!active.data.current) return;

		setDraggedEventWithMonth({
			event: active.data.current.event,
			month: active.data.current.month,
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!active) return;
		if (!over) return;
		if (!active.data.current) return;
		if (!over.data.current) return;

		const lifeHistoryEvent = active.data.current.event;

		const sourceMonth = active.data.current.month;

		const targetMonth = over.data.current.month;

		setLifeHistory((lifeHistory) =>
			LifeHistoryDomain.moveEvent({
				event: lifeHistoryEvent,
				lifeHistory,
				sourceMonth,
				targetMonth,
			}),
		);

		console.log(lifeHistory);
		console.log(sourceMonth);
		console.log(targetMonth);

		// update sourcemonth con events
		// update targetmonth con events

		setDraggedEventWithMonth(null);
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex flex-col w-full gap-2">
				{lifeHistory.map(({ id, decade, years }) => (
					<LifeHistoryDecade
						key={id}
						{...{ id, decade, years, setOpenUploadForm }}
					/>
				))}
			</div>

			<DragOverlay>
				{draggedEventWithMonth ? (
					<LifeHistoryEvent {...draggedEventWithMonth} />
				) : null}
			</DragOverlay>
		</DndContext>
	);
};

// biome-ignore lint/suspicious/noRedeclare: <explanation>
const LifeHistoryDecade = ({
	decade,
	years,
	setOpenUploadForm,
}: LifeHistoryDecade & {
	setOpenUploadForm: (openUploadForm: boolean, selectedDate?: Date) => void;
}) => {
	return (
		<div className="flex flex-col w-full gap-2">
			<>Decade {decade}</>

			<div className="flex flex-col gap-2">
				{years.map(({ id, year, months }) => (
					<LifeHistoryYear
						key={id}
						{...{ id, year, months, setOpenUploadForm }}
					/>
				))}
			</div>
		</div>
	);
};

// biome-ignore lint/suspicious/noRedeclare: <explanation>
const LifeHistoryYear = ({
	year,
	months,
	setOpenUploadForm,
}: LifeHistoryYear & {
	setOpenUploadForm: (openUploadForm: boolean, selectedDate?: Date) => void;
}) => {
	return (
		<div className="w-full p-2 rounded-lg bg-slate-200">
			<div className="flex w-full gap-2">
				<div className="grid items-center p-2 rounded-lg bg-slate-300">
					<span className="text-sm text-center">Year {year}</span>
				</div>

				<div className="w-full grid auto-rows-[190px] grid-cols-[repeat(auto-fit,_minmax(190px,_1fr))] gap-2">
					{months.map(({ id, month, events }) => (
						<LifeHistoryMonth
							key={id}
							setOpenUploadForm={setOpenUploadForm}
							{...{ id, month, events }}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

const MONTH_NUMBER_TO_NAME = {
	1: "January",
	2: "February",
	3: "March",
	4: "April",
	5: "May",
	6: "June",
	7: "July",
	8: "August",
	9: "September",
	10: "October",
	11: "November",
	12: "December",
} as const satisfies Record<LifeHistoryMonthNumber, string>;

// biome-ignore lint/suspicious/noRedeclare: <explanation>
const LifeHistoryMonth = ({
	id,
	month,
	events,
	setOpenUploadForm,
}: LifeHistoryMonth & {
	setOpenUploadForm: (openUploadForm: boolean, selectedDate?: Date) => void;
}) => {
	const handleClick = useCallback(() => {
		const date = dayjs(id).toDate();
		console.log(id);

		setOpenUploadForm(true, date);
	}, [id, setOpenUploadForm]);

	return (
		<button
			type="button"
			onClick={handleClick}
			className="p-4 rounded-lg cursor-pointer bg-slate-300 hover:bg-slate-400"
		>
			<div className="flex flex-col w-full gap-2">
				{MONTH_NUMBER_TO_NAME[month]}

				<Droppable id={id} data={{ month: { id, month, events } }}>
					<div className="w-full grid grid-cols-[repeat(auto-fill,_minmax(25%,_1fr))] gap-2">
						{events.map((event) => (
							<LifeHistoryEvent
								key={event.id}
								month={{ id, month, events }}
								event={event}
							/>
						))}
					</div>
				</Droppable>
			</div>
		</button>
	);
};

// biome-ignore lint/suspicious/noRedeclare: <explanation>
const LifeHistoryEvent = ({
	event,
	month,
}: {
	event: LifeHistoryEvent;
	month: LifeHistoryMonth;
}) => {
	const getUserLifeHistories = useGetUserLifeHistories();
	const life_histories = getUserLifeHistories?.data;

	return (
		<Draggable id={event.id} data={{ event, month }}>
			{isLifeHistoryTextEvent(event) && <LifeHistoryTextEvent event={event} />}
			{isLifeHistoryImageEvent(event) && (
				<LifeHistoryImageEvent event={event} />
			)}
			{life_histories?.map((history) => {
				return (
					<div key={history.id}>
						{dayjs(history.event_date).format("YYYY-MM") === month.id && (
							<>
								<p>{history.event_text}</p>
								{history.imagesUrls.length > 0 && (
									<img
										src={history.imagesUrls[0].url}
										alt={history.imagesUrls[0].name}
									/>
								)}
							</>
						)}
					</div>
				);
			})}
		</Draggable>
	);
};

// biome-ignore lint/suspicious/noRedeclare: <explanation>
const LifeHistoryTextEvent = ({ event }: { event: LifeHistoryTextEvent }) => {
	return (
		<div className="grid items-center p-4 bg-white rounded-md">
			<span className="text-sm ellipsis">{event.event_text}</span>
		</div>
	);
};

// biome-ignore lint/suspicious/noRedeclare: <explanation>
const LifeHistoryImageEvent = ({ event }: { event: LifeHistoryImageEvent }) => {
	return <img src={event.event_image} alt="" />;
};
