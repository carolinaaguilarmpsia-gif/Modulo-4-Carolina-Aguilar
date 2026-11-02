import type { Rol } from '../../administracion/types/Rol.js';

/** Quién hace la petición — siempre sale del JWT, nunca del cuerpo del request. */
export interface ActorContext {
  userId: string;
  rol: Rol;
  facultadId: string;
}
