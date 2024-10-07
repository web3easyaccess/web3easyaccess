<font size=4>

# Web3EasyAccess

欢迎使用: [web3easyaccess.link](https://www.web3easyaccess.link/)

## Web3EasyAccess 是什么

Web3EasyAccess, 提供一种轻松访问 web3 世界的方法，人们可以像登录普通 Web2 网站一样登录本网站，进而管理去中心化资产，探索去中心化世界。\
在 SOLANA 中，我们利用链下的多人部分签名技术与 Program Derived Addresses 技术来实现本系统。通过本系统提供的服务，用户无需管理助记词或私钥，而是通过用户自己的密码信息对账户进行控制，同时保留“去中心化”的关键特性。另外，用户也可以对现有的密码信息进行修改，同时保持账户地址不变。

## 系统实现原理

### 前置知识: 什么是 PDA

-   程序派生账户（PDA）是为了让特定程序可以控制一些账户而设计出来的。使用 PDA，程序可以通过编程方法为一些地址进行签名，而不一定用到私钥。
    (Program Derived Addresses (PDAs) are home to accounts that are designed to be controlled by a specific program. With PDAs, programs can programmatically sign for certain addresses without needing a private key. )
-   在本系统中，保存用户资产的账户是一个 PDA，每个 PDA 拥有一个独立的签名公钥，该公钥对应用户自定义的密码信息，每次交易需要用户首先在链下完成签名才允许执行。

### 实现原理

#### 创建账户与发起交易

![arch](./resources/solana-W3EA-ARCH-1.png "architecture")

如上图，用户每次交易需要两个 Signers，一个是在浏览器端用户私密签名账户，另一个是服务端内置的签名账户。秉承去中心化的思想，用户的私密账户由用户的密码信息生成，且永远不会泄露给服务器，副作用是，一旦遗忘永远无法找回。

系统的主要处理逻辑有以下几点：

1. 一是根据用户的 email 及密码信息派生出用于控制用户 PDA 的普通钱包地址，我们称之为“密码地址(password address or password account)”，该地址不暴露给用户，发起交易时在浏览器端用该地址为交易执行签名，未经签名的交易无法执行。同一个 email 下的多个资金账户共用一个 “密码地址”。

2. 二是根据用户的 email 派生出用户的 ownerId，当前最多支持 255 个，系统为每个 ownerId 创建一个独立的资金账户(PDA)；

3. 在应用服务器后端，系统拥有一个独立的普通钱包地址，该地址也为用户的交易执行签名，并作为链上交易的手续费付款人(payer)。在 solana 的 program 内部，执行交易时，所需的手续费将从用户的资产 PDA 中返还给后端的钱包地址。

### 密码信息的去中心化解释

1. 本系统仍然保有区块链产品的关键特点：“去中心化”，即本系统不存储用户的私密信息，副作用是用户一旦遗忘个人密码信息，将丢失对账户的控制权，且无法恢复。（在未来，当系统实现账户守护功能之后，则用户可以设置亲友地址，通过亲友账户找回账户的控制权）
2. 用户的邮箱无法用于找回密码。

### 用户的 交易网络费如何支付

-   发起交易时系统自动计算当前交易所需费用，并将费用作为参数传入用户合约，交易的同时直接将费用从用户的账户中扣除。

</font>
