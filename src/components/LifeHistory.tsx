import { useState, useCallback, useMemo } from "react";
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
	LifeHistory as LifeHistoryDomain,
} from "../domain/LifeHistory";

import { Draggable } from "./drag-and-drop/Draggable";
import { Droppable } from "./drag-and-drop/Droppable";
import {
	useGetUserLifeHistories,
	useUpdateLifeHistory,
} from "../services/lifeHistory";

type LifeHistoryEventWithMonth = {
	event: LifeHistoryEvent;
	month: LifeHistoryMonth;
};

export const LifeHistory = ({
	birthDate,
	setOpenUploadForm,
}: {
	birthDate: string;
	setOpenUploadForm: (openUploadForm: boolean, selectedDate?: Date) => void;
}) => {
	const { data: lifeHistories = [] } = useGetUserLifeHistories();

	const lifeHistory = useMemo(
		() => LifeHistoryDomain.initiate(birthDate, lifeHistories),
		[birthDate, lifeHistories],
	);

	const [draggedEventWithMonth, setDraggedEventWithMonth] =
		useState<LifeHistoryEventWithMonth | null>(null);

	const updateLifeHistory = useUpdateLifeHistory();

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

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (!active) return;
		if (!over) return;
		if (!active.data.current) return;
		if (!over.data.current) return;

		const lifeHistoryEvent = active.data.current.event;

		const targetMonth = over.data.current.month;

		await updateLifeHistory.mutateAsync({
			...lifeHistoryEvent,
			event_date: `${targetMonth.id}-01`,
		});

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
	return (
		<Draggable id={event.id} data={{ event, month }}>
			{isLifeHistoryTextEvent(event) && <LifeHistoryTextEvent event={event} />}
			{isLifeHistoryImageEvent(event) && (
				<LifeHistoryImageEvent event={event} />
			)}
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
