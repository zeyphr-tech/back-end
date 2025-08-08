# Zeyphr – Bringing Web3 to Everyone
![Zeyphr Logo](https://res.cloudinary.com/dezo0vvpb/image/upload/v1746361459/WhatsApp_Image_2025-04-09_at_5.09.11_PM_hyxsn5.jpg)

## 🧠 About Zeyphr

Zeyphr is our startup which we are building throughout IOTA Movethon and Hedera Hello Future Trilogy under the **DeFi / Tokenization** track. Our Mission is Web3 ecommerce gateway that removes the complexity of blockchain. From email-password logins to universal tap-and-pay, QR pay Zeyphr enables anyone to buy, sell, and transact — online or offline and also allows Business to create stable coins for their businesses - Just like Web2 !!

---


## 🔗 Links

- [📹️ **Demo Video**](https://youtu.be/2_dmkKHpmGk?si=Itxnn4ckQVZE4EFu)

- [🛠️ **Pitch Deck**](https://docs.google.com/presentation/d/1BHCd-msoeLb-_6pV9gf9d7nPe008a_EfaSwtajmkBzo/edit?usp=sharing)

---

## 📂 Related Repositories

> 🔗 This repository contains the **Back end code** for Zeyphr.

You can find the rest of the Zeyphr project codes here:

- 🖥️ **POS Machine:**
    [github.com/SriranganK/zeyphr/tree/main/pos_machine](https://bit.ly/zeyphr-pos)

- ✨️ **Front End:**
    [github.com/SriranganK/zeyphr-backend](https://bit.ly/zeyphr-frontend)

- 📜 **Smart Contracts:**
    [github.com/nikhilkxmar/zeyphr-contract](https://bit.ly/zeyphr-contract)

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
RPC_URL=https://json-rpc.evm.testnet.iotaledger.net/
CONTRACT_ADDRESS="YOUR-DEPLOYED-CONTRACT-ADDRESS"
SECRET_KEY="THIS-IS-THE-SERVER-SECRET-KEY"
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


## 🧠 About Zeyphr

Zeyphr is our submission to the IOTA Movethon under the **Payments & Consumer Applications** track. Our Mission is Web3 ecommerce gateway that removes the complexity of blockchain. From email-password logins to universal tap-and-pay, QR pay Zeyphr enables anyone to buy, sell, and transact — online or offline - Just like Web2 !!

---

## ✨ Features

- 🪪 **Web2-style Login:** Email + Password with Email OTP; wallets are abstracted from the user.

- 📲 **Tap & Pay:** NFC-based crypto payments via physical Zeyphr card with in-store POS devices.
- 🔍 **Scan & Pay:** QR-based payments available on web and in-store POS devices.
- 🔐 **Secure Wallet Management:** Private keys are encrypted using user credentials and stored securely.
- 🛒 **Decentralized Marketplace:** Buy & sell physical and digital products online or in-store.

---
## 🏗 Architecture

![Zeyphr Architecture](https://res.cloudinary.com/dezo0vvpb/image/upload/v1746361408/zeyphr_arch_bnwsbz.jpg)

---
## 🛠️ Tech Stack

- **Frontend:** ReactJS , Shadcn, ethers.js
- **Backend:** Node.js with Express , Flask
- **Database:** MongoDB
- **Blockchain:** IOTA EVM, Solidity, Pinata(IPFS)
- **POS Machine**: IOT, Python, Shell Script, ReactJS
- **POS Hardware**: Raspberry Pi 5, Display(XPT2046), NFC Sensor(PN532)