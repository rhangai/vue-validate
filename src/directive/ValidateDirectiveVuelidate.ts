import { DirectiveOptions } from "vue/types/options";
import { ValidateManager } from "../manager/ValidateManager";
import { BehaviorSubject, Observable, combineLatest, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { ValidateRulesManager } from "../rules/ValidateRulesManager";
import { ValidateComponent } from "../manager/ValidateComponent";
import { watchAsObservable } from "../util";

class ValidateDirectiveVuelidateManager {
	private vuelidate: any;
	private state$ = new BehaviorSubject(false);
	private vuelidateSubscription: Subscription | null = null;
	private validateComponent: ValidateComponent | null;

	constructor(component: Vue | undefined | null) {
		this.validateComponent = ValidateManager.create(component, {
			reset: this.reset.bind(this),
			validate: this.validate.bind(this),
			state$: () => this.state$,
		});
	}

	destroy() {
		if (this.vuelidateSubscription) {
			this.vuelidateSubscription.unsubscribe();
			this.vuelidateSubscription = null;
		}
		this.validateComponent?.destroy();
	}

	setBinding(binding: any) {
		if (this.vuelidate !== binding.value) {
			this.vuelidate = binding.value;
			this.refreshSubscription();
		}
	}

	private refreshSubscription() {
		if (this.vuelidateSubscription) {
			this.vuelidateSubscription.unsubscribe();
			this.vuelidateSubscription = null;
		}

		if (!this.vuelidate || !this.validateComponent) return;

		const component = this.validateComponent.component;
		const vuelidateObservable = watchAsObservable(
			component,
			() => !this.vuelidate.$invalid,
			{ immediate: true }
		);
		this.vuelidateSubscription = vuelidateObservable.subscribe(this.state$);
	}

	validate() {
		this.vuelidate?.$touch?.();
	}

	reset() {
		this.vuelidate?.$reset?.();
	}
}

export const ValidateDirectiveVuelidate: DirectiveOptions = {
	bind(el: any, binding, vnode) {
		const manager = new ValidateDirectiveVuelidateManager(
			vnode.componentInstance
		);
		manager.setBinding(binding);
		el.validateDirectiveManager = manager;
	},
	update(el: any, binding) {
		el.validateDirectiveManager?.setBinding(binding);
	},
	unbind(el: any, binding, vnode) {
		el.validateDirectiveManager?.destroy();
	},
};
