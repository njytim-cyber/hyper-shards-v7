import React from 'react';
import { Icon } from './Icon';
import { ICONS } from '../../game/config/Icons';

interface BackButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = "BACK", className = "back-btn" }) => {
    return (
        <button onClick={onClick} className={className} style={{ display: 'flex', alignItems: 'center' }}>
            <Icon name={ICONS.Menu.Back} style={{ marginRight: '6px' }} /> {label}
        </button>
    );
};
