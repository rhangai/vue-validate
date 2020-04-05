import { DirectiveOptions } from "vue/types/options";
import { ValidateManager } from "../manager/ValidateManager";
import { ValidateRulesManager } from "../rules/ValidateRulesManager";
import { ValidateItem } from "../manager/ValidateItem";

class ValidateDirectiveRulesManager {
	private rulesManager: ValidateRulesManager;
	private validateItem: ValidateItem | null;

	constructor(component: Vue | undefined | null, binding: any) {
		this.rulesManager = new ValidateRulesManager(binding.value);
		this.validateItem = ValidateManager.createItem(component, {
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
		this.validateItem?.destroy();
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
