import { supabase } from '../lib/supabase';

const RCON_KEY = 'rcon_authorized';
const RCON_TIMESTAMP = 'rcon_timestamp';
const RCON_EXPIRY = 24 * 60 * 60 * 1000; // 24 sata

export const rconAuth = {
  async verifyRconCode(code: string): Promise<boolean> {
    try {
      console.log('Pokušaj verifikacije RCON koda:', code);
      
      // Dohvatamo RCON postavke
      const { data, error } = await supabase
        .from('rcon_settings')
        .select('code, is_active')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Nije moguće povezati se sa bazom podataka');
      }

      if (!data) {
        console.error('Nema RCON postavki u bazi');
        throw new Error('RCON postavke nisu konfigurisane');
      }
      
      console.log('Dobijeni podaci iz baze:', data);
      
      if (!data.is_active) {
        console.error('RCON pristup nije aktivan');
        throw new Error('RCON pristup je trenutno onemogućen.');
      }
      
      const isValid = data.code === code;
      console.log('Provjera šifre:', {
        unesenaŠifra: code,
        šifraIzBaze: data.code,
        podudaranje: isValid
      });

      if (isValid) {
        const timestamp = Date.now();
        localStorage.setItem(RCON_KEY, 'true');
        localStorage.setItem(RCON_TIMESTAMP, timestamp.toString());
        console.log('Autentifikacija uspješna, postavljeni podaci u localStorage');
        return true;
      } else {
        console.log('Šifre se ne podudaraju');
        return false;
      }
    } catch (error) {
      console.error('RCON verification error:', error);
      this.clearAuthorization();
      throw error;
    }
  },

  async isAuthorized(): Promise<boolean> {
    try {
      const isAuth = localStorage.getItem(RCON_KEY) === 'true';
      const timestamp = parseInt(localStorage.getItem(RCON_TIMESTAMP) || '0');
      const now = Date.now();

      if (!isAuth || !timestamp) {
        return false;
      }

      if ((now - timestamp) > RCON_EXPIRY) {
        console.log('Sesija je istekla');
        this.clearAuthorization();
        return false;
      }

      const { data, error } = await supabase
        .from('rcon_settings')
        .select('is_active')
        .single();

      if (error || !data?.is_active) {
        console.log('RCON pristup nije više aktivan u bazi');
        this.clearAuthorization();
        return false;
      }

      return true;
    } catch (error) {
      console.error('RCON authorization check error:', error);
      this.clearAuthorization();
      return false;
    }
  },

  clearAuthorization(): void {
    localStorage.removeItem(RCON_KEY);
    localStorage.removeItem(RCON_TIMESTAMP);
    console.log('Obrisani podaci autorizacije iz localStorage-a');
  }
}; 