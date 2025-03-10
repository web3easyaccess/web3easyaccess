/* eslint-disable react-hooks/rules-of-hooks */
import { Col, Divider, Row, Text } from '@nextui-org/react'

import RequestDataCard from '@/components/RequestDataCard'
import RequestDetailsCard from '@/components/RequestDetalilsCard'
import ModalStore from '@/store/ModalStore'
import { convertHexToUtf8, styledToast } from '@/utils/HelperUtil'
import { approveKadenaRequest, rejectKadenaRequest } from '@/utils/KadenaRequestHandlerUtil'
import { web3wallet } from '@/utils/WalletConnectUtil'
import RequestModal from '../components/RequestModal'
import { useCallback, useState } from 'react'

export default function SessionSignKadenaModal() {
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

  // Get message, convert it to UTF8 string if it is valid hex
  const message = convertHexToUtf8(request.params.message)

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    try {
      if (requestEvent) {
        setIsLoadingApprove(true)
        const response = await approveKadenaRequest(requestEvent)
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
        setIsLoadingApprove(false)
        ModalStore.close()
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
      const response = rejectKadenaRequest(requestEvent)
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
    console.log('w3ea,getReqAddress,x4:', aaa)
    return aaa[2]
  }

  return (
    <RequestModal
      intention="sign a Kadena message"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
    >
      <RequestDetailsCard
        chains={[chainId ?? '']}
        address={getReqAddress()}
        protocol={requestSession.relay.protocol}
      />
      <Divider y={1} />
      {message && (
        <>
          <Row>
            <Col>
              <Text h5>Message1</Text>
              <Text color="$gray400">{message}</Text>
            </Col>
          </Row>
          <Divider y={1} />
        </>
      )}
      <RequestDataCard data={params} />
    </RequestModal>
  )
}
