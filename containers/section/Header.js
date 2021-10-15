import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useConnection, useWallet, WalletProvider, ConnectionProvider, useLocalStorage } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAutoConnect } from '../../components/AutoConnectProvider';
import styles from '../../styles/Header.module.css'

export default function Header() {
  const { publicKey, connected, connecting, wallets, wallet, select, connect, disconnect } = useWallet();
  //const {publicKey,connected,signTransaction,sendTransaction, wallets, select, connect, wallet:theWallet} = wallet;
  //const { autoConnect, setAutoConnect } = useAutoConnect();
  const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);
  const [error, setError] = useState(false);
  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  //console.log('AutoConnect', autoConnect, 'Error', error);

  const doConnect = useCallback(()=>{
    if ( !wallet ) {
      select(wallets[0].name);
      return;
    }
    if ( connected ) return;
    // if ( !walletName && wallets.length == 1 ) {
    //   setWalletName(wallets[0].name);
    // }
    //console.log('Connecting...');
    connect().then(()=>{
      //console.log('Connect success!')
      setAutoConnect(true);
    }).catch((err)=>{
       //console.log('Error', err);
       setError(true);
    });
  },[wallet,connected])

  const text = useMemo(() => {
    // if (!wallet) {
    //   return (
    //   <div className={styles.btnWallet}>
    //     <span className={styles.btnWalletText}>Connect to a wallet</span>
    //   </div>
    //   )
    // }
    if (connecting) return (
      <div className={styles.btnWallet}>
        <span className={styles.btnWalletText}>Connecting ...</span>
      </div>
    );
    if (connected) return (
      <div className={styles.btnWallet}>
        <span className={styles.btnWalletText}>{base58.slice(0, 4) + '..' + base58.slice(-4)}</span>
      </div>
    ); //'Connected';
    // if (wallet) 
    return (
      <div className={styles.btnWalletConnect} onClick={doConnect}>
        <span className={styles.btnWalletText}>Connect to a wallet</span>
      </div>
    );
    // return 'Connect Wallet';
}, [connecting, connected, wallet, doConnect]);

  // const walletsByName = useMemo(() => wallets.reduce((walletsByName, wallet) => {
  //   walletsByName[wallet.name] = wallet;
  //   return walletsByName;
  // }, {}), [wallets]);  


  useEffect(()=>{
    //console.log('Wallets', autoConnect, error, wallet, wallets)
    if ( error ) return;
    if ( !wallet ) {
      select(wallets[0].name);
      return;
    }
    if ( connected || !autoConnect ) return;
    // if ( !walletName && wallets.length == 1 ) {
    //   setWalletName(wallets[0].name);
    // }
    //console.log('Connecting...');
    connect({ onlyIfTrusted: true }).catch((err)=>{
       //console.log('Error', err);
       setError(true);
    });
    // console.log( wallet.connected );
  },[wallet, error]);

/*   useEffect(async ()=>{
    if ( wallet.connected ) return;
    if ( walletName ) {
      const w = walletsByName[walletName];
      console.log('Wallet Name:', w.name);
      select(w.name);
      await w.adapter().connect().catch((err)=>{
        console.log('Error', err);
      });
    }
  },[walletName, walletsByName]);
 */
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <img src="/img/DG_LOGO.png"/>
      </div>
      <div className={styles.middle}>
        <div className={styles.menuBox}>
          <div className={styles.menuItem}>
            Racing
            <img src="/arrow-down.png"/>
          </div>
        </div>
        <div className={styles.menuBox}>
          <div className={styles.menuItem}>
            Marketplace
          </div>
        </div>
        <div className={styles.menuBox}>
          <div className={styles.menuItem}>
            Learn
            <img src="/arrow-down.png"/>
          </div>
        </div>
        <div className={styles.menuBox}>
          <div className={styles.menuItem}>
            What's New
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <img src="/user.png"/>
        <div className={styles.btnWalletContainer}>
            {text}
        </div>
        <img src="/btn.png"/>
      </div>
    </div>
  )
}