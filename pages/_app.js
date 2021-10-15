import { withRouter } from "next/router";
import { appWithTranslation } from "next-i18next";
import dynamic from 'next/dynamic';
import Head from "next/head";
import nextI18NextConfig from '../next-i18next.config.js'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');


const ContextProvider = dynamic(() => import('../components/ContextProvider'), {
  ssr: false,
});

function MainApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <link rel="stylesheet" href="/styles/common.css" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ContextProvider>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </ContextProvider>
    </>
  )
}

export default withRouter(appWithTranslation(MainApp, nextI18NextConfig))
