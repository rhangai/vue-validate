import { mount } from "@vue/test-utils";
import { ValidateProvider } from "./ValidateProvider";
import { ValidateManager } from "../manager/ValidateManager";

describe("ValidateProvider", () => {
	it("should render the provider", async () => {
		const wrapper = mount(ValidateProvider);
		expect(wrapper.is("div")).toBe(true);
		expect(wrapper.vm.validateManager).toBeInstanceOf(ValidateManager);
	});
});
