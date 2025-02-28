import { getMaskColor, makeStyles, MaskColorVar, MaskDialog } from '@masknet/theme'
import { Box, Button, DialogContent, Link, Stack, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../../locales/index.js'
import { SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { useState } from 'react'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    svg: {
        color: getMaskColor(theme).orangeMain,
    },
    personaTextZone: {
        margin: theme.spacing(4, 0),
        fontSize: '13px',
    },
}))

interface DisconnectProfileDialogProps {
    open: boolean
    networkIdentifier: string
    onClose(): void
    onDisconnect: (identifier: ProfileIdentifier) => void
    profileIdentifiers: ProfileIdentifier[]
    personaIdentifier: PersonaIdentifier
}

enum steps {
    selection = 1,
    action = 2,
}

export const DisconnectProfileDialog = ({
    open,
    onClose,
    networkIdentifier,
    profileIdentifiers,
    onDisconnect,
    personaIdentifier,
}: DisconnectProfileDialogProps) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const [currentStep, setCurrentStep] = useState<steps>(steps.selection)
    const [profileIdentifier, setProfileIdentifier] = useState<ProfileIdentifier | null>()
    return (
        <MaskDialog open={open} title={t.personas_disconnect()} onClose={onClose}>
            <DialogContent sx={{ width: 480 }}>
                {currentStep === steps.selection && (
                    <Stack minHeight="100px" justifyContent="center">
                        {profileIdentifiers.map((x) => (
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={1}
                                key={x.userId}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    {SOCIAL_MEDIA_ICON_MAPPING[networkIdentifier]}
                                    <Typography
                                        variant="caption"
                                        key={x.userId}
                                        sx={{ color: MaskColorVar.textPrimary, fontSize: 13, mr: 1 }}>
                                        @{x.userId}
                                    </Typography>
                                </Stack>
                                <Box>
                                    <Link
                                        sx={{ color: (theme) => getMaskColor(theme).redMain }}
                                        component="button"
                                        variant="caption"
                                        onClick={() => {
                                            setProfileIdentifier(x)
                                            setCurrentStep(steps.action)
                                        }}>
                                        {t.personas_disconnect_raw()}
                                    </Link>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                )}
                {currentStep === steps.action && profileIdentifier ? (
                    <Box>
                        <Box textAlign="center" py={2}>
                            <Icons.Warning className={classes.svg} size={64} />
                        </Box>
                        <Typography variant="caption" sx={{ color: MaskColorVar.textPrimary, fontSize: 13, mr: 1 }}>
                            {t.personas_disconnect_warning()}
                        </Typography>
                        <Typography className={classes.personaTextZone}>
                            persona: {personaIdentifier.rawPublicKey}
                        </Typography>
                        <Stack mt={3} mb={1} direction="row" justifyContent="space-around" gap={4}>
                            <Button sx={{ flex: 1 }} onClick={onClose} color="secondary">
                                {t.cancel()}
                            </Button>
                            <Button
                                sx={{ flex: 1 }}
                                variant="contained"
                                onClick={() => {
                                    onDisconnect(profileIdentifier)
                                    setCurrentStep(steps.selection)
                                    onClose()
                                }}>
                                {t.confirm()}
                            </Button>
                        </Stack>
                    </Box>
                ) : null}
            </DialogContent>
        </MaskDialog>
    )
}
