import logotextHorizColorDarkV0 from '/logotext-horiz-color-dark-v0.svg'
import logotextHorizColorLightV0 from '/logotext-horiz-color-light-v0.svg'
import { type FunctionComponent } from 'react'

export const LogotextHorizColorImage: FunctionComponent<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
    <picture>
        <source srcSet={logotextHorizColorDarkV0} media="(prefers-color-scheme: dark)" />
        <source srcSet={logotextHorizColorLightV0} media="(prefers-color-scheme: light)" />
        <img width={size === 'sm' ? 120 : 250} src={logotextHorizColorLightV0} alt="OpenCodeGraph logo" />
    </picture>
)
