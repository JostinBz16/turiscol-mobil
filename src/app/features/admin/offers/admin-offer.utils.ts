import { AlertController } from '@ionic/angular/standalone';

/** Human readable (Spanish) labels for the offer types returned by the API. */
const OFFER_TYPE_LABELS: Record<string, string> = {
  product: 'Producto',
  service: 'Servicio',
  event: 'Evento',
  accommodation: 'Alojamiento',
};

export function offerTypeLabel(type: string | undefined): string {
  return (type && OFFER_TYPE_LABELS[type]) ?? type ?? '-';
}

const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatOfferPrice(value: number | string | null | undefined): string {
  const amount = Number(value);
  return value === null || value === undefined || Number.isNaN(amount)
    ? '-'
    : priceFormatter.format(amount);
}

export function formatOfferDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
}

/** Fallback label when a provider name cannot be resolved. */
export function shortId(id: string | undefined): string {
  return id ? `${id.slice(0, 8)}...` : '-';
}

export function offerStatusLabel(offer: { blocked?: boolean; active?: boolean }): string {
  if (offer.blocked) return 'Bloqueada';
  return offer.active ? 'Activa' : 'Inactiva';
}

export type ModerationAction = 'block' | 'unblock' | 'feature' | 'unfeature';

/** Texts shared by the list and the detail page for each moderation action. */
export const MODERATION_COPY: Record<
  ModerationAction,
  { header: string; message: (name: string) => string; confirmText: string; success: string }
> = {
  block: {
    header: 'Bloquear oferta',
    message: (name) =>
      `Se bloqueará "${name}" y dejará de estar disponible para los turistas. ¿Deseas continuar?`,
    confirmText: 'Bloquear',
    success: 'Oferta bloqueada',
  },
  unblock: {
    header: 'Desbloquear oferta',
    message: (name) =>
      `Se quitará el bloqueo de "${name}". La oferta NO se reactivará automáticamente: el proveedor debe activarla de nuevo. ¿Deseas continuar?`,
    confirmText: 'Desbloquear',
    success: 'Oferta desbloqueada. El proveedor debe activarla de nuevo.',
  },
  feature: {
    header: 'Destacar oferta',
    message: (name) => `¿Deseas marcar "${name}" como destacada?`,
    confirmText: 'Destacar',
    success: 'Oferta destacada',
  },
  unfeature: {
    header: 'Quitar destacada',
    message: (name) => `¿Deseas quitar "${name}" de las ofertas destacadas?`,
    confirmText: 'Quitar',
    success: 'Oferta quitada de destacadas',
  },
};

/** Maps an HTTP error of a moderation call to a clear Spanish message. */
export function offerActionErrorMessage(err: any): string {
  switch (err?.status) {
    case 403:
      return 'No tienes permisos de administrador para realizar esta acción.';
    case 404:
      return 'La oferta ya no existe o fue eliminada.';
    case 0:
      return 'No se pudo conectar con el servidor.';
    default:
      return 'No se pudo completar la acción. Inténtalo de nuevo.';
  }
}

/** Opens a confirmation alert and resolves true only when the user confirms. */
export async function confirmModeration(
  alertCtrl: AlertController,
  action: ModerationAction,
  offerName: string,
): Promise<boolean> {
  const copy = MODERATION_COPY[action];
  const alert = await alertCtrl.create({
    header: copy.header,
    message: copy.message(offerName),
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: copy.confirmText, role: 'confirm' },
    ],
  });
  await alert.present();
  const { role } = await alert.onDidDismiss();
  return role === 'confirm';
}
