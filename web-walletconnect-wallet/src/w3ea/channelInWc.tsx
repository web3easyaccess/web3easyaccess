type Message = {
  msgType:
    | 'reportReceived'
    | 'connect'
    | 'signMessage'
    | 'signTypedData'
    | 'signTransaction'
    | 'sendTransaction'
  chainKey: string
  address: string
  msgIdx: number
  msg: {
    chatId: string
    content: any
  }
}

let setReceivedMsgBox: (msgIdx: number, response: Message) => void
let getReceivedMsgBox: (msgIdx: number) => Message

let getLatestReceivedMsgIdx: () => number
let setLatestReceivedMsgIdx: (msgIdx: number) => void
let removeReceivedMsgBox: (msgIdx: number) => void

import { useEffect, useRef, useState } from 'react'

export let setW3eaWallet: (w: W3eaWallet) => void = (w: W3eaWallet) => {}
export let getW3eaWallet: () => W3eaWallet = () => {
  return new W3eaWallet('', '')
}
export let setReceiverData: (data: { address: string; chainKey: string }) => void = ({}) => {}
export let getReceiverData: () => { address: string; chainKey: string } = () => {
  return { address: 'Loading...', chainKey: '' }
}

import SettingsStore from '@/store/SettingsStore'
import { TransactionRequest, W3eaWallet } from './W3eaWallet'
import { japanese } from 'viem/accounts'

let setW3eaMainHost: (host: string) => void
let getW3eaMainHost: () => string

