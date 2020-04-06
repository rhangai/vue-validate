import { BehaviorSubject, Observable, Subscription, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { ValidateItem, ValidateItemOptions } from "./ValidateItem";
export const VALIDATE_MANAGER_SYMBOL = Symbol("vue-validate-manager");

/**
 * Manage the validation state of a group of components
 */
export class ValidateManager {
	private readonly state$ = new BehaviorSubject(true);
	private readonly map = new Map<Vue, ValidateItem>();
	private subscription: Subscription | null = null;

	/**
	 * Get the state as an observable.
	 */
	observable$() {
		return this.state$.asObservable();
	}

	/**
	 * Validate every item from the manager
	 */
	async validate(): Promise<boolean> {
		const validators: Promise<boolean>[] = [];
		this.map.forEach((v) =>
			validators.push(v.validate().catch(() => false))
		);
		const isValid = await Promise.all(validators);
		return !isValid.includes(false);
	}

	/**
	 * Reset every item form the manager
	 */
	async reset(): Promise<void> {
		const promises: Promise<void | null>[] = [];
		this.map.forEach((v) => promises.push(v.reset().catch(() => null)));
		await Promise.all(promises);
	}

	/**
	 * Destroy the validate manager.
	 */
	destroy() {
		const items: ValidateItem[] = [];
		this.map.forEach((v) => items.push(v));
		this.map.clear();

		this.subscription?.unsubscribe();
		items.forEach((v) => v.destroy());
	}

	/**
	 * Create a new ValidateItem
	 * @param component
	 * @param options
	 */
	createItem(component: Vue, options: ValidateItemOptions): ValidateItem {
		const componentValidate = new ValidateItem(this, component, options);
		this.map.set(component, componentValidate);
		this.refreshSubscription();
		return componentValidate;
	}

	/**
	 * Removes the component from validation
	 * @param component
	 */
	remove(component: Vue) {
		if (this.map.delete(component)) this.refreshSubscription();
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
		this.subscription = combineLatest(
			...validators,
			(values) => !values.includes(false)
		).subscribe(this.state$);
	}

	/**
	 * Create a new item on the component
	 */
	static createItem(
		component: Vue | null | undefined,
		options: ValidateItemOptions
	): ValidateItem | null {
		const validateManager = this.findManager(component);
		if (!validateManager) return null;
		return validateManager.createItem(component!, options);
	}

	/// Find the manager on the component
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
