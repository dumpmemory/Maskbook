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

export type Approval = ContractEventLog<{
    owner: string
    approved: string
    tokenId: string
    0: string
    1: string
    2: string
}>
export type ApprovalForAll = ContractEventLog<{
    owner: string
    operator: string
    approved: boolean
    0: string
    1: string
    2: boolean
}>
export type Transfer = ContractEventLog<{
    from: string
    to: string
    tokenId: string
    0: string
    1: string
    2: string
}>

export interface LensHub extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): LensHub
    clone(): LensHub
    methods: {
        DANGER__disableTokenGuardian(): NonPayableTransactionObject<void>

        act(
            publicationActionParams: [
                number | string | BN,
                number | string | BN,
                number | string | BN,
                (number | string | BN)[],
                (number | string | BN)[],
                string,
                string | number[],
            ],
        ): NonPayableTransactionObject<string>

        actWithSig(
            publicationActionParams: [
                number | string | BN,
                number | string | BN,
                number | string | BN,
                (number | string | BN)[],
                (number | string | BN)[],
                string,
                string | number[],
            ],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<string>

        approve(to: string, tokenId: number | string | BN): NonPayableTransactionObject<void>

        balanceOf(owner: string): NonPayableTransactionObject<string>

        batchMigrateFollowModules(profileIds: (number | string | BN)[]): NonPayableTransactionObject<void>

        batchMigrateFollowers(
            followerProfileIds: (number | string | BN)[],
            idOfProfileFollowed: number | string | BN,
            followTokenIds: (number | string | BN)[],
        ): NonPayableTransactionObject<void>

        batchMigrateFollows(
            followerProfileId: number | string | BN,
            idsOfProfileFollowed: (number | string | BN)[],
            followTokenIds: (number | string | BN)[],
        ): NonPayableTransactionObject<void>

        batchMigrateProfiles(profileIds: (number | string | BN)[]): NonPayableTransactionObject<void>

        burn(tokenId: number | string | BN): NonPayableTransactionObject<void>

        'changeDelegatedExecutorsConfig(uint256,address[],bool[],uint64,bool)'(
            delegatorProfileId: number | string | BN,
            delegatedExecutors: string[],
            approvals: boolean[],
            configNumber: number | string | BN,
            switchToGivenConfig: boolean,
        ): NonPayableTransactionObject<void>

        'changeDelegatedExecutorsConfig(uint256,address[],bool[])'(
            delegatorProfileId: number | string | BN,
            delegatedExecutors: string[],
            approvals: boolean[],
        ): NonPayableTransactionObject<void>

        changeDelegatedExecutorsConfigWithSig(
            delegatorProfileId: number | string | BN,
            delegatedExecutors: string[],
            approvals: boolean[],
            configNumber: number | string | BN,
            switchToGivenConfig: boolean,
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<void>

        collectLegacy(
            collectParams: [
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                string | number[],
            ],
        ): NonPayableTransactionObject<string>

        collectLegacyWithSig(
            collectParams: [
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                string | number[],
            ],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<string>

        comment(
            commentParams: [
                number | string | BN,
                string,
                number | string | BN,
                number | string | BN,
                (number | string | BN)[],
                (number | string | BN)[],
                string | number[],
                string[],
                (string | number[])[],
                string,
                string | number[],
            ],
        ): NonPayableTransactionObject<string>

        commentWithSig(
            commentParams: [
                number | string | BN,
                string,
                number | string | BN,
                number | string | BN,
                (number | string | BN)[],
                (number | string | BN)[],
                string | number[],
                string[],
                (string | number[])[],
                string,
                string | number[],
            ],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<string>

        createProfile(createProfileParams: [string, string, string | number[]]): NonPayableTransactionObject<string>

        emitCollectNFTTransferEvent(
            profileId: number | string | BN,
            pubId: number | string | BN,
            collectNFTId: number | string | BN,
            from: string,
            to: string,
        ): NonPayableTransactionObject<void>

        emitUnfollowedEvent(
            unfollowerProfileId: number | string | BN,
            idOfProfileUnfollowed: number | string | BN,
            transactionExecutor: string,
        ): NonPayableTransactionObject<void>

        enableTokenGuardian(): NonPayableTransactionObject<void>

        exists(tokenId: number | string | BN): NonPayableTransactionObject<boolean>

        follow(
            followerProfileId: number | string | BN,
            idsOfProfilesToFollow: (number | string | BN)[],
            followTokenIds: (number | string | BN)[],
            datas: (string | number[])[],
        ): NonPayableTransactionObject<string[]>

        followWithSig(
            followerProfileId: number | string | BN,
            idsOfProfilesToFollow: (number | string | BN)[],
            followTokenIds: (number | string | BN)[],
            datas: (string | number[])[],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<string[]>

        getApproved(tokenId: number | string | BN): NonPayableTransactionObject<string>

        getContentURI(profileId: number | string | BN, pubId: number | string | BN): NonPayableTransactionObject<string>

        getDelegatedExecutorsConfigNumber(delegatorProfileId: number | string | BN): NonPayableTransactionObject<string>

        getDelegatedExecutorsMaxConfigNumberSet(
            delegatorProfileId: number | string | BN,
        ): NonPayableTransactionObject<string>

        getDelegatedExecutorsPrevConfigNumber(
            delegatorProfileId: number | string | BN,
        ): NonPayableTransactionObject<string>

        getDomainSeparator(): NonPayableTransactionObject<string>

        getFollowNFTImpl(): NonPayableTransactionObject<string>

        getGovernance(): NonPayableTransactionObject<string>

        getLegacyCollectNFTImpl(): NonPayableTransactionObject<string>

        getModuleRegistry(): NonPayableTransactionObject<string>

        getProfile(
            profileId: number | string | BN,
        ): NonPayableTransactionObject<[string, string, string, string, string, string, string]>

        getProfileIdByHandleHash(handleHash: string | number[]): NonPayableTransactionObject<string>

        getPublication(
            profileId: number | string | BN,
            pubId: number | string | BN,
        ): NonPayableTransactionObject<[string, string, string, string, string, string, string, string, string]>

        getPublicationType(
            profileId: number | string | BN,
            pubId: number | string | BN,
        ): NonPayableTransactionObject<string>

        getState(): NonPayableTransactionObject<string>

        getTokenGuardianDisablingTimestamp(wallet: string): NonPayableTransactionObject<string>

        getTreasury(): NonPayableTransactionObject<string>

        getTreasuryData(): NonPayableTransactionObject<{
            0: string
            1: string
        }>

        getTreasuryFee(): NonPayableTransactionObject<string>

        initialize(name: string, symbol: string, newGovernance: string): NonPayableTransactionObject<void>

        isActionModuleEnabledInPublication(
            profileId: number | string | BN,
            pubId: number | string | BN,
            module: string,
        ): NonPayableTransactionObject<boolean>

        isApprovedForAll(owner: string, operator: string): NonPayableTransactionObject<boolean>

        isBlocked(
            profileId: number | string | BN,
            byProfileId: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        'isDelegatedExecutorApproved(uint256,address)'(
            delegatorProfileId: number | string | BN,
            delegatedExecutor: string,
        ): NonPayableTransactionObject<boolean>

        'isDelegatedExecutorApproved(uint256,address,uint64)'(
            delegatorProfileId: number | string | BN,
            delegatedExecutor: string,
            configNumber: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        isFollowing(
            followerProfileId: number | string | BN,
            followedProfileId: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        isProfileCreatorWhitelisted(profileCreator: string): NonPayableTransactionObject<boolean>

        mintTimestampOf(tokenId: number | string | BN): NonPayableTransactionObject<string>

        mirror(
            mirrorParams: [
                number | string | BN,
                string,
                number | string | BN,
                number | string | BN,
                (number | string | BN)[],
                (number | string | BN)[],
                string | number[],
            ],
        ): NonPayableTransactionObject<string>

        mirrorWithSig(
            mirrorParams: [
                number | string | BN,
                string,
                number | string | BN,
                number | string | BN,
                (number | string | BN)[],
                (number | string | BN)[],
                string | number[],
            ],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<string>

        name(): NonPayableTransactionObject<string>

        nonces(signer: string): NonPayableTransactionObject<string>

        ownerOf(tokenId: number | string | BN): NonPayableTransactionObject<string>

        post(
            postParams: [number | string | BN, string, string[], (string | number[])[], string, string | number[]],
        ): NonPayableTransactionObject<string>

        postWithSig(
            postParams: [number | string | BN, string, string[], (string | number[])[], string, string | number[]],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<string>

        quote(
            quoteParams: [
                number | string | BN,
                string,
                number | string | BN,
                number | string | BN,
                (number | string | BN)[],
                (number | string | BN)[],
                string | number[],
                string[],
                (string | number[])[],
                string,
                string | number[],
            ],
        ): NonPayableTransactionObject<string>

        quoteWithSig(
            quoteParams: [
                number | string | BN,
                string,
                number | string | BN,
                number | string | BN,
                (number | string | BN)[],
                (number | string | BN)[],
                string | number[],
                string[],
                (string | number[])[],
                string,
                string | number[],
            ],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<string>

        royaltyInfo(
            tokenId: number | string | BN,
            salePrice: number | string | BN,
        ): NonPayableTransactionObject<{
            0: string
            1: string
        }>

        'safeTransferFrom(address,address,uint256)'(
            from: string,
            to: string,
            tokenId: number | string | BN,
        ): NonPayableTransactionObject<void>

        'safeTransferFrom(address,address,uint256,bytes)'(
            from: string,
            to: string,
            tokenId: number | string | BN,
            _data: string | number[],
        ): NonPayableTransactionObject<void>

        setApprovalForAll(operator: string, approved: boolean): NonPayableTransactionObject<void>

        setBlockStatus(
            byProfileId: number | string | BN,
            idsOfProfilesToSetBlockStatus: (number | string | BN)[],
            blockStatus: boolean[],
        ): NonPayableTransactionObject<void>

        setBlockStatusWithSig(
            byProfileId: number | string | BN,
            idsOfProfilesToSetBlockStatus: (number | string | BN)[],
            blockStatus: boolean[],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<void>

        setEmergencyAdmin(newEmergencyAdmin: string): NonPayableTransactionObject<void>

        setFollowModule(
            profileId: number | string | BN,
            followModule: string,
            followModuleInitData: string | number[],
        ): NonPayableTransactionObject<void>

        setFollowModuleWithSig(
            profileId: number | string | BN,
            followModule: string,
            followModuleInitData: string | number[],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<void>

        setGovernance(newGovernance: string): NonPayableTransactionObject<void>

        setMigrationAdmins(migrationAdmins: string[], whitelisted: boolean): NonPayableTransactionObject<void>

        setProfileMetadataURI(profileId: number | string | BN, metadataURI: string): NonPayableTransactionObject<void>

        setProfileMetadataURIWithSig(
            profileId: number | string | BN,
            metadataURI: string,
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<void>

        setRoyalty(royaltiesInBasisPoints: number | string | BN): NonPayableTransactionObject<void>

        setState(newState: number | string | BN): NonPayableTransactionObject<void>

        setTreasury(newTreasury: string): NonPayableTransactionObject<void>

        setTreasuryFee(newTreasuryFee: number | string | BN): NonPayableTransactionObject<void>

        supportsInterface(interfaceId: string | number[]): NonPayableTransactionObject<boolean>

        symbol(): NonPayableTransactionObject<string>

        tokenDataOf(tokenId: number | string | BN): NonPayableTransactionObject<[string, string]>

        tokenURI(tokenId: number | string | BN): NonPayableTransactionObject<string>

        totalSupply(): NonPayableTransactionObject<string>

        transferFrom(from: string, to: string, tokenId: number | string | BN): NonPayableTransactionObject<void>

        unfollow(
            unfollowerProfileId: number | string | BN,
            idsOfProfilesToUnfollow: (number | string | BN)[],
        ): NonPayableTransactionObject<void>

        unfollowWithSig(
            unfollowerProfileId: number | string | BN,
            idsOfProfilesToUnfollow: (number | string | BN)[],
            signature: [string, number | string | BN, string | number[], string | number[], number | string | BN],
        ): NonPayableTransactionObject<void>

        whitelistProfileCreator(profileCreator: string, whitelist: boolean): NonPayableTransactionObject<void>
    }
    events: {
        Approval(cb?: Callback<Approval>): EventEmitter
        Approval(options?: EventOptions, cb?: Callback<Approval>): EventEmitter

        ApprovalForAll(cb?: Callback<ApprovalForAll>): EventEmitter
        ApprovalForAll(options?: EventOptions, cb?: Callback<ApprovalForAll>): EventEmitter

        Transfer(cb?: Callback<Transfer>): EventEmitter
        Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'Approval', cb: Callback<Approval>): void
    once(event: 'Approval', options: EventOptions, cb: Callback<Approval>): void

    once(event: 'ApprovalForAll', cb: Callback<ApprovalForAll>): void
    once(event: 'ApprovalForAll', options: EventOptions, cb: Callback<ApprovalForAll>): void

    once(event: 'Transfer', cb: Callback<Transfer>): void
    once(event: 'Transfer', options: EventOptions, cb: Callback<Transfer>): void
}