export default function ChannelInWc() {
  const w3eaWallet = useRef(new W3eaWallet('', ''))
  const receiverData = useRef({ address: '', chainKey: '' })

  getW3eaWallet = () => {
    return w3eaWallet.current
  }
  setW3eaWallet = (w: W3eaWallet) => {
    w3eaWallet.current = w
  }
  getReceiverData = () => {
    return receiverData.current
  }
  setReceiverData = (data: { address: string; chainKey: string }) => {
    receiverData.current = data
  }

  const latestReceivedMsgIdx = useRef(0)
  setLatestReceivedMsgIdx = (msgIdx: number) => {
    latestReceivedMsgIdx.current = msgIdx
  }
  getLatestReceivedMsgIdx = () => {
    return latestReceivedMsgIdx.current
  }

  const aMap = new Map()
  const receivedMsgBox = useRef(aMap)
  setReceivedMsgBox = (msgIdx: number, response: any) => {
    receivedMsgBox.current.set(msgIdx, response)
  }
  getReceivedMsgBox = (msgIdx: number) => {
    return receivedMsgBox.current.get(msgIdx)
  }

  removeReceivedMsgBox = (msgIdx: number) => {
    return receivedMsgBox.current.delete(msgIdx)
  }

  const w3eaMainHost = useRef('')

  setW3eaMainHost = (host: string) => {
    w3eaMainHost.current = host
  }

  getW3eaMainHost = () => {
    return w3eaMainHost.current
  }

  console.log('ChannelInWc init ....w3eaWallet:', w3eaWallet, '.receiverData:', receiverData)
  console.log('ChannelInWc init2....w3eaMainHost:', w3eaMainHost.current)

  window.addEventListener(
    'message',
    handleMsgReceived, // receiveMsgFromParent,
    false
  )

  useEffect(() => {}, [])

  /////////////////////////////////////////

  return <div></div>
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function handleMsgReceived(event: { origin: any; data: string }) {
  if (getW3eaMainHost() == '' || getW3eaMainHost() == undefined) {
    if (event.origin != 'http://localhost:3000' && event.origin != 'https://web3easyaccess.link') {
      return
    }
  } else if (event.origin != getW3eaMainHost()) {
    return
  }

  const msg: Message = JSON.parse(event.data)

  //
  const msg2Parent: Message = {
    msgType: 'reportReceived',
    chainKey: '',
    address: '',
    msgIdx: msg.msgIdx,
    msg: {
      chatId: '',
      content: {}
    }
  }
  await sendMsgOnce(msg2Parent)

  //

  if (msg.msgIdx <= getLatestReceivedMsgIdx()) {
    console.log('ChildWcHost:this must be repeat msg trigger by browser, discard', event.data)
    return
  } else {
    console.log('ChildWcHost:handleMsgReceived in wc,msg:', msg)
  }
  setLatestReceivedMsgIdx(msg.msgIdx)

  if (msg.msgType == 'connect') {
    const content = msg.msg.content as {
      mainHost: string
      walletconnectHost: string
    }
    setW3eaMainHost(content.mainHost)
    //
    if (getReceiverData().address != msg.address || getReceiverData().chainKey != msg.chainKey) {
      setReceiverData({ address: msg.address, chainKey: msg.chainKey })
      SettingsStore.setW3eaChainKey(getReceiverData().chainKey)
      SettingsStore.setW3eaAddress(getReceiverData().address)
    }
    //
  } else {
    setReceivedMsgBox(msg.msgIdx, msg)
  }
}
////

const sendMsgOnce = async (msg: Message) => {
  if (getW3eaMainHost() != null && getW3eaMainHost() != undefined && getW3eaMainHost() != '') {
    msg.chainKey = getReceiverData().chainKey
    msg.address = getReceiverData().address
    console.log('ChildWcHost:sendMsgOnce, w3eaMainHost:', getW3eaMainHost(), msg)
    parent.postMessage(JSON.stringify(msg), getW3eaMainHost())
  } else {
    console.log('ChildWcHost:warn,,,,main host error2, maybe have not connected!')
  }
}

const sendMsgAndWaitResponse = async (msg: Message) => {
  if (getW3eaMainHost() == null || getW3eaMainHost() == undefined || getW3eaMainHost() == '') {
    throw Error('main host error, maybe have not connected!')
  }
  msg.chainKey = getReceiverData().chainKey
  msg.address = getReceiverData().address
  parent.postMessage(JSON.stringify(msg), getW3eaMainHost())
  let cnt = 0
  while (true) {
    await sleep(500)
    const receivedMsg = getReceivedMsgBox(msg.msgIdx)
    if (receivedMsg != null && receivedMsg != undefined) {
      removeReceivedMsgBox(msg.msgIdx)
      return receivedMsg
    }

    if (cnt % 20 == 0) {
      console.log(
        'ChildWcHost:childWc:sendMsgAndWaitResponse, waiting...cnt=',
        cnt,
        'sent msg=',
        msg
      )
    }
    cnt++
  }
}
////

////

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}
// const idx2Parent = { msgIdx: 0 }

export const chat_signMessage = async (userMessage: string, isTypedData: boolean) => {
  const msg: Message = {
    msgType: isTypedData ? 'signTypedData' : 'signMessage',
    chainKey: '',
    address: '',
    msgIdx: new Date().getTime(), // ++idx2Parent.msgIdx,
    msg: {
      chatId: '',
      content: userMessage
    }
  }
  console.log('ChildWcHost:chat_signMessage, send msg to parent:', msg, 'isTypedData=', isTypedData)

  const receivedMsg = await sendMsgAndWaitResponse(msg)
  console.log('ChildWcHost:chat_signMessage, receive hash from parent:', receivedMsg.msg.content)
  const signedHash = receivedMsg.msg.content
  return signedHash
}

export const chat_sendTransaction = async (userMessage: TransactionRequest) => {
  const msg: Message = {
    msgType: 'sendTransaction',
    chainKey: '',
    address: '',
    msgIdx: new Date().getTime(), // ++idx2Parent.msgIdx,
    msg: {
      chatId: '',
      content: userMessage
    }
  }
  console.log('ChildWcHost:chat_sendTransaction, send msg to parent:', msg)
  const receivedMsg = await sendMsgAndWaitResponse(msg)
  console.log(
    'ChildWcHost:chat_sendTransaction, receive hash from parent:',
    receivedMsg.msg.content
  )
  const tranHash = receivedMsg.msg.content
  return tranHash
}