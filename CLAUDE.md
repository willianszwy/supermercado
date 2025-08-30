# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production  
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Architecture Overview

**SwipeCart** is a React PWA shopping list app with gesture-based interactions built with Vite and Tailwind CSS.

### Core Application Structure

The app follows a view-based architecture with three main views managed by `App.jsx`:
- `main` - Primary shopping list interface (ShoppingList component)
- `newList` - Product selection for creating new lists (NewListView component) 
- `history` - Past shopping lists (HistoryView component)

### State Management

All state is managed through React hooks with localStorage persistence via `useLocalStorage` hook:
- `currentList` - Active shopping list items with status (pending/completed/missing)
- `allProducts` - Historical product database for list creation
- `cartHistory` - Completed shopping sessions

### Product Data Model

Products contain: `id`, `name`, `quantity`, `category`, `status`, `addedAt`
Categories are defined in `src/utils/categories.js` with 11 predefined types (Geral, Açougue, Padaria, etc.)

### Key Features

**Gesture System**: Uses @dnd-kit for drag interactions - swipe right (completed), swipe left (missing)

**Category Organization**: Pending items are grouped by category with collapsible sections and color-coded visual indicators

**Two-Step Add Modal**: FloatingAddButton implements a wizard flow:
1. Enter product name and quantity
2. Select category from color-coded tile grid

**Tour System**: Interactive guided tour with responsive positioning for desktop/mobile

### Component Patterns

- **Modal Pattern**: Multi-step forms with category selection (FloatingAddButton, NewListView)
- **Collapsible Sections**: Category grouping with expand/collapse and item counters
- **Icon System**: SVG components without emojis (per project rule)
- **Responsive Design**: Mobile-first with desktop adaptations

### Styling Guidelines

- Never use emojis in code or UI
- Primary colors: Blue (navigation/selection), Green (positive actions), Red (removal)
- Category colors mapped through utility functions in `categories.js`
- Tailwind classes with `primary-*` custom color variables

### Text Processing

`textUtils.js` provides `normalizeProductText()` for consistent product name handling (trim, capitalize, normalize spaces)

### PWA Configuration

- Vite PWA plugin configured for auto-update with GitHub Pages deployment
- Base path set to `/supermercado/` for GitHub Pages
- Manifest includes theme colors and icons for standalone app experience

### Data Persistence

Uses `useLocalStorage` hook for persistent state management with error handling:
- Automatically syncs state changes to localStorage
- Graceful fallback to initial values on localStorage errors
- Supports functional updates like React's useState

### Error Handling

ErrorBoundary components wrap all major view components to catch and handle React errors gracefully