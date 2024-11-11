import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { CreateAccount } from "../generated/schema"
import { CreateAccount as CreateAccountEvent } from "../generated/Factory/Factory"
import { handleCreateAccount } from "../src/factory"
import { createCreateAccountEvent } from "./factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let ownerId = BigInt.fromI32(234)
    let account = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newCreateAccountEvent = createCreateAccountEvent(ownerId, account)
    handleCreateAccount(newCreateAccountEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CreateAccount created and stored", () => {
    assert.entityCount("CreateAccount", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CreateAccount",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "ownerId",
      "234"
    )
    assert.fieldEquals(
      "CreateAccount",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "account",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
