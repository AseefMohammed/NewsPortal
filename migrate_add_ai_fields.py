import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('news.db')
c = conn.cursor()

# Add new columns for AI enhancements
c.execute("""
ALTER TABLE news ADD COLUMN ai_summary TEXT;
""")
c.execute("""
ALTER TABLE news ADD COLUMN key_points TEXT;
""")
c.execute("""
ALTER TABLE news ADD COLUMN sentiment TEXT;
""")
c.execute("""
ALTER TABLE news ADD COLUMN topics TEXT;
""")
c.execute("""
ALTER TABLE news ADD COLUMN ai_confidence TEXT;
""")

conn.commit()
conn.close()
print('Migration complete: AI fields added to news table.')
