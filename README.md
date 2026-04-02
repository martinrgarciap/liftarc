# LiftArc

LiftArc is a mobile-first workout planning and progress tracking app designed to help users stay consistent, log workouts efficiently, and see meaningful fitness progress over time.

The app is focused on three core goals:

- plan workouts clearly
- log sets, reps, and weight quickly
- track progress through body metrics, charts, streaks, and achievements

## Stack

- **Expo React Native** for the mobile app
- **Supabase Auth + Postgres** for authentication and database hosting
- **Spring Boot API** for business logic and app-specific backend workflows

## MVP Pages

- **Dashboard**
- **Program**
- **Workout**
- **Progress**
- **Check-In**
- **Profile**

## MVP Features

- user sign up and login
- workout program builder
- assign exercises to workout days
- active workout logging for sets, reps, and weight
- daily bodyweight tracking
- weekly average bodyweight tracking
- body measurement check-ins
- progress charts and workout history
- streaks and achievement milestones
- theme color picker in profile/settings

## Architecture

LiftArc uses a mobile-first architecture:

- **Expo React Native app** for the user experience
- **Supabase Auth** for authentication
- **Spring Boot API** for protected business logic and calculations
- **Supabase Postgres** for app data storage
