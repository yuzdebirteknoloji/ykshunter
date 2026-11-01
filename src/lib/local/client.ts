import { LocalQuery, LOCAL_USER_ID } from './query'
import type { TableName } from './db'

/** Supabase istemcisinin yerel (APK) karşılığı */
export const localSupabase = {
  from(table: string) {
    return new LocalQuery(table as TableName)
  },
  async rpc(name: string) {
    if (name === 'get_leaderboard') return { data: [], error: null }
    if (name === 'claim_legacy_data') return { data: { trial_analyses: 0, mindmap_analyses: 0 }, error: null }
    return { data: null, error: { message: `Yerel modda desteklenmiyor: ${name}` } }
  },
  auth: {
    async getUser() {
      return { data: { user: { id: LOCAL_USER_ID } }, error: null }
    },
  },
}
