import { useEffect, useState } from "react";
import { Sun } from "../assets/icons/sun";
import { Moon } from "../assets/icons/moon";

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    if (savedMode) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", newMode.toString());
  };

  return (
    <button className="" onClick={toggleDarkMode}>
      {darkMode ? <Sun /> : <Moon />}
    </button>
  );
};

export default DarkModeToggle;
