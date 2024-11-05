/* eslint-disable react-hooks/rules-of-hooks */
import { Col, Divider, Row, Text } from '@nextui-org/react'
import { useCallback, useState } from 'react'

import RequesDetailsCard from '@/components/RequestDetalilsCard'
import ModalStore from '@/store/ModalStore'
import { approveEIP155Request, rejectEIP155Request } from '@/utils/EIP155RequestHandlerUtil'
import { getSignParamsMessage, styledToast } from '@/utils/HelperUtil'
import { web3wallet } from '@/utils/WalletConnectUtil'
import RequestModal from '../components/RequestModal'
export default function SessionSignModal() {
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

  //   console.log('ssmodal,xyz,:requestEvent:', requestEvent)
  //   console.log('ssmodal,xyz,:params:', params)
  //   console.log('ssmodal,xyz,:requestSession:', requestSession)
  console.log('ssmodal,xyz,:requestAddress:', requestSession.namespaces.eip155.accounts[0])

  const getReqAddress = () => {
    // eip155:11155111:0x5ebc3dc13728004bBE83608d05F851136C9fD85C
    if (requestSession == undefined) {
      return ''
    }
    const aaa = requestSession.namespaces.eip155.accounts[0].split(':')
    console.log('w3ea,getReqAddress,x5:', aaa)
    return aaa[2]
  }

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(request.params)

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    try {
      if (requestEvent) {
        setIsLoadingApprove(true)
        const response = await approveEIP155Request(requestEvent)
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
      const response = rejectEIP155Request(requestEvent)
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

  return (
    <RequestModal
      intention="request a signature"
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
      <Row>
        <Col>
          <Text h5>Message2</Text>
          <Text color="$gray400" data-testid="request-message-text">
            {message}
          </Text>
        </Col>
      </Row>
    </RequestModal>
  )
}
