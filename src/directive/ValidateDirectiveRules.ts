import { DirectiveOptions } from "vue/types/options";

export const ValidateDirectiveRules: DirectiveOptions = {
	bind(el, binding, vnode) {
		console.log("BIND", vnode);
		console.log(vnode.context);
		console.log(vnode.componentInstance);
	},
	update(el, binding, vnode) {
		console.log("UPDATED", vnode);
		console.log(vnode.context);
		console.log(vnode.componentInstance);
	},
	unbind(el, binding, vnode) {
		console.log("UBIND", vnode);
		console.log(vnode.context);
		console.log(vnode.componentInstance);
	},
};
