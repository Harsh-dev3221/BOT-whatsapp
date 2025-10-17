import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, children }: PageHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.titleSection}>
                    <p className={styles.badge}>Control Center</p>
                    <h1 className={styles.title}>
                        {title}
                    </h1>
                    {subtitle ? (
                        <p className={styles.subtitle}>
                            {subtitle}
                        </p>
                    ) : null}
                </div>
                {actions ? (
                    <div className={styles.actions}>{actions}</div>
                ) : null}
            </div>
            {children ? <div className={styles.children}>{children}</div> : null}
        </header>
    );
}

export default PageHeader;
