import Vue, { ComponentOptions } from "vue";
import { Observable } from "rxjs";
import {
	ValidateManager,
	VALIDATE_MANAGER_SYMBOL,
} from "./manager/ValidateManager";
import { ValidateComponent } from "./manager/ValidateComponent";
import { watchAsObservable } from "./util";

export interface IValidateField extends Vue {
	readonly isValid: boolean;
}

interface ValidateFieldMixinComponent extends Vue, IValidateField {
	$formComponent: ValidateComponent | null;
	validateManager: ValidateManager;
	isDirty: boolean;
}

export const ValidateFieldMixin: ComponentOptions<Vue> &
	ThisType<ValidateFieldMixinComponent> = {
	inject: {
		validateManager: {
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
		validateManager: {
			immediate: true,
			handler() {
				if (this.$formComponent) {
					this.$formComponent.destroy();
					this.$formComponent = null;
				}
				if (!this.validateManager) return;
				this.$formComponent = this.validateManager.create(this, {
					reset: () => {
						this.isDirty = false;
					},
					validate: () => {
						this.isDirty = true;
					},
					state$: () => {
						return watchAsObservable(
							this,
							() => {
								if (!this.isDirty) return true;
								return !!this.isValid;
							},
							{
								immediate: true,
							}
						);
					},
				});
			},
		},
	},
};
