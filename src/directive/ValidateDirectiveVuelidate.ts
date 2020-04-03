import { DirectiveOptions } from "vue/types/options";
import { ValidateManager } from "../manager/ValidateManager";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { ValidateRulesManager } from "../rules/ValidateRulesManager";
import { ValidateComponent } from "../manager/ValidateComponent";

class ValidateDirectiveVuelidateManager {
	private vuelidate: any;
	private rulesManager = new ValidateRulesManager();
	private validateComponent: ValidateComponent | null;

	constructor(component: Vue | undefined | null) {
		this.validateComponent = ValidateManager.create(component, {
			reset: this.reset.bind(this),
			validate: this.validate.bind(this),
			state$: (component: Vue) =>
				this.rulesManager.fromComponent$(component),
		});
	}

	destroy() {
		this.validateComponent?.destroy();
	}

	setBinding(binding: any) {
		console.log("Updating");
		if (this.vuelidate !== binding.value) {
			this.vuelidate = binding.value;
			this.rulesManager.setRules(vuelidateRules(binding.value));
		}
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
		const dirty$ = new BehaviorSubject(false);
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

function vuelidateRules(vuelidate: any) {
	if (!vuelidate) return null;
	return [
		() => {
			if (vuelidate.$invalid) return false;
			return true;
		},
	];
}
