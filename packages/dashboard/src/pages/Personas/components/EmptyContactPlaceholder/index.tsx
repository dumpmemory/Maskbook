import { memo } from 'react'
import { makeStyles, Box, Typography, Link } from '@material-ui/core'
import { EmptyIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import { DashboardTrans } from '../../../../locales/i18n_generated'

const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    prompt: {
        color: MaskColorVar.textLight,
        fontSize: theme.typography.pxToRem(12),
        lineHeight: theme.typography.pxToRem(16),
        marginTop: theme.spacing(2.5),
    },
    icon: {
        width: 96,
        height: 96,
        fill: 'none',
    },
}))

export const EmptyContactPlaceholder = memo(() => {
    const classes = useStyles()
    return (
        <Box className={classes.container}>
            <EmptyIcon className={classes.icon} />
            <Typography className={classes.prompt}>
                <DashboardTrans.personas_empty_contact_tips
                    components={{ i: <Link href="https://mask.io/download-links/" /> }}
                    values={{ name: 'Mask Network' }}
                />
            </Typography>
        </Box>
    )
})
