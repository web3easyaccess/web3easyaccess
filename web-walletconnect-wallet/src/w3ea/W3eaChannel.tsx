type Message = {
  msgType: 'childReady' | 'initializeChild' | 'signMessage' | 'signTransaction' | 'sendTransaction'
  chainKey: string
  address: string
  msgIdx: number
  msg: {
    chatId: string
    content: any
  }
}

let receivedMsgIdx = 0

import { useEffect, useState } from 'react'
import { receiverData } from './web3easyaccess'

import SettingsStore from '@/store/SettingsStore'
import { TransactionRequest } from './W3eaWallet'

const w3eaHost = () => {
  let hh
  if (process.env.PARENT_W3EA_HOST != undefined && process.env.PARENT_W3EA_HOST != '') {
    console.log('env is valid!')
    hh = process.env.PARENT_W3EA_HOST
  } else {
    console.log('env is invalid!')
    hh = 'http://localhost:3000'
  }
  if (hh.endsWith('/')) {
    return hh.substring(0, hh.length - 1)
  } else {
    return hh
  }
} // process.env.PARENT_W3EA_HOST

export default function W3eaChannel() {
  ////////////////////////////////////
  // w3ea,web3easyaccess...

  console.log('w3ea, host:', w3eaHost())

  window.addEventListener('message', receiveMsgFromParent, false)

  useEffect(() => {
    const msg: Message = {
      msgType: 'childReady',
      chainKey: '',
      address: '',
      msgIdx: new Date().getTime(), // ++idx2Parent.msgIdx,
      msg: {
        chatId: '',
        content: undefined
      }
    }
    sendMsgToParent(msg)
  }, [])
  /////////////////////////////////////////

  return <div></div>
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const sendMsgToParent = async (message: Message) => {
  const nnn = 100
  console.log('in sendMsgToParent,,1')
  for (let k = 0; k < nnn; k++) {
    await sleep(100)
    try {
      parent.postMessage(JSON.stringify(message), w3eaHost()) //window.postMessage
      break
    } catch (e) {
      console.log('sendMsgToParent error:', e)
    }
    if (k == nnn - 1) {
      throw Error('sendMsgToParent timeout!')
    }
  }
  console.log('in sendMsgToParent,,2')
}

const parentMsgBuffer = new Map()

//
const receiveMsgFromParent = async (event: { origin: string; data: Message }) => {
  await sleep(Math.random() * 100)
  console.log('w3ea received....:', event)
  if (event.origin == w3eaHost()) {
    if (event.data.msgIdx <= receivedMsgIdx) {
      console.log('this must be repeat msg trigger by browser, discard', event.data)
    } else {
      receivedMsgIdx = event.data.msgIdx
      console.log('it is child here, msg from parent:', event.data)
      if (event.data.msgType == 'initializeChild') {
        if (
          receiverData.address != event.data.address ||
          receiverData.chainKey != event.data.chainKey
        ) {
          receiverData.address = event.data.address
          receiverData.chainKey = event.data.chainKey
          SettingsStore.setW3eaAddress(receiverData.address)
        }
      } else {
        parentMsgBuffer.set(event.data.msg.chatId, event.data.msg.content)
      }
    }
  }
}

const waitParentMsg = async (chatId: string) => {
  const timeout_ = 60 * 10
  const interval_ = 0.1
  const nnn = timeout_ / interval_
  console.log('in waitParentMsg,,1')
  for (let k = 0; k < nnn; k++) {
    await sleep(interval_ * 1000)
    try {
      const msg = parentMsgBuffer.get(chatId)
      if (msg != '' && msg != null && msg != undefined) {
        console.log('in waitParentMsg, msg:', msg)
        parentMsgBuffer.delete(chatId)
        return msg
      }
    } catch (e) {}
    if (k == nnn - 1) {
      throw Error('waitParentMsg timeout')
    }
  }
  console.log('in waitParentMsg,,2')
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}
// const idx2Parent = { msgIdx: 0 }

export const chat_signMessage = async (userMessage: string) => {
  let chatId = new Date().getTime() + '_' + getRandomInt(1000)

  parentMsgBuffer.set(chatId, '')

  const msg: Message = {
    msgType: 'signMessage',
    chainKey: '',
    address: '',
    msgIdx: new Date().getTime(), // ++idx2Parent.msgIdx,
    msg: {
      chatId: chatId,
      content: userMessage
    }
  }
  console.log('chat_signMessage, send msg to parent:', msg)
  await sendMsgToParent(msg)
  const signedHash = await waitParentMsg(chatId)
  console.log('chat_signMessage, receive hash from parent:', signedHash)
  return signedHash
}

export const chat_sendTransaction = async (userMessage: TransactionRequest) => {
  let chatId = new Date().getTime() + '_' + getRandomInt(1000)

  parentMsgBuffer.set(chatId, '')

  const msg: Message = {
    msgType: 'sendTransaction',
    chainKey: '',
    address: '',
    msgIdx: new Date().getTime(), // ++idx2Parent.msgIdx,
    msg: {
      chatId: chatId,
      content: userMessage
    }
  }
  console.log('chat_sendTransaction, send msg to parent:', msg)
  await sendMsgToParent(msg)
  const signedHash = await waitParentMsg(chatId)
  console.log('chat_sendTransaction, receive hash from parent:', signedHash)
  return signedHash
}
