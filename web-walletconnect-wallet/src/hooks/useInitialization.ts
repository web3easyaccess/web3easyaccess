import SettingsStore from '@/store/SettingsStore'
import { createOrRestoreCosmosWallet } from '@/utils/CosmosWalletUtil'
import { createOrRestoreEIP155Wallet } from '@/utils/EIP155WalletUtil'
import { createOrRestoreSolanaWallet } from '@/utils/SolanaWalletUtil'
import { createOrRestorePolkadotWallet } from '@/utils/PolkadotWalletUtil'
import { createOrRestoreNearWallet } from '@/utils/NearWalletUtil'
import { createOrRestoreMultiversxWallet } from '@/utils/MultiversxWalletUtil'
import { createOrRestoreTronWallet } from '@/utils/TronWalletUtil'
import { createOrRestoreTezosWallet } from '@/utils/TezosWalletUtil'
import { createWeb3Wallet, web3wallet } from '@/utils/WalletConnectUtil'
import { createOrRestoreKadenaWallet } from '@/utils/KadenaWalletUtil'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import useSmartAccounts from './useSmartAccounts'
import { loadW3eaWallet } from '@/w3ea/web3easyaccess'

import * as web3easyaccess from "@/w3ea/web3easyaccess";

export default function useInitialization() {
<<<<<<< HEAD
  const [initialized, setInitialized] = useState(false)
    console.log("w3ea,useInitialization called...");

  const prevRelayerURLValue = useRef<string>('')
    const prevW3eaAddressValue = useRef<string>('')

    const { relayerRegionURL, w3eaAddress } = useSnapshot(SettingsStore.state)
  const { initializeSmartAccounts } = useSmartAccounts()

  const onInitialize = useCallback(async () => {
    try {
            console.log("w3ea,onInitialize triggered...w3eaAddress:", w3eaAddress);
            const { XXeip155Addresses, XXeip155Wallets } = createOrRestoreEIP155Wallet()
            const { w3eaAddresses, eip155Wallets } = web3easyaccess.getAddress()
            prevW3eaAddressValue.current = w3eaAddresses[0];
            const eip155Addresses = w3eaAddresses;
            //
      const { cosmosAddresses } = await createOrRestoreCosmosWallet()
      const { solanaAddresses } = await createOrRestoreSolanaWallet()
      const { polkadotAddresses } = await createOrRestorePolkadotWallet()
      const { nearAddresses } = await createOrRestoreNearWallet()
      const { multiversxAddresses } = await createOrRestoreMultiversxWallet()
      const { tronAddresses } = await createOrRestoreTronWallet()
      const { tezosAddresses } = await createOrRestoreTezosWallet()
      const { kadenaAddresses } = await createOrRestoreKadenaWallet()
            // await initializeSmartAccounts(eip155Wallets[eip155Addresses[0]].getPrivateKey())

      SettingsStore.setEIP155Address(eip155Addresses[0])
      SettingsStore.setCosmosAddress(cosmosAddresses[0])
      SettingsStore.setSolanaAddress(solanaAddresses[0])
      SettingsStore.setPolkadotAddress(polkadotAddresses[0])
      SettingsStore.setNearAddress(nearAddresses[0])
      SettingsStore.setMultiversxAddress(multiversxAddresses[0])
      SettingsStore.setTronAddress(tronAddresses[0])
      SettingsStore.setTezosAddress(tezosAddresses[0])
      SettingsStore.setKadenaAddress(kadenaAddresses[0])

      await createWeb3Wallet(relayerRegionURL)
      setInitialized(true)
    } catch (err: unknown) {
      console.error('Initialization failed', err)
      alert(err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relayerRegionURL])
=======
    const [initialized, setInitialized] = useState(false)
    const prevRelayerURLValue = useRef<string>('')

    const { relayerRegionURL } = useSnapshot(SettingsStore.state)
    const { initializeSmartAccounts } = useSmartAccounts()

    const onInitialize = useCallback(async () => {
        try {
            const { w3eaAddress, w3eaWallet } = loadW3eaWallet()
            const { eip155Addresses, eip155Wallets } = createOrRestoreEIP155Wallet()
            // w3ea comments:
            //   const { cosmosAddresses } = await createOrRestoreCosmosWallet()
            //   const { solanaAddresses } = await createOrRestoreSolanaWallet()
            //   const { polkadotAddresses } = await createOrRestorePolkadotWallet()
            //   const { nearAddresses } = await createOrRestoreNearWallet()
            //   const { multiversxAddresses } = await createOrRestoreMultiversxWallet()
            //   const { tronAddresses } = await createOrRestoreTronWallet()
            //   const { tezosAddresses } = await createOrRestoreTezosWallet()
            //   const { kadenaAddresses } = await createOrRestoreKadenaWallet()
            //   await initializeSmartAccounts(eip155Wallets[eip155Addresses[0]].getPrivateKey())

            SettingsStore.setW3eaAddress(w3eaAddress)
>>>>>>> Branch_69124a60_walletconnect-raw

            SettingsStore.setEIP155Address(eip155Addresses[0])
            // w3ea comments:
            // SettingsStore.setCosmosAddress(cosmosAddresses[0])
            // SettingsStore.setSolanaAddress(solanaAddresses[0])
            // SettingsStore.setPolkadotAddress(polkadotAddresses[0])
            // SettingsStore.setNearAddress(nearAddresses[0])
            // SettingsStore.setMultiversxAddress(multiversxAddresses[0])
            // SettingsStore.setTronAddress(tronAddresses[0])
            // SettingsStore.setTezosAddress(tezosAddresses[0])
            // SettingsStore.setKadenaAddress(kadenaAddresses[0])
            await createWeb3Wallet(relayerRegionURL)
            setInitialized(true)
        } catch (err: unknown) {
            console.error('Initialization failed', err)
            alert(err)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [relayerRegionURL])

<<<<<<< HEAD
  useEffect(() => {
        console.log("before onInitialize...before w3eaAddress:", prevW3eaAddressValue.current);
        console.log("before onInitialize...w3eaAddress:", w3eaAddress, ",initialized=", initialized);
        if (!initialized || prevW3eaAddressValue.current != w3eaAddress) {
            onInitialize();
    }
    if (prevRelayerURLValue.current !== relayerRegionURL) {
      onRelayerRegionChange()
    }
    }, [initialized, onInitialize, relayerRegionURL, onRelayerRegionChange, w3eaAddress])

=======
    // restart transport if relayer region changes
    const onRelayerRegionChange = useCallback(() => {
        try {
            web3wallet?.core?.relayer.restartTransport(relayerRegionURL)
            prevRelayerURLValue.current = relayerRegionURL
        } catch (err: unknown) {
            alert(err)
        }
    }, [relayerRegionURL])
>>>>>>> Branch_69124a60_walletconnect-raw

    useEffect(() => {
        if (!initialized) {
            onInitialize()
        }
        if (prevRelayerURLValue.current !== relayerRegionURL) {
            onRelayerRegionChange()
        }
    }, [initialized, onInitialize, relayerRegionURL, onRelayerRegionChange])

    return initialized
}
