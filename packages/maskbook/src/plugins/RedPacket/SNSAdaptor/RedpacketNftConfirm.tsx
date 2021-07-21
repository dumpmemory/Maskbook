import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    isNative,
    resolveAddressLinkOnExplorer,
    useChainId,
    useWallet,
} from '@masknet/web3-shared'
import { Button, Grid, Link, Typography } from '@material-ui/core'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import LaunchIcon from '@material-ui/icons/Launch'
import { TxFeeEstimation } from '../../../web3/UI/TxFeeEstimation'
import { Flags, useI18N } from '../../../utils'
import { NftReadOnlyList } from './NftReadOnlyList'

const useStyles = makeStyles()((theme) => ({
    root: {},
    button: {},
    link: {
        display: 'flex',
        marginLeft: theme.spacing(0.5),
    },
    account: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    message: {
        borderLeft: '2px solid red',
        paddingLeft: theme.spacing(0.5),
    },
}))
export interface RedpacketNftConfirmProps {}
export function RedpacketNftConfirm(props: RedpacketNftConfirmProps) {
    const { classes } = useStyles()
    const wallet = useWallet()
    const chainId = useChainId()
    const { t } = useI18N()

    const nfts: { img: string; name: string }[] = Array.from({ length: 10 })

    nfts.fill({
        img: new URL('./assets/nft.png', import.meta.url).toString(),
        name: 'Token',
    })

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography color="textPrimary" variant="body1">
                        {t('plugin_red_packet_nft_account_name')}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography color="textPrimary" variant="body1" align="right" className={classes.account}>
                        ({wallet?.name}) {formatEthereumAddress(wallet?.address ?? '', 4)}
                        {isNative(wallet?.address!) ? null : (
                            <Link
                                color="textPrimary"
                                className={classes.link}
                                href={resolveAddressLinkOnExplorer(chainId, wallet!.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stop}>
                                <LaunchIcon fontSize="small" />
                            </Link>
                        )}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary">
                        {t('plugin_red_packet_nft_arrached_message')}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary" align="right">
                        Happy New Year
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <NftReadOnlyList nfts={nfts} />
                </Grid>

                <Grid item xs={6}>
                    <Typography color="textPrimary" variant="body1">
                        {t('plugin_red_packet_nft_total_amount')}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography color="textPrimary" align="right">
                        20
                    </Typography>
                </Grid>
                {Flags.wallet_gas_price_dialog_enable ? <TxFeeEstimation classes={classes} /> : null}

                <Grid item xs={12}>
                    <Typography variant="body2" color="error" className={classes.message}>
                        MetaMask Tx Signature: User denied transaction signature.
                    </Typography>
                </Grid>
            </Grid>
            <EthereumWalletConnectedBoundary>
                <Button className={classes.button} fullWidth size="large" variant="contained">
                    {t('cancel')}
                </Button>
                <ActionButton variant="contained" size="large" className={classes.button} fullWidth>
                    {t('plugin_red_packet_send_symbol', { amount: 100, token: '' })}
                </ActionButton>
            </EthereumWalletConnectedBoundary>
        </>
    )
}
