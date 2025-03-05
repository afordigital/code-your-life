import { useDraggable } from "@dnd-kit/core";

export const Draggable = <DraggableData extends object>({
  id,
  data,
  children,
}: {
  id: string | number;
  data: DraggableData;
  children: React.ReactNode;
}) => {
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
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  );
};
