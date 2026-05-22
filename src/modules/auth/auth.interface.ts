export interface SignUpUser {
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
}

export interface LoginUser {
  email: string;
  password: string;
}