import "jest-styled-components"
import React from "react"
import renderer from "react-test-renderer"
import Input from "../Input-palette"

describe("Input", () => {
  it("renders standard mode", () => {
    const input = renderer.create(
      <Input placeholder="Placeholder" title="Title" block />
    )

    expect(input.toJSON()).toMatchSnapshot()
  })

  it("renders quick mode", () => {
    const input = renderer.create(
      <Input quick placeholder="Placeholder" title="Title" block />
    )

    expect(input.toJSON()).toMatchSnapshot()
  })
})
