import { CreateAccount as CreateAccountEvent } from "../generated/Factory/Factory";
import { CreateAccount } from "../generated/schema";

import { Account as AccountDatasource } from "../generated/templates";

export function handleCreateAccount(event: CreateAccountEvent): void {
    let entity = new CreateAccount(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.ownerId = event.params.ownerId;
    entity.account = event.params.account;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
    AccountDatasource.create(event.params.account);
}
