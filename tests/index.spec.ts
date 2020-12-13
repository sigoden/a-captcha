import { foo } from "../src";

test("foo", () => {
  expect(foo()).toEqual("foo");
})