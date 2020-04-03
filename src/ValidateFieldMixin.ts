import Vue, { ComponentOptions } from "vue";
import { Observable } from "rxjs";
import { ValidateManager } from "./manager/ValidateManager";
import { ValidateComponent } from "./manager/ValidateComponent";
import { VALIDATE_MANAGER_SYMBOL } from "./ValidateProvider";

export interface IValidateField extends Vue {
	readonly isValid: boolean;
}

interface ValidateFieldMixinComponent extends Vue, IValidateField {
	$formComponent: ValidateComponent | null;
	ValidateManager: ValidateManager;
	isDirty: boolean;
}

export const ValidateFieldMixin: ComponentOptions<Vue> &
	ThisType<ValidateFieldMixinComponent> = {
	inject: {
		ValidateManager: {
			from: VALIDATE_MANAGER_SYMBOL,
			default: () => null,
		},
	},
	data() {
		return {
			isDirty: false,
		};
	},
	watch: {
		ValidateManager: {
			immediate: true,
			handler() {
				if (this.$formComponent) {
					this.$formComponent.destroy();
					this.$formComponent = null;
				}
				this.$formComponent = this.ValidateManager.create(this, {
					reset: () => {
						this.isDirty = false;
					},
					validate: () => {
						this.isDirty = true;
					},
					state$: () => {
						return new Observable<boolean>((subscriber) => {
							const unwatch = this.$watch(
								() => {
									if (!this.isDirty) return true;
									return this.isValid;
								},
								(isValid) => {
									subscriber.next(!!isValid);
								},
								{
									immediate: true,
								}
							);
							return () => {
								unwatch();
							};
						});
					},
				});
			},
		},
	},
};
