import { skipToken, useQuery } from '@tanstack/react-query'
import { useWallet } from '@masknet/web3-hooks-base'
import Services from '#services'

export function useConnectedOrigins() {
    const wallet = useWallet()
    const address = wallet?.address
    return useQuery({
        queryKey: ['wallet-granted-origins', address],
        queryFn: address ? async () => Services.Wallet.getAllConnectedOrigins(address, 'any') : skipToken,
        enabled: !!address,
        networkMode: 'always',
        select(data) {
            return [...data].sort((a, b) => a.localeCompare(b, 'en-US'))
        },
    })
}
