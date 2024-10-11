let receivedMsgIdx = 0

import { useEffect, useState } from 'react'
import { receiverData } from './web3easyaccess'

import SettingsStore from '@/store/SettingsStore'

export default function W3eaRecever() {
  ////////////////////////////////////
  // w3ea,web3easyaccess...
  const [receiveIdx, setReceiveIdx] = useState(0)
  //回调函数
  async function receiveMessageFromIndex(event) {
    await new Promise(r => setTimeout(r, Math.random() * 100))
    if (event.origin == 'http://localhost:3000') {
      if (event.data.msgIdx <= receivedMsgIdx) {
        console.log('这应该是重复的消息，舍弃。', event.data)
      } else {
        receivedMsgIdx = event.data.msgIdx
        console.log('我是child,我接收到parent的消息: ', event.data)
        receiverData.address = event.data.address
        receiverData.chainCode = event.data.address

        SettingsStore.setW3eaAddress(receiverData.address)

        setReceiveIdx(receiveIdx + 1)
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
          parent.postMessage(reportMsg, 'http://localhost:3000') //window.postMessage
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
