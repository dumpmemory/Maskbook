import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const MarketsIcon: typeof SvgIcon = createIcon(
    'Markets',
    <g>
        <path
            d="M3.292 19.066h22.75v3.89c0 1.282-.93 2.332-2.068 2.332H5.36c-1.137 0-2.068-1.05-2.068-2.333v-3.889z"
            fill="#00BB35"
        />
        <path
            d="M5.36 1.566h18.614c1.137 0 2.068.945 2.068 2.1v15.4H3.292v-15.4c0-1.155.93-2.1 2.068-2.1z"
            fill="#15CE49"
        />
        <path
            d="M14.667 12.833c-3.85 0-7-3.15-7-7a.78.78 0 01.778-.778.78.78 0 01.778.778c0 2.994 2.45 5.444 5.444 5.444 2.995 0 5.445-2.45 5.445-5.444a.78.78 0 01.777-.778.78.78 0 01.778.778c0 3.85-3.15 7-7 7z"
            fill="#fff"
        />
    </g>,
    '0 0 28 28',
)
