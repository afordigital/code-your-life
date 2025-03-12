import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";

export function Draggable({
	id,
	data,
	children,
}: {
	id: string | number;
	data: Record<string, unknown>;
	children: ReactNode;
}) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id,
		data,
	});
	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			}
		: {};

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			{children}
		</div>
	);
}
