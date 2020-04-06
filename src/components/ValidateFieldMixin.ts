import Vue, { ComponentOptions } from "vue";
import { ValidateManager, VALIDATE_MANAGER_SYMBOL } from "../manager/ValidateManager";
import { ValidateItem } from "../manager/ValidateItem";
import { watchAsObservable } from "../util";

export interface IValidateField {
	readonly isValid: boolean;
}

interface ValidateFieldMixinComponent extends Vue, IValidateField {
	$validateItem: ValidateItem | null;
	validateManager: ValidateManager;
	dirty: boolean;
}

export const ValidateFieldMixin: ComponentOptions<Vue> & ThisType<ValidateFieldMixinComponent> = {
	inject: {
		validateManager: {
			from: VALIDATE_MANAGER_SYMBOL,
			default: () => null,
		},
	},
	data() {
		return {
			dirty: false,
		};
	},
	watch: {
		validateManager: {
			immediate: true,
			handler() {
				if (this.$validateItem) {
					this.$validateItem.destroy();
					this.$validateItem = null;
				}
				if (!this.validateManager) return;
				this.$validateItem = this.validateManager.createItem(this, this, {
					reset: () => {
						this.dirty = false;
					},
					validate: () => {
						this.dirty = true;
					},
					state$: () => {
						return watchAsObservable(
							this,
							function () {
								if (!this.dirty) return true;
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
