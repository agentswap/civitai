import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { Fragment } from 'react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { env } from '~/env/client.mjs';
import { infuraProvider } from 'wagmi/providers/infura';

export const chains = [mainnet, goerli];
const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_ID;

const { publicClient } = configureChains(chains, [
  infuraProvider({ apiKey: env.NEXT_PUBLIC_INFURA_API_KEY }),
  w3mProvider({ projectId }),
]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <Fragment>
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </Fragment>
  );
}
