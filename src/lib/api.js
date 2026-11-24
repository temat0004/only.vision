import { localApi } from './localApi'
import { supabaseApi, hasSupabase } from './supabaseApi'

// Один интерфейс — два источника данных. Пока нет ключей Supabase, работает демо-база в браузере.
export const api = hasSupabase ? supabaseApi : localApi
