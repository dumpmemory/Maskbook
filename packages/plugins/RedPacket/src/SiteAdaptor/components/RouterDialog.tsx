import { Trans } from '@lingui/macro'
import { InjectedDialog, NetworkTab, usePageTab, useParamTab, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect, type ReactNode } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { nftDefaultChains, RoutePaths } from '../../constants.js'
import { makeStyles, MaskTabList } from '@masknet/theme'
import { Tab, useTheme } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import { base } from '../../base.js'
import { useSiteThemeMode } from '@masknet/plugin-infra/content-script'
import { TabContext } from '@mui/lab'
import { Icons } from '@masknet/icons'
import { HistoryTabs, RedPacketTabs } from '../../types.js'

const useStyles = makeStyles<{ isDim: boolean }>()((theme, { isDim }) => {
    // it's hard to set dynamic color, since the background color of the button is blended transparent
    const darkBackgroundColor = isDim ? '#38414b' : '#292929'
    return {
        tabWrapper: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
        arrowButton: {
            backgroundColor: theme.palette.mode === 'dark' ? darkBackgroundColor : undefined,
        },
    }
})

const pageMap: Record<RedPacketTabs, RoutePaths> = {
    [RedPacketTabs.tokens]: RoutePaths.CreateErc20RedPacket,
    [RedPacketTabs.collectibles]: RoutePaths.CreateNftRedPacket,
}
export function RouterDialog(props: InjectedDialogProps) {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const theme = useTheme()
    const mode = useSiteThemeMode(theme)

    useLayoutEffect(() => {
        if (pathname === RoutePaths.Exit) {
            props.onClose?.()
        }
    }, [pathname === RoutePaths.Exit, props.onClose])

    const { classes } = useStyles({ isDim: mode === 'dim' })
    const [currentTab, onChange] = usePageTab<RedPacketTabs>(pageMap)
    const chainIds =
        currentTab === RedPacketTabs.tokens ?
            base.enableRequirement.web3[NetworkPluginID.PLUGIN_EVM].supportedChainIds
        :   nftDefaultChains

    const createTabs = (
        <TabContext value={currentTab}>
            <MaskTabList variant="base" onChange={onChange} aria-label="Redpacket">
                <Tab label={<Trans>Tokens</Trans>} value={RedPacketTabs.tokens} />
                <Tab label={<Trans>NFTs</Trans>} value={RedPacketTabs.collectibles} />
            </MaskTabList>
        </TabContext>
    )
    const [currentHistoryTab, onChangeHistoryTab] = useParamTab<HistoryTabs>(HistoryTabs.Claimed)
    const historyTabs = (
        <TabContext value={currentHistoryTab}>
            <MaskTabList variant="base" onChange={onChangeHistoryTab} aria-label="Redpacket">
                <Tab label={<Trans>Sent</Trans>} value={HistoryTabs.Sent} />
                <Tab label={<Trans>Claimed</Trans>} value={HistoryTabs.Claimed} />
            </MaskTabList>
        </TabContext>
    )
    const isCreate = matchPath(`${RoutePaths.Create}/*`, pathname)
    const titleTabs =
        isCreate ? createTabs
        : matchPath(RoutePaths.History, pathname) ? historyTabs
        : null
    const networkTabs =
        isCreate ?
            <div className={classes.tabWrapper}>
                <NetworkTab
                    chains={chainIds}
                    hideArrowButton={currentTab === RedPacketTabs.collectibles}
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    classes={{ arrowButton: classes.arrowButton }}
                />
            </div>
        :   null
    const titleMap: Record<string, ReactNode> = {
        [RoutePaths.ConfirmErc20RedPacket]: <Trans>Confirm the Lucky Drop</Trans>,
        [RoutePaths.History]: <Trans>History</Trans>,
        [RoutePaths.HistoryDetail]: <Trans>Claim Details</Trans>,
        [RoutePaths.NftHistory]: <Trans>History</Trans>,
        [RoutePaths.CustomCover]: <Trans>Add a Custom Cover</Trans>,
    }
    const titleTailMap: Record<string, ReactNode> = {
        [RoutePaths.CreateErc20RedPacket]: (
            <Icons.History
                onClick={() => navigate({ pathname: RoutePaths.History, search: `tab=${HistoryTabs.Sent}` })}
            />
        ),
        [RoutePaths.CreateNftRedPacket]: (
            <Icons.History
                onClick={() => {
                    navigate(RoutePaths.NftHistory)
                }}
            />
        ),
    }

    return (
        <InjectedDialog
            {...props}
            title={titleMap[pathname] || <Trans>Lucky Drop</Trans>}
            titleTabs={titleTabs}
            networkTabs={networkTabs}
            titleTail={titleTailMap[pathname] || null}
            onClose={() => {
                navigate(-1)
            }}
        />
    )
}
