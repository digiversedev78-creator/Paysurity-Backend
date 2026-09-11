export interface AuthenticatedUserInterface {
  id: string;
  email: string;
  roles?: string[];
}
