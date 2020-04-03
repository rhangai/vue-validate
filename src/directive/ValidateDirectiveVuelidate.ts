import { DirectiveOptions } from "vue/types/options";
import { ValidateManager } from "../manager/ValidateManager";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { ValidateRulesManager } from "../rules/ValidateRulesManager";

export const ValidateDirectiveVuelidate: DirectiveOptions = {
	bind(el: any, binding, vnode) {
		const dirty$ = new BehaviorSubject(false);
		const component = vnode.componentInstance;

		const rulesManager = new ValidateRulesManager(
			vuelidateRules(binding.value)
		);
		el.validateRulesManager = rulesManager;
		el.validateComponent = ValidateManager.create(component, {
			reset() {
				dirty$.next(false);
			},
			validate() {
				dirty$.next(true);
			},
			state$(component: Vue) {
				return combineLatest([
					rulesManager.fromComponent$(component),
					dirty$,
				]).pipe(
					map(([isValid, isDirty]) => {
						// if (!isDirty) return true;
						return !isValid;
					})
				);
			},
		});
	},
	update(el: any, binding) {
		el.validateRulesManager.setRules(vuelidateRules(binding.value));
	},
	unbind(el: any, binding, vnode) {
		if (el.validateComponent) {
			el.validateComponent.destroy();
		}
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
