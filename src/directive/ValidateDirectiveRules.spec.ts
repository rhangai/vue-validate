import Vue from "vue";
import { mount, Wrapper } from "@vue/test-utils";
import { ValidateProvider } from "../components";
import { ValidateDirectiveRules } from "./ValidateDirectiveRules";

interface TestInput extends Vue {
	value: string;
	readonly isValid: boolean;
}

describe("ValidateDirectiveRules", () => {
	it("should allow rules on elements", async () => {
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

		await validateProvider.vm.reset();
		await expect(validateProvider.vm.validate()).resolves.toBe(true);

		wrapper.destroy();
	});

	it("should allow rules on components", async () => {
		const TestInput = Vue.extend({
			data: () => ({
				value: "",
			}),
			template: `
				<input type="text" v-model="value" >
			`,
		});

		const TestWrapper = Vue.extend({
			components: {
				ValidateProvider,
				TestInput,
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
					<test-input v-rules="required" />
				</validate-provider>
			`,
		});

		const wrapper = mount(TestWrapper);
		const validateProvider = wrapper.get(ValidateProvider);

		await expect(validateProvider.vm.validate()).resolves.toBe(false);

		wrapper.get("input").setValue("Some text");
		await wrapper.vm.$nextTick();

		await validateProvider.vm.reset();
		await expect(validateProvider.vm.validate()).resolves.toBe(true);

		wrapper.destroy();
	});

	it("should allow nested rules", async () => {
		const TestInput = Vue.extend({
			directives: {
				rules: ValidateDirectiveRules,
			},
			props: {
				invalid: Boolean,
			},
			data: () => ({
				value: "",
			}),
			methods: {
				required(v: any) {
					return !!v;
				},
				invalidRule(v: any) {
					return !this.invalid;
				},
			},
			template: `
				<input type="text" v-model="value" v-rules="[required, invalidRule]" >
			`,
		});

		const TestWrapper = Vue.extend({
			components: {
				ValidateProvider,
				TestInput,
			},
			template: `
				<validate-provider ref="parent">
					<div>
						<validate-provider ref="child">
							<test-input ref="input" />
						</validate-provider>
					</div>
					<test-input invalid />
				</validate-provider>
			`,
		});

		const wrapper = mount(TestWrapper);
		const validateProvider = wrapper.get({ ref: "parent" }) as Wrapper<ValidateProvider>;
		const childValidateProvider = wrapper.get({ ref: "child" }) as Wrapper<ValidateProvider>;

		await expect(validateProvider.vm.validate()).resolves.toBe(false);

		wrapper.get({ ref: "input" }).setValue("Some text");
		await wrapper.vm.$nextTick();

		await validateProvider.vm.reset();
		await expect(validateProvider.vm.validate()).resolves.toBe(false);
		await expect(childValidateProvider.vm.validate()).resolves.toBe(true);

		wrapper.destroy();
	});
});
