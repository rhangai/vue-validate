import Vue, { ComponentOptions } from "vue";
import { Subscription } from "rxjs";
import { ValidateManager } from "./manager/ValidateManager";
import { ValidateComponent } from "./manager/ValidateComponent";

export const VALIDATE_MANAGER_SYMBOL = Symbol("vue-validate-manager");

interface ValidateProviderVue extends Vue {
	isValid: boolean;
	[VALIDATE_MANAGER_SYMBOL]: ValidateManager;
	validateManager: ValidateManager;
	parentValidateManager: ValidateManager | null;
	parentFormComponent: ValidateComponent | null;
	subscription: Subscription;

	refreshParentValidateManager(): void;
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
			[VALIDATE_MANAGER_SYMBOL]: this.validateManager,
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
		const validateManager = new ValidateManager();
		this.validateManager = validateManager;
		this[VALIDATE_MANAGER_SYMBOL] = validateManager;
		this.subscription = validateManager.observable$().subscribe({
			next: (v: boolean) => {
				this.isValid = !!v;
			},
		});
		this.refreshParentValidateManager();
	},
	beforeDestroy() {
		this.subscription.unsubscribe();
	},
	methods: {
		refreshParentValidateManager() {
			if (this.parentFormComponent) {
				this.parentFormComponent.destroy();
				this.parentFormComponent = null;
			}
			if (!this.parentValidateManager || !this.validateManager) return;
			this.parentFormComponent = this.parentValidateManager.create(this, {
				reset: () => this.validateManager.reset(),
				validate: () => this.validateManager.validate(),
				state$: () => this.validateManager.observable$(),
			});
		},
	},
	watch: {
		isValid() {
			this.$emit("input", this.isValid);
		},
		parentValidateManager: {
			immediate: true,
			handler(manager: ValidateManager) {
				this.refreshParentValidateManager();
			},
		},
	},
	render(h) {
		return h("div", void 0, this.$slots.default);
	},
};
