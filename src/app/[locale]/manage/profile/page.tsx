'use client';

import React, { useState } from 'react';
import { useAuth } from '@/sections/tournaments/auth-context';
import { useLocale, useTranslations } from 'next-intl';
import { UserRound, LockKeyhole } from 'lucide-react';
import { notify } from '@/lib/notify';

export default function ProfilePage() {
    const t = useTranslations('Profile');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const { user, updateProfile } = useAuth();

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [savingInfo, setSavingInfo] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingInfo(true);
        try {
            await updateProfile({ firstName, lastName });
            notify.success(t('infoUpdated'));
        } catch (error: any) {
            notify.error(error?.message || tCommon('error'));
        } finally {
            setSavingInfo(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            notify.warning(t('passwordMismatch'));
            return;
        }
        setSavingPassword(true);
        try {
            await updateProfile({ currentPassword, newPassword, locale });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            notify.success(t('passwordUpdated'));
        } catch (error: any) {
            notify.error(error?.message || tCommon('error'));
        } finally {
            setSavingPassword(false);
        }
    };

    const inputClass =
        'border border-input rounded-lg px-3 py-2 mt-1 w-full bg-white text-foreground focus:ring-2 focus:ring-ring outline-none';

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="display-title text-3xl md:text-4xl text-foreground flex items-center gap-3">
                    <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
                        <UserRound className="h-5 w-5" />
                    </span>
                    {t('title')}
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                    {t('subtitle')}
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
                    <div className="bg-neutral-50/50 px-6 py-4 border-b border-border">
                        <h2 className="display-title text-lg text-foreground">
                            {t('personalInfo')}
                        </h2>
                    </div>
                    <form onSubmit={handleSaveInfo} className="p-6 space-y-4">
                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                {t('firstName')}
                            </span>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                {t('lastName')}
                            </span>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                {t('email')}
                            </span>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className={`${inputClass} opacity-60 cursor-not-allowed`}
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                {t('role')}
                            </span>
                            <input
                                type="text"
                                value={(user?.role || '').replace('_', ' ')}
                                disabled
                                className={`${inputClass} opacity-60 cursor-not-allowed`}
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={savingInfo}
                            className="w-full py-2 px-4 rounded-lg text-white font-bold transition duration-200 shadow-card bg-brand-600 hover:bg-brand-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                            {savingInfo ? t('saving') : t('saveInfo')}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
                    <div className="bg-neutral-50/50 px-6 py-4 border-b border-border flex items-center gap-2">
                        <LockKeyhole className="h-4 w-4 text-brand-600" />
                        <h2 className="display-title text-lg text-foreground">
                            {t('changePassword')}
                        </h2>
                    </div>
                    <form onSubmit={handleSavePassword} className="p-6 space-y-4">
                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                {t('currentPassword')}
                            </span>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder={t('currentPasswordPlaceholder')}
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                {t('newPassword')}
                            </span>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t('newPasswordPlaceholder')}
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                {t('confirmPassword')}
                            </span>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('confirmPasswordPlaceholder')}
                                className={inputClass}
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={savingPassword}
                            className="w-full py-2 px-4 rounded-lg text-white font-bold transition duration-200 shadow-card bg-brand-600 hover:bg-brand-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                            {savingPassword ? t('saving') : t('savePassword')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
