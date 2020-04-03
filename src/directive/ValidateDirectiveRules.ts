import { DirectiveOptions } from "vue/types/options";
import { ValidateManager } from "../manager/ValidateManager";
import { BehaviorSubject } from "rxjs";

export const ValidateDirectiveRules: DirectiveOptions = {
	bind(el: any, binding, vnode) {
		const isDirty$ = new BehaviorSubject(false);
		const component = vnode.componentInstance;
		el.validateComponent = ValidateManager.create(component, {
			reset() {
				isDirty$.next(false);
			},
			validate() {
				isDirty$.next(true);
			},
			state$() {
				return isDirty$.asObservable();
			},
		});
	},
	unbind(el: any, binding, vnode) {
		if (el.validateComponent) {
			el.validateComponent.destroy();
		}
	},
};
