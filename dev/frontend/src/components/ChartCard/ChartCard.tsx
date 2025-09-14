import { FC, ReactNode } from 'react';

import './ChartCard.scss';

export interface ChartCardProps {
    children?: ReactNode;
    className?: string;
    footerNoteValue?: string;
    hadIssuesDuringTimeline?: boolean;
    isMini?: boolean;
    lastItemDate?: string;
    optimalStatus?: 'low' | 'optimal' | 'high';
    title?: string;
    unit?: string;
}

export const ChartCard: FC<ChartCardProps> = ({
    children,
    className = '',
    footerNoteValue,
    hadIssuesDuringTimeline,
    isMini = false,
    lastItemDate,
    optimalStatus,
    title,
    unit = '',
}: ChartCardProps) => {
    return (
        <div className={`mini-card ${isMini ? 'mini-card--mini' : ''} ${className}`}>
            {title && (
                <div className="mini-card__header">
                    <h4 className="mini-card__title">{title}</h4>
                </div>
            )}
            <div>{children}</div>
            {isMini && (
                <div className="mini-card__mini-info">
                    <span className="mini-card__mini-latest">
                        {footerNoteValue && (
                            <span>
                                Ultima:{' '}
                                <strong>
                                    {footerNoteValue}
                                    {unit}
                                </strong>{' '}
                                {lastItemDate ? `(${new Date(lastItemDate).toLocaleDateString('ro-RO')})` : undefined}
                            </span>
                        )}
                    </span>
                    <span className="mini-card__mini-flags">
                        {hadIssuesDuringTimeline && <span className={`mini-card__had-issues-during-timeline-issues`}>⚠️</span>}
                        {optimalStatus && (
                            <span className={`mini-card__mini-status ${optimalStatus}`}>
                                {optimalStatus === 'high' ? '↑' : optimalStatus === 'low' ? '↓' : '✓'}
                            </span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
};
