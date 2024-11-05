/* eslint-disable react-hooks/rules-of-hooks */
import { transactions } from 'near-api-js'
import { Divider, Text } from '@nextui-org/react'

import RequestDataCard from '@/components/RequestDataCard'
import RequestDetailsCard from '@/components/RequestDetalilsCard'
import RequestMethodCard from '@/components/RequestMethodCard'
import ModalStore from '@/store/ModalStore'
import { approveNearRequest, rejectNearRequest } from '@/utils/NearRequestHandlerUtil'
import { web3wallet } from '@/utils/WalletConnectUtil'
import { NEAR_SIGNING_METHODS } from '@/data/NEARData'
import { styledToast } from '@/utils/HelperUtil'
import RequestModal from '../components/RequestModal'
import { useCallback, useState } from 'react'

export default function SessionSignNearModal() {
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

  const formatTransaction = (transaction: Uint8Array) => {
    const tx = transactions.Transaction.decode(Buffer.from(transaction).map(i => i))

    return {
      signerId: tx.signerId,
      receiverId: tx.receiverId,
      publicKey: tx.publicKey.toString(),
      actions: tx.actions.map(action => {
        switch (action.enum) {
          case 'createAccount': {
            return {
              type: 'CreateAccount',
              params: action.createAccount
            }
          }
          case 'deployContract': {
            return {
              type: 'DeployContract',
              params: {
                ...action.deployContract,
                args: Buffer.from(
                  action.deployContract == undefined ? '' : action.deployContract.code
                ).toString()
              }
            }
          }
          case 'functionCall': {
            return {
              type: 'FunctionCall',
              params: {
                ...action.functionCall,
                args: JSON.parse(
                  Buffer.from(
                    action.functionCall == undefined ? '' : action.functionCall.args
                  ).toString()
                )
              }
            }
          }
          case 'transfer': {
            return {
              type: 'Transfer',
              params: action.transfer
            }
          }
          case 'stake': {
            return {
              type: 'Stake',
              params: {
                ...action.stake,
                publicKey: action.stake == undefined ? '' : action.stake.publicKey.toString()
              }
            }
          }
          case 'addKey': {
            return {
              type: 'AddKey',
              params: {
                ...action.addKey,
                publicKey: action.addKey == undefined ? '' : action.addKey.publicKey.toString()
              }
            }
          }
          case 'deleteKey': {
            return {
              type: 'DeleteKey',
              params: {
                ...action.deleteKey,
                publicKey:
                  action.deleteKey == undefined ? '' : action.deleteKey.publicKey.toString()
              }
            }
          }
          case 'deleteAccount': {
            return {
              type: 'DeleteAccount',
              params: action.deleteAccount
            }
          }
          default:
            return {
              type: action.enum,
              params: {}
            }
        }
      })
    }
  }

  const formatParams = () => {
    switch (params.request.method) {
      case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTION:
        return {
          ...params,
          request: {
            ...params.request,
            params: {
              ...params.request.params,
              transaction: formatTransaction(params.request.params.transaction)
            }
          }
        }
      case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTIONS:
        return {
          ...params,
          request: {
            ...params.request,
            params: {
              ...params.request.params,
              transactions: params.request.params.transactions.map(formatTransaction)
            }
          }
        }
      default:
        return params
    }
  }

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    try {
      if (requestEvent) {
        setIsLoadingApprove(true)
        const response = await approveNearRequest(requestEvent)
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
      const response = rejectNearRequest(requestEvent)
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
    console.log('w3ea,getReqAddress,x7:', aaa)
    return aaa[2]
  }

  return (
    <RequestModal
      intention="sign NEAR message"
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
      <RequestDataCard data={formatParams()} />
      <Divider y={1} />
      <RequestMethodCard methods={[request.method]} />
    </RequestModal>
  )
}
