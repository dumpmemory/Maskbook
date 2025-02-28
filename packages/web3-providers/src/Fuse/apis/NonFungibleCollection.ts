import Fuse from 'fuse.js'
import type { FuseBaseAPI } from '../../types/Fuse.js'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export class FuseNonFungibleCollectionAPI implements FuseBaseAPI.Provider {
    create<T = NonFungibleCollection<ChainId, SchemaType>>(items: T[]) {
        return new Fuse(items, {
            keys: [
                { name: 'name', weight: 0.5 },
                { name: 'symbol', weight: 0.8 },
                { name: 'address', weight: 1 },
            ],
            shouldSort: true,
            threshold: 0.45,
            minMatchCharLength: 3,
        })
    }
}
