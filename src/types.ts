import { Database } from "./database.types";

export type InsertLifeHistory = Database["public"]["Tables"]["life_history"]["Insert"]

export type CurrentUser = Database["public"]["Tables"]["users"]["Row"]
