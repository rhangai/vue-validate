import Vue, { ComponentOptions } from "vue";
import { Observable } from "rxjs";
import { FormManager } from "./FormManager";
import { FormComponentValidate } from "./FormComponentValidate";
import { FORM_SYMBOL } from "./Form";

export interface IFormField extends Vue {
	readonly isValid: boolean;
}

interface FormFieldComponent extends Vue, IFormField {
	$formComponent: FormComponentValidate | null;
	formManager: FormManager;
	isDirty: boolean;
}

export const FormFieldMixin: ComponentOptions<Vue> = {
	inject: {
		formManager: {
			from: FORM_SYMBOL,
			default: () => null,
		},
	},
	data() {
		return {
			isDirty: false,
		};
	},
	watch: {
		formManager: {
			immediate: true,
			handler(this: FormFieldComponent) {
				if (this.$formComponent) {
					this.$formComponent.destroy();
					this.$formComponent = null;
				}
				this.$formComponent = this.formManager.create(this, {
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
