# Zeyphr – Bringing Web3 to Everyone
![Zeyphr Logo](https://res.cloudinary.com/dezo0vvpb/image/upload/v1746361459/WhatsApp_Image_2025-04-09_at_5.09.11_PM_hyxsn5.jpg)

## 🧠 About Zeyphr

**Zeyphr** is a next-generation, multi-chain commerce and payments platform bringing the power of Web3 to everyday users — without the complexity.  

When users sign up, they’re instantly provisioned with a **Hedera account** (with future support for IOTA, Bitcoin, Ethereum, Solana, and more) to send, receive, and store crypto as easily as any Web2 app.  

### 🚀 For Digital Creators & Sellers
- 💳 **Integrated crypto + fiat payments**  
- 🪙 **Custom stablecoins** for loyalty & exclusivity  
- 🎨 **NFT support** for unique digital assets  
- 🏪 **POS integration** for physical commerce, showcasing Hedera’s scalability  

### 🛠 Under the Hood
- 🔗 **Hedera Token Service (HTS)** for token & NFT minting and management  
- ⏱ **Hedera Consensus Service (HCS)** for real-time product listings and updates  
- 🔐 **Secure in-house key management**, abstracting blockchain complexity  

### 🌟 Our Edge
Frictionless onboarding, cross-chain compatibility, and loyalty programs powered by stablecoins — making Web3 commerce practical, scalable, and rewarding. 

---

## ✨ Features

- 🪪 **Web2-style Login:** Email + Password with Email OTP; wallets are abstracted from the user.

- 📲 **Tap & Pay:** NFC-based crypto payments via physical Zeyphr card with in-store POS devices.
- 🔍 **Scan & Pay:** QR-based payments available on web and in-store POS devices.
- 🔐 **Secure Wallet Management:** Private keys are encrypted using user credentials and stored securely.
- 🛒 **Decentralized Marketplace:** Buy & sell physical and digital products online or in-store.

---

## 🔗 Links

- [📹️ **Demo Video**](https://youtu.be/2_dmkKHpmGk?si=Itxnn4ckQVZE4EFu)

- [🛠️ **Pitch Deck**](https://docs.google.com/presentation/d/1ToWP1_WXy51SQc3bLjQ9hUUs-x2sUh4-0DLETQSlCIs/edit?usp=sharing)

---

## 📂 Related Repositories

> 🔗 This repository contains the **Back end code** for Zeyphr.

You can find the rest of the Zeyphr project codes here:

- 🖥️ **POS Machine:**
    [zeyphr-tech/posmachine](https://github.com/zeyphr-tech/posmachine)

- ✨️ **Front End:**
    [zeyphr-tech/front-end](https://github.com/zeyphr-tech/front-end)

---

## 🔨 Setup

1. Create a free database on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) with a collection named `zeyphr`
2. Create a free account on [Pinata](https://pinata.cloud/)
3. Kindly change the email address at `line 8 in src/utils/email.ts`

Your `.env` file should look something like this.

```
PORT=
MONGODB_URI=mongodb+srv://your_user:your_pass@cluster.mongodb.net/zeyphr
PINATA_API_KEY=
PINATA_SECRET_API_KEY=
JWT_SECRET=
EMAIL_PASSKEY="YOUR-EMAIL-PASSWORD"
SECRET_KEY="THIS-IS-THE-SERVER-SECRET-KEY"
ACCOUNT_ID=
PRIVATE_KEY=
NFT_COLLECTION=
MARKETPLACE_ID=
MARKETPLACE_KEY=
```

---

## ⚽ Usage

```
1. npm install
2. npm run dev
```

---

## 🚀 Live Demo

🔗 [Try Zeyphr Now](https://zeyphr.netlify.app/)

> Create your account and experience the future of decentralized commerce with **Zeyphr**
---

## 🏗 Architecture

![Zeyphr Architecture](https://res.cloudinary.com/djeteilo6/image/upload/v1754685065/zeyphr_arch_allhedera_w4lkdq.jpg)

---
## 🛠️ Tech Stack

- **Frontend:** ReactJS , Shadcn
- **Backend:** Node.js with Express , Flask
- **Database:** MongoDB
- **Blockchain:** Hashgraph Hedera, IOTA EVM, Solidity, Pinata(IPFS)
- **POS Machine**: IOT, Python, Shell Script, ReactJS
- **POS Hardware**: Raspberry Pi 5, Display(XPT2046), NFC Sensor(PN532)