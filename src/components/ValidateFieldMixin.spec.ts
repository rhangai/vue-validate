import Vue from "vue";
import { mount, Wrapper } from "@vue/test-utils";
import { ValidateProvider } from "./ValidateProvider";
import { ValidateFieldMixin } from "./ValidateFieldMixin";

interface TestInput extends Vue {
	value: string;
	readonly isValid: boolean;
}

describe("ValidateFieldMixin", () => {
	const TestInput = Vue.extend({
		mixins: [ValidateFieldMixin],
		data: () => ({
			value: "",
		}),
		computed: {
			isValid() {
				return !!this.value;
			},
		},
		template: `
			<input type="text" v-model="value">
		`,
	});

	it("should allow nested providers the provider", async () => {
		const TestWrapper = Vue.extend({
			components: {
				ValidateProvider,
				TestInput,
			},
			template: `
				<validate-provider ref="parent">
					<test-input ref="child" />
				</validate-provider>
			`,
		});

		const wrapper = mount(TestWrapper);
		const validateProvider = wrapper.get(ValidateProvider);
		const testInput = wrapper.get(TestInput) as Wrapper<TestInput>;

		expect(testInput.vm.isValid).toBe(false);
		await expect(validateProvider.vm.validate()).resolves.toBe(false);

		wrapper.get("input").setValue("Some text");
		await wrapper.vm.$nextTick();

		await validateProvider.vm.resetValidation();
		await expect(validateProvider.vm.validate()).resolves.toBe(true);

		wrapper.destroy();
	});

	it("should allow changing providers the provider", async () => {
		const TestWrapper = Vue.extend({
			components: {
				ValidateProvider,
				TestInput,
			},
			data: () => ({
				component: "form",
			}),
			template: `
				<validate-provider ref="parent">
					<component :is="component">
						<test-input ref="child" />
					</component>
				</validate-provider>
			`,
		});

		const wrapper = mount(TestWrapper);
		const validateProvider = wrapper.get(ValidateProvider);
		const testInput = wrapper.get(TestInput) as Wrapper<TestInput>;

		wrapper.setData({ component: "validate-provider" });
		await wrapper.vm.$nextTick();

		wrapper.destroy();
	});
});
