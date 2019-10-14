import { ContextAccessor, PublicSockets, PrivateSockets, PublicData, PrivateRequests, InstanceConfig } from './interfaces';
declare function makeContextAccessor(instanceConfig: InstanceConfig, publicSockets: PublicSockets, privateSockets: PrivateSockets, publicData: PublicData, privateRequests: PrivateRequests): ContextAccessor;
export default makeContextAccessor;
export { makeContextAccessor };
