declare module "d3-svg-legend" {
	export interface LegendColorGenerator {
		(this: unknown, selection: unknown): void;
		scale(value: unknown): LegendColorGenerator;
		shapeWidth(value: number): LegendColorGenerator;
		shapeHeight(value: number): LegendColorGenerator;
		shapePadding(value: number): LegendColorGenerator;
		labelOffset(value: number): LegendColorGenerator;
		orient(value: string): LegendColorGenerator;
		labels(value: string[]): LegendColorGenerator;
	}
	export function legendColor<T = string>(): LegendColorGenerator;
}
