import { CloseIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@material-ui/core'
import classNames from 'classnames'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import { useCallback } from 'react'

const useStyles = makeStyles()((theme) => ({
    tokenSelector: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: 528,
        height: 188,
        overflowY: 'auto',
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        borderRadius: 12,
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
        padding: theme.spacing(1, 1.5, 1, 1),
    },
    wrapper: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: theme.spacing(2.5),
        background: '#fff',
        width: 120,
        height: 180,
        borderRadius: 8,
    },
    addWrapper: {
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'light' ? 'none' : '#2F3336',
    },
    nftWrapper: {
        justifyContent: 'center',
    },
    lastRowWrapper: {
        marginBottom: theme.spacing(0.5),
    },
    addIcon: {
        color: '#AFC3E1',
    },
    nftImg: {
        margin: '0 auto',
        width: '100%',
    },
    closeIcon: {
        position: 'absolute',
        cursor: 'pointer',
        top: 5,
        right: 5,
        width: 10,
        height: 10,
        padding: theme.spacing(0.5),
        color: 'rgba(255, 95, 95, 1)',
        background: 'rgba(255, 95, 95, 0.2)',
        borderRadius: 500,
    },
    nftNameWrapper: {
        width: '100%',
        background: theme.palette.mode === 'light' ? 'none' : '#2F3336',
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        paddingTop: 2,
        paddingBottom: 1,
    },
    nftName: {
        marginLeft: 8,
    },

    token: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 1.5, 1, 0),
        width: '100%',
        alignItems: 'center',
    },
    tokenTitle: {
        textAlign: 'left',
    },
    tokenIcon: {
        display: 'flex',
        '&>:first-child': {
            marginRight: theme.spacing(0.5),
        },
    },
}))

export interface NftListProps {
    nfts: { img: string; name: string }[]
    // token: ERC721TokenDetailed
    readonly?: boolean

    onChange?: (nfts: { img: string; name: string }[]) => void
}

export function NftList(props: NftListProps) {
    const { classes } = useStyles()
    const { nfts, readonly = false, onChange } = props

    const onDelete = useCallback(() => {
        onChange?.(nfts)
    }, [])

    const onAdd = useCallback(() => {
        onChange?.(nfts)
    }, [])

    return (
        <>
            {!readonly ? null : (
                <Box className={classes.token}>
                    <Box className={classes.tokenTitle}>
                        <Typography variant="body1" color="textPrimary">
                            Collections
                        </Typography>
                    </Box>
                    <Box className={classes.tokenIcon}>
                        {/* <TokenIcon address={token.address} />
                        {token.name} ({token.symbol}) */}
                    </Box>
                </Box>
            )}
            <Box className={classes.tokenSelector}>
                {nfts.map((nft, i) => (
                    <Box
                        className={classNames(
                            classes.wrapper,
                            classes.nftWrapper,
                            nfts.length - i < 3 ? classes.lastRowWrapper : '',
                        )}
                        key={i.toString()}>
                        <img className={classes.nftImg} src={nft.img} />
                        <div className={classes.nftNameWrapper}>
                            <Typography className={classes.nftName} color="textSecondary">
                                {nft.name}
                            </Typography>
                        </div>
                        {!readonly ? <CloseIcon className={classes.closeIcon} onClick={onDelete} /> : null}
                    </Box>
                ))}
                {!readonly ? (
                    <Box className={classNames(classes.wrapper, classes.addWrapper, classes.lastRowWrapper)}>
                        <AddCircleOutlineIcon className={classes.addIcon} onClick={onAdd} />
                    </Box>
                ) : null}
            </Box>
        </>
    )
}
