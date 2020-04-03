import { BehaviorSubject, Observable, Subscription, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import {
	FormComponentValidate,
	FormComponentValidateOptions,
} from "./FormComponentValidate";

export class FormManager {
	private readonly state$ = new BehaviorSubject(false);
	private readonly map = new Map<Vue, FormComponentValidate>();
	private subscription: Subscription | null = null;

	observable$() {
		return this.state$.asObservable();
	}

	async validate(): Promise<boolean> {
		const validators: Promise<boolean>[] = [];
		this.map.forEach((v) =>
			validators.push(v.validate().catch(() => false))
		);
		const isValid = await Promise.all(validators);
		return !isValid.includes(false);
	}

	async reset(): Promise<void> {
		const promises: Promise<void | null>[] = [];
		this.map.forEach((v) => promises.push(v.reset().catch(() => null)));
		await Promise.all(promises);
	}

	create(component: Vue, options: FormComponentValidateOptions) {
		const componentValidate = new FormComponentValidate(
			this,
			component,
			options
		);
		this.map.set(component, componentValidate);
		this.refreshSubscription();
		return componentValidate;
	}

	/**
	 * Remove o componente da validação
	 * @param component
	 */
	remove(component: Vue) {
		this.map.delete(component);
		this.refreshSubscription();
	}

	private refreshSubscription() {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}

		const validators: Observable<boolean>[] = [];
		this.map.forEach((v) => validators.push(v.observable$()));

		// Faz a inscrição
		this.subscription = combineLatest(...validators)
			.pipe(
				// Mapeia
				map((values) => !values.includes(false))
			)
			.subscribe(this.state$);
	}
}
