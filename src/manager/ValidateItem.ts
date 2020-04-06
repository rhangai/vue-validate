/* eslint 'no-useless-constructor': 'off' */
import Vue from "vue";
import { Observable, BehaviorSubject, Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { ValidateManager } from "./ValidateManager";

export type ValidateItemKey = Vue | HTMLElement;
export type ValidateItemOptions = {
	/// Limpa o estado do observável
	reset: () => unknown | Promise<unknown>;
	/// Valida o observável
	validate: () => unknown | Promise<unknown>;
	/// Pega o estado da validação
	state$: () => Observable<boolean>;
};

/**
 * Validates each field
 */
export class ValidateItem {
	private readonly subscription: Subscription;
	private readonly state$ = new BehaviorSubject(false);

	constructor(
		private readonly validateManager: ValidateManager,
		private readonly key: ValidateItemKey,
		private readonly component: Vue,
		private readonly options: ValidateItemOptions
	) {
		this.destroy = this.destroy.bind(this);
		this.component.$once("hook:beforeDestroy", this.destroy);
		this.subscription = this.options.state$().pipe(distinctUntilChanged()).subscribe(this.state$);
	}

	async validate(): Promise<boolean> {
		await this.options.validate();
		return this.state$.getValue();
	}

	async reset(): Promise<void> {
		await this.options.reset();
	}

	observable$() {
		return this.state$.asObservable();
	}

	destroy() {
		this.subscription.unsubscribe();
		this.validateManager.removeItem(this.key);
		this.component.$off("hook:beforeDestroy", this.destroy);
	}
}
