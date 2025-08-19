# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript application for managing approved candidates from ISS Cuiabá (Municipal Tax Inspector) public examination. The application manages candidate call orders with quota system (AC - General, PCD - People with Disabilities, NI - Black/Indigenous) across three specialties:

- **DIREITO/PROCESSO TRIBUTÁRIO** (Tax Law/Process)
- **GESTÃO TRIBUTÁRIA** (Tax Management) 
- **TECNOLOGIA DA INFORMAÇÃO** (Information Technology)

## Development Commands

- **Development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Architecture

### Clean Architecture Structure

The codebase follows Clean Architecture principles with clear separation of concerns:

```
src/
├── domain/           # Business logic and entities
│   ├── entities/     # Domain entities (Candidate)
│   ├── repositories/ # Repository interfaces
│   └── usecases/     # Business use cases
├── infrastructure/   # External adapters
│   └── repositories/ # Repository implementations (CSV, LocalStorage)
├── services/         # Application services coordinating use cases
└── components/       # React UI components
```

### Key Domain Concepts

- **Candidate Entity** (`src/domain/entities/Candidate.ts`): Encapsulates candidate business logic with methods for quota checking, position calculation, and state management
- **Call Order System**: Manages the sequential calling of candidates following predefined quota patterns
- **Quota Types**: AC (General), PCD (People with Disabilities), NI (Black/Indigenous)
- **Position Management**: Candidates can be removed/restored, affecting subsequent call order

### Data Flow

1. **Data Source**: CSV file (`src/data/dados-aprovados.csv`) contains approved candidates
2. **Repository Pattern**: `CSVCandidateRepository` loads candidates, `LocalStorageCallOrderRepository` persists call order state
3. **Services Layer**: `CallOrderService` and `CandidateService` coordinate between use cases and repositories
4. **State Management**: React hooks (`useCallOrder`, `useCandidates`, `useExport`) manage component state
5. **UI Components**: Feature components handle specific functionality (CallOrderList, CandidatesList, etc.)

## Key Business Logic

### Call Order Sequences

Each specialty has a predefined call sequence pattern defined in `CallOrderService:98-115`:
- 20-position repeating patterns with specific AC/PCD/NI distribution
- Patterns ensure fair quota representation in candidate calling

### Export Functionality

The application supports exporting call orders to:
- **PDF**: Using jsPDF with html2canvas for visual rendering
- **Excel**: Using xlsx library for structured data export

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **PDF Export**: jsPDF + html2canvas  
- **Excel Export**: xlsx
- **Date Handling**: date-fns
- **Forms**: React Hook Form

## File Structure Notes

- **Types**: All TypeScript interfaces are centralized in `src/types/index.ts`
- **UI Components**: Reusable components in `src/components/ui/`
- **Feature Components**: Domain-specific components in `src/components/features/`
- **Hooks**: Custom React hooks for state management in `src/hooks/`