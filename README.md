# Pollar

**Decentralized, Privacy-Preserving Voting Platform on Sui**

Pollar is a decentralized application (dApp) that enables secure, anonymous, and verifiable voting experiences for communities and DAOs on the Sui blockchain. The platform combines Sui Seal encryption for privacy-preserving votes, zkLogin for seamless user onboarding, and NFT-gated access controls for exclusive voting rights.

## Overview

Pollar revolutionizes on-chain governance by providing:

- **Privacy-First Voting**: Votes are encrypted using Mysten Seal before being submitted on-chain, ensuring voter anonymity while maintaining transparency of aggregate results
- **Seamless Authentication**: Users can sign in with Google accounts via zkLogin, eliminating the need to manage private keys
- **NFT-Gated Polls**: Create polls restricted to holders of specific NFT collections, perfect for DAO governance and community decisions
- **Fully On-Chain Logic**: Smart contracts written in Sui Move ensure security, speed, and transparency
- **Real-Time Updates**: Event-driven architecture provides instant poll updates and vote tallies

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM 7
- **UI Components**: Radix UI Themes
- **Styling**: CSS Modules, GSAP for animations
- **Charts**: Recharts
- **Testing**: Vitest with React Testing Library

### Blockchain Integration
- **Network**: Sui Network (Testnet/Mainnet)
- **Wallet**: Mysten dApp Kit
- **Authentication**: Mysten Enoki (zkLogin)
- **Encryption**: Mysten Seal
- **Smart Contracts**: Sui Move

### Backend Services
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Walrus Sites

## Prerequisites

Before setting up Pollar, ensure you have the following installed:

- **Node.js**: Version 18 or higher
- **Package Manager**: npm or pnpm (pnpm recommended)
- **Sui CLI**: For smart contract development and deployment
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pollar.git
cd pollar
```

### 2. Install Dependencies

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Or if using pnpm:

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the `frontend` directory. You can use the `.env copy.example` file as a template:

```bash
cp ".env copy.example" .env
```

Edit the `.env` file and configure the following environment variables:

#### Required Variables

**Enoki Configuration**
- `VITE_ENOKI_API_KEY`: Your Enoki API key from [Enoki Portal](https://portal.enoki.mystenlabs.com)
- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/)

**Smart Contract Configuration**
- `VITE_PACKAGE_ID`: The deployed Move contract package ID (obtained after publishing the contract)

**Supabase Configuration**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

#### Optional Variables

- `VITE_POLL_REGISTRY_ID`: PollRegistry object ID (if not set, the app will attempt to find it automatically)

Example `.env` file:

```env
VITE_ENOKI_API_KEY=your_enoki_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_PACKAGE_ID=your_package_id_here
VITE_POLL_REGISTRY_ID=your_poll_registry_id_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (for production)
6. Add authorized redirect URIs:
   - `http://localhost:5173/login` (for development)
   - `https://yourdomain.com/login` (for production)
7. Copy the Client ID to your `.env` file

### 5. Configure Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Project Settings > API
3. Copy the Project URL and anon/public key
4. Add them to your `.env` file
5. Set up the required database tables (see Database Schema section below)

### 6. Deploy Smart Contracts

Navigate to the Move contracts directory:

```bash
cd ../move
```

Build the contracts:

```bash
sui move build
```

Run tests:

```bash
sui move test
```

Publish the contract to Sui testnet:

```bash
sui client publish --gas-budget 10000000
```

Copy the Package ID from the output and add it to your `.env` file as `VITE_PACKAGE_ID`.

## Running the Application

### Development Mode

Start the development server:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

Build the application:

```bash
npm run build
```

The production build will be created in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Testing

Run unit tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Deployment

### Walrus Sites Deployment (Testnet)

Pollar can be deployed to Walrus Sites for decentralized hosting on Sui.

#### Prerequisites

1. Install Walrus CLI and site-builder tools
2. Configure your Sui wallet for testnet
3. Build the frontend application

#### Configuration

1. Edit `sites-config.yaml` in the `frontend` directory
2. Ensure your wallet is configured correctly
3. Update the `object_id` in `dist/ws-resources.json` if updating an existing site

