import React from 'react';

import { Paper } from '@material-ui/core';

import styles from './scss/minor-ui-components.module.scss';

type WarningBannerProps = {
    message?: string;
    icon?: JSX.Element;
    className?: string;
}
const WarningBannerCore = (params: WarningBannerProps): JSX.Element => {
    let icon;
    if (params.icon) {
        icon = <div className={styles.icon}>{params.icon}</div>
    }
    return <Paper className={params.className? params.className : styles.warningBanner}>
        {icon}<span>{params.message}</span>
    </Paper>
}
export const WarningBanner = React.memo(WarningBannerCore);