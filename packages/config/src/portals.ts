export type PortalId = 'operativo' | 'administrativo' | 'tecnico';

export interface PortalDefinition {
  id: PortalId;
  name: string;
  shortName: string;
  description: string;
  audience: string;
  access: 'public' | 'private';
  robots: 'index' | 'noindex';
  accent: string;
  domainEnv: string;
  localUrl: string;
}

export const PORTALS = {
  operativo: {
    id: 'operativo',
    name: 'Manual operativo',
    shortName: 'Operativo',
    description: 'Guías para utilizar la aplicación y completar tareas cotidianas.',
    audience: 'Usuarios de la aplicación',
    access: 'public',
    robots: 'index',
    accent: '#4fbf9f',
    domainEnv: 'PUBLIC_OPERATIVO_URL',
    localUrl: 'http://localhost:4321',
  },
  administrativo: {
    id: 'administrativo',
    name: 'Manual administrativo',
    shortName: 'Administrativo',
    description: 'Procesos y pantallas del panel administrativo de SACDIA.',
    audience: 'Personal con acceso al panel',
    access: 'private',
    robots: 'noindex',
    accent: '#f06151',
    domainEnv: 'PUBLIC_ADMINISTRATIVO_URL',
    localUrl: 'http://localhost:4322',
  },
  tecnico: {
    id: 'tecnico',
    name: 'Documentación técnica',
    shortName: 'Técnico',
    description: 'API, arquitectura, datos, seguridad y estándares de desarrollo.',
    audience: 'Equipo de desarrollo',
    access: 'private',
    robots: 'noindex',
    accent: '#183651',
    domainEnv: 'PUBLIC_TECNICO_URL',
    localUrl: 'http://localhost:4323',
  },
} as const satisfies Record<PortalId, PortalDefinition>;
