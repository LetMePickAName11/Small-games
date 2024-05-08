export interface SocketType {
  emit(getconfigurations: string, a: any): void;
  on: (arg0: string, arg1: (v: any) => any) => void;
}