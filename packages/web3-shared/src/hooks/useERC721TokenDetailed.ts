import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { ERC721TokenDetailed, EthereumTokenType } from '../types'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useChainId } from './useChainId'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useSingleContractMultipleData } from './useMulticall'
import { formatEthereumAddress } from '../utils'

export function useERC721TokenDetailed(address?: string, token?: Partial<ERC721TokenDetailed>) {
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(address)

    // compose calls
    const { names, callDatas } = useMemo(
        () => ({
            names: ['name', 'symbol', 'baseURI', 'tokenURI'] as 'name'[],
            callDatas: Array.from<[]>({ length: 3 }).fill([]),
        }),
        [],
    )

    // validate
    const [results, calls, _, callback] = useSingleContractMultipleData(erc721TokenContract, names, callDatas)
    const asyncResult = useAsyncRetry(() => callback(calls), [erc721TokenContract, names, callDatas, chainId])

    // compose
    const token_ = useMemo(() => {
        if (!address || !erc721TokenContract) return
        const [
            name = token?.name ?? '',
            symbol = token?.symbol ?? '',
            baseURI = token?.baseURI ?? '',
            tokenURI = token?.tokenURI ?? '',
        ] = results.map((x) => (x.succeed ? x.value : undefined))
        return {
            type: EthereumTokenType.ERC721,
            address: formatEthereumAddress(address),
            chainId,
            name,
            symbol,
            baseURI,
            tokenURI,
        } as ERC721TokenDetailed
    }, [erc721TokenContract, address, chainId, results, token?.name, token?.symbol, token?.baseURI])

    return {
        ...asyncResult,
        value: token_,
    } as AsyncStateRetry<typeof token_>
}
