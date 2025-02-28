import {
    NextIDPlatform,
    fromHex,
    toBase64,
    type BindingProof,
    type NextIDAction,
    type NextIDBindings,
    type NextIDErrorBody,
    type NextIDIdentity,
    type NextIDPayload,
    type NextIDPersonaBindings,
} from '@masknet/shared-base'
import { first, uniqWith } from 'lodash-es'
import urlcat from 'urlcat'
import { fetchJSON } from '../entry-helpers.js'
import type { NextIDBaseAPI } from '../entry-types.js'
import {
    PROOF_BASE_URL_DEV,
    PROOF_BASE_URL_PROD,
    RELATION_SERVICE_URL,
    TWITTER_HANDLER_VERIFY_URL,
} from './constants.js'
import { staleNextIDCached } from './helpers.js'

const BASE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production' ? PROOF_BASE_URL_PROD : PROOF_BASE_URL_DEV
interface CreatePayloadBody {
    action: string
    platform: string
    identity: string
    public_key: string
}

type PostContentLanguages = 'default' | 'zh_CN'

interface CreatePayloadResponse {
    post_content: {
        [key in PostContentLanguages]: string
    }
    sign_payload: string
    uuid: string
    created_at: string
}

/**
 * Lens account queried from next id
 */
export interface LensAccount {
    lens: string
    displayName: string
    address: string
}

const getPersonaQueryURL = (platform: string, identity: string) =>
    urlcat(BASE_URL, '/v1/proof', {
        platform,
        identity,
    })

const getExistedBindingQueryURL = (platform: string, identity: string, personaPublicKey: string) =>
    urlcat(BASE_URL, '/v1/proof/exists', {
        platform,
        identity,
        public_key: personaPublicKey,
    })

export class NextIDProofAPI implements NextIDBaseAPI.Proof {
    async bindProof(
        uuid: string,
        personaPublicKey: string,
        action: NextIDAction,
        platform: string,
        identity: string,
        createdAt: string,
        options?: {
            walletSignature?: string
            signature?: string
            proofLocation?: string
        },
    ) {
        const requestBody = {
            uuid,
            action,
            platform,
            identity,
            public_key: personaPublicKey,
            proof_location: options?.proofLocation,
            extra: {
                wallet_signature: options?.walletSignature ? toBase64(fromHex(options.walletSignature)) : undefined,
                signature: options?.signature ? toBase64(fromHex(options.signature)) : undefined,
            },
            created_at: createdAt,
        }

        const result = await fetchJSON<NextIDErrorBody | undefined>(urlcat(BASE_URL, '/v1/proof'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })

        if (result?.message) throw new Error(result.message)

        // Should delete cache when proof status changed
        const cacheKeyOfQueryPersona = getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey)
        const cacheKeyOfQueryPlatform = getPersonaQueryURL(platform, identity)
        const cacheKeyOfExistedBinding = getExistedBindingQueryURL(platform, identity, personaPublicKey)

