import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { ApproveMaskDialog, FormattedBalance, SelectGasSettingsModal, useMenuConfig } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useChainContext,
    useFungibleToken,
    useFungibleTokenPrice,
    useNetworkContext,
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { DepositPaymaster, SmartPayBundler } from '@masknet/web3-providers'
import {
    formatBalance,
    formatCurrency,
    GasOptionType,
    isSameAddress,
    isZero,
    toFixed,
    ZERO,
} from '@masknet/web3-shared-base'
import {
    type ChainId,
    formatGas,
    formatWeiToEther,
    type GasConfig,
    GasEditor,
    type Transaction,
} from '@masknet/web3-shared-evm'
import { Box, MenuItem, type MenuProps, Typography } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useGasCurrencyMenu } from '../../../hooks/useGasCurrencyMenu.js'
import { SettingsContext } from '../SettingsBoard/Context.js'
import { useQuery } from '@tanstack/react-query'

export interface SelectGasSettingsToolbarProps<T extends NetworkPluginID = NetworkPluginID>
    extends withClasses<'label' | 'root'> {
    pluginID?: T
    chainId?: Web3Helper.ChainIdAll
    nativeToken: Web3Helper.FungibleTokenAll
    nativeTokenPrice: number
    gasLimit: number
    gasConfig?: GasConfig
    supportMultiCurrency?: boolean
    estimateGasFee?: string
    editMode?: boolean
    /** No effects on editMode */
    className?: string
    onChange?(gasConfig: GasConfig): void
    /** Will open internal setting dialog instead if not provided */
    onOpenCustomSetting?(): void
    MenuProps?: Partial<MenuProps>
}

const useStyles = makeStyles()((theme) => {
    return {
        button: {
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 99,
            width: 93,
            height: 26,
            cursor: 'pointer',
            justifyContent: 'center',
            marginLeft: 6,
        },
        root: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '16px 0',
            '& > p': {
                fontSize: 14,
                lineHeight: '18px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
            },
        },
        gasSection: {
            display: 'flex',
            lineHeight: '18px',
            fontWeight: 700,
            alignItems: 'center',
        },
        text: {
            lineHeight: '18px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            marginRight: 5,
        },
        menuItem: {
            display: 'flex',
            justifyContent: 'space-between',
            margin: '0px 12px',
            padding: theme.spacing(1, 0),
            width: 158,
            '&:hover': {
                background: 'none',
            },
        },
        title: {
            fontWeight: 700,
        },
        estimateGas: {
            color: theme.palette.text.third,
        },
        menuItemBorder: {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        gasUSDPrice: {
            fontWeight: 700,
            margin: '0px 4px',
        },
        edit: {
            lineHeight: '18px',
            color: theme.palette.maskColor.primary,
            marginRight: 4,
            fontWeight: 700,
            cursor: 'pointer',
        },
    }
})

export const SelectGasSettingsToolbar = memo(function SelectGasSettingsToolbar(props: SelectGasSettingsToolbarProps) {
    const { pluginID } = useNetworkContext(props.pluginID)
    const { chainId } = useChainContext({ chainId: props.chainId })

    return (
        <SettingsContext initialState={{ pluginID, chainId }}>
            <SelectGasSettingsToolbarUI {...props} />
        </SettingsContext>
    )
})

