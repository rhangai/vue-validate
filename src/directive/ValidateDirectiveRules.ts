import { DirectiveOptions } from "vue/types/options";
import { ValidateManager } from "../manager/ValidateManager";
import { BehaviorSubject } from "rxjs";
import { ValidateRulesManager } from "../rules/ValidateRulesManager";
import { ValidateComponent } from "../manager/ValidateComponent";

class ValidateDirectiveRulesManager {
	private rulesManager: ValidateRulesManager;
	private validateComponent: ValidateComponent | null;

	constructor(component: Vue | undefined | null, binding: any) {
		this.rulesManager = new ValidateRulesManager(binding.value);
		this.validateComponent = ValidateManager.create(component, {
			reset() {},
			validate() {},
			state$: (component: Vue) => {
				return this.rulesManager.fromComponent$(component);
			},
		});
	}

	setBinding(binding: any) {
		this.rulesManager.setRules(binding.value);
	}

	destroy() {
		this.validateComponent?.destroy();
	}
}

export const ValidateDirectiveRules: DirectiveOptions = {
	bind(el: any, binding, vnode) {
		el.validateDirective = new ValidateDirectiveRulesManager(
			vnode.componentInstance,
			binding
		);
	},
	update(el: any, binding, vnode) {
		el.validateDirective?.setBinding(binding);
	},
	unbind(el: any, binding, vnode) {
		el.validateDirective?.destroy();
	},
};
