import { BehaviorSubject, Observable, Subscription, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import {
	ValidateComponent,
	ValidateComponentOptions,
} from "./ValidateComponent";
import { VALIDATE_MANAGER_SYMBOL } from "../ValidateProvider";

/**
 * Manage the validation state of a group of components
 */
export class ValidateManager {
	private readonly state$ = new BehaviorSubject(true);
	private readonly map = new Map<Vue, ValidateComponent>();
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

	/**
	 * Create a new ValidateComponent
	 * @param component
	 * @param options
	 */
	create(
		component: Vue,
		options: ValidateComponentOptions
	): ValidateComponent {
		const componentValidate = new ValidateComponent(
			this,
			component,
			options
		);
		this.map.set(component, componentValidate);
		this.refreshSubscription();
		return componentValidate;
	}

	/**
	 * Removes the component from validation
	 * @param component
	 */
	remove(component: Vue) {
		this.map.delete(component);
		this.refreshSubscription();
	}

	// Refresh the subscription every time this form changes
	private refreshSubscription() {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}

		const validators: Observable<boolean>[] = [];
		this.map.forEach((v) => validators.push(v.observable$()));
		if (validators.length <= 0) {
			this.state$.next(true);
			return;
		}

		// Faz a inscrição
		this.subscription = combineLatest(...validators)
			.pipe(
				// Mapeia
				map((values) => !values.includes(false))
			)
			.subscribe(this.state$);
	}

	/**
	 *
	 */
	static create(
		component: Vue | null | undefined,
		options: ValidateComponentOptions
	): ValidateComponent | null {
		const validateManager = this.findManager(component);
		if (!validateManager) return null;
		return validateManager.create(component!, options);
	}

	static findManager(
		component: Vue | null | undefined
	): ValidateManager | null {
		let currentComponent = component;
		while (currentComponent != null) {
			// @ts-ignore
			const validateManager = currentComponent[VALIDATE_MANAGER_SYMBOL];
			if (validateManager) return validateManager;
			currentComponent = currentComponent.$parent;
		}
		return null;
	}
}
