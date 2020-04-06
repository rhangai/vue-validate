import Vue from "vue";
import { mount, createWrapper } from "@vue/test-utils";
import { ValidateProvider, ValidateProviderVue } from "./ValidateProvider";
import { ValidateManager } from "../manager/ValidateManager";

describe("ValidateProvider", () => {
	it("should render the provider", async () => {
		const wrapper = mount(ValidateProvider);
		expect(wrapper.is("div")).toBe(true);
		expect(wrapper.vm.validateManager).toBeInstanceOf(ValidateManager);
		expect(await wrapper.vm.validate()).toBe(true);
		wrapper.destroy();
	});

	it("should allow nested providers the provider", async () => {
		const TestComponent = Vue.extend({
			components: {
				ValidateProvider,
			},
			template: `
				<validate-provider ref="parent">
					<validate-provider ref="child" />
				</validate-provider>
			`,
		});

		const wrapper = mount(TestComponent);
		await wrapper.vm.$nextTick();
		const parent = wrapper.find({ ref: "parent" });
		const parentVm: ValidateProviderVue = parent.vm as ValidateProviderVue;
		const child = wrapper.find({ ref: "child" });
		const childVm: ValidateProviderVue = child.vm as ValidateProviderVue;
		expect(child.is(ValidateProvider)).toBe(true);
		expect(parentVm.validateManager).toBeInstanceOf(ValidateManager);
		expect(childVm.validateManager).toBeInstanceOf(ValidateManager);
		expect(childVm.parentValidateManager).toBe(parentVm.validateManager);

		await parentVm.resetValidation();
		expect(await parentVm.validate()).toBe(true);

		wrapper.destroy();
	});
});
