// types.ts
export interface User {
    id: number;
    email: string;
    role: string;
  }
  
  export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
  }
  