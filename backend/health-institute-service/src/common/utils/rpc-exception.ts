import { RpcException } from '@nestjs/microservices';

export const throwRpcException = (code: number, message: string) => {
  throw new RpcException({ code, message });
};
