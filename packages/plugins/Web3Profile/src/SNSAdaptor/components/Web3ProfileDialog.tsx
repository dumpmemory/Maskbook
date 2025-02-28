import { useEffect, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { sortBy } from 'lodash-es'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { Icons } from '@masknet/icons'
import { DialogActions, DialogContent } from '@mui/material'
import { InjectedDialog, LoadGuard, PersonaAction, usePersonaProofs, type WalletTypes } from '@masknet/shared'
import {
    CrossIsolationMessages,
    EMPTY_LIST,
    type MaskEvents,
    NetworkPluginID,
    NextIDPlatform,
    PopupRoutes,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { ChainId } from '@masknet/web3-shared-evm'
import { Sentry } from '@masknet/web3-providers'
import { SceneMap, type Scene } from '../../constants.js'
import { useI18N } from '../../locales/i18n_generated.js'
import { context } from '../context.js'
import { useAllPersonas, useCurrentPersona, useLastRecognizedProfile } from '../hooks/index.js'
import { getDonationList, getFootprintList, getNFTList, getUnlistedConfig, getWalletList } from '../utils.js'
import { ImageManagement } from './ImageManagement.js'
import { Main } from './Main.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        width: 568,
        height: 494,
        padding: '0px 16px',
        backgroundColor: theme.palette.background.paper,
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    actions: {
        padding: '0px !important',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    titleTailButton: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
}))

export function Web3ProfileDialog() {
    const t = useI18N()
    const { classes } = useStyles()
    const [scene, setScene] = useState<Scene>()
    const [accountId, setAccountId] = useState<string>()

    const [open, setOpen] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.web3ProfileDialogEvent.on(({ open }) => {
            if (open)
                Sentry.captureEvent({
                    eventType: TelemetryAPI.EventType.Access,
                    eventID: TelemetryAPI.EventID.AccessWeb3ProfileDialog,
                })
            setOpen(open)
        })
    }, [])

    const persona = useCurrentPersona()
    const currentVisitingProfile = useLastRecognizedProfile()
    const allPersona = useAllPersonas()
    const currentPersona = allPersona.find((x) => x.identifier.rawPublicKey === persona?.rawPublicKey)
    const personaPublicKey = currentPersona?.identifier.publicKeyAsHex

    const {
        value: proofs,
        retry: retryQueryBinding,
        loading: loadingBinding,
        error: loadingBindingError,
    } = usePersonaProofs(personaPublicKey, {
        events: { ownProofChanged: context?.ownProofChanged },
    } as WebExtensionMessage<MaskEvents>)

    const { value: avatar } = useAsyncRetry(async () => context.getPersonaAvatar(currentPersona?.identifier), [])

    const wallets: WalletTypes[] = useMemo(() => {
        if (!proofs?.length) return EMPTY_LIST
        return proofs
            .filter((proof) => proof.platform === NextIDPlatform.Ethereum)
            .map(
                (proof): WalletTypes => ({
                    address: proof.identity,
                    networkPluginID: NetworkPluginID.PLUGIN_EVM,
                    updateTime: proof.last_checked_at ?? proof.created_at,
                    collections: [],
                }),
            )
    }, [proofs])

    const accounts = useMemo(
        () => proofs?.filter((proof) => proof.platform === NextIDPlatform.Twitter) || EMPTY_LIST,
        [proofs],
    )
    const { value: NFTList } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return getNFTList(wallets, [ChainId.Mainnet, ChainId.Matic])
    }, [wallets])

    const { value: donationList } = useAsyncRetry(async () => getDonationList(wallets), [wallets])

    const { value: footprintList } = useAsyncRetry(async () => getFootprintList(wallets), [wallets])

    const { value: hiddenConfig, retry: retryGetWalletHiddenList } = useAsyncRetry(async () => {
        if (!personaPublicKey) return
        return getUnlistedConfig(personaPublicKey)
    }, [personaPublicKey])

    const accountArr = useMemo(
        () => getWalletList(accounts, wallets, allPersona, hiddenConfig, footprintList, donationList, NFTList),
        [accounts, wallets, allPersona, hiddenConfig, footprintList, donationList, NFTList],
    )

    const userId = currentVisitingProfile?.identifier?.userId
    const accountList = useMemo(() => {
        return sortBy(accountArr, (x) => (x.identity.toLowerCase() === userId?.toLowerCase() ? -1 : 0))
    }, [userId, accountArr])

    const { chainId } = useChainContext()

    const openPopupsWindow = () => {
        context.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }

    return (
        <InjectedDialog
            classes={{ dialogContent: classes.content }}
            title={scene ? SceneMap[scene].title : t.web3_profile()}
            fullWidth={false}
            open={open}
            isOnBack
            titleTail={
                <Icons.WalletUnderTabs size={24} onClick={openPopupsWindow} className={classes.titleTailButton} />
            }
            onClose={() => setOpen(false)}>
            <DialogContent className={classes.content}>
                <LoadGuard loading={loadingBinding} retry={retryQueryBinding} error={!!loadingBindingError}>
                    <Main
                        openImageSetting={(scene, accountId) => {
                            setScene(scene)
                            setAccountId(accountId)
                        }}
                        persona={currentPersona}
                        currentVisitingProfile={currentVisitingProfile}
                        accountList={accountList}
                    />
                </LoadGuard>
                {accountId && scene ? (
                    <ImageManagement
                        open
                        currentPersona={currentPersona}
                        account={accountList.find((x) => x.identity === accountId)}
                        scene={scene}
                        onClose={() => {
                            setScene(undefined)
                        }}
                        accountId={accountId}
                        currentVisitingProfile={currentVisitingProfile}
                        allWallets={wallets}
                        getWalletHiddenRetry={retryGetWalletHiddenList}
                        unlistedCollectionConfig={hiddenConfig?.collections?.[accountId]}
                    />
                ) : null}
            </DialogContent>
            {currentPersona ? (
                <DialogActions className={classes.actions}>
                    <PersonaAction
                        avatar={avatar === null ? undefined : avatar}
                        currentPersona={currentPersona}
                        currentVisitingProfile={currentVisitingProfile}
                    />
                </DialogActions>
            ) : null}
        </InjectedDialog>
    )
}
