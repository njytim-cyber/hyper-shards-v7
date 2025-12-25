import React, { useState, useCallback, useEffect } from 'react';
import {
    settingsManager,
    getKeyDisplayName,
    LANGUAGE_NAMES,
    type GameSettings
} from '../../game/config/SettingsConfig';
import { useTranslation } from '../../i18n/I18nContext';
import { BackButton } from '../ui/BackButton';

interface SettingsScreenProps {
    onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
    const [settings, setSettings] = useState<GameSettings>(settingsManager.getAll());
    const [rebindingKey, setRebindingKey] = useState<keyof GameSettings['keybindings'] | null>(null);
    const [activeTab, setActiveTab] = useState<'audio' | 'controls' | 'display' | 'language'>('audio');

    const { t, setLanguage } = useTranslation();

    // Update local state when setting changes
    const updateSetting = useCallback(<K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        settingsManager.set(key, value);
        setSettings(settingsManager.getAll());

        if (key === 'language') {
            setLanguage(value as GameSettings['language']);
        }
    }, [setLanguage]);

    // Handle keybinding
    useEffect(() => {
        if (!rebindingKey) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            settingsManager.setKeybinding(rebindingKey, e.code);
            setSettings(settingsManager.getAll());
            setRebindingKey(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [rebindingKey]);

    // Handle ESC to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape' && !rebindingKey) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, rebindingKey]);

    const renderSlider = (
        label: string,
        value: number,
        onChange: (v: number) => void
    ) => (
        <div className="settings-row">
            <label className="settings-label">{label}</label>
            <div className="settings-slider-container">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="settings-slider"
                />
                <span className="settings-value">{value}%</span>
            </div>
        </div>
    );

    const renderToggle = (
        label: string,
        value: boolean,
        onChange: (v: boolean) => void,
        description?: string
    ) => (
        <div className="settings-row">
            <div className="settings-label-group">
                <label className="settings-label">{label}</label>
                {description && <span className="settings-desc">{description}</span>}
            </div>
            <button
                className={`settings-toggle ${value ? 'active' : ''}`}
                onClick={() => onChange(!value)}
            >
                {value ? t('settings.on') : t('settings.off')}
            </button>
        </div>
    );

    const renderKeybind = (
        label: string,
        action: keyof GameSettings['keybindings']
    ) => (
        <div className="settings-row">
            <label className="settings-label">{label}</label>
            <button
                className={`settings-keybind ${rebindingKey === action ? 'rebinding' : ''}`}
                onClick={() => setRebindingKey(action)}
            >
                {rebindingKey === action
                    ? 'PRESS KEY...'
                    : getKeyDisplayName(settings.keybindings[action])}
            </button>
        </div>
    );

    return (
        <div className="screen-container screen-enter" style={{ paddingTop: '5vh' }}>
            <div className="screen-header-row" style={{ maxWidth: '800px', width: '100%', marginBottom: '30px' }}>
                <div style={{ width: '100px' }}>
                    <BackButton onClick={onClose} label="BACK" />
                </div>
                <div className="screen-title-group">
                    <h1 className="screen-title">{t('settings.title')}</h1>
                </div>
                <div style={{ width: '100px' }}></div>
            </div>

            <div className="screen-content">
                <div className="settings-tabs">
                    {(['audio', 'controls', 'display', 'language'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`settings-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="settings-content" style={{ flex: 1, width: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
                    {activeTab === 'audio' && (
                        <div className="settings-section">
                            {renderSlider(t('settings.volume_master'), settings.masterVolume,
                                (v) => updateSetting('masterVolume', v))}
                            {renderSlider(t('settings.volume_music'), settings.musicVolume,
                                (v) => updateSetting('musicVolume', v))}
                            {renderSlider(t('settings.volume_sfx'), settings.sfxVolume,
                                (v) => updateSetting('sfxVolume', v))}
                        </div>
                    )}

                    {activeTab === 'controls' && (
                        <div className="settings-section">
                            <div className="settings-group-header">Movement</div>
                            {renderKeybind('Move Up', 'moveUp')}
                            {renderKeybind('Move Down', 'moveDown')}
                            {renderKeybind('Move Left', 'moveLeft')}
                            {renderKeybind('Move Right', 'moveRight')}

                            <div className="settings-group-header">Actions</div>
                            {renderKeybind('Dash', 'dash')}
                            {renderKeybind('Swap Weapon', 'swap')}
                            {renderKeybind('Pause', 'pause')}
                        </div>
                    )}

                    {activeTab === 'display' && (
                        <div className="settings-section">
                            {renderToggle(t('settings.fullscreen'), settings.fullscreen,
                                (v) => updateSetting('fullscreen', v))}
                            {renderToggle('Show FPS', settings.showFps,
                                (v) => updateSetting('showFps', v))}
                            {renderToggle('Screen Shake', settings.screenShake,
                                (v) => updateSetting('screenShake', v),
                                'Camera shake on explosions')}
                            {renderToggle('Reduced Motion', settings.reducedMotion,
                                (v) => updateSetting('reducedMotion', v),
                                'Disable non-essential animations')}
                        </div>
                    )}

                    {activeTab === 'language' && (
                        <div className="settings-section">
                            <div className="language-grid">
                                {(Object.entries(LANGUAGE_NAMES) as [GameSettings['language'], string][]).map(([code, name]) => (
                                    <button
                                        key={code}
                                        className={`language-btn ${settings.language === code ? 'active' : ''}`}
                                        onClick={() => updateSetting('language', code)}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="settings-footer" style={{ width: '100%', marginTop: 'auto', paddingTop: '10px' }}>
                    <button
                        className="settings-reset-btn"
                        onClick={() => {
                            settingsManager.reset();
                            setSettings(settingsManager.getAll());
                        }}
                    >
                        RESET DEFAULTS
                    </button>
                    <button className="main-btn" onClick={onClose} style={{ marginTop: 0 }}>
                        SAVE & CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
};
