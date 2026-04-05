insert into public.exercises (name, muscle_group, equipment, is_system)
values
  ('Barbell Bench Press', 'chest', 'barbell', true),
  ('Incline Dumbbell Press', 'chest', 'dumbbells', true),
  ('Machine Chest Press', 'chest', 'machine', true),
  ('Lat Pulldown', 'back', 'cable', true),
  ('Seated Cable Row', 'back', 'cable', true),
  ('Barbell Row', 'back', 'barbell', true),
  ('Overhead Press', 'shoulders', 'barbell', true),
  ('Lateral Raise', 'shoulders', 'dumbbells', true),
  ('Rear Delt Fly', 'shoulders', 'machine', true),
  ('Barbell Back Squat', 'legs', 'barbell', true),
  ('Leg Press', 'legs', 'machine', true),
  ('Romanian Deadlift', 'legs', 'barbell', true),
  ('Leg Extension', 'legs', 'machine', true),
  ('Seated Leg Curl', 'legs', 'machine', true),
  ('Standing Calf Raise', 'legs', 'machine', true),
  ('Barbell Curl', 'biceps', 'barbell', true),
  ('Hammer Curl', 'biceps', 'dumbbells', true),
  ('Tricep Pushdown', 'triceps', 'cable', true),
  ('Overhead Tricep Extension', 'triceps', 'cable', true),
  ('Hip Thrust', 'glutes', 'barbell', true)
on conflict do nothing;