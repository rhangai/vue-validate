import { BehaviorSubject, Subject, combineLatest, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

export type ValidateRuleResult = boolean | string;

export type ValidateRule = (
	value: any
) => ValidateRuleResult | Promise<ValidateRuleResult>;

export class ValidateRulesManager {
	private rules$: BehaviorSubject<ValidateRule[] | null>;

	constructor(rules: ValidateRule[] | null = null) {
		this.rules$ = new BehaviorSubject<ValidateRule[] | null>(rules);
	}

	fromComponent$(component: Vue): Observable<boolean> {
		const value$ = new Observable<any>((subscriber) => {
			const unwatch = component.$watch(
				// @ts-ignore
				() => component.value,
				(value) => {
					subscriber.next(value);
				},
				{ immediate: true }
			);
			return () => {
				unwatch();
			};
		});
		return combineLatest([this.rules$, value$]).pipe(
			switchMap(([rules, value]) => {
				return ValidateRulesManager.applyRules(rules, value);
			})
		);
	}

	setRules(rules: ValidateRule[]) {
		this.rules$.next(rules);
	}

	static async applyRules(
		rules: ValidateRule[] | null,
		value: any
	): Promise<boolean> {
		return false;
	}
}