export function SelectGasSettingsToolbarUI({
    gasConfig: gasOption,
    gasLimit,
    nativeToken,
    nativeTokenPrice,
    estimateGasFee,
    supportMultiCurrency,
    editMode,
    className,
    classes: externalClasses,
    onChange,
    onOpenCustomSetting,
    MenuProps,
}: SelectGasSettingsToolbarProps) {
    const { classes, cx, theme } = useStyles(undefined, { props: { classes: externalClasses } })
    const { gasOptions, GAS_OPTION_NAMES } = SettingsContext.useContainer()

    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [isCustomGas, setIsCustomGas] = useState(false)
    const [currentGasOptionType, setCurrentGasOptionType] = useState<GasOptionType>(
        gasOption?.gasOptionType && gasOption.gasOptionType !== GasOptionType.CUSTOM ?
            gasOption.gasOptionType
        :   GasOptionType.NORMAL,
    )
    const [currentGasCurrency, setCurrentGasCurrency] = useState(gasOption?.gasCurrency)
    const { chainId } = useChainContext()
    const Utils = useWeb3Utils()

    const isSupportEIP1559 = Utils.chainResolver.isFeatureSupported(chainId, 'EIP1559')
    const setGasConfigCallback = useCallback(
        (maxFeePerGas: string, maxPriorityFeePerGas: string, gasPrice: string) =>
            onChange?.(
                isSupportEIP1559 ?
                    {
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                        gasCurrency: currentGasCurrency,
                        gas: new BigNumber(gasLimit).toString(),
                        gasOptionType: isCustomGas ? GasOptionType.CUSTOM : currentGasOptionType,
                    }
                :   {
                        gasPrice: new BigNumber(maxFeePerGas).gt(0) ? maxFeePerGas : gasPrice,
                        gasCurrency: currentGasCurrency,
                        gas: new BigNumber(gasLimit).toString(),
                        gasOptionType: isCustomGas ? GasOptionType.CUSTOM : currentGasOptionType,
                    },
            ),
        [isSupportEIP1559, chainId, onChange, currentGasCurrency, gasLimit, currentGasOptionType, isCustomGas],
    )

    const openCustomGasSettingsDialog = useCallback(async () => {
        setIsCustomGas(true)
        if (typeof onOpenCustomSetting === 'function') {
            onOpenCustomSetting()
            return
        }

        const { settings } = await SelectGasSettingsModal.openAndWaitForClose({
            chainId,
            disableGasLimit: true,
            disableSlippageTolerance: true,
            transaction: gasOption,
        })
        if (!settings?.transaction) return

        setGasConfigCallback(
            (settings.transaction as Transaction).maxFeePerGas!,
            (settings.transaction as Transaction).maxPriorityFeePerGas!,
            (settings.transaction as Transaction).gasPrice!,
        )
    }, [chainId, gasOption, setGasConfigCallback, onOpenCustomSetting])

    const currentGasOption = gasOptions?.[currentGasOptionType]
    useEffect(() => {
        if (!currentGasOption || isCustomGas) return

        setGasConfigCallback(
            currentGasOption.suggestedMaxFeePerGas,
            currentGasOption.suggestedMaxPriorityFeePerGas,
            currentGasOption.suggestedMaxPriorityFeePerGas,
        )
    }, [currentGasOption, isCustomGas, setGasConfigCallback])

    const { data: currencyRatio } = useQuery({
        queryKey: ['currency-ratio', chainId],
        queryFn: async () => {
            const chainId = await SmartPayBundler.getSupportedChainId()
            const depositPaymaster = new DepositPaymaster(chainId)
            const ratio = await depositPaymaster.getRatio()

            return ratio
        },
    })

    const [menu, openMenu] = useMenuConfig(
        Object.entries(gasOptions ?? {})
            .reverse()
            .filter(([type]) => type !== GasOptionType.CUSTOM)
            .map(([type, { suggestedMaxFeePerGas, estimatedBaseFee }]) => {
                const gas = formatGas(isZero(suggestedMaxFeePerGas) ? estimatedBaseFee : suggestedMaxFeePerGas)
                return (
                    <MenuItem
                        key={type}
                        className={cx(classes.menuItem, classes.menuItemBorder)}
                        onClick={() => {
                            setIsCustomGas(false)
                            setCurrentGasOptionType(type as GasOptionType)
                        }}>
                        <Typography className={classes.title}>{GAS_OPTION_NAMES[type as GasOptionType]}</Typography>
                        <Typography className={classes.estimateGas}>{gas}</Typography>
                    </MenuItem>
                )
            })
            .concat(
                <MenuItem key="setting" className={cx(classes.menuItem)} onClick={openCustomGasSettingsDialog}>
                    <Typography className={classes.title}>
                        <Trans>Custom</Trans>
                    </Typography>
                </MenuItem>,
            ),
        {
            ...MenuProps,
            anchorSibling: false,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
                ...MenuProps?.anchorOrigin,
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
                ...MenuProps?.transformOrigin,
            },
            PaperProps: {
                ...MenuProps?.PaperProps,
                style: {
                    background: theme.palette.maskColor.bottom,
                    transform: 'translateY(8px)',
                    ...MenuProps?.PaperProps?.style,
                },
            },
        },
    )

    const [currencyMenu, openCurrencyMenu] = useGasCurrencyMenu(
        NetworkPluginID.PLUGIN_EVM,
        (address) => setCurrentGasCurrency(address),
        currentGasCurrency,
        () => setApproveDialogOpen(true),
    )

    const { data: currencyToken = nativeToken } = useFungibleToken(undefined, currentGasCurrency, nativeToken, {
        chainId,
    })
    const { data: currencyTokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, currentGasCurrency)

    const gasFee = useMemo(() => {
        if (!gasOption || !gasLimit) return ZERO
        const result = GasEditor.fromConfig(chainId as ChainId, gasOption).getGasFee(gasLimit)
        if (!currentGasCurrency || isSameAddress(nativeToken?.address, currentGasCurrency)) {
            return result
        }
        if (!currencyRatio) return ZERO
        return new BigNumber(toFixed(result.multipliedBy(currencyRatio), 0))
    }, [gasLimit, gasOption, currencyRatio, currentGasCurrency, nativeToken])

    const gasFeeUSD = useMemo(() => {
        if (!gasFee || gasFee.isZero()) return '$0'
        if (!currentGasCurrency || isSameAddress(nativeToken?.address, currentGasCurrency)) {
            return formatCurrency(formatWeiToEther(gasFee).times(nativeTokenPrice), 'USD', {
                onlyRemainTwoOrZeroDecimal: true,
            })
        }

        if (!currencyToken || !currencyTokenPrice) return '$0'

        return formatCurrency(
            new BigNumber(formatBalance(gasFee, currencyToken.decimals)).times(currencyTokenPrice),
            'USD',
            { onlyRemainTwoOrZeroDecimal: true },
        )
    }, [
        gasFee,
        nativeTokenPrice,
        currencyTokenPrice,
        nativeToken?.address,
        currentGasCurrency,
        currencyToken?.decimals,
    ])

    if (!gasOptions || isZero(gasFee)) return null

    if (editMode)
        return (
            <Typography variant="body1" color="textPrimary" align="right" className={className}>
                <Typography component="span" className={classes.edit} onClick={openCustomGasSettingsDialog}>
                    <Trans>Edit</Trans>
                </Typography>
                <FormattedBalance
                    value={gasFee ?? estimateGasFee}
                    decimals={nativeToken?.decimals}
                    symbol={nativeToken?.symbol}
                    formatter={formatBalance}
                    significant={3}
                />
                ({gasFeeUSD})
            </Typography>
        )

    return (
        <Box className={cx(classes.root, className)}>
            <Typography className={cx(classes.label, classes.label)}>
                <Trans>Gas Fee</Trans>
            </Typography>
            <Typography className={classes.gasSection} component="div">
                <FormattedBalance
                    value={gasFee}
                    decimals={currencyToken?.decimals ?? 0}
                    significant={4}
                    symbol={currencyToken?.symbol}
                    formatter={formatBalance}
                />
                <Typography className={classes.gasUSDPrice}>≈ {gasFeeUSD}</Typography>
                <div className={classes.button} onClick={gasOptions ? openMenu : undefined}>
                    <Typography className={classes.text}>
                        {isCustomGas ?
                            <Trans>Custom</Trans>
                        :   GAS_OPTION_NAMES[currentGasOptionType]}
                    </Typography>
                    <Icons.Candle width={12} height={12} />
                </div>
                {supportMultiCurrency ?
                    <Icons.ArrowDrop onClick={openCurrencyMenu} />
                :   null}
                {menu}
                {supportMultiCurrency ? currencyMenu : null}
            </Typography>
            <ApproveMaskDialog open={approveDialogOpen} handleClose={() => setApproveDialogOpen(false)} />
        </Box>
    )
}
