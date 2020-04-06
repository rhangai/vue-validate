import { BehaviorSubject, combineLatest, Observable, fromEvent, merge, of } from "rxjs";
import { watchAsObservable } from "../util";

export type ValidateRuleResult = boolean | string;

export type ValidateRule = (value: any) => ValidateRuleResult;

export class ValidateRulesManager {
	private rules$: BehaviorSubject<ValidateRule[]>;

	constructor(rules: ValidateRule[] | null = null) {
		this.rules$ = new BehaviorSubject<ValidateRule[]>(this.normalizeRules(rules));
	}

	fromComponent$(component: Vue): Observable<boolean> {
		const value$ = watchAsObservable(component, "value", {
			immediate: true,
		});
		return combineLatest([this.rules$, value$], (rules, value) => {
			if (!rules) return true;
			const result = ValidateRulesManager.doValidateRules(value, rules);
			if (result === false || Array.isArray(result)) return false;
			return true;
		});
	}

	fromElement$(element: HTMLElement): Observable<boolean> {
		const value$ = merge(
			// @ts-ignore
			of(element.value),
			fromEvent(element, "input", (event) => event.target.value)
		);
		return combineLatest([this.rules$, value$], (rules, value) => {
			if (!rules) return true;
			const result = ValidateRulesManager.doValidateRules(value, rules);
			if (result === false || Array.isArray(result)) return false;
			return true;
		});
	}

	setRules(rules: ValidateRule[] | ValidateRule | null) {
		this.rules$.next(this.normalizeRules(rules));
	}

	normalizeRules(rules: ValidateRule[] | ValidateRule | null): ValidateRule[] {
		if (!rules) {
			return [];
		}
		// @ts-ignore
		return [].concat(rules).filter(Boolean);
	}

	static validateRules(value: any, rules: ValidateRule[] | ValidateRule | null): Array<string> | boolean {
		if (!rules) return true;
		if (!Array.isArray(rules)) rules = [rules];
		return ValidateRulesManager.doValidateRules(value, rules);
	}

	private static doValidateRules(value: any, rules: ValidateRule[]): Array<string> | boolean {
		try {
			const errors: string[] = [];
			for (let i = 0; i < rules.length; ++i) {
				const isValid = rules[i].call(null, value);
				if (isValid === false) return false;
				else if (typeof isValid === "string") return [isValid];
			}
			return true;
		} catch (err) {
			return false;
		}
	}
}
