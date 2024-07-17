import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { CreateAccount } from "../generated/Factory/Factory"

export function createCreateAccountEvent(
  ownerId: BigInt,
  account: Address
): CreateAccount {
  let createAccountEvent = changetype<CreateAccount>(newMockEvent())

  createAccountEvent.parameters = new Array()

  createAccountEvent.parameters.push(
    new ethereum.EventParam(
      "ownerId",
      ethereum.Value.fromUnsignedBigInt(ownerId)
    )
  )
  createAccountEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return createAccountEvent
}
