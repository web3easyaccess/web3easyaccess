let receivedMsgIdx = 0

import { useEffect, useState } from 'react'
import { receiverData } from './web3easyaccess'

import SettingsStore from '@/store/SettingsStore'

export default function W3eaRecever() {
  ////////////////////////////////////
  // w3ea,web3easyaccess...

  const w3eaHost = 'http://localhost:3000' // process.env.PARENT_W3EA_HOST
  console.log('w3ea, host:', w3eaHost)
  //回调函数
  async function receiveMessageFromIndex(event) {
    await new Promise(r => setTimeout(r, Math.random() * 100))
    console.log('w3ea received....:', event)
    if (event.origin == w3eaHost) {
      if (event.data.msgIdx <= receivedMsgIdx) {
        console.log('这应该是重复的消息，舍弃。', event.data)
      } else {
        receivedMsgIdx = event.data.msgIdx
        console.log('我是child,我接收到parent的消息: ', event.data)
        receiverData.address = event.data.address
        receiverData.chainKey = event.data.chainKey

        SettingsStore.setW3eaAddress(receiverData.address)
      }
    }
  }
  //监听message事件
  window.addEventListener('message', receiveMessageFromIndex, false)

  useEffect(() => {
    // 渲染完成，发送消息给parent
    const send = async () => {
      while (true) {
        try {
          const reportMsg = 'child[walletconnect]OK'
          parent.postMessage(reportMsg, w3eaHost) //window.postMessage
          break
        } catch (e) {
          await new Promise(r => setTimeout(r, 500))
        }
      }
    }
    send()
  }, [])
  /////////////////////////////////////////

  return <div></div>
}
