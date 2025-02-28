import { isFirefox } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    root: {
        overflow: 'unset',
    },
    name: {
        transform: 'translate(0px, 3px)',
    },
    border: {
        transform: 'translate(0px, 1px)',
    },
}))
interface NFTAvatarRingProps {
    stroke: string
    strokeWidth: number
    fontSize: number
    text: string
    price: string
    width: number
    id: string
    hasRainbow?: boolean
    borderSize?: number
}

export function NFTAvatarRing(props: NFTAvatarRingProps) {
    const { classes } = useStyles()
    const { stroke, strokeWidth, fontSize, text, width, id, price, hasRainbow = false, borderSize = 2 } = props

    const avatarSize = hasRainbow ? width - borderSize : width + 1
    const R = avatarSize / 2
    const path_r = R - strokeWidth + fontSize / 2
    const x1 = R - path_r
    const y1 = R
    const x2 = R + path_r

    return (
        <svg className={classes.root} width="100%" height="100%" viewBox={`0 0 ${avatarSize} ${avatarSize}`} id={id}>
            <defs>
                <path
                    id={`${id}-path-name`}
                    fill="none"
                    stroke="none"
                    strokeWidth="0"
                    d={`M${x1} ${y1} A${path_r} ${path_r} 0 1 1 ${x2} ${y1}`}
                />
                <path
                    id={`${id}-path-price`}
                    fill="none"
                    stroke="none"
                    strokeWidth="0"
                    d={`M${x1} ${y1} A${path_r} ${path_r} 0 1 0 ${x2} ${y1}`}
                />
                <linearGradient id={`${id}-gradient`} x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#24FF00" />
                    <stop offset="100%" stopColor="#00E4C9 " />
                </linearGradient>
            </defs>

            <g>
                <circle
                    cx={R}
                    cy={R}
                    r={R - strokeWidth / 2 + 1}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                />
                <g className={classes.border}>
                    <circle cx={R} cy={R} r={R - 2} fill="none" stroke="#24FF00" strokeWidth={2} />
                </g>
                <g className={classes.name}>
                    <text x="0%" textAnchor="middle" fill={`url(#${id}-gradient)`} fontFamily="sans-serif">
                        <textPath xlinkHref={`#${id}-path-name`} startOffset="50%" rotate="auto">
                            <tspan fontWeight="bold" fontSize={fontSize}>
                                {text}
                            </tspan>
                        </textPath>
                    </text>
                </g>
                <text
                    x="0%"
                    textAnchor="middle"
                    fill={isFirefox() ? 'currentColor' : `url(#${id}-gradient)`}
                    fontFamily="sans-serif">
                    <textPath xlinkHref={`#${id}-path-price`} startOffset="50%" rotate="auto">
                        <tspan fontWeight="bold" fontSize={fontSize} dy="0.5em">
                            {price}
                        </tspan>
                    </textPath>
                </text>
            </g>
        </svg>
    )
}
