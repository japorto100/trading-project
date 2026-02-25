declare module "d3-svg-annotation" {
	export const annotationLabel: unknown;
	export interface AnnotationGenerator {
		(this: unknown, selection: unknown): void;
		type(value: unknown): AnnotationGenerator;
		annotations(value: unknown[]): AnnotationGenerator;
	}
	export function annotation(): AnnotationGenerator;
}
