import React from 'react';

import WarningIcon from '@material-ui/icons/Warning';

import styles from './scss/minor-ui-components.module.scss';

type WarningBannerProps = {
    message?: string;
}
const WarningBannerCore = (params: WarningBannerProps): JSX.Element => {
    return <div className={styles.warningBanner}>
        <WarningIcon className={styles.warningIcon} /><span>{params.message}</span>
    </div>
}
export const WarningBanner = React.memo(WarningBannerCore);