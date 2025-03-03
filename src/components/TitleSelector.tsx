import type { LifeUnit, TimeUnit } from "../App";
import { getTimeUnitOptions } from "../utils/getTimeUnitOptions";

export const TitleSelector = ({
	lifeUnit,
	setLifeUnit,
	timeUnit,
	setTimeUnit,
}: {
	lifeUnit: LifeUnit;
	setLifeUnit: React.Dispatch<React.SetStateAction<LifeUnit>>;
	timeUnit: TimeUnit;
	setTimeUnit: React.Dispatch<React.SetStateAction<TimeUnit>>;
}) => {
	return (
		<h2 className="font-bold flex items-center gap-2">
			Your
			<select
				className="border p-1 rounded"
				value={lifeUnit}
				onChange={(e) => setLifeUnit(e.target.value as LifeUnit)}
			>
				<option value="life">life</option>
				<option value="year">year</option>
				<option value="month">month</option>
			</select>
			in
			<select
				className="border p-1 rounded"
				value={timeUnit}
				onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
			>
				{getTimeUnitOptions(lifeUnit).map((unit: TimeUnit) => (
					<option key={unit} value={unit}>
						{unit}
					</option>
				))}
			</select>
		</h2>
	);
};
