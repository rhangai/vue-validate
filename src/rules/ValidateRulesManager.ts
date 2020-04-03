import { BehaviorSubject, Subject, combineLatest, Observable } from "rxjs";
import { switchMap, map } from "rxjs/operators";

export type ValidateRuleResult = boolean | string;

export type ValidateRule = (value: any) => ValidateRuleResult;

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
			map(([rules, value]) => {
				if (!rules) return true;
				return ValidateRulesManager.applyRules(rules, value);
			})
		);
	}

	setRules(rules: ValidateRule[] | ValidateRule | null) {
		if (!rules) {
			this.rules$.next(null);
			return;
		}
		// @ts-ignore
		this.rules$.next([].concat(rules).filter(Boolean));
	}

	static applyRules(rules: ValidateRule[], value: any): boolean {
		try {
			for (let i = 0; i < rules.length; ++i) {
				const isValid = rules[i].call(null, value);
				if (isValid === false) return false;
			}
			return true;
		} catch (err) {
			return false;
		}
	}
}
