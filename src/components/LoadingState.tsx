import styles from './LoadingState.module.css';

interface LoadingStateProps {
    message?: string;
    compact?: boolean;
}

export function LoadingState({ message, compact = false }: LoadingStateProps) {
    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            <div className={styles.spinner}>
                <div className={styles.spinnerRing} aria-hidden="true" />
                <div className={styles.spinnerTop} />
            </div>
            {message ? <p className={styles.message}>{message}</p> : null}
        </div>
    );
}

export default LoadingState;