#### Deploy Command

```bash
cd frontend
npm run build
site-builder --config ./sites-config.yaml --context=testnet deploy ./dist --epochs 1
```

#### First-Time Deployment

For the first deployment, remove the `object_id` field from `dist/ws-resources.json`. The site-builder will create a new site and automatically add the `object_id` to the file.

#### Updating Existing Site

To update an existing site, ensure the `object_id` in `dist/ws-resources.json` matches your site object ID. The deploy command will update the existing site.

#### Accessing Your Site

After deployment, you will receive:
- A local development URL (for testnet)
- Instructions for self-hosting a portal
- Information about bringing your own domain

Note: wal.app only supports sites deployed on mainnet. For testnet sites, you need to self-host a portal or use a third-party hosted testnet portal.

## Project Structure

```
Pollar/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── config/           # Configuration files
│   │   ├── constants/        # Application constants
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── styles/           # Global styles
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   ├── dist/                 # Production build output
│   ├── sites-config.yaml     # Walrus Sites configuration
│   └── package.json
├── move/                     # Sui Move smart contracts
│   ├── sources/              # Move source files
│   ├── tests/                # Move test files
│   └── Move.toml             # Move package configuration
└── README.md
```

## Smart Contracts

The core voting logic is implemented in Sui Move smart contracts located in the `move/` directory.

### Main Module: `pollar.move`

**Key Structures:**
- `Poll`: Shared object storing poll metadata (title, description, options, start/end times, NFT requirements)
- `VoteRegistry`: Dynamic object handling encrypted vote storage
- `User`: Object representing a registered user

**Key Functions:**
- `mint_user`: Register a new user on-chain
- `mint_poll`: Create a new poll
- `vote_sealed`: Submit an encrypted vote (public polls)
- `vote_sealed_with_nft`: Submit an encrypted vote with NFT ownership validation (NFT-gated polls)

### Building and Testing Contracts

```bash
cd move
sui move build
sui move test
```

### Publishing Contracts

```bash
sui client publish --gas-budget 10000000
```

## Database Schema

Pollar uses Supabase (PostgreSQL) for user profiles and vote tracking. The following tables are required:

### User Profiles Table

```sql
CREATE TABLE user_profiles (
  wallet_address TEXT PRIMARY KEY,
  username TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Vote Tracking Table

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  poll_id TEXT NOT NULL,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, poll_id)
);
```

## Configuration Files

### `sites-config.yaml`

Configuration file for Walrus Sites deployment. Contains:
- Network contexts (testnet/mainnet)
- Package IDs
- Wallet configuration
- Portal settings

### `ws-resources.json`

Walrus Sites resource configuration. Contains:
- Route mappings for SPA routing
- Site name
- Site object ID (for updates)

## Troubleshooting

### Environment Variables Not Loading

- Ensure all environment variables are prefixed with `VITE_`
- Restart the development server after changing `.env` file
- Check that the `.env` file is in the `frontend` directory

### Google OAuth Errors

- Verify redirect URIs match exactly in Google Cloud Console
- Ensure the domain is added to authorized JavaScript origins
- Check that the Client ID is correct in `.env`

### Supabase Connection Issues

- Verify the Supabase URL and anon key are correct
- Check that the database tables are created
- Ensure Row Level Security (RLS) policies are configured if needed

### Smart Contract Errors

- Verify the `VITE_PACKAGE_ID` matches your deployed contract
- Ensure the contract is deployed to the correct network (testnet/mainnet)
- Check that the PollRegistry object ID is correct if manually set

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure Node.js version is 18 or higher

### Deployment Issues

- Verify wallet configuration in `sites-config.yaml`
- Check that the `object_id` in `ws-resources.json` matches your site (for updates)
- Ensure the frontend is built before deploying: `npm run build`
- Verify you have sufficient SUI tokens for gas fees

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Maintain consistent naming conventions

### Component Structure

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props and data structures
- Implement proper error boundaries

### Testing

- Write unit tests for utility functions
- Test custom hooks in isolation
- Use React Testing Library for component tests
- Maintain test coverage above 70%

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
