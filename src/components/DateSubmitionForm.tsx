import { useState } from "react";
import { useCreateLifeHistory } from "../services/lifeHistory";
import { CurrentUser } from "../types";

export const DateSubmitionForm = ({
  currentUser,
}: {
  currentUser: CurrentUser;
}) => {
  const [note, setNote] = useState<string>("");

  const createLifeHistory = useCreateLifeHistory();

  const createNewHistory = () => {
    if (createLifeHistory.isPending) return;

    createLifeHistory.mutate({ user_id: currentUser.id, event_text: note });
    setNote("");
  };

  return (
    <>
      <form className="flex flex-col gap-8 p-8">
        <p>Tell me about this date</p>

        <textarea
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
          }}
          className="border-2 border-black"
        ></textarea>
        <button
          type="button"
          onClick={createNewHistory}
          className="px-8 py-4 text-white bg-black rounded-md disabled:bg-gray-400 hover:bg-gray-700"
        >
          Upload a note
        </button>
      </form>
      <input type="file" className="m-8" />
    </>
  );
};
