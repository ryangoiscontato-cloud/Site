import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xdmbzqvwombhxcgiwsmm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbWJ6cXZ3b21iaHhjZ2l3c21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzE3ODIsImV4cCI6MjA5NzA0Nzc4Mn0.GdmUIs_bPV_otP61yRGaGXo2dfSBg0mZ8NpVd4-luYg'
)
export const isConfigured = true