        await staleNextIDCached(cacheKeyOfExistedBinding)
        await staleNextIDCached(cacheKeyOfQueryPersona)
        await staleNextIDCached(cacheKeyOfQueryPlatform)
    }

    async queryExistedBindingByPersona(personaPublicKey: string) {
        const url = getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey)
        const { ids } = await fetchJSON<NextIDBindings>(url)
        // Will have only one item when query by personaPublicKey
        return first(ids)
    }

    async queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page = 1) {
        if (!platform && !identity) return []

        const response = await fetchJSON<NextIDBindings>(
            urlcat(BASE_URL, '/v1/proof', {
                platform,
                identity,
                page,
                exact: true,
                sort: 'activated_at',
                order: 'desc',
            }),
        )

        return response.ids
    }

    async queryLatestBindingByPlatform(
        platform: NextIDPlatform,
        identity: string,
        publicKey?: string,
    ): Promise<NextIDPersonaBindings | null> {
        if (!platform && !identity) return null

        const result = await this.queryExistedBindingByPlatform(platform, identity, 1)
        if (publicKey) return result.find((x) => x.persona === publicKey) ?? null
        return first(result) ?? null
    }

    async queryAllExistedBindingsByPlatform(platform: NextIDPlatform, identity: string, exact?: boolean) {
        if (!platform && !identity) return []

        const nextIDPersonaBindings: NextIDPersonaBindings[] = []
        let page = 1
        do {
            const result = await fetchJSON<NextIDBindings>(
                urlcat(BASE_URL, '/v1/proof', {
                    platform,
                    identity,
                    exact,
                    page,
                    order: 'desc',
                }),
            )

            const personaBindings = result.ids
            if (personaBindings.length === 0) return nextIDPersonaBindings
            nextIDPersonaBindings.push(...personaBindings)

            // next is `0` if current page is the last one.
            if (result.pagination.next === 0) return nextIDPersonaBindings

            page += 1
        } while (page > 1)
        return []
    }

    async queryIsBound(personaPublicKey: string, platform: NextIDPlatform, identity: string) {
        try {
            if (!platform && !identity) return false

            const url = getExistedBindingQueryURL(platform, identity, personaPublicKey)
            const result = await fetchJSON<BindingProof | undefined>(url)
            return !!result?.is_valid
        } catch {
            return false
        }
    }

    async queryProfilesByRelationService(address: string) {
        const response = await fetchJSON<{
            data: {
                identity: {
                    neighborWithTraversal: Array<{
                        source: NextIDPlatform
                        to: NextIDIdentity
                        from: NextIDIdentity
                    }>
                }
            }
        }>(RELATION_SERVICE_URL, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                operationName: 'GET_PROFILES_QUERY',
                variables: { platform: 'ethereum', identity: address.toLowerCase() },
                query: `
                    query GET_PROFILES_QUERY($platform: String, $identity: String) {
                        identity(platform: $platform, identity: $identity) {
                            neighborWithTraversal(depth: 5) {
                                source
                                to {
                                    platform
                                    identity
                                    displayName
                                }
                                from {
                                    platform
                                    identity
                                    displayName
                                }
                            }
                        }
                    }
                `,
            }),
        })

        const rawData = response.data.identity.neighborWithTraversal
            .map((x) => createBindingProofFromProfileQuery(x.to.platform, x.source, x.to.identity, x.to.displayName))
            .concat(
                response.data.identity.neighborWithTraversal.map((x) =>
                    createBindingProofFromProfileQuery(x.from.platform, x.source, x.from.identity, x.to.displayName),
                ),
            )

        return uniqWith(rawData, (a, b) => a.identity === b.identity && a.platform === b.platform).filter(
            (x) => ![NextIDPlatform.Ethereum, NextIDPlatform.NextID].includes(x.platform) && x.identity,
        )
    }

    async queryProfilesByTwitterId(twitterId: string) {
        const response = await fetchJSON<{
            data: {
                identity: {
                    neighborWithTraversal: Array<{
                        source: NextIDPlatform
                        to: NextIDIdentity
                        from: NextIDIdentity
                    }>
                }
            }
        }>(RELATION_SERVICE_URL, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                operationName: 'GET_PROFILES_QUERY',
                variables: { platform: 'twitter', identity: twitterId.toLowerCase() },
                query: `
                    query GET_PROFILES_QUERY($platform: String, $identity: String) {
                        identity(platform: $platform, identity: $identity) {
                            neighborWithTraversal(depth: 5) {
                                source
                                to {
                                    platform
                                    identity
                                    displayName
                                }
                                from {
                                    platform
                                    identity
                                    displayName
                                }
                            }
                        }
                    }
                `,
            }),
        })

        const rawData = response.data.identity.neighborWithTraversal
            .map((x) => createBindingProofFromProfileQuery(x.to.platform, x.source, x.to.identity, x.to.displayName))
            .concat(
                response.data.identity.neighborWithTraversal.map((x) =>
                    createBindingProofFromProfileQuery(x.from.platform, x.source, x.from.identity, x.to.displayName),
                ),
            )

        return uniqWith(rawData, (a, b) => a.identity === b.identity && a.platform === b.platform).filter(
            (x) => ![NextIDPlatform.Ethereum, NextIDPlatform.NextID].includes(x.platform) && x.identity,
        )
    }

    async queryAllLens(twitterId: string): Promise<LensAccount[]> {
        const response = await fetchJSON<{
            data: {
                identity: {
                    uuid: string
                    platform: 'twitter'
                    identity: string
                    displayName: string
                    neighborWithTraversal: Array<{
                        source: NextIDPlatform
                        from: NextIDIdentity
                        to: NextIDIdentity
                    }>
                }
            }
        }>(RELATION_SERVICE_URL, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                operationName: 'GET_PROFILES_QUERY',
                variables: { platform: 'twitter', identity: twitterId.toLowerCase() },
                query: `
                    query GET_PROFILES_QUERY($platform: String, $identity: String) {
                      identity(platform: $platform, identity: $identity) {
                        uuid
                        platform
                        identity
                        displayName
                        neighborWithTraversal(depth: 5) {
                          source
                          from {
                            uuid
                            platform
                            identity
                            displayName
                          }
                          to {
                            uuid
                            platform
                            identity
                            displayName
                          }
                        }
                      }
                    }
                `,
            }),
        })

        const connections = response.data.identity.neighborWithTraversal.filter((x) => {
            return (
                x.source === NextIDPlatform.LENS &&
                x.from.platform === NextIDPlatform.Ethereum &&
                x.to.platform === NextIDPlatform.LENS
            )
        })

        return connections.map((x) => ({
            lens: x.to.identity,
            displayName: x.to.displayName,
            address: x.from.identity,
        }))
    }

    async createPersonaPayload(
        personaPublicKey: string,
        action: NextIDAction,
        identity: string,
        platform: NextIDPlatform,
        language?: string,
    ): Promise<NextIDPayload | null> {
        const requestBody: CreatePayloadBody = {
            action,
            platform,
            identity,
            public_key: personaPublicKey,
        }

        const nextIDLanguageFormat = language?.replace('-', '_') as PostContentLanguages

        const response = await fetchJSON<CreatePayloadResponse>(urlcat(BASE_URL, '/v1/proof/payload'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })

        return response
            ? {
                  postContent:
                      response.post_content[nextIDLanguageFormat ?? 'default'] ?? response.post_content.default,
                  signPayload: JSON.stringify(JSON.parse(response.sign_payload)),
                  createdAt: response.created_at,
                  uuid: response.uuid,
              }
            : null
    }

    async verifyTwitterHandlerByAddress(address: string, handler: string): Promise<boolean> {
        const response = await fetchJSON<{
            statusCode: number
            data?: string[]
            error?: string
        }>(
            urlcat(TWITTER_HANDLER_VERIFY_URL, '/v1/relation/handles', {
                wallet: address.toLowerCase(),
                isVerified: true,
            }),
        )

        if (response.error || !handler || !address) return false

        return response.data?.includes(handler) || response.data?.length === 0
    }
}

function createBindingProofFromProfileQuery(
    platform: NextIDPlatform,
    source: NextIDPlatform,
    identity: string,
    name: string,
): BindingProof {
    return {
        platform,
        source,
        identity,
        name,
        created_at: '',
        invalid_reason: '',
        last_checked_at: '',
        is_valid: true,
    }
}
