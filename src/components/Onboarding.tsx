import { useState } from "react";
import { useUpdateUserDatabirth } from "../services/user";

export const Onboarding = () => {
  const [birthdate, setBirthdate] = useState("");
  const updateUserDatabirth = useUpdateUserDatabirth();

  const onBoard = () => {
    if (updateUserDatabirth.isPending) return;

    updateUserDatabirth.mutate({ birth_date: birthdate });
    setBirthdate("");
  };

  return (
    <section className="w-screen min-h-screen flex items-center justify-center flex-col gap-8">
      <form className="bg-white items-center flex flex-col border border-primary/10 p-10 rounded-md gap-8">
        <div className="flex flex-col gap-2 items-center">
          <h1
            style={{ fontFamily: "Fredoka Variable", fontWeight: 500 }}
            className="text-primary relative z-10 text-[32px]"
          >
            <div className="bg-secondary absolute -z-10 top-7 right-20 w-32 h-3" />
            Enter your birthdate
          </h1>
          <p className="text-md">
            We need to know your birth date to start creating...
          </p>
        </div>
        <label>
          <input
            type="date"
            value={birthdate}
            onChange={(event) => {
              setBirthdate(event.target.value);
            }}
            className="shadow-[6px_6px_0_rgba(184,224,210,1)] w-[328px] h-[55px] py-[18px] px-16 border border-primary rounded-full"
          />
        </label>
        <button
          type="submit"
          disabled={!birthdate}
          onClick={onBoard}
          style={{ fontFamily: "Fredoka Variable", fontWeight: 500 }}
          className="bg-secondary text-[18px] flex items-center justify-center hover:bg-white shadow-[6px_6px_0_rgba(184,224,210,1)] cursor-pointer w-[328px] h-[55px] py-[18px] px-16 border border-primary rounded-full"
        >
          Start Creating!
        </button>
      </form>
    </section>
  );
};
