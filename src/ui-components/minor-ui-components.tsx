import React from 'react';

import Paper from '@material-ui/core/Paper';

import WarningIcon from '@material-ui/icons/Warning';

import styles from './scss/minor-ui-components.module.scss';

type WarningBannerProps = {
    message?: string;
}
const WarningBannerCore = (params: WarningBannerProps): JSX.Element => {
    return <Paper className={styles.warningBanner} variant="outlined" >
        <WarningIcon className={styles.warningIcon} /><span>{params.message}</span>
    </Paper>
}
export const WarningBanner = React.memo(WarningBannerCore);