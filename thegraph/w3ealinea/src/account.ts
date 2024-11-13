import { CreateAccount as CreateAccountEvent } from "../generated/Factory/Factory";
import {
    InitAccount as InitAccountEvent,
    ChgEntry as ChgEntryEvent,
    ChgPasswdAddr as ChgPasswdAddrEvent,
    SyncEntryEOA as SyncEntryEOAEvent,
    UpgradeImpl as UpgradeImplEvent,
    SendTransaction as SendTransactionEvent,
} from "../generated/templates/Account/Account";
import {
    InitAccount,
    ChgEntry,
    ChgPasswdAddr,
    SyncEntryEOA,
    UpgradeImpl,
    SendTransaction,
} from "../generated/schema";

/*
event InitAccount(address passwdAddr, address factory);
              - event: InitAccount(address,address)
                handler: handleInitAccount
*/
export function handleInitAccount(event: InitAccountEvent): void {
    let entity = new InitAccount(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.account = event.address;
    entity.passwdAddr = event.params.passwdAddr;
    entity.factory = event.params.factory;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleChgEntry(event: ChgEntryEvent): void {
    let entity = new ChgEntry(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.account = event.address;
    entity.newEntry = event.params.newEntry;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleChgPasswdAddr(event: ChgPasswdAddrEvent): void {
    let entity = new ChgPasswdAddr(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.account = event.address;
    entity.oldPasswdAddr = event.params.oldPasswdAddr;
    entity.newPasswdAddr = event.params.newPasswdAddr;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleSyncEntryEOA(event: SyncEntryEOAEvent): void {
    let entity = new SyncEntryEOA(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.account = event.address;
    entity.newEntryEOA = event.params.newEntryEOA;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleUpgradeImpl(event: UpgradeImplEvent): void {
    let entity = new UpgradeImpl(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.account = event.address;
    entity.oldImpl = event.params.oldImpl;
    entity.newImpl = event.params.newImpl;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleSendTransaction(event: SendTransactionEvent): void {
    let entity = new SendTransaction(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.account = event.address;
    entity.to = event.params.to;
    entity.data = event.params.data;
    entity.value = event.params.value;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}
