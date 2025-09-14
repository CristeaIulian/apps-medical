import React, { useRef } from 'react';

import { CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

import { OptimalRange } from '../../types';

import './ChartView.scss';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export interface ChartDataPoint {
    date: string;
    value: number;
    label?: string;
}

export interface ChartViewProps {
    data: ChartDataPoint[];
    title?: string;
    unit?: string;
    optimalRange?: OptimalRange;
    height?: number;
    showGrid?: boolean;
    showLegend?: boolean;
    isMini?: boolean;
}

export const ChartView: React.FC<ChartViewProps> = ({
    data,
    title,
    unit = '',
    optimalRange,
    height = 300,
    showGrid = true,
    showLegend = true,
    isMini = false,
}) => {
    const chartRef = useRef<any>(null);

    // Get CSS custom properties for theming
    const getCSSProperty = (property: string): string => {
        return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    };

    const colors = {
        primary: getCSSProperty('--text-primary') || '#ffffff',
        secondary: getCSSProperty('--text-secondary') || '#cccccc',
        muted: getCSSProperty('--text-muted') || '#999999',
        accent: getCSSProperty('--accent') || '#007bff',
        success: getCSSProperty('--success') || '#28a745',
        warning: getCSSProperty('--warning') || '#ffc107',
        danger: getCSSProperty('--danger') || '#dc3545',
        border: getCSSProperty('--border') || '#404040',
    };

    // Prepare chart data
    const chartData = {
        labels:
            data.length === 1
                ? ['', new Date(data[0].date).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' }), '']
                : data.map(point => {
                      const date = new Date(point.date);
                      return isMini ? date.toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' }) : date.toLocaleDateString('ro-RO');
                  }),
        datasets: [
            {
                label: title || 'Values',
                data:
                    data.length === 1
                        ? [null, data[0].value, null] // 3 points to match 3 labels
                        : data.map(point => point.value),
                borderColor: colors.accent,
                backgroundColor: colors.accent + '20',
                pointBackgroundColor: colors.accent,
                pointBorderColor: colors.primary,
                pointBorderWidth: 1,
                pointRadius: isMini ? 3 : 5,
                pointHoverRadius: isMini ? 4 : 7,
                fill: false,
                tension: 0.2,
                // Remove the showLine property entirely, or set it explicitly:
                showLine: true, // Always show lines when there are multiple points
                spanGaps: true, // Connect points even if there are null values
            },
        ],
    };

    // Optimal range area (if provided)
    if (optimalRange) {
        chartData.datasets.push(
            {
                label: 'Interval Optim',
                data: data.length === 1 ? [optimalRange.max || 0, optimalRange.max || 0, optimalRange.max || 0] : data.map(() => optimalRange.max || 0),
                borderColor: colors.success + '60',
                backgroundColor: colors.success + '10',
                pointBackgroundColor: colors.success + '60',
                pointBorderColor: colors.success + '60',
                pointBorderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: '+1' as any,
                tension: 0,
                showLine: true,
                spanGaps: true,
            },
            {
                label: 'Interval Optim Min',
                data: data.length === 1 ? [optimalRange.min || 0, optimalRange.min || 0, optimalRange.min || 0] : data.map(() => optimalRange.min || 0),
                borderColor: colors.success + '60',
                backgroundColor: colors.success + '10',
                pointBackgroundColor: colors.success + '60',
                pointBorderColor: colors.success + '60',
                pointBorderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                tension: 0,
                showLine: true,
                spanGaps: true,
            }
        );
    }

    // Chart options with theming
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
        plugins: {
            legend: {
                display: showLegend && !isMini,
                position: 'top' as const,
                labels: {
                    color: colors.secondary,
                    font: {
                        size: 12,
                    },
                    filter: (legendItem: any) => {
                        // Hide the min range from legend (it's just for fill)
                        return !legendItem.text.includes('Min');
                    },
                },
            },
            title: {
                display: !!title && !isMini,
                text: title,
                color: colors.primary,
                font: {
                    size: 16,
                    weight: '500' as const,
                },
                padding: {
                    bottom: 20,
                },
            },
            tooltip: {
                backgroundColor: colors.border,
                titleColor: colors.primary,
                bodyColor: colors.secondary,
                borderColor: colors.accent,
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: (context: any) => {
                        const value = context.parsed.y;

                        if (context.datasetIndex === 0) {
                            let label = `${context.dataset.label}: ${value}${unit}`;

                            // Add status indicator if optimal range exists
                            if (optimalRange) {
                                if (value > (optimalRange.max || 0)) {
                                    label += ' (↑ ridicat)';
                                } else if (value < (optimalRange.min || 0)) {
                                    label += ' (↓ scăzut)';
                                } else {
                                    label += ' (✓ optim)';
                                }
                            }

                            return label;
                        } else {
                            return `${context.dataset.label}: ${value}${unit}`;
                        }
                    },
                },
            },
        },
        scales: {
            x: {
                display: !isMini || data.length > 1,
                grid: {
                    display: showGrid && !isMini,
                    color: colors.border + '40',
                },
                ticks: {
                    color: colors.muted,
                    font: {
                        size: isMini ? 10 : 12,
                    },
                    maxTicksLimit: isMini ? 4 : 8,
                },
                border: {
                    color: colors.border,
                },
            },
            y: {
                display: !isMini,
                grid: {
                    display: showGrid,
                    color: colors.border + '40',
                },
                ticks: {
                    color: colors.muted,
                    font: {
                        size: 12,
                    },
                    callback: function (value: any) {
                        return value + unit;
                    },
                },
                border: {
                    color: colors.border,
                },
            },
        },
        elements: {
            point: {
                hoverBorderWidth: 2,
            },
        },
    } as any;

    return (
        <div className={`mini_chart  ${isMini ? 'mini_chart--mini' : ''}`} style={{ height: `${height}px` }}>
            <Line ref={chartRef} data={chartData} options={options} />
        </div>
    );
};
