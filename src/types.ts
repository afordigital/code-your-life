import { Database } from "./database.types";

export type ListLifeHistories =
  Database["public"]["Tables"]["life_history"]["Row"] & {
    imagesUrls: Array<{ name: string; url: string }>;
  };

export type InsertLifeHistory = Omit<
  Database["public"]["Tables"]["life_history"]["Insert"],
  "user_id"
> & { imgFiles?: File[] };

export type UpdateLifeHistory = Omit<
  Database["public"]["Tables"]["life_history"]["Update"],
  "id" | "user_id"
> & { id: number; imgFiles?: File[] };

export type CurrentUser = Database["public"]["Tables"]["users"]["Row"];
