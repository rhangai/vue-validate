import Vue from "vue";
import { Subscription } from "rxjs";
import { FormManager } from "./FormManager";
import { FormComponentValidate } from "./FormComponentValidate";
import Component from "vue-class-component";
import { Watch } from "vue-property-decorator";

export const FORM_SYMBOL = Symbol("vue-form-manager");

@Component<Form>({
	props: {
		value: {
			type: Boolean,
			default: false,
		},
	},
	provide() {
		return {
			[FORM_SYMBOL]: this.formManager,
		};
	},
	inject: {
		parentFormManager: {
			from: FORM_SYMBOL,
			default: () => null,
		},
	},
})
export class Form extends Vue {
	private isValid = false;
	private readonly parentFormManager!: FormManager;
	private readonly [FORM_SYMBOL] = new FormManager();
	private parentFormComponent!: FormComponentValidate | null;
	private subscription!: Subscription;

	get formManager() {
		return this[FORM_SYMBOL];
	}

	created() {
		this.subscription = this.formManager.observable$().subscribe({
			next: (v: boolean) => {
				this.isValid = !!v;
			},
		});
	}

	beforeDestroy() {
		this.subscription.unsubscribe();
	}

	@Watch("isValid")
	onIsValid() {
		this.$emit("input", this.isValid);
	}

	@Watch("parentFormManager", { immediate: true })
	onParentFormManager(manager: FormManager) {
		if (this.parentFormComponent) {
			this.parentFormComponent.destroy();
			this.parentFormComponent = null;
		}
		if (!manager) return;
		this.parentFormComponent = manager.create(this, {
			reset: () => this.formManager.reset(),
			validate: () => this.formManager.validate(),
			state$: () => this.formManager.observable$(),
		});
	}

	render(h: (...args: unknown[]) => unknown) {
		return h("div", null, this.$slots.default);
	}
}
