import { DirectiveOptions } from "vue/types/options";
import { ValidateManager, VALIDATE_MANAGER_SYMBOL } from "../manager/ValidateManager";
import { ValidateRulesManager } from "../rules/ValidateRulesManager";
import { ValidateItem, ValidateItemKey } from "../manager/ValidateItem";
import { VNode } from "vue";

class ValidateDirectiveRulesManager {
	private rulesManager: ValidateRulesManager;
	private validateItem: ValidateItem | null;
	private lastValue: any = null;

	constructor(binding: any, createItem: (rulesManager: ValidateRulesManager) => ValidateItem | null) {
		this.rulesManager = new ValidateRulesManager(binding.value);
		this.lastValue = binding.value;
		this.validateItem = createItem(this.rulesManager);
	}

	setBinding(binding: any) {
		this.rulesManager.setRules(binding.value);
	}

	destroy() {
		this.validateItem?.destroy();
	}

	static findComponent(vnode: VNode | undefined): Vue | null {
		while (vnode != null) {
			const instance = vnode.componentInstance;
			if (instance) {
				return instance;
			}
			vnode = vnode.parent;
		}
		return null;
	}

	static findManager(component: Vue | null | undefined): ValidateManager | null {
		while (component != null) {
			const instanceValidateManager =
				// @ts-ignore
				component[VALIDATE_MANAGER_SYMBOL];
			if (instanceValidateManager) return instanceValidateManager;
			component = component.$parent;
		}
		return null;
	}
}

export const ValidateDirectiveRules: DirectiveOptions = {
	bind(el: any, binding, vnode) {
		let validateDirective: ValidateDirectiveRulesManager;
		if (vnode.componentInstance) {
			const component = vnode.componentInstance;
			const validateManager = ValidateDirectiveRulesManager.findManager(component);
			if (!validateManager) return;
			validateDirective = new ValidateDirectiveRulesManager(binding, (rulesManager) => {
				return validateManager.createItem(component, component, {
					resetValidation() {},
					validate() {},
					state$: () => {
						return rulesManager.fromComponent$(component);
					},
				});
			});
		} else {
			const component: Vue | null = ValidateDirectiveRulesManager.findComponent(
				// @ts-ignore
				vnode.context?._vnode
			);
			const validateManager = ValidateDirectiveRulesManager.findManager(component);
			if (!component || !validateManager) return;
			validateDirective = new ValidateDirectiveRulesManager(binding, (rulesManager) => {
				return validateManager.createItem(el, component, {
					resetValidation() {},
					validate() {},
					state$: () => {
						return rulesManager.fromElement$(el);
					},
				});
			});
		}
		el.validateDirective = validateDirective;
	},
	update(el: any, binding, vnode) {
		el.validateDirective?.setBinding(binding);
	},
	unbind(el: any, binding, vnode) {
		el.validateDirective?.destroy();
	},
};
