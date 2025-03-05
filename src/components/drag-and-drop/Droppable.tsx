import { useDroppable } from "@dnd-kit/core";

export const Droppable = <DroppableData extends object>({
  id,
  data,
  children,
}: {
  id: number | string;
  data: DroppableData;
  children: React.ReactNode;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
  });
  const style = {
    filter: isOver ? "greyscale(0.5)" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      {children}
    </div>
  );
};
