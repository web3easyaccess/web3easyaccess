import { Avatar, Row } from '@nextui-org/react'
import Image from 'next/image'
import Link from 'next/link'

import { parseUri } from '@walletconnect/utils'
import PageHeader from '@/components/PageHeader'
import QrReader from '@/components/QrReader'
import { web3wallet } from '@/utils/WalletConnectUtil'
import { Button, Input, Loading, Text } from '@nextui-org/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { styledToast } from '@/utils/HelperUtil'
import ModalStore from '@/store/ModalStore'

import SettingsStore from '@/store/SettingsStore'
import { useSnapshot } from 'valtio'
import AccountCard from '@/components/AccountCard'
import { EIP155_MAINNET_CHAINS, EIP155_TEST_CHAINS, EIP155_CHAINS } from '@/data/EIP155Data'

import ChannelInWc from '@/w3ea/channelInWc'
import { getChain } from '@/w3ea/ChainsData'

import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation'
import SessionsPage from './sessions'
import PairingsPage from './pairings'

export default function WalletConnectPage(params: { deepLink?: string }) {
  const { deepLink } = params
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const { mainHostUrl, walletConnectHostUrl, channelId } = router.query
  const mainHostUrlRef = useRef(mainHostUrl)
  const walletConnectHostUrlRef = useRef(walletConnectHostUrl)
  const channelIdRef = useRef(channelId)
  console.log('w3ea,zzz:123:mainHostUrl:', mainHostUrlRef.current)
  console.log('w3ea,zzz:123:walletConnectHostUrl:', walletConnectHostUrlRef.current)
  console.log('inwc,w3ea,zzz:123:getChannelId123:', channelIdRef.current, channelId)

  const {
    testNets,
    w3eaChainKey,
    w3eaAddress,
    eip155Address,
    cosmosAddress,
    solanaAddress,
    polkadotAddress,
    nearAddress,
    multiversxAddress,
    tronAddress,
    tezosAddress,
    kadenaAddress,
    smartAccountEnabled,
    chainAbstractionEnabled
  } = useSnapshot(SettingsStore.state)

  async function onConnect(uri: string) {
    const { topic: pairingTopic } = parseUri(uri)
    // if for some reason, the proposal is not received, we need to close the modal when the pairing expires (5mins)
    const pairingExpiredListener = ({ topic }: { topic: string }) => {
      if (pairingTopic === topic) {
        styledToast('Pairing expired. Please try again with new Connection URI', 'error')
        ModalStore.close()
        web3wallet.core.pairing.events.removeListener('pairing_expire', pairingExpiredListener)
      }
    }
    web3wallet.once('session_proposal', () => {
      web3wallet.core.pairing.events.removeListener('pairing_expire', pairingExpiredListener)
    })
    try {
      setLoading(true)
      web3wallet.core.pairing.events.on('pairing_expire', pairingExpiredListener)
      await web3wallet.pair({ uri })
    } catch (error) {
      styledToast((error as Error).message, 'error')
      ModalStore.close()
    } finally {
      setLoading(false)
      setUri('')
    }
  }

  useEffect(() => {
    if (deepLink) {
      onConnect(deepLink)
    }
  }, [deepLink])

  const currentChain = getChain()

  console.log('child,walletconnect,w3eaChainKey:', w3eaChainKey, '--', currentChain)

  const defaultPageId = 'walletconnect'
  const [pageId, setPageId] = useState(defaultPageId as 'walletconnect' | 'sessions' | 'pairings')
  const updatePageId = (pageId: 'walletconnect' | 'sessions' | 'pairings') => {
    console.log('wc,updatePageId,id:', pageId)
    setPageId(pageId)
  }

  const MyOtherPage = () => {
    if (pageId == 'sessions') {
      return <SessionsPage></SessionsPage>
    } else if (pageId == 'pairings') {
      return <PairingsPage></PairingsPage>
    }
  }

  return (
    <>
      <MyNavigation updatePageId={updatePageId}></MyNavigation>
      <div style={{ marginTop: '5px' }}>
        {pageId != 'walletconnect' ? (
          MyOtherPage()
        ) : (
          <Fragment>
            <PageHeader title="WalletConnect" />
            <>
              {/* <QrReader onConnect={onConnect} /> */}

              {/* <Text size={13} css={{ textAlign: 'center', marginTop: '$10', marginBottom: '$10' }}>
          or use walletconnect uri
        </Text> */}

              <Text size={14} css={{ textAlign: 'left', marginTop: '10px', marginBottom: '10px' }}>
                {`In the DApp, select "WalletConnect". In the pop-up window, click "Copy Link". Then paste
          the copied content here and click "Connect".`}
              </Text>

              <Input
                css={{ width: '100%' }}
                bordered
                aria-label="wc url connect input"
                placeholder="wc url. e.g. wc:a281567bb3e4..."
                onChange={e => setUri(e.target.value)}
                value={uri}
                data-testid="uri-input"
                contentRight={
                  <Button
                    size="xs"
                    disabled={!uri}
                    css={{ marginLeft: -60 }}
                    onClick={() => onConnect(uri)}
                    color="gradient"
                    data-testid="uri-connect-button"
                  >
                    {loading ? <Loading size="md" type="points" color={'white'} /> : 'Connect'}
                  </Button>
                }
              />

              <div style={{ marginTop: '40px' }}></div>

              <AccountCard
                key={currentChain.name}
                name={currentChain.name}
                logo={currentChain.logo}
                rgb={currentChain.rgb}
                address={w3eaAddress}
                chainId={w3eaChainKey}
                data-testid={'chain-card-' + w3eaChainKey.toString()}
              />

              {/* {Object.entries(EIP155_CHAINS)
          .filter(r => r[0] == getChainKey())
          .map(([caip10, { name, logo, rgb }]) => (
            <AccountCard
              key={name}
              name={name}
              logo={logo}
              rgb={rgb}
              address={w3eaAddress}
              chainId={caip10.toString()}
              data-testid={'chain-card-' + caip10.toString()}
            />
          ))} */}
            </>
          </Fragment>
        )}
      </div>
      <ChannelInWc
        mainHostUrl={mainHostUrlRef.current}
        walletConnectHostUrl={walletConnectHostUrlRef.current}
        channelId={channelIdRef.current}
      ></ChannelInWc>
    </>
  )
}

