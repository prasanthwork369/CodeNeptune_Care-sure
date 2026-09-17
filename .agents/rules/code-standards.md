# Code Standards: Comments & Structure

## Comments
- **Single-line only (no paragraphs)**: Comments must always be simple, single-line comments (`// ...`). Never write multi-line comment blocks or explanatory paragraphs (`/* ... */`).
- **Required places only**: Never write redundant comments that state the obvious (e.g., `// Header`, `// Title`, `// Button`, `// state`, `// handle click`).
- **Explain 'why', keep it brief**: Only add comments when explaining non-obvious *why* (domain-specific logic, workarounds, edge cases) and keep it to a single concise line.

## Structure
- **Understandable and clean**: Code should be self-explanatory with intuitive naming for functions, variables, and components.
- **Maintain clear architecture boundaries**:
  - `app/`: Expo Router routes and screens only (minimal logic, compose feature components).
  - `src/components/` and `src/features/<feature>/`: Feature-scoped reusable UI.
  - `src/hooks/`: Data queries/mutations and UI presentation logic.
  - `src/store/`: Zustand stores for client-side state.
  - `src/services/` & `src/api/`: API integration and business logic.
- Colocate styles and helpers when appropriate instead of over-fragmenting files.
