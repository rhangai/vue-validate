import { VueConstructor } from "vue";
import { ValidateProvider } from "./components";
import { ValidateDirectiveRules } from "./directive";

export const VueValidate = {
	install(vue: VueConstructor) {
		vue.component("validate-provider", ValidateProvider);
		vue.directive("rules", ValidateDirectiveRules);
	},
};
