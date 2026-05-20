import sql from '@/app/lib/db'

export async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS vuaxs_groups (
      id                   INT PRIMARY KEY,
      name                 TEXT NOT NULL,
      group_status         INT NOT NULL,
      procress             FLOAT NOT NULL DEFAULT 0,
      percentage_of_shares FLOAT NOT NULL DEFAULT 0,
      money_of_shares      FLOAT NOT NULL DEFAULT 0,
      number_of_members    INT NOT NULL DEFAULT 0,
      number_of_tickets    INT NOT NULL DEFAULT 0,
      draw_id              TEXT,
      open_date            TEXT,
      time_cut_off         TEXT,
      create_time          TEXT,
      status_win           INT NOT NULL DEFAULT -1,
      prize_win_after_tax  FLOAT NOT NULL DEFAULT 0,
      ticket_image_url     TEXT,
      ticket_image_path    TEXT,
      number_finish        JSONB,
      is_final             BOOLEAN NOT NULL DEFAULT FALSE,
      saved_at             TIMESTAMP DEFAULT NOW(),
      updated_at           TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS vuaxs_tickets (
      id                   INT PRIMARY KEY,
      group_id             INT NOT NULL REFERENCES vuaxs_groups(id) ON DELETE CASCADE,
      phone                TEXT NOT NULL,
      percentage_of_shares FLOAT NOT NULL DEFAULT 0,
      money_of_shares      FLOAT NOT NULL DEFAULT 0,
      is_me                BOOLEAN NOT NULL DEFAULT FALSE,
      prize_win_amount     FLOAT NOT NULL DEFAULT 0,
      prize_win_after_tax  FLOAT NOT NULL DEFAULT 0
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS vuaxs_numbers (
      ticket_id  INT NOT NULL REFERENCES vuaxs_tickets(id) ON DELETE CASCADE,
      group_id   INT NOT NULL,
      num        INT NOT NULL,
      status     INT NOT NULL DEFAULT 0,
      PRIMARY KEY (ticket_id, num)
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_vuaxs_groups_is_final ON vuaxs_groups(is_final)`
  await sql`CREATE INDEX IF NOT EXISTS idx_vuaxs_groups_status ON vuaxs_groups(group_status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_vuaxs_tickets_group_id ON vuaxs_tickets(group_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_vuaxs_numbers_group_id ON vuaxs_numbers(group_id)`

  console.log('[vuaxs] Migration done')
}
