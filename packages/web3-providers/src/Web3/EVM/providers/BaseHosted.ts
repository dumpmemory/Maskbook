import { uniqWith } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { delay } from '@masknet/kit'
import {
    EMPTY_LIST,
    PersistentStorages,
    NetworkPluginID,
    type StorageObject,
    type UpdatableWallet,
    type Wallet,
    CrossIsolationMessages,
} from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    getDefaultChainId,
    isValidAddress,
    formatEthereumAddress,
    type ChainId,
    type ProviderType,
} from '@masknet/web3-shared-evm'
import { BaseEVMWalletProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

export abstract class BaseHostedProvider extends BaseEVMWalletProvider implements WalletAPI.HostedProvider {
    protected abstract io_renameWallet(address: string, name: string): Promise<void>
    abstract resetAllWallets(): Promise<void>
    protected walletStorage:
        | StorageObject<{
              account: string
              chainId: ChainId
              wallets: Wallet[]
          }>
        | undefined

    constructor(
        protected override providerType: ProviderType,
        protected initial?: {
            formatAddress?: () => string
            isSupportedAccount?: (account: string) => Promise<boolean>
            isSupportedChainId?: (chainId: ChainId) => Promise<boolean>
            getDefaultAccount?: () => string
            getDefaultChainId?: () => ChainId
        },
    ) {
        super(providerType)
    }

    async setup() {
        this.walletStorage = PersistentStorages.Web3.createSubScope(
            // if you change this (don't unless you have migration), please also be aware of packages/mask/background/services/wallet/services/sdk.ts
            `${NetworkPluginID.PLUGIN_EVM}_${this.providerType}_hosted`,
            {
                account: this.options.getDefaultAccount(),
                chainId: this.options.getDefaultChainId(),
                wallets: [] as Wallet[],
            },
        ).storage

        await Promise.all([
            this.walletStorage?.account.initializedPromise,
            this.walletStorage?.chainId.initializedPromise,
            this.walletStorage?.wallets.initializedPromise,
        ])
        this.onAccountChanged()
        this.onChainChanged()

        this.walletStorage?.account.subscription.subscribe(this.onAccountChanged.bind(this))
        this.walletStorage?.chainId.subscription.subscribe(this.onChainChanged.bind(this))
    }

    protected get options() {
        return {
            isSupportedAccount: () => true,
            isSupportedChainId: (chainId: number) => chainId > 0 && Number.isInteger(chainId),
            getDefaultAccount: () => '',
            getDefaultChainId,
            formatAddress: formatEthereumAddress,
            ...this.initial,
        }
    }

    override get subscription() {
        if (!this.walletStorage) return super.subscription
        return {
            account: this.walletStorage?.account.subscription,
            chainId: this.walletStorage?.chainId.subscription,
            wallets: this.walletStorage?.wallets.subscription,
        }
    }

    get wallets() {
        return this.walletStorage?.wallets.value ?? EMPTY_LIST
    }

    get hostedAccount() {
        return this.walletStorage?.account.value ?? this.options.getDefaultAccount()
    }

    get hostedChainId() {
        return this.walletStorage?.chainId.value ?? this.options.getDefaultChainId()
    }

    async addWallet(wallet: Wallet): Promise<void> {
        const now = new Date()
        const address = this.options.formatAddress(wallet.address)

        // already added
        if (this.walletStorage?.wallets.value.some((x) => isSameAddress(x.address, address))) return

        await this.walletStorage?.wallets.setValue([
            ...(this.walletStorage?.wallets.value ?? []),
            {
                ...wallet,
                id: address,
                address,
                name: wallet.name.trim() || `Account ${this.walletStorage?.wallets.value.length + 1}`,
                createdAt: now,
                updatedAt: now,
            },
        ])
    }

    async updateWallet(address: string, updates: Partial<UpdatableWallet>) {
        const wallet = this.walletStorage?.wallets.value.find((x) => isSameAddress(x.address, address))
        if (!wallet) throw new Error('Failed to find wallet.')

        const now = new Date()
        await this.walletStorage?.wallets.setValue(
            this.walletStorage?.wallets.value.map((x) =>
                isSameAddress(x.address, address) ?
                    {
                        ...x,
                        name: updates.name ?? x.name,
                        owner: updates.owner ?? x.owner,
                        identifier: updates.identifier ?? x.identifier,
                        createdAt: x.createdAt ?? now,
                        updatedAt: now,
                    }
                :   x,
            ),
        )
        CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
    }

    async renameWallet(address: string, name: string) {
        const isNameExists = this.walletStorage?.wallets.value
            .filter((x) => !isSameAddress(x.address, address))
            .some((x) => x.name === name)

        if (isNameExists) throw new Error('The wallet name already exists.')

        if (!this.walletStorage?.wallets.value.find((x) => isSameAddress(x.address, address))?.owner)
            await this.io_renameWallet(address, name)
        await this.updateWallet(address, {
            name,
        })
    }

    async removeWallet(address: string, password?: string | undefined) {
        await this.walletStorage?.wallets.setValue(
            this.walletStorage?.wallets.value?.filter((x) => !isSameAddress(x.address, address)),
        )
    }

    async updateWallets(wallets: Wallet[]): Promise<void> {
        if (!wallets.length) return
        const result = wallets.filter(
            (x) =>
                !this.walletStorage?.wallets.value.find(
                    (y) => isSameAddress(x.address, y.address) && isSameAddress(x.owner, y.owner),
                ),
        )
        await this.walletStorage?.wallets.setValue(
            uniqWith([...(this.walletStorage?.wallets.value ?? []), ...result], (a, b) =>
                isSameAddress(a.address, b.address),
            ),
        )
    }

    async removeWallets(wallets: Wallet[]): Promise<void> {
        if (!wallets.length) return
        await this.walletStorage?.wallets.setValue(
            this.walletStorage?.wallets.value?.filter((x) => !wallets.find((y) => isSameAddress(x.address, y.address))),
        )
    }

    private async onAccountChanged() {
        await this.walletStorage?.account.initializedPromise

        if (!this.hostedAccount) return

        this.emitter.emit('accounts', [this.hostedAccount])
        await delay(100)
        this.emitter.emit('chainId', web3_utils.toHex(this.hostedChainId))
    }

    private async onChainChanged() {
        await this.walletStorage?.chainId.initializedPromise
        if (this.hostedChainId) this.emitter.emit('chainId', web3_utils.toHex(this.hostedChainId))
    }

    async switchAccount(account?: string) {
        if (!isValidAddress(account)) throw new Error(`Invalid address: ${account}`)
        const supported = await this.options.isSupportedAccount(account)
        if (!supported) throw new Error(`Not supported account: ${account}`)
        await this.walletStorage?.account.setValue(account)
    }

    override async switchChain(chainId: ChainId) {
        const supported = await this.options.isSupportedChainId(chainId)
        if (!supported) throw new Error(`Not supported chain id: ${chainId}`)
        await this.walletStorage?.chainId.setValue(chainId)
    }
}
