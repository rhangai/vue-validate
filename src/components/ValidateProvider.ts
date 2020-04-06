import Vue, { ComponentOptions } from "vue";
import { Subscription } from "rxjs";
import { ValidateManager, VALIDATE_MANAGER_SYMBOL } from "../manager/ValidateManager";
import { ValidateItem } from "../manager/ValidateItem";

export interface ValidateProvider extends Vue {
	validate(): Promise<boolean>;
	reset(): Promise<void>;
}

export interface ValidateProviderVue extends Vue, ValidateProvider {
	isValid: boolean;
	validateManager: ValidateManager;
	[VALIDATE_MANAGER_SYMBOL]: ValidateManager;
	parentValidateManager: ValidateManager | null;
	parentValidateItem: ValidateItem | null;
	subscription: Subscription;
	parentValidateManagerRefresh(): void;
}

export const ValidateProvider: ComponentOptions<ValidateProviderVue> & ThisType<ValidateProviderVue> = {
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
			validateManager: new ValidateManager(),
			isValid: true,
		};
	},
	created() {
		this[VALIDATE_MANAGER_SYMBOL] = this.validateManager;
		this.subscription = this.validateManager.observable$().subscribe({
			next: (v: boolean) => {
				this.isValid = !!v;
			},
		});
	},
	beforeDestroy() {
		this.validateManager.destroy();
		this.subscription.unsubscribe();
	},
	methods: {
		validate() {
			return this.validateManager.validate();
		},
		reset() {
			return this.validateManager.reset();
		},
		parentValidateManagerRefresh() {
			if (this.parentValidateItem) {
				this.parentValidateItem.destroy();
				this.parentValidateItem = null;
			}
			if (!this.parentValidateManager || !this.validateManager) return;
			this.parentValidateItem = this.parentValidateManager.createItem(this, this, {
				reset: () => this.validateManager.reset(),
				validate: () => this.validateManager.validate(),
				state$: () => this.validateManager.observable$(),
			});
		},
	},
	watch: {
		isValid: {
			immediate: true,
			handler() {
				this.$emit("input", this.isValid);
			},
		},
		parentValidateManager: {
			immediate: true,
			handler() {
				this.parentValidateManagerRefresh();
			},
		},
	},
	render(h) {
		return h("div", void 0, this.$slots.default);
	},
};
