import { getSiteType, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type NetworkDescriptor, type ProviderIconClickBaitProps } from '@masknet/web3-shared-base'
import { makeStyles, ShadowRootTooltip, usePortalShadowRoot } from '@masknet/theme'
import {
    alpha,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    Typography,
} from '@mui/material'
import { ProviderIcon } from './ProviderIcon.js'
import { useI18N } from '../../../../utils/index.js'
import { useAsyncFn } from 'react-use'
import { ChainId, NETWORK_DESCRIPTORS as EVM_NETWORK_DESCRIPTORS, ProviderType } from '@masknet/web3-shared-evm'
import { NETWORK_DESCRIPTORS as SOL_NETWORK_DESCRIPTORS } from '@masknet/web3-shared-solana'
import { NETWORK_DESCRIPTORS as FLOW_NETWORK_DESCRIPTORS } from '@masknet/web3-shared-flow'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { useState } from 'react'
import { DialogDismissIconUI } from '../../../../components/InjectedComponents/DialogDismissIcon.js'
import { ImageIcon } from '@masknet/shared'
const descriptors: Record<
    NetworkPluginID,
    Array<NetworkDescriptor<Web3Helper.ChainIdAll, Web3Helper.NetworkTypeAll>>
> = {
    [NetworkPluginID.PLUGIN_EVM]: EVM_NETWORK_DESCRIPTORS,
    [NetworkPluginID.PLUGIN_FLOW]: FLOW_NETWORK_DESCRIPTORS,
    [NetworkPluginID.PLUGIN_SOLANA]: SOL_NETWORK_DESCRIPTORS,
}

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`

    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(2),
            counterReset: 'steps 0',
        },
        section: {
            flexGrow: 1,
            marginTop: 21,
            counterIncrement: 'steps 1',
            '&:first-of-type': {
                marginTop: 0,
            },
        },
        wallets: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridGap: '12px 12px',
            margin: theme.spacing(2, 0, 0),
            [smallQuery]: {
                gridAutoRows: '110px',
                gridTemplateColumns: 'repeat(2, 1fr)',
            },
        },
        walletItem: {
            padding: 0,
            height: 122,
            width: '100%',
            display: 'block',
            '& > div': {
                borderRadius: 8,
            },
        },
        providerIcon: {
            height: '100%',
            fontSize: 36,
            display: 'flex',
        },
        dialogTitle: {
            fontSize: 18,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            textAlign: 'center',
        },
        chooseNetwork: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            paddingLeft: 32,
        },
        dialogCloseButton: {
            color: theme.palette.text.primary,
            padding: 0,
            width: 24,
            height: 24,
            '& > svg': {
                fontSize: 24,
            },
        },
        listItem: {
            padding: theme.spacing(1.5),
        },
        listItemText: {
            fontSize: 12,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            marginLeft: 12,
        },
    }
})

export interface PluginProviderRenderProps {
    networks: Web3Helper.NetworkDescriptorAll[]
    providers: Web3Helper.ProviderDescriptorAll[]
    onProviderIconClicked: (
        network: Web3Helper.NetworkDescriptorAll,
        provider: Web3Helper.ProviderDescriptorAll,
        isReady?: boolean,
        downloadLink?: string,
    ) => void
    ProviderIconClickBait?: React.ComponentType<
        ProviderIconClickBaitProps<Web3Helper.ChainIdAll, Web3Helper.ProviderTypeAll, Web3Helper.NetworkTypeAll>
    >
}

export function PluginProviderRender({
    networks,
    providers,
    ProviderIconClickBait,
    onProviderIconClicked,
}: PluginProviderRenderProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const snsPlugins = useActivatedPluginsSNSAdaptor('any')
    const dashboardPlugins = useActivatedPluginsDashboard()
    const [selectChainDialogOpen, setSelectChainDialogOpen] = useState(false)

    const fortmaticProviderDescriptor = providers.find((x) => x.type === ProviderType.Fortmatic)

    const [{ error }, handleClick] = useAsyncFn(
        async (provider: Web3Helper.ProviderDescriptorAll, fortmaticChainId?: Web3Helper.ChainIdAll) => {
            if (provider.type === ProviderType.Fortmatic && !fortmaticChainId) {
                setSelectChainDialogOpen(true)
                return
            }
            const target = [...snsPlugins, ...dashboardPlugins].find(
                (x) => x.ID === (provider.providerAdaptorPluginID as string),
            )
            if (!target) return

            const connection = target.Web3State?.Connection?.getConnection?.({ providerType: provider.type })

            const chainId =
                fortmaticChainId ??
                (provider.type === ProviderType.WalletConnect
                    ? ChainId.Mainnet
                    : await connection?.getChainId({ providerType: provider.type }))
            const networkDescriptor = descriptors[provider.providerAdaptorPluginID].find((x) => x.chainId === chainId)

            if (!chainId || !networkDescriptor) return
            const isReady = target.Web3State?.Provider?.isReady(provider.type)
            const downloadLink = target.Web3State?.Others?.providerResolver.providerDownloadLink(provider.type)
            onProviderIconClicked(networkDescriptor, provider, isReady, downloadLink)
        },
        [],
    )

    console.log(error)

    return (
        <>
            <Box className={classes.root}>
                <section className={classes.section}>
                    <List className={classes.wallets}>
                        {providers
                            .filter((z) => {
                                const siteType = getSiteType()
                                if (!siteType) return false
                                return [
                                    ...(z.enableRequirements?.supportedEnhanceableSites ?? []),
                                    ...(z.enableRequirements?.supportedExtensionSites ?? []),
                                ].includes(siteType)
                            })
                            .map((provider) => {
                                const supportChains = networks
                                    .filter((x) => x.networkSupporterPluginID === provider.providerAdaptorPluginID)
                                    .map((x) => x.name)

                                return (
                                    <ShadowRootTooltip
                                        title={t('plugin_wallet_support_chains_tips', {
                                            provider: provider.name,
                                            chains: supportChains.join(supportChains.length > 1 ? ', ' : ''),
                                        })}
                                        arrow
                                        placement="top"
                                        key={provider.ID}>
                                        <ListItem
                                            className={classes.walletItem}
                                            onClick={() => {
                                                handleClick(provider)
                                            }}>
                                            {ProviderIconClickBait ? (
                                                <ProviderIconClickBait key={provider.ID} provider={provider}>
                                                    <ProviderIcon
                                                        className={classes.providerIcon}
                                                        icon={provider.icon}
                                                        name={provider.name}
                                                        iconFilterColor={provider.iconFilterColor}
                                                    />
                                                </ProviderIconClickBait>
                                            ) : (
                                                <ProviderIcon
                                                    className={classes.providerIcon}
                                                    icon={provider.icon}
                                                    name={provider.name}
                                                    iconFilterColor={provider.iconFilterColor}
                                                />
                                            )}
                                        </ListItem>
                                    </ShadowRootTooltip>
                                )
                            })}
                    </List>
                </section>
            </Box>
            {usePortalShadowRoot((container) => (
                <Dialog
                    container={container}
                    open={selectChainDialogOpen}
                    onClose={() => setSelectChainDialogOpen(false)}>
                    <DialogTitle
                        sx={{
                            whiteSpace: 'nowrap',
                            display: 'grid',
                            alignItems: 'center',
                            gridTemplateColumns: '50px auto 50px',
                        }}>
                        <IconButton
                            className={classes.dialogCloseButton}
                            onClick={() => setSelectChainDialogOpen(false)}>
                            <DialogDismissIconUI />
                        </IconButton>
                        <Typography className={classes.dialogTitle}>{t('plugin_wallet_connect_fortmatic')}</Typography>
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: 352 }}>
                        <Typography className={classes.chooseNetwork}>{t('plugin_wallet_choose_network')}</Typography>
                        <List>
                            {EVM_NETWORK_DESCRIPTORS.filter((x) =>
                                [ChainId.Mainnet, ChainId.BSC].includes(x.chainId),
                            ).map((x) => (
                                <ListItemButton
                                    key={x.chainId}
                                    className={classes.listItem}
                                    onClick={() => {
                                        if (!fortmaticProviderDescriptor) return
                                        handleClick(fortmaticProviderDescriptor, x.chainId)
                                    }}>
                                    <ImageIcon icon={x.icon} size={30} iconFilterColor={alpha(x.iconColor, 0.2)} />
                                    <Typography className={classes.listItemText}>{x.name}</Typography>
                                </ListItemButton>
                            ))}
                        </List>
                    </DialogContent>
                </Dialog>
            ))}
        </>
    )
}
