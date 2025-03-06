import { FC, useState } from "react";
import { useCreateLifeHistory } from "../services/lifeHistory";

interface DateSubmitionFormProps {
  onSubmition: () => void;
}

export const DateSubmitionForm: FC<DateSubmitionFormProps> = ({
  onSubmition,
}) => {
  const [note, setNote] = useState<string>("");
  const [imgFiles, setImgFiles] = useState<File[]>([]);

  const createLifeHistory = useCreateLifeHistory();

  const createNewHistory = async () => {
    if (createLifeHistory.isPending) return;

    await createLifeHistory.mutateAsync({
      event_text: note,
      //TODO: necesitas pasarle si o si el event_date para saber en que casilla ponerlo en el calendario, de momento lo pongo en la fecha actual
      event_date: new Date().toISOString(),
      // puedes pasarle un array de archivos, es el mismo que devuelven los inputs de tipo file
      imgFiles,
    });
    setNote("");
    setImgFiles([]);
    onSubmition();
  };

  return (
    <>
      <form className="flex flex-col gap-8 p-8 relative">
        <span
          className="text-2xl font-bold absolute top-0 right-2 cursor-pointer text-red-400"
          onClick={onSubmition}
        >
          x
        </span>
        <p>Tell me about this date</p>
        <textarea
          value={note}
          disabled={createLifeHistory.isPending}
          onChange={(event) => {
            setNote(event.target.value);
          }}
          className="border-2 border-black"
        ></textarea>
        <button
          type="button"
          disabled={createLifeHistory.isPending}
          onClick={createNewHistory}
          className="px-8 py-4 text-white bg-black rounded-md disabled:bg-gray-400 hover:bg-gray-700"
        >
          {createLifeHistory.isPending ? "Loading..." : "Upload a note"}
        </button>
      </form>
      <input
        type="file"
        className="m-8"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            setImgFiles(Array.from(e.target.files));
          }
        }}
      />
    </>
  );
};
