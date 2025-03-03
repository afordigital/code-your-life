import type { TimeUnit } from "../App";

export const getTimeUnitOptions = (lifeUnit: string): TimeUnit[] => {
	if (lifeUnit === "life") {
		return ["years", "months", "weeks"];
	}
	if (lifeUnit === "year") {
		return ["months", "weeks"];
	}
	if (lifeUnit === "month") {
		return ["weeks"];
	}
	return [];
};
