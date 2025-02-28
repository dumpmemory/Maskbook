/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type BN from 'bn.js'
import type { ContractOptions } from 'web3-eth-contract'
import type { EventLog } from 'web3-core'
import type { EventEmitter } from 'events'
import type {
    Callback,
    PayableTransactionObject,
    NonPayableTransactionObject,
    BlockType,
    ContractEventLog,
    BaseContract,
} from './types.js'

export interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export type OwnershipTransferred = ContractEventLog<{
    previousOwner: string
    newOwner: string
    0: string
    1: string
}>
export type Qualification = ContractEventLog<{
    account: string
    qualified: boolean
    blockNumber: string
    timestamp: string
    0: string
    1: boolean
    2: string
    3: string
}>

export interface Qualification2 extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): Qualification2
    clone(): Qualification2
    methods: {
        get_start_time(): NonPayableTransactionObject<string>

        ifQualified(
            account: string,
            data: (string | number[])[],
        ): NonPayableTransactionObject<{
            qualified: boolean
            errorMsg: string
            0: boolean
            1: string
        }>

        logQualified(
            account: string,
            data: (string | number[])[],
        ): NonPayableTransactionObject<{
            qualified: boolean
            errorMsg: string
            0: boolean
            1: string
        }>

        owner(): NonPayableTransactionObject<string>

        renounceOwnership(): NonPayableTransactionObject<void>

        set_start_time(_start_time: number | string | BN): NonPayableTransactionObject<void>

        start_time(): NonPayableTransactionObject<string>

        supportsInterface(interfaceId: string | number[]): NonPayableTransactionObject<boolean>

        transferOwnership(newOwner: string): NonPayableTransactionObject<void>
    }
    events: {
        OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter
        OwnershipTransferred(options?: EventOptions, cb?: Callback<OwnershipTransferred>): EventEmitter

        Qualification(cb?: Callback<Qualification>): EventEmitter
        Qualification(options?: EventOptions, cb?: Callback<Qualification>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'OwnershipTransferred', cb: Callback<OwnershipTransferred>): void
    once(event: 'OwnershipTransferred', options: EventOptions, cb: Callback<OwnershipTransferred>): void

    once(event: 'Qualification', cb: Callback<Qualification>): void
    once(event: 'Qualification', options: EventOptions, cb: Callback<Qualification>): void
}