function MyNavigation({
  updatePageId
}: {
  updatePageId: (pageId: 'walletconnect' | 'sessions' | 'pairings') => void
}) {
  return (
    <Row justify="space-between" align="center">
      {/* <Link href="/" passHref>
          <a className="navLink" data-testid="accounts">
            <Image alt="accounts icon" src="/icons/accounts-icon.svg" width={27} height={27} />
          </a>
        </Link> */}

      <Link href="" passHref>
        <a className="navLink" data-testid="sessions" onClick={() => updatePageId('sessions')}>
          <Image alt="sessions icon" src="/icons/sessions-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href="" passHref>
        <a
          className="navLink"
          data-testid="wc-connect"
          onClick={() => updatePageId('walletconnect')}
        >
          <Avatar
            size="lg"
            css={{ cursor: 'pointer' }}
            color="gradient"
            icon={
              <Image
                alt="wallet connect icon"
                src="/wallet-connect-logo.svg"
                width={30}
                height={30}
              />
            }
          />
        </a>
      </Link>

      <Link href="" passHref>
        <a className="navLink" data-testid="pairings" onClick={() => updatePageId('pairings')}>
          <Image alt="pairings icon" src="/icons/pairings-icon.svg" width={25} height={25} />
        </a>
      </Link>

      {/* <Link href="/settings" passHref>
          <a className="navLink" data-testid="settings">
            <Image alt="settings icon" src="/icons/settings-icon.svg" width={27} height={27} />
          </a>
        </Link> */}
    </Row>
  )
}
