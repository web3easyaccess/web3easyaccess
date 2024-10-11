import SettingsStore from '@/store/SettingsStore'
import { cosmosAddresses } from '@/utils/CosmosWalletUtil'
import { getW3eaAddress } from '@/w3ea/web3easyaccess'
import { eip155Addresses } from '@/utils/EIP155WalletUtil'
import { nearAddresses } from '@/utils/NearWalletUtil'
import { solanaAddresses } from '@/utils/SolanaWalletUtil'
import { multiversxAddresses } from '@/utils/MultiversxWalletUtil'
import { tronAddresses } from '@/utils/TronWalletUtil'
import { tezosAddresses } from '@/utils/TezosWalletUtil'
import { kadenaAddresses } from '@/utils/KadenaWalletUtil'
import { useSnapshot } from 'valtio'

export default function AccountPicker() {
  const { account } = useSnapshot(SettingsStore.state)

  function onSelect(value: string) {
    const account = Number(value)
    console.log('account', account)
    SettingsStore.setAccount(account)
    SettingsStore.setW3eaAddress(getW3eaAddress())
    SettingsStore.setEIP155Address(eip155Addresses[account])
    SettingsStore.setCosmosAddress(cosmosAddresses[account])
    SettingsStore.setSolanaAddress(solanaAddresses[account])
    SettingsStore.setNearAddress(nearAddresses[account])
    SettingsStore.setMultiversxAddress(multiversxAddresses[account])
    SettingsStore.setTronAddress(tronAddresses[account])
    SettingsStore.setTezosAddress(tezosAddresses[account])
    SettingsStore.setKadenaAddress(kadenaAddresses[account])
  }

  return (
    <select
      value={account}
      onChange={e => onSelect(e.currentTarget.value)}
      aria-label="addresses"
      data-testid="account-picker"
    >
      <option value={0}>Account 1</option>
      {/* <option value={1}>Account 2</option>  // w3ea comments */}
    </select>
  )
}
