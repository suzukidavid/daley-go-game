import { useLocalStorage } from '@solana/wallet-adapter-react';
import { createContext, FC, useContext } from 'react';

// export interface AutoConnectContextState {
//     autoConnect: boolean;
//     setAutoConnect(autoConnect: boolean): void;
// }

export const AutoConnectContext = createContext({
    autoConnect: false,
    setAutoConnect: () => {}
});

export function useAutoConnect() {
    return useContext(AutoConnectContext);
}

export const AutoConnectProvider = ({ children }) => {
    const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);

    return (
        <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>{children}</AutoConnectContext.Provider>
    );
};
