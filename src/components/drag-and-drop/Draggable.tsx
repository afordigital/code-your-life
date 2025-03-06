import { type ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";

interface DraggableProps {
  id: string;
  data: Record<string, unknown>;
  children: ReactNode;
}

export function Draggable({ id, data, children }: DraggableProps) {
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
