import React from 'react';

export interface IconProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ name, className = "", style = {} }) => (
    <svg className={className} style={{ width: '1em', height: '1em', fill: 'currentColor', ...style }}>
        <use xlinkHref={`#icon-${name}`} />
    </svg>
);
