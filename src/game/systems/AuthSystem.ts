import { supabase } from '../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export class AuthSystem {
    public user: User | null = null;
    public session: Session | null = null;
    public loading: boolean = true;

    constructor() {
        this.init();
    }

    private async init() {
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
        // Magic link login for simplicity, or we can do password
        const { error } = await supabase.auth.signInWithOtp({ email });
        return { error };
    }

    // Keeping it simple with Anonymous login for games usually
    public async signInAnonymously() {
        const { data, error } = await supabase.auth.signInAnonymously();
        return { data, error };
    }

    public async signOut() {
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
