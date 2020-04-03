/* eslint 'no-useless-constructor': 'off' */
import Vue from "vue";
import { Observable, BehaviorSubject, Subscription } from "rxjs";
import { FormManager } from "./FormManager";

export type FormComponentValidateOptions = {
	/// Limpa o estado do observável
	reset: (component: Vue) => unknown | Promise<unknown>;
	/// Valida o observável
	validate: (component: Vue) => unknown | Promise<unknown>;
	/// Pega o estado da validação
	state$: (component: Vue) => Observable<boolean>;
};

export class FormComponentValidate {
	private readonly subscription: Subscription;
	private readonly state$ = new BehaviorSubject(false);

	constructor(
		private readonly formManager: FormManager,
		private readonly component: Vue,
		private readonly options: FormComponentValidateOptions
	) {
		this.destroy = this.destroy.bind(this);
		this.component.$once("hook:beforeDestroy", this.destroy);
		this.subscription = this.options
			.state$(this.component)
			.subscribe(this.state$);
	}

	async validate(): Promise<boolean> {
		await this.options.validate(this.component);
		return this.state$.getValue();
	}

	async reset(): Promise<void> {
		await this.options.reset(this.component);
	}

	observable$() {
		return this.state$.asObservable();
	}

	destroy() {
		this.subscription.unsubscribe();
		this.formManager.remove(this.component);
		this.component.$off("hook:beforeDestroy", this.destroy);
	}
}
