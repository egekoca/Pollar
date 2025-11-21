# Pollar 🐻‍❄️

**Decentralized, Privacy-Preserving Voting Platform on Sui**

> Built for the Sui Hackathon.

Pollar is a next-generation decentralized application (dApp) that revolutionizes on-chain governance. By combining **Sui Seal** for privacy and **zkLogin** for seamless onboarding, Pollar enables secure, anonymous, and verifiable voting experiences for communities and DAOs.

## 🏆 Key Features

### 🔒 Privacy-First Voting (Powered by Seal)
Unlike traditional blockchain voting where choices are public, Pollar encrypts every vote using **Mysten Seal**.
- Votes are encrypted on the client side before being submitted on-chain.
- Ensures voter privacy while maintaining the transparency of the total tally.
- Only the aggregate results are verifiable, protecting individual choices.

### 🔑 Seamless Onboarding (zkLogin / Enoki)
Forget managing complex private keys just to cast a vote.
- Users can sign in with their **Google accounts**.
- Powered by **Mysten Enoki** and zkLogin primitives.
- Bridges the gap between Web2 usability and Web3 security.

### 🎨 NFT-Gated Polls
Empower your community with exclusive voting rights.
- Create polls that are restricted to holders of specific NFT collections.
- The smart contract validates ownership at runtime (`vote_sealed_with_nft`).
- Perfect for DAO governance, community decisions, and exclusive events.

### ⚡ Fully On-Chain Logic
- **Smart Contracts:** Written in **Sui Move**, ensuring speed and security.
- **Dynamic Data:** Utilizes Sui's Dynamic Fields for scalable vote registries.
- **Real-time:** Instant updates and event-driven architecture.

---

## 🛠️ Tech Stack

- **Blockchain:** Sui Network (Testnet/Mainnet)
- **Smart Contracts:** Move Language
- **Frontend:** React, Vite, TypeScript
- **Styling:** Radix UI, CSS Modules, GSAP (Animations)
- **Integration:** 
  - `@mysten/dapp-kit` (Wallet & RPC)
  - `@mysten/seal` (Encryption)
  - `@mysten/enoki` (zkLogin Auth)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Sui CLI** (for smart contract development)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pollar.git
cd pollar
```

### 2. Frontend Setup
Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
# or
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in the `frontend` directory. You will need API keys from the [Enoki Portal](https://portal.enoki.mystenlabs.com).

```env
VITE_ENOKI_API_KEY=your_public_enoki_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Run the Application
Start the development server:

```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 📜 Smart Contracts

The core logic resides in the `move/` directory:

- **`pollar.move`**: The main module containing:
  - `Poll`: Shared object storing poll metadata.
  - `VoteRegistry`: Dynamic object handling vote storage.
  - `vote_sealed`: Function for encrypted voting.
  - `vote_sealed_with_nft`: Function for NFT-gated encrypted voting.

To build and test contracts:
```bash
cd move
sui move build
sui move test
```

---

## 🤝 License

This project is open source and available under the [MIT License](LICENSE).

