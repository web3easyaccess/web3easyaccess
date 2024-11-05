/* eslint-disable react-hooks/rules-of-hooks */
import { Divider, Text } from '@nextui-org/react'

import RequestDataCard from '@/components/RequestDataCard'
import RequesDetailsCard from '@/components/RequestDetalilsCard'
import RequestMethodCard from '@/components/RequestMethodCard'
import ModalStore from '@/store/ModalStore'
import { styledToast } from '@/utils/HelperUtil'
import { approvePolkadotRequest, rejectPolkadotRequest } from '@/utils/PolkadotRequestHandlerUtil'
import { web3wallet } from '@/utils/WalletConnectUtil'
import RequestModal from '../components/RequestModal'
import { useCallback, useState } from 'react'

export default function SessionSignPolkadotModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession
  const [isLoadingApprove, setIsLoadingApprove] = useState(false)
  const [isLoadingReject, setIsLoadingReject] = useState(false)

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required request data
  const { topic, params } = requestEvent
  const { request, chainId } = params

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    try {
      if (requestEvent) {
        setIsLoadingApprove(true)
        const response = await approvePolkadotRequest(requestEvent)
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
      }
    } catch (e) {
      styledToast((e as Error).message, 'error')
    } finally {
      setIsLoadingApprove(false)
      ModalStore.close()
    }
  }, [requestEvent, topic])

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true)
      const response = rejectPolkadotRequest(requestEvent)
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
      } catch (e) {
        setIsLoadingReject(false)
        styledToast((e as Error).message, 'error')
        ModalStore.close()
        return
      }
      setIsLoadingReject(false)
      ModalStore.close()
    }
  }, [requestEvent, topic])

  const getReqAddress = () => {
    // eip155:11155111:0x5ebc3dc13728004bBE83608d05F851136C9fD85C
    if (requestSession == undefined) {
      return ''
    }
    const aaa = requestSession.namespaces.eip155.accounts[0].split(':')
    console.log('w3ea,getReqAddress,x8:', aaa)
    return aaa[2]
  }

  return (
    <RequestModal
      intention="sign a Polkadot message"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
    >
      <RequesDetailsCard
        chains={[chainId ?? '']}
        address={getReqAddress()}
        protocol={requestSession.relay.protocol}
      />
      <Divider y={1} />
      <RequestDataCard data={params} />
      <Divider y={1} />
      <RequestMethodCard methods={[request.method]} />
    </RequestModal>
  )
}
