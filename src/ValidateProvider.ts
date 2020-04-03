import Vue, { ComponentOptions } from "vue";
import { Subscription } from "rxjs";
import { ValidateManager } from "./manager/ValidateManager";
import { ValidateComponent } from "./manager/ValidateComponent";

export const VALIDATE_MANAGER_SYMBOL = Symbol("vue-validate-manager");

interface ValidateProviderVue extends Vue {
	isValid: boolean;
	[VALIDATE_MANAGER_SYMBOL]: ValidateManager;
	ValidateManager: ValidateManager;
	parentFormComponent: ValidateComponent | null;
	subscription: Subscription;
}

export const ValidateProvider: ComponentOptions<ValidateProviderVue> &
	ThisType<ValidateProviderVue> = {
	props: {
		value: {
			type: Boolean,
			default: false,
		},
	},
	provide() {
		return {
			[VALIDATE_MANAGER_SYMBOL]: this.ValidateManager,
		};
	},
	inject: {
		parentValidateManager: {
			from: VALIDATE_MANAGER_SYMBOL,
			default: () => null,
		},
	},
	data() {
		return {
			isValid: false,
		};
	},
	created() {
		this.ValidateManager = this[
			VALIDATE_MANAGER_SYMBOL
		] = new ValidateManager();
		this.subscription = this.ValidateManager.observable$().subscribe({
			next: (v: boolean) => {
				this.isValid = !!v;
			},
		});
	},
	beforeDestroy() {
		this.subscription.unsubscribe();
	},
	watch: {
		isValid() {
			this.$emit("input", this.isValid);
		},
		parentValidateManager: {
			immediate: true,
			handler(manager: ValidateManager) {
				if (this.parentFormComponent) {
					this.parentFormComponent.destroy();
					this.parentFormComponent = null;
				}
				if (!manager) return;
				this.parentFormComponent = manager.create(this, {
					reset: () => this.ValidateManager.reset(),
					validate: () => this.ValidateManager.validate(),
					state$: () => this.ValidateManager.observable$(),
				});
			},
		},
	},
	render(h) {
		return h("div", void 0, this.$slots.default);
	},
};
