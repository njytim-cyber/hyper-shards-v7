import { supabase } from '../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export class AuthSystem {
    public user: User | null = null;
    public session: Session | null = null;
    public loading: boolean = true;
    public offlineMode: boolean = false;

    constructor() {
        this.init();
    }

    private async init() {
        // If supabase is not configured, run in offline mode
        if (!supabase) {
            console.warn('[AuthSystem] Running in offline mode - no Supabase configured');
            this.offlineMode = true;
            this.loading = false;
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            this.session = session;
            this.user = session?.user ?? null;

            supabase.auth.onAuthStateChange((_event, session) => {
                this.session = session;
                this.user = session?.user ?? null;
                // Dispatch event for UI updates
                window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: this.user } }));
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
        } finally {
            this.loading = false;
        }
    }

    public async signInWithEmail(email: string) {
        if (!supabase) return { error: { message: 'Offline mode - sign in unavailable' } };
        const { error } = await supabase.auth.signInWithOtp({ email });
        return { error };
    }

    public async signInAnonymously() {
        if (!supabase) return { data: null, error: { message: 'Offline mode - sign in unavailable' } };
        const { data, error } = await supabase.auth.signInAnonymously();
        return { data, error };
    }

    public async signOut() {
        if (!supabase) return { error: null };
        const { error } = await supabase.auth.signOut();
        return { error };
    }

    public getUserEmail(): string | undefined {
        return this.user?.email;
    }

    public isAuthenticated(): boolean {
        return !!this.user;
    }
}

export const authSystem = new AuthSystem();
