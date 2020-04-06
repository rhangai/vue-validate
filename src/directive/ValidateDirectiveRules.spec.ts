import Vue from "vue";
import { mount, Wrapper } from "@vue/test-utils";
import { ValidateProvider } from "../components";
import { ValidateDirectiveRules } from "./ValidateDirectiveRules";

interface TestInput extends Vue {
	value: string;
	readonly isValid: boolean;
}

describe("ValidateDirectiveRules", () => {
	it("should allow nested providers the provider", async () => {
		const TestWrapper = Vue.extend({
			components: {
				ValidateProvider,
			},
			directives: {
				rules: ValidateDirectiveRules,
			},
			data: () => ({
				value: "",
			}),
			methods: {
				required(v: any) {
					return !!v;
				},
			},
			template: `
				<validate-provider ref="parent">
					<div>
						<input type="text" v-model="value" v-rules="required" />
					</div>
				</validate-provider>
			`,
		});

		const wrapper = mount(TestWrapper);
		const validateProvider = wrapper.get(ValidateProvider);

		await expect(validateProvider.vm.validate()).resolves.toBe(false);

		wrapper.get("input").setValue("Some text");
		await wrapper.vm.$nextTick();

		await expect(validateProvider.vm.validate()).resolves.toBe(true);

		wrapper.destroy();
	});
});
