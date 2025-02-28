import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import type { ChainId, GasConfig, Transaction } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { SwapQuoteResponse, TradeComputed } from '../../types/index.js'
import { SUPPORTED_CHAIN_ID_LIST } from './constants.js'
import { useSwapErrorCallback } from '../../SNSAdaptor/trader/hooks/useSwapErrorCallback.js'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null, gasConfig?: GasConfig) {
    const notifyError = useSwapErrorCallback()
    const connection = useWeb3Connection()
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()

    const config = useMemo(() => {
        if (
            !account ||
            !tradeComputed?.trade_ ||
            pluginID !== NetworkPluginID.PLUGIN_EVM ||
            !SUPPORTED_CHAIN_ID_LIST.includes(chainId as ChainId)
        )
            return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
            ...gasConfig,
        } as Transaction
    }, [account, tradeComputed, gasConfig])

    return useAsyncFn(async () => {
        if (!account || !config || !tradeComputed || !connection || !tradeComputed.trade_) {
            return
        }

        try {
            const gas = await connection.estimateTransaction?.({
                from: account,
                ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
            })
            const hash = await connection.sendTransaction(
                {
                    ...config,
                    gas,
                },
                { chainId, overrides: { ...gasConfig } },
            )
            const receipt = await connection.getTransactionReceipt(hash)

            return receipt?.transactionHash
        } catch (error: unknown) {
            if (error instanceof Error) {
                notifyError(error.message)
            }
            return
        }
    }, [connection, account, chainId, stringify(config), gasConfig, pluginID])
}
